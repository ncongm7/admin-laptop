<template>
    <div class="product-search card">
        <div class="card-header bg-info text-white">
            <h6 class="mb-0">
                <i class="bi bi-search"></i> Tìm kiếm & Quét mã sản phẩm
            </h6>
        </div>

        <div class="card-body">
            <!-- Thanh tìm kiếm và quét mã -->
            <div class="search-bar mb-3">
                <div class="input-group">
                    <input 
                        ref="searchInput" 
                        type="text" 
                        class="form-control form-control-lg" 
                        v-model="keyword"
                        @input="handleSearchInput" 
                        @keyup.enter="handleSearch"
                        @paste="handlePaste"
                        placeholder="Tìm tên, mã sản phẩm hoặc quét mã..." />
                    <button 
                        class="btn btn-outline-info" 
                        @click="openAdvancedSearch"
                        title="Tìm kiếm nâng cao">
                        <i class="bi bi-funnel"></i>
                    </button>
                    <button 
                        class="btn btn-outline-primary" 
                        @click="toggleBarcodeScanner"
                        :class="{ 'active': showBarcodeScanner }"
                        title="Bật/tắt quét mã vạch/QR">
                        <i class="bi bi-upc-scan"></i>
                    </button>
                    <button class="btn btn-primary" @click="handleSearch">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
                <small v-if="isScanning" class="text-info mt-1 d-block">
                    <i class="bi bi-upc-scan"></i> Đang quét mã vạch/QR... (Nhập mã hoặc quét bằng camera)
                </small>
            </div>

            <!-- Camera Scanner cho quét mã vạch/QR -->
            <div v-if="showBarcodeScanner" class="barcode-scanner-container mb-3">
                <div class="scanner-header d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">
                        <i class="bi bi-camera"></i> Quét mã vạch/QR
                    </h6>
                    <button class="btn btn-sm btn-outline-danger" @click="closeBarcodeScanner">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="scanner-wrapper">
                    <StreamQrcodeBarcodeReader @decode="onBarcodeDetected" />
                </div>
                <small class="text-muted d-block mt-2">
                    <i class="bi bi-info-circle"></i> Đưa mã vạch/QR vào khung camera hoặc nhập mã vào ô tìm kiếm
                </small>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Đang tìm...</span>
                </div>
                <span class="ms-2">Đang tìm kiếm...</span>
            </div>

            <!-- Kết quả tìm kiếm -->
            <div v-if="!isLoading && ketQua.length > 0" class="search-results">
                <div class="results-header mb-2 d-flex justify-content-between align-items-center">
                    <span class="text-muted">
                        Tìm thấy <strong>{{ totalElements }}</strong> sản phẩm
                        <span v-if="totalElements > ketQua.length" class="text-muted">
                            (hiển thị {{ ketQua.length }})
                        </span>
                    </span>
                    <div class="keyboard-hint text-muted small">
                        <kbd>Ctrl+F</kbd> Tìm kiếm nâng cao | <kbd>Esc</kbd> Đóng modal
                    </div>
                </div>

                <div class="product-grid">
                    <div 
                        v-for="product in ketQua" 
                        :key="product.id" 
                        class="product-card"
                        :class="{ 'product-new': isNewProduct(product), 'product-hot': isHotProduct(product) }"
                    >
                        <div class="product-image-wrapper">
                            <img 
                                :src="getProductImage(product)" 
                                :alt="getProductName(product)" 
                                class="product-image"
                                loading="lazy"
                                @error="handleImageError"
                            />
                            <!-- Badges -->
                            <div class="product-badges">
                                <span v-if="isNewProduct(product)" class="badge bg-success badge-new">
                                    <i class="bi bi-star-fill"></i> Mới
                                </span>
                                <span v-if="isHotProduct(product)" class="badge bg-danger badge-hot">
                                    <i class="bi bi-fire"></i> Hot
                                </span>
                                <span v-if="hasDiscount(product)" class="badge bg-warning text-dark badge-discount">
                                    <i class="bi bi-tag-fill"></i> Giảm giá
                                </span>
                            </div>
                        </div>

                        <div class="product-info">
                            <h6 class="product-name">{{ getProductName(product) }}</h6>

                            <div class="product-meta">
                                <span class="meta-badge">
                                    <i class="bi bi-box-seam"></i> {{ getVariantCount(product) }} biến thể
                                </span>
                                <span v-if="product.trangThai === 1" class="meta-badge status-active">
                                    <i class="bi bi-check-circle-fill"></i> Đang bán
                                </span>
                                <span v-else class="meta-badge status-inactive">
                                    <i class="bi bi-pause-circle-fill"></i> Ngừng bán
                                </span>
                            </div>

                            <div class="product-footer">
                                <div class="d-flex gap-2">
                                    <button 
                                        class="btn btn-sm btn-outline-info flex-fill" 
                                        @click="openProductDetailModal(product)"
                                        title="Xem chi tiết (D)">
                                        <i class="bi bi-info-circle"></i> Chi tiết
                                    </button>
                                    <button 
                                        class="btn btn-sm btn-primary flex-fill" 
                                        @click="openVariantModal(product)"
                                        title="Chọn sản phẩm (Enter)">
                                        <i class="bi bi-cart-plus"></i> Chọn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination-wrapper mt-3">
                    <nav aria-label="Pagination">
                        <ul class="pagination pagination-sm justify-content-center mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 0 }">
                                <button class="page-link" @click="goToPage(0)" :disabled="currentPage === 0">
                                    <i class="bi bi-chevron-double-left"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === 0 }">
                                <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 0">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                            </li>
                            <li 
                                v-for="page in visiblePages" 
                                :key="page"
                                class="page-item" 
                                :class="{ active: page === currentPage }"
                            >
                                <button class="page-link" @click="goToPage(page)">
                                    {{ page + 1 }}
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                                <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages - 1">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
                                <button class="page-link" @click="goToPage(totalPages - 1)" :disabled="currentPage >= totalPages - 1">
                                    <i class="bi bi-chevron-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                    <div class="text-center mt-2">
                        <small class="text-muted">
                            Trang {{ currentPage + 1 }} / {{ totalPages }}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Không có kết quả -->
            <div v-if="!isLoading && ketQua.length === 0 && keyword" class="no-results text-center py-4">
                <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-2">Không tìm thấy sản phẩm nào</p>
            </div>

            <!-- Hướng dẫn -->
            <div v-if="!keyword && !isLoading && ketQua.length === 0" class="search-instruction text-center py-4">
                <i class="bi bi-info-circle" style="font-size: 3rem; color: #0dcaf0;"></i>
                <p class="text-muted mt-2 mb-0">
                    Nhập tên hoặc mã sản phẩm để tìm kiếm
                </p>
            </div>
        </div>

        <!-- Modal 1: Chọn biến thể -->
        <div v-if="showVariantModal" class="modal fade show" style="display: block;" @click.self="closeVariantModal">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-list-ul"></i> Chọn biến thể - {{ selectedProduct?.tenSanPham }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeVariantModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="loadingVariants" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Đang tải...</span>
                            </div>
                        </div>

                        <div v-else-if="variants.length === 0" class="text-center py-4 text-muted">
                            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                            <p class="mt-2">Sản phẩm không có biến thể</p>
                        </div>

                        <div v-else class="variants-list">
                            <div v-for="variant in variants" :key="variant.id" class="variant-item"
                                @click="selectVariant(variant)">
                                <div class="variant-info">
                                    <div class="variant-name">{{ getVariantDisplayName(variant) }}</div>
                                    <div class="variant-specs">
                                        {{ getVariantSpecs(variant) }}
                                    </div>
                                </div>
                                <div class="variant-meta">
                                    <div class="variant-price">
                                        <span v-if="variant.coGiamGia && variant.giaGiam" class="price-discounted">
                                            {{ formatCurrency(variant.giaGiam) }}
                                        </span>
                                        <span v-else>
                                            {{ formatCurrency(variant.giaBan) }}
                                        </span>
                                        <span v-if="variant.coGiamGia && variant.giaGoc" class="price-original">
                                            <del>{{ formatCurrency(variant.giaGoc) }}</del>
                                        </span>
                                    </div>
                                    <div v-if="variant.coGiamGia && variant.phanTramGiam" class="discount-badge">
                                        <span class="badge bg-danger">-{{ variant.phanTramGiam }}%</span>
                                    </div>
                                    <div class="variant-stock">
                                        <span :class="getStockClass(variant.soLuongTon)">
                                            <i class="bi bi-box"></i> Tồn: {{ variant.soLuongTon }}
                                        </span>
                                    </div>
                                    <div class="variant-status">
                                        <span v-if="variant.soLuongTon > 0" class="badge bg-success">
                                            <i class="bi bi-check-circle"></i> Còn hàng
                                        </span>
                                        <span v-else class="badge bg-danger">
                                            <i class="bi bi-x-circle"></i> Hết hàng
                                        </span>
                                    </div>
                                </div>
                                <div class="variant-action">
                                    <i class="bi bi-chevron-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal 2: Nhập số lượng -->
        <div v-if="showQuantityModal" class="modal fade show" style="display: block;" @click.self="closeQuantityModal">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-cart-plus"></i> Nhập số lượng
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeQuantityModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="selectedVariant" class="quantity-form">
                            <div class="selected-variant-info">
                                <h6 class="mb-2">{{ getVariantDisplayName(selectedVariant) }}</h6>
                                <p class="text-muted small mb-1">{{ getVariantSpecs(selectedVariant) }}</p>
                            </div>

                            <hr>

                            <div class="info-row">
                                <span class="label">Giá bán:</span>
                                <span class="value price">
                                    <span v-if="selectedVariant.coGiamGia && selectedVariant.giaGiam" class="price-discounted">
                                        {{ formatCurrency(selectedVariant.giaGiam) }}
                                    </span>
                                    <span v-else>
                                        {{ formatCurrency(selectedVariant.giaBan) }}
                                    </span>
                                    <span v-if="selectedVariant.coGiamGia && selectedVariant.giaGoc" class="price-original ms-2">
                                        <del>{{ formatCurrency(selectedVariant.giaGoc) }}</del>
                                    </span>
                                </span>
                            </div>

                            <div v-if="selectedVariant.coGiamGia && selectedVariant.phanTramGiam" class="info-row">
                                <span class="label">Giảm giá:</span>
                                <span class="value text-danger">
                                    <span class="badge bg-danger">-{{ selectedVariant.phanTramGiam }}%</span>
                                </span>
                            </div>

                            <div class="info-row">
                                <span class="label">Tồn kho:</span>
                                <span class="value stock">{{ selectedVariant.soLuongTon }} sản phẩm</span>
                            </div>

                            <hr>

                            <div class="form-group">
                                <label class="form-label">
                                    Số lượng <span class="text-danger">*</span>
                                </label>
                                <div class="quantity-input-group">
                                    <button class="btn btn-outline-secondary" @click="decreaseQuantity"
                                        :disabled="quantity <= 1">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <input type="number" class="form-control text-center" v-model.number="quantity"
                                        :max="selectedVariant.soLuongTon" min="1" @input="validateQuantity">
                                    <button class="btn btn-outline-secondary" @click="increaseQuantity"
                                        :disabled="quantity >= selectedVariant.soLuongTon">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                                <small v-if="quantityError" class="text-danger">{{ quantityError }}</small>
                            </div>

                            <hr>

                            <div class="total-row">
                                <span class="label">Tổng tiền:</span>
                                <span class="value total">{{ formatCurrency(getCurrentPrice(selectedVariant) * quantity) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeQuantityModal">
                            <i class="bi bi-x-circle"></i> Hủy
                        </button>
                        <button type="button" class="btn btn-success" @click="confirmAddProduct"
                            :disabled="!canAddProduct">
                            <i class="bi bi-check-circle"></i> Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal backdrop -->
        <div 
            v-if="showVariantModal || showQuantityModal || showProductDetailModal" 
            class="modal-backdrop fade show"
            style="z-index: 9998; pointer-events: auto;"
            @click="handleBackdropClick"
        ></div>

        <!-- Modal chi tiết sản phẩm -->
        <ProductDetailModal
            :visible="showProductDetailModal"
            :product="selectedProductForDetail"
            @close="closeProductDetailModal"
            @select-variant="handleSelectVariantFromDetail"
        />

        <!-- Modal tìm kiếm nâng cao -->
        <AdvancedProductSearch
            :visible="showAdvancedSearch"
            @close="closeAdvancedSearch"
            @results="handleAdvancedSearchResults"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { StreamQrcodeBarcodeReader } from 'vue3-barcode-qrcode-reader'
import { timKiemSanPham, laySanPhamConHang } from '@/service/banhang/banHangService'
import { timSanPhamTheoIMEI } from '@/service/banhang/serialService'
import { useToast } from '@/composables/useToast'
import ProductDetailModal from './ProductDetailModal.vue'
import AdvancedProductSearch from './AdvancedProductSearch.vue'
import { sanitizeInput, debounce as debounceUtil } from '@/utils/validation'
import { PLACEHOLDER_IMAGES, handleImageError as handleImageErrorUtil } from '@/utils/imagePlaceholder'

const { warning: showWarning, success: showSuccess, error: showError } = useToast()

const emit = defineEmits(['product-selected', 'scan-imei'])

// State - Search
const keyword = ref('')
const ketQua = ref([])
const isLoading = ref(false)
const searchInput = ref(null)

// State - Pagination
const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

// State - Modals
const showVariantModal = ref(false)
const showQuantityModal = ref(false)
const showProductDetailModal = ref(false)
const showAdvancedSearch = ref(false)
const selectedProduct = ref(null)
const selectedProductForDetail = ref(null)
const selectedVariant = ref(null)
const variants = ref([])
const loadingVariants = ref(false)

// State - Quantity
const quantity = ref(1)
const quantityError = ref('')

// State - Barcode Scanner
const showBarcodeScanner = ref(false)
const isScanning = ref(false)
const lastScannedCode = ref('')

// Debounce timer
let searchTimeout = null
let barcodeInputTimeout = null

// Computed
const canAddProduct = computed(() => {
    return selectedVariant.value &&
        quantity.value > 0 &&
        quantity.value <= selectedVariant.value.soLuongTon &&
        !quantityError.value
})

// Computed - Pagination
const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible)
    
    if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible)
    }
    
    for (let i = start; i < end; i++) {
        pages.push(i)
    }
    return pages
})

