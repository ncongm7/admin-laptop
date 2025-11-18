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
                    <input ref="searchInput" type="text" class="form-control form-control-lg" v-model="keyword"
                        @input="handleSearch" @keyup.enter="handleSearch"
                        placeholder="Tìm tên, mã sản phẩm hoặc quét mã..." />
                    <button class="btn btn-primary" @click="handleSearch">
                        <i class="bi bi-search"></i>
                    </button>
                </div>

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
                <div class="results-header mb-2">
                    <span class="text-muted">Tìm thấy <strong>{{ ketQua.length }}</strong> sản phẩm</span>
                </div>

                <div class="product-grid">
                    <div v-for="product in ketQua" :key="product.id" class="product-card">
                        <div class="product-image-wrapper">
                            <img :src="getProductImage(product)" :alt="getProductName(product)" class="product-image" />
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
                                <button class="btn btn-sm btn-primary w-100" @click="openVariantModal(product)">
                                    <i class="bi bi-eye"></i> Xem chi tiết
                                </button>
                            </div>
                        </div>
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
                                    <div class="variant-price">{{ formatCurrency(variant.giaBan) }}</div>
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
                                <span class="value price">{{ formatCurrency(selectedVariant.giaBan) }}</span>
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
                                <span class="value total">{{ formatCurrency(selectedVariant.giaBan * quantity) }}</span>
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
        <div v-if="showVariantModal || showQuantityModal" class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { timKiemSanPham, laySanPhamConHang } from '@/service/banhang/banHangService'

const emit = defineEmits(['product-selected', 'scan-imei'])

// State - Search
const keyword = ref('')
const ketQua = ref([])
const isLoading = ref(false)
const searchInput = ref(null)

// State - Modals
const showVariantModal = ref(false)
const showQuantityModal = ref(false)
const selectedProduct = ref(null)
const selectedVariant = ref(null)
const variants = ref([])
const loadingVariants = ref(false)

// State - Quantity
const quantity = ref(1)
const quantityError = ref('')

// Debounce timer
let searchTimeout = null

// Computed
const canAddProduct = computed(() => {
    return selectedVariant.value &&
        quantity.value > 0 &&
        quantity.value <= selectedVariant.value.soLuongTon &&
        !quantityError.value
})

// Load sản phẩm còn hàng khi vào màn hình
onMounted(async () => {
    await loadSanPhamConHang()
})

// Methods
const loadSanPhamConHang = async () => {
    isLoading.value = true
    console.log('📦 Load danh sách sản phẩm còn hàng...')

    try {
        const response = await laySanPhamConHang({
            page: 0,
            size: 20
        })

        console.log('📦 Response sản phẩm còn hàng:', response)

        // Xử lý response linh hoạt
        let products = []

        if (response) {
            if (response.data && response.data.content && Array.isArray(response.data.content)) {
                products = response.data.content
            } else if (response.data && Array.isArray(response.data)) {
                products = response.data
            } else if (Array.isArray(response)) {
                products = response
            } else if (response.content && Array.isArray(response.content)) {
                products = response.content
            }
        }

        ketQua.value = products
        console.log('✅ Đã load', products.length, 'sản phẩm còn hàng')

    } catch (error) {
        console.error('❌ Lỗi khi load sản phẩm còn hàng:', error)
        ketQua.value = []
    } finally {
        isLoading.value = false
    }
}

const handleSearch = () => {
    clearTimeout(searchTimeout)

    if (!keyword.value || keyword.value.trim().length < 2) {
        // Nếu xóa keyword, load lại sản phẩm còn hàng
        loadSanPhamConHang()
        return
    }

    searchTimeout = setTimeout(async () => {
        isLoading.value = true
        console.log('🔍 Tìm kiếm sản phẩm:', keyword.value.trim())

        try {
            const response = await timKiemSanPham({
                keyword: keyword.value.trim(),
                page: 0,
                size: 20
            })

            console.log('📦 Response tìm kiếm:', response)

            // Xử lý response linh hoạt - backend có thể trả về nhiều cấu trúc
            let products = []

            if (response) {
                // Trường hợp 1: response.data.content (pagination)
                if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    products = response.data.content
                }
                // Trường hợp 2: response.data (array trực tiếp)
                else if (response.data && Array.isArray(response.data)) {
                    products = response.data
                }
                // Trường hợp 3: response là array
                else if (Array.isArray(response)) {
                    products = response
                }
                // Trường hợp 4: response.data.data
                else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    products = response.data.data
                }
            }

            ketQua.value = products
            console.log('✅ Tìm thấy', products.length, 'sản phẩm')

        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm sản phẩm:', error)
            console.error('Error details:', error.response?.data)
            ketQua.value = []
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
        alert('Sản phẩm này đã hết hàng!')
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
        total: selectedVariant.value.giaBan * quantity.value
    })

    // Đóng modal và reset
    closeQuantityModal()
}

const getProductImage = (product) => {
    if (product.anhSanPhams && product.anhSanPhams.length > 0) {
        const defaultImage = product.anhSanPhams.find(img => img.is_default)
        return defaultImage ? defaultImage.uri : product.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/150x150?text=No+Image'
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

@media (max-width: 576px) {
    .quantity-input-group input {
        font-size: 1rem;
    }

    .total-row .value.total {
        font-size: 1.25rem;
    }
}
</style>