// Load sản phẩm còn hàng khi vào màn hình
onMounted(async () => {
    await loadSanPhamConHang()
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcut)
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyboardShortcut)
})

// Methods
const loadSanPhamConHang = async (page = 0) => {
    isLoading.value = true
    console.log('📦 Load danh sách sản phẩm còn hàng...', { page, size: pageSize.value })

    try {
        const response = await laySanPhamConHang({
            page: page,
            size: pageSize.value
        })

        console.log('📦 Response sản phẩm còn hàng:', response)

        // Xử lý response linh hoạt
        let products = []

        if (response) {
            if (response.data && response.data.content && Array.isArray(response.data.content)) {
                products = response.data.content
                // Cập nhật pagination info
                if (response.data.totalElements !== undefined) {
                    totalElements.value = response.data.totalElements
                }
                if (response.data.totalPages !== undefined) {
                    totalPages.value = response.data.totalPages
                }
            } else if (response.data && Array.isArray(response.data)) {
                products = response.data
            } else if (Array.isArray(response)) {
                products = response
            } else if (response.content && Array.isArray(response.content)) {
                products = response.content
            }
        }

        ketQua.value = products
        currentPage.value = page
        console.log('✅ Đã load', products.length, 'sản phẩm còn hàng')

    } catch (error) {
        console.error('❌ Lỗi khi load sản phẩm còn hàng:', error)
        ketQua.value = []
    } finally {
        isLoading.value = false
    }
}

/**
 * Chuyển trang
 */
const goToPage = async (page) => {
    if (page < 0 || page >= totalPages.value) return
    
    if (keyword.value) {
        await handleSearch(page)
    } else {
        await loadSanPhamConHang(page)
    }
}

/**
 * Xử lý keyboard shortcuts
 */
const handleKeyboardShortcut = (event) => {
    // Ctrl+F: Mở tìm kiếm nâng cao
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault()
        openAdvancedSearch()
        return
    }
    
    // Esc: Đóng modal
    if (event.key === 'Escape') {
        if (showVariantModal.value) {
            closeVariantModal()
        } else if (showQuantityModal.value) {
            closeQuantityModal()
        } else if (showProductDetailModal.value) {
            closeProductDetailModal()
        } else if (showAdvancedSearch.value) {
            closeAdvancedSearch()
        } else if (showBarcodeScanner.value) {
            closeBarcodeScanner()
        }
        return
    }
    
    // Enter: Chọn sản phẩm đầu tiên (nếu đang focus vào input search và có kết quả)
    if (event.key === 'Enter' && document.activeElement === searchInput.value && ketQua.value.length > 0) {
        event.preventDefault()
        openVariantModal(ketQua.value[0])
        return
    }
    
    // D: Mở chi tiết sản phẩm đầu tiên
    if (event.key === 'd' && !event.ctrlKey && !event.altKey && ketQua.value.length > 0) {
        if (document.activeElement === searchInput.value || document.activeElement.tagName === 'BODY') {
            openProductDetailModal(ketQua.value[0])
        }
    }
}

/**
 * Xử lý lỗi ảnh
 */
const handleImageError = (event) => {
    handleImageErrorUtil(event, 'medium')
}

/**
 * Kiểm tra sản phẩm mới (trong 7 ngày)
 */
const isNewProduct = (product) => {
    if (!product.ngayTao) return false
    const createdDate = new Date(product.ngayTao)
    const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
}

/**
 * Kiểm tra sản phẩm hot (có nhiều biến thể hoặc tồn kho cao)
 */
const isHotProduct = (product) => {
    const variantCount = getVariantCount(product)
    // Hot nếu có >= 5 biến thể hoặc tổng tồn kho > 50
    if (variantCount >= 5) return true
    
    // Tính tổng tồn kho từ các biến thể
    if (product.chiTietSanPhams && product.chiTietSanPhams.length > 0) {
        const totalStock = product.chiTietSanPhams.reduce((sum, v) => sum + (v.soLuongTon || 0), 0)
        return totalStock > 50
    }
    
    return false
}

/**
 * Kiểm tra sản phẩm có giảm giá
 */
const hasDiscount = (product) => {
    if (product.chiTietSanPhams && product.chiTietSanPhams.length > 0) {
        return product.chiTietSanPhams.some(v => v.coGiamGia && v.phanTramGiam > 0)
    }
    return false
}

/**
 * Xử lý input tìm kiếm (có thể là mã vạch/QR được quét)
 */
const handleSearchInput = () => {
    // Sanitize input
    keyword.value = sanitizeInput(keyword.value)
    
    // Nếu đang ở chế độ quét, kiểm tra xem có phải mã vạch/QR không
    if (isScanning.value && keyword.value.trim().length >= 8) {
        // Có thể là mã vạch/QR (thường dài hơn 8 ký tự)
        clearTimeout(barcodeInputTimeout)
        barcodeInputTimeout = setTimeout(() => {
            handleBarcodeInput(keyword.value.trim())
        }, 500) // Đợi 500ms để đảm bảo đã nhập xong mã
    } else {
        // Tìm kiếm bình thường
        handleSearch()
    }
}

/**
 * Xử lý khi paste (có thể là mã vạch/QR được copy)
 */
const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData('text')
    if (pastedText && pastedText.trim().length >= 8) {
        // Có thể là mã vạch/QR
        setTimeout(() => {
            handleBarcodeInput(pastedText.trim())
        }, 100)
    }
}

/**
 * Xử lý mã vạch/QR được nhập/quét
 */
const handleBarcodeInput = async (code) => {
    if (!code || code === lastScannedCode.value) {
        return // Tránh xử lý trùng lặp
    }

    console.log('📷 Xử lý mã vạch/QR:', code)
    lastScannedCode.value = code
    isScanning.value = true
    isLoading.value = true

    try {
        // Thử tìm sản phẩm theo IMEI/Serial
        const response = await timSanPhamTheoIMEI(code)

        if (response && response.data) {
            const product = response.data

            // Kiểm tra tồn kho
            if (!product.soLuongTon || product.soLuongTon < 1) {
                showWarning('Sản phẩm này đã hết hàng!')
                // Vẫn hiển thị sản phẩm trong kết quả
                ketQua.value = [product]
                return
            }

            // Tự động mở modal chọn biến thể và thêm vào hóa đơn
            // Nếu product là ChiTietSanPham (có id), tự động thêm vào hóa đơn
            if (product.id) {
                // Emit event để thêm vào hóa đơn
                emit('product-selected', {
                    variant: product,
                    quantity: 1,
                    product: product
                })

                showSuccess(`Đã tìm thấy sản phẩm: ${product.tenSanPham || product.tenSP}`)
                
                // Reset keyword sau khi quét thành công
                keyword.value = ''
                closeBarcodeScanner()
            } else {
                // Nếu là SanPham cha, hiển thị trong kết quả
                ketQua.value = [product]
                showSuccess('Đã tìm thấy sản phẩm! Vui lòng chọn biến thể.')
            }
        } else {
            // Nếu không tìm thấy theo IMEI, thử tìm kiếm bình thường
            console.log('⚠️ Không tìm thấy theo IMEI, thử tìm kiếm bình thường...')
            keyword.value = code
            handleSearch()
        }
    } catch (error) {
        console.error('❌ Lỗi khi tìm sản phẩm theo mã vạch/QR:', error)
        
        // Nếu không tìm thấy theo IMEI, thử tìm kiếm bình thường
        console.log('⚠️ Thử tìm kiếm bình thường với mã:', code)
        keyword.value = code
        handleSearch()
    } finally {
        isLoading.value = false
        isScanning.value = false
    }
}

const handleSearch = async (page = 0) => {
    clearTimeout(searchTimeout)
    clearTimeout(barcodeInputTimeout)

    // Sanitize và validate keyword
    const sanitizedKeyword = sanitizeInput(keyword.value)
    if (sanitizedKeyword !== keyword.value) {
        keyword.value = sanitizedKeyword
    }

    if (!keyword.value || keyword.value.trim().length < 2) {
        // Nếu xóa keyword, load lại sản phẩm còn hàng
        currentPage.value = 0
        await loadSanPhamConHang(0)
        return
    }

    // Giới hạn độ dài keyword để tránh spam
    if (keyword.value.length > 100) {
        keyword.value = keyword.value.substring(0, 100)
        showWarning('Từ khóa tìm kiếm quá dài, đã được cắt ngắn')
    }

    searchTimeout = setTimeout(async () => {
        isLoading.value = true
        console.log('🔍 Tìm kiếm sản phẩm:', keyword.value.trim(), { page, size: pageSize.value })

        try {
            const response = await timKiemSanPham({
                keyword: keyword.value.trim(),
                page: page,
                size: pageSize.value
            })

            console.log('📦 Response tìm kiếm:', response)

            // Xử lý response linh hoạt - backend có thể trả về nhiều cấu trúc
            let products = []

            if (response) {
                // Trường hợp 1: response.data.content (pagination)
                if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    products = response.data.content
                    // Cập nhật pagination info
                    if (response.data.totalElements !== undefined) {
                        totalElements.value = response.data.totalElements
                    }
                    if (response.data.totalPages !== undefined) {
                        totalPages.value = response.data.totalPages
                    }
                }
                // Trường hợp 2: response.data (array trực tiếp)
                else if (response.data && Array.isArray(response.data)) {
                    products = response.data
                    totalElements.value = products.length
                    totalPages.value = 1
                }
                // Trường hợp 3: response là array
                else if (Array.isArray(response)) {
                    products = response
                    totalElements.value = products.length
                    totalPages.value = 1
                }
                // Trường hợp 4: response.data.data
                else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    products = response.data.data
                    totalElements.value = products.length
                    totalPages.value = 1
                }
            }

            ketQua.value = products
            currentPage.value = page
            console.log('✅ Tìm thấy', products.length, 'sản phẩm')

        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm sản phẩm:', error)
            console.error('Error details:', error.response?.data)
            ketQua.value = []
            totalElements.value = 0
            totalPages.value = 0
        } finally {
            isLoading.value = false
        }
    }, 300)
}

// Modal methods
const openVariantModal = async (product) => {
    selectedProduct.value = product
    showVariantModal.value = true
    loadingVariants.value = true

    try {
        console.log('📦 Load variants cho sản phẩm:', product)

        // Variants có thể có sẵn trong product.chiTietSanPhams
        if (product.chiTietSanPhams && product.chiTietSanPhams.length > 0) {
            variants.value = product.chiTietSanPhams
            console.log('✅ Load', variants.value.length, 'variants từ cache')
        } else {
            // Nếu không có, cần gọi API để load variants
            // TODO: Implement API call nếu cần
            variants.value = []
            console.log('⚠️ Sản phẩm không có variants')
        }
    } catch (error) {
        console.error('❌ Lỗi khi load variants:', error)
        variants.value = []
    } finally {
        loadingVariants.value = false
    }
}

const closeVariantModal = () => {
    showVariantModal.value = false
    selectedProduct.value = null
    variants.value = []
}

const selectVariant = (variant) => {
    if (variant.soLuongTon <= 0) {
        showWarning('Sản phẩm này đã hết hàng!')
        return
    }

    selectedVariant.value = variant
    quantity.value = 1
    quantityError.value = ''

    // Đóng modal 1, mở modal 2
    closeVariantModal()
    showQuantityModal.value = true
}

const closeQuantityModal = () => {
    showQuantityModal.value = false
    selectedVariant.value = null
    quantity.value = 1
    quantityError.value = ''
}

const increaseQuantity = () => {
    if (quantity.value < selectedVariant.value.soLuongTon) {
        quantity.value++
        validateQuantity()
    }
}

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--
        validateQuantity()
    }
}

const validateQuantity = () => {
    quantityError.value = ''

    if (!quantity.value || quantity.value < 1) {
        quantityError.value = 'Số lượng phải lớn hơn 0'
        return
    }

    if (quantity.value > selectedVariant.value.soLuongTon) {
        quantityError.value = `Số lượng không được vượt quá tồn kho (${selectedVariant.value.soLuongTon})`
        quantity.value = selectedVariant.value.soLuongTon
    }
}

const confirmAddProduct = () => {
    if (!canAddProduct.value) return

    // Emit sự kiện với chi tiết sản phẩm và số lượng
    emit('product-selected', {
        variant: selectedVariant.value,
        quantity: quantity.value,
        product: selectedProduct.value
    })

    console.log('✅ Đã chọn sản phẩm:', {
        name: getVariantDisplayName(selectedVariant.value),
        quantity: quantity.value,
        price: getCurrentPrice(selectedVariant.value),
        total: getCurrentPrice(selectedVariant.value) * quantity.value
    })

    // Đóng modal và reset
    closeQuantityModal()
}

const getProductImage = (product) => {
    if (product.anhSanPhams && product.anhSanPhams.length > 0) {
        const defaultImage = product.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : product.anhSanPhams[0].uri
    }
    return PLACEHOLDER_IMAGES.medium
}

const getProductName = (product) => {
    // ChiTietSanPham có tenSP, SanPham có tenSanPham
    return product.tenSP || product.tenSanPham || 'Không có tên'
}

const getProductCode = (product) => {
    // ChiTietSanPham có maCTSP, SanPham có maSanPham
    return product.maCTSP || product.maSanPham || 'N/A'
}

const getVariantCount = (product) => {
    // Đếm số biến thể nếu có
    return product.chiTietSanPhams?.length || 0
}

const hasStock = (product) => {
    // Kiểm tra còn hàng
    // Nếu có soLuongTon (ChiTietSanPham)
    if (product.soLuongTon !== undefined) {
        return product.soLuongTon > 0
    }

    // Nếu là SanPham cha, kiểm tra có biến thể còn hàng không
    if (product.chiTietSanPhams && product.chiTietSanPhams.length > 0) {
        return product.chiTietSanPhams.some(ctsp => ctsp.soLuongTon > 0)
    }

    // Nếu có trangThai = 1 (đang bán) thì coi như còn hàng
    // Vì API /api/san-pham/con-hang đã lọc sản phẩm có tồn kho > 0
    if (product.trangThai === 1) {
        return true
    }

    return false
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

const getStockClass = (stock) => {
    if (stock > 10) return 'stock-high text-success'
    if (stock > 0) return 'stock-medium text-warning'
    return 'stock-low text-danger'
}

const getVariantDisplayName = (variant) => {
    // Backend trả về field "tenSanPham" trong ChiTietSanPhamResponse
    const name = variant.tenSanPham || variant.tenSP || 'Không có tên'

    // Nếu có mã CTSP, hiển thị cả mã
    if (variant.maCtsp) {
        return `${name} (${variant.maCtsp})`
    }

    return name
}

const getVariantSpecs = (variant) => {
    // Tạo chuỗi mô tả ngắn gọn các thuộc tính
    // Backend trả về: tenCpu, tenRam, dungLuongOCung, tenMauSac, kichThuocManHinh
    const specs = []

    if (variant.tenCpu) specs.push(variant.tenCpu)
    if (variant.tenRam) specs.push(variant.tenRam)
    if (variant.dungLuongOCung) specs.push(variant.dungLuongOCung)
    if (variant.tenMauSac) specs.push(`Màu ${variant.tenMauSac}`)
    if (variant.kichThuocManHinh) specs.push(`${variant.kichThuocManHinh}"`)

    return specs.length > 0 ? specs.join(' | ') : 'Chưa có thông số'
}

/**
 * Lấy giá hiện tại của variant (ưu tiên giá giảm nếu có)
 */
const getCurrentPrice = (variant) => {
    if (variant.coGiamGia && variant.giaGiam) {
        return variant.giaGiam
    }
    return variant.giaBan || 0
}

/**
 * Mở modal chi tiết sản phẩm
 */
const openProductDetailModal = (product) => {
    selectedProductForDetail.value = product
    showProductDetailModal.value = true
}

/**
 * Đóng modal chi tiết sản phẩm
 */
const closeProductDetailModal = () => {
    showProductDetailModal.value = false
    selectedProductForDetail.value = null
}

/**
 * Xử lý click vào backdrop
 */
const handleBackdropClick = () => {
    if (showProductDetailModal.value) {
        closeProductDetailModal()
    } else if (showVariantModal.value) {
        closeVariantModal()
    } else if (showQuantityModal.value) {
        closeQuantityModal()
    }
}

/**
 * Xử lý khi chọn biến thể từ modal chi tiết
 */
const handleSelectVariantFromDetail = (data) => {
    // Đóng modal chi tiết
    closeProductDetailModal()
    
    // Mở modal chọn số lượng với biến thể đã chọn
    if (data.variant) {
        selectedVariant.value = data.variant
        selectedProduct.value = data.product
        quantity.value = 1
        quantityError.value = ''
        showQuantityModal.value = true
    }
}

/**
 * Mở modal tìm kiếm nâng cao
 */
const openAdvancedSearch = () => {
    showAdvancedSearch.value = true
}

/**
 * Đóng modal tìm kiếm nâng cao
 */
const closeAdvancedSearch = () => {
    showAdvancedSearch.value = false
}

/**
 * Xử lý kết quả từ tìm kiếm nâng cao
 */
const handleAdvancedSearchResults = (products) => {
    // Cập nhật kết quả tìm kiếm
    ketQua.value = products
    keyword.value = '' // Reset keyword vì đã dùng filter nâng cao
    currentPage.value = 0
    totalElements.value = products.length
    totalPages.value = Math.ceil(products.length / pageSize.value)
    
    // Đóng modal
    closeAdvancedSearch()
    
    console.log('✅ Đã nhận', products.length, 'kết quả từ tìm kiếm nâng cao')
}

/**
 * Bật/tắt camera scanner
 */
const toggleBarcodeScanner = () => {
    showBarcodeScanner.value = !showBarcodeScanner.value
    isScanning.value = showBarcodeScanner.value
    
    if (showBarcodeScanner.value) {
        // Focus vào input để có thể nhập mã
        nextTick(() => {
            if (searchInput.value) {
                searchInput.value.focus()
            }
        })
    }
}

/**
 * Đóng camera scanner
 */
const closeBarcodeScanner = () => {
    showBarcodeScanner.value = false
    isScanning.value = false
    lastScannedCode.value = ''
}

/**
 * Xử lý khi camera quét được mã vạch/QR
 */
const onBarcodeDetected = async (result) => {
    console.log('📷 Camera đã quét được mã:', result)
    
    if (!result || !result.trim()) {
        return
    }

    // Đóng camera sau khi quét
    closeBarcodeScanner()

    // Set mã vào input và xử lý
    keyword.value = result.trim()
    await handleBarcodeInput(result.trim())
}
</script>

<style scoped>
.product-search {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
}

.card-body {
    flex: 1;
    overflow-y: auto;
}

.search-results {
    margin-top: 1rem;
}

.results-header {
    padding: 0.5rem 0;
    border-bottom: 2px solid #dee2e6;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.product-card {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #0dcaf0;
}

.product-image-wrapper {
    position: relative;
    margin-bottom: 0.5rem;
}

.product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
    transition: opacity 0.3s;
}

.product-image[loading="lazy"] {
    opacity: 0.7;
}

.product-image[loading="lazy"]:not([src=""]) {
    opacity: 1;
}

.product-badges {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    z-index: 1;
}

.badge-new,
.badge-hot,
.badge-discount {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.product-card.product-new {
    border-left: 3px solid #28a745;
}

.product-card.product-hot {
    border-left: 3px solid #dc3545;
}

.keyboard-hint {
    font-size: 0.75rem;
}

.keyboard-hint kbd {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    padding: 0.1rem 0.3rem;
    font-size: 0.7rem;
    font-family: monospace;
}

.pagination-wrapper {
    padding: 1rem 0;
}

.pagination .page-link {
    cursor: pointer;
    user-select: none;
}

.product-stock-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stock-high {
    color: #28a745;
    border: 1px solid #28a745;
}

.stock-medium {
    color: #ffc107;
    border: 1px solid #ffc107;
}

.stock-low {
    color: #dc3545;
    border: 1px solid #dc3545;
}

.product-info {
    text-align: left;
}

.product-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-code {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
}

.product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.meta-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    background: #e9ecef;
    border-radius: 12px;
    color: #495057;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
}

.meta-badge.status-active {
    background: #d1f5e5;
    color: #28a745;
}

.meta-badge.status-inactive {
    background: #ffe8e8;
    color: #dc3545;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.product-price {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
}

.no-results,
.search-instruction {
    padding: 3rem 1rem;
}

/* ===== MODAL STYLES ===== */
.modal {
    z-index: 1050;
}

.modal-backdrop {
    z-index: 1040;
}

/* Variant List */
.variants-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.variant-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
}

.variant-item:hover {
    border-color: #0dcaf0;
    background: #f8f9fa;
    box-shadow: 0 2px 8px rgba(13, 202, 240, 0.15);
}

.variant-info {
    flex: 1;
    min-width: 0;
}

.variant-name {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.25rem;
}

.variant-specs {
    font-size: 0.875rem;
    color: #6c757d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.variant-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.variant-price {
    font-size: 1.125rem;
    font-weight: 700;
    color: #dc3545;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
}

.price-discounted {
    color: #dc3545;
    font-weight: 700;
}

.price-original {
    color: #6c757d;
    font-size: 0.875rem;
    font-weight: 400;
}

.discount-badge {
    margin-top: 0.25rem;
}

.variant-stock {
    font-size: 0.875rem;
    font-weight: 600;
}

.variant-status {
    font-size: 0.75rem;
}

.variant-action {
    color: #6c757d;
    font-size: 1.25rem;
}

/* Quantity Modal */
.quantity-form {
    padding: 0.5rem 0;
}

.selected-variant-info h6 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.info-row .label {
    font-weight: 600;
    color: #495057;
}

.info-row .value {
    font-weight: 600;
}

.info-row .value.price {
    color: #dc3545;
    font-size: 1.125rem;
}

.info-row .value.stock {
    color: #28a745;
}

.quantity-input-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.quantity-input-group input {
    flex: 1;
    font-size: 1.25rem;
    font-weight: 600;
}

.quantity-input-group button {
    width: 40px;
    padding: 0;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.total-row .label {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212529;
}

.total-row .value.total {
    font-size: 1.5rem;
    font-weight: 700;
    color: #28a745;
}

/* Responsive */
@media (max-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 0.75rem;
    }
    
    .search-bar .input-group {
        flex-wrap: wrap;
    }
    
    .search-bar .btn {
        min-width: 44px;
        min-height: 44px;
    }
}

@media (max-width: 991px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }

    .variant-item {
        flex-direction: column;
        align-items: flex-start;
    }

    .variant-meta {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .variant-action {
        display: none;
    }
}

@media (max-width: 767.98px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.5rem;
    }
    
    .product-card {
        padding: 0.5rem;
    }
    
    .product-image {
        height: 120px;
    }
    
    .product-footer .btn {
        font-size: 0.85rem;
        padding: 0.4rem 0.5rem;
    }
    
    .results-header {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .keyboard-hint {
        display: none; /* Ẩn keyboard hint trên mobile */
    }
    
    .barcode-scanner-container {
        padding: 0.75rem;
    }
    
    .scanner-wrapper {
        max-width: 100%;
    }
}

@media (max-width: 576px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .product-image {
        height: 100px;
    }
    
    .product-name {
        font-size: 0.85rem;
    }
    
    .quantity-input-group input {
        font-size: 1rem;
    }

    .total-row .value.total {
        font-size: 1.25rem;
    }
    
    .pagination {
        font-size: 0.85rem;
    }
    
    .pagination .page-link {
        padding: 0.375rem 0.5rem;
    }
}

/* Barcode Scanner Styles */
.barcode-scanner-container {
    background: #f8f9fa;
    border: 2px solid #0dcaf0;
    border-radius: 8px;
    padding: 1rem;
}

.scanner-header {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.scanner-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
}

.scanner-wrapper :deep(video) {
    width: 100%;
    height: auto;
    display: block;
}

.btn.active {
    background-color: #0dcaf0;
    border-color: #0dcaf0;
    color: white;
}
</style>
