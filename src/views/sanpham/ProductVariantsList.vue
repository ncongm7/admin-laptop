<template>
    <div class="product-variants-list">
        <div class="container-fluid">
            <!-- Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="mb-1">Danh sách Chi tiết Sản phẩm</h2>
                            <p class="text-muted mb-0">Quản lý tất cả biến thể sản phẩm trong hệ thống</p>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-outline-secondary me-2" @click="exportData">
                                <i class="bi bi-download me-1"></i>Xuất Excel
                            </button>
                            <button class="btn btn-primary" @click="showAddForm">
                                <i class="bi bi-plus-circle me-1"></i>Thêm biến thể
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters & Search -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="row g-3">
                                <!-- Search -->
                                <div class="col-md-4">
                                    <label class="form-label">Tìm kiếm</label>
                                    <div class="input-group">
                                        <span class="input-group-text">
                                            <i class="bi bi-search"></i>
                                        </span>
                                        <input v-model="filters.search" type="text" class="form-control"
                                            placeholder="Tên sản phẩm, mã sản phẩm...">
                                    </div>
                                </div>

                                <!-- Product Filter -->
                                <div class="col-md-3">
                                    <label class="form-label">Sản phẩm</label>
                                    <select v-model="filters.productId" class="form-select">
                                        <option value="">Tất cả sản phẩm</option>
                                        <option v-for="product in products" :key="product.id" :value="product.id">
                                            {{ product.tenSanPham }}
                                        </option>
                                    </select>
                                </div>

                                <!-- ❌ XÓA: Brand Filter - Backend chưa có Hang controller -->
                                <!-- <div class="col-md-2">
                                    <label class="form-label">Hãng</label>
                                    <select v-model="filters.brandId" class="form-select">
                                        <option value="">Tất cả hãng</option>
                                        <option v-for="brand in attributeStore.getBrands" :key="brand.id"
                                            :value="brand.id">
                                            {{ brand.tenHang }}
                                        </option>
                                    </select>
                                </div> -->

                                <!-- Price Range -->
                                <div class="col-md-3">
                                    <label class="form-label">Khoảng giá</label>
                                    <div class="d-flex gap-2">
                                        <input v-model="filters.minPrice" type="number" class="form-control"
                                            placeholder="Từ">
                                        <input v-model="filters.maxPrice" type="number" class="form-control"
                                            placeholder="Đến">
                                    </div>
                                </div>
                            </div>

                            <!-- Advanced Filters -->
                            <div class="row g-3 mt-2">
                                <div class="col-md-2">
                                    <label class="form-label">RAM</label>
                                    <select v-model="filters.ramId" class="form-select">
                                        <option value="">Tất cả RAM</option>
                                        <option v-for="ram in attributeStore.getRams" :key="ram.id" :value="ram.id">
                                            {{ ram.dungLuong }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">Ổ cứng</label>
                                    <select v-model="filters.storageId" class="form-select">
                                        <option value="">Tất cả ổ cứng</option>
                                        <option v-for="storage in attributeStore.getStorages" :key="storage.id"
                                            :value="storage.id">
                                            {{ storage.tenOCung }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">Màu sắc</label>
                                    <select v-model="filters.colorId" class="form-select">
                                        <option value="">Tất cả màu</option>
                                        <option v-for="color in attributeStore.getColors" :key="color.id"
                                            :value="color.id">
                                            {{ color.tenMau }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">Trạng thái</label>
                                    <select v-model="filters.status" class="form-select">
                                        <option value="">Tất cả</option>
                                        <option value="in_stock">Còn hàng</option>
                                        <option value="out_of_stock">Hết hàng</option>
                                        <option value="low_stock">Sắp hết</option>
                                    </select>
                                </div>

                                <div class="col-md-4 d-flex align-items-end">
                                    <div class="d-flex gap-2 w-100">
                                        <button class="btn btn-outline-secondary flex-fill" @click="clearFilters">
                                            <i class="bi bi-arrow-clockwise me-1"></i>Làm mới
                                        </button>
                                        <button class="btn btn-primary flex-fill" @click="applyFilters">
                                            <i class="bi bi-funnel me-1"></i>Lọc
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results Summary -->
            <div class="row mb-3">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="results-summary">
                            <span class="text-muted">
                                Hiển thị {{ filteredVariants.length }} / {{ totalVariants }} biến thể
                            </span>
                        </div>
                        <div class="view-controls">
                            <div class="btn-group me-2" role="group">
                                <button class="btn btn-sm"
                                    :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
                                    @click="viewMode = 'table'">
                                    <i class="bi bi-table"></i>
                                </button>
                                <button class="btn btn-sm"
                                    :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                                    @click="viewMode = 'grid'">
                                    <i class="bi bi-grid-3x3-gap"></i>
                                </button>
                            </div>
                            <select v-model="itemsPerPage" class="form-select form-select-sm" style="width: auto;">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body p-0">
                            <!-- Debug Info -->
                            <!-- <div class="p-3 bg-light">
                                <small class="text-muted">
                                    Debug: Loading={{ loading }},
                                    AllVariants={{ allVariants.length }},
                                    Filtered={{ filteredVariants.length }},
                                    Paginated={{ paginatedVariants.length }}
                                </small>
                            </div> -->

                            <!-- Loading State -->
                            <div v-if="loading" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
                            </div>

                            <!-- Empty State -->
                            <div v-else-if="filteredVariants.length === 0" class="text-center py-5">
                                <div class="empty-icon mb-3">
                                    <i class="bi bi-box-seam display-1 text-muted"></i>
                                </div>
                                <h5 class="mb-2">Không tìm thấy biến thể nào</h5>
                                <p class="text-muted mb-4">Thử thay đổi bộ lọc hoặc thêm biến thể mới</p>
                                <button class="btn btn-primary" @click="showAddForm">
                                    <i class="bi bi-plus-circle me-1"></i> Thêm biến thể
                                </button>
                            </div>

                            <!-- Table View -->
                            <div v-else-if="viewMode === 'table'" class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>
                                                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                                            </th>
                                            <th>Ảnh</th>
                                            <th>Sản phẩm</th>
                                            <th>Thông số</th>
                                            <th>Giá bán</th>
                                            <th>Tồn kho</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày tạo</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="variant in paginatedVariants" :key="variant.id">
                                            <td>
                                                <input type="checkbox" v-model="selectedVariants" :value="variant.id">
                                            </td>
                                            <td>
                                                <img :src="getVariantImage(variant)" alt="Variant"
                                                    class="variant-thumbnail">
                                            </td>
                                            <td>
                                                <div class="product-info">
                                                    <div class="fw-bold">{{ getProductName(variant.sanPhamId) }}</div>
                                                    <small class="text-muted">{{ variant.tenSP || 'N/A' }}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="variant-specs">
                                                    <div v-if="variant.ramId" class="spec-item">
                                                        <i class="bi bi-memory me-1"></i>
                                                        {{ getAttributeName('rams', variant.ramId) }}
                                                    </div>
                                                    <div v-if="variant.ocungId" class="spec-item">
                                                        <i class="bi bi-device-hdd me-1"></i>
                                                        {{ getAttributeName('storages', variant.ocungId) }}
                                                    </div>
                                                    <div v-if="variant.mauSacId" class="spec-item">
                                                        <i class="bi bi-palette me-1"></i>
                                                        {{ getAttributeName('colors', variant.mauSacId) }}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="fw-bold text-success">
                                                    {{ formatCurrency(variant.giaBan) }}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge" :class="getStockBadgeClass(variant.imeiCount)">
                                                    {{ variant.imeiCount || 0 }} sản phẩm
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge" :class="getStatusBadgeClass(variant.imeiCount)">
                                                    {{ getStatusText(variant.imeiCount) }}
                                                </span>
                                            </td>
                                            <td>
                                                <small class="text-muted">
                                                    {{ formatDate(variant.createdAt) }}
                                                </small>
                                            </td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <button class="btn btn-outline-primary"
                                                        @click="viewVariant(variant)">
                                                        <i class="bi bi-eye"></i>
                                                    </button>
                                                    <button class="btn btn-outline-secondary"
                                                        @click="editVariant(variant)">
                                                        <i class="bi bi-pencil"></i>
                                                    </button>
                                                    <button class="btn btn-outline-danger"
                                                        @click="confirmDelete(variant.id)">
                                                        <i class="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Grid View -->
                            <div v-else class="p-3">
                                <div class="row g-3">
                                    <div v-for="variant in paginatedVariants" :key="variant.id"
                                        class="col-xl-3 col-lg-4 col-md-6">
                                        <ProductVariantCard :variant="variant" @edit="editVariant" @view="viewVariant"
                                            @delete="confirmDelete" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="row mt-4">
                <div class="col-12">
                    <nav aria-label="Variants pagination">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage = 1">
                                    <i class="bi bi-chevron-double-left"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage--">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                            </li>

                            <li v-for="page in visiblePages" :key="page" class="page-item"
                                :class="{ active: page === currentPage }">
                                <button class="page-link" @click="currentPage = page">{{ page }}</button>
                            </li>

                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage++">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage = totalPages">
                                    <i class="bi bi-chevron-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Modal Form -->
        <ProductDetailFormModal v-if="showModal" :variant="currentVariant" :product="selectedProduct" :show="showModal"
            @close="closeModal" @save="handleSave" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import { useAttributeStore } from '@/stores/attributeStore'
import ProductVariantCard from '@/components/chitietsanpham/ProductVariantCard.vue'
import ProductDetailFormModal from '@/components/chitietsanpham/ProductDetailFormModal.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

const router = useRouter()
const productStore = useProductStore()
const productDetailStore = useProductDetailStore()
const attributeStore = useAttributeStore()

// State
const loading = ref(false)
const showModal = ref(false)
const currentVariant = ref(null)
const selectedProduct = ref(null)
const viewMode = ref('table')
const currentPage = ref(1)
const itemsPerPage = ref(25)
const selectedVariants = ref([])
const selectAll = ref(false)

// Filters
const filters = ref({
    search: '',
    productId: '',
    brandId: '',
    minPrice: '',
    maxPrice: '',
    ramId: '',
    storageId: '',
    colorId: '',
    status: ''
})

// Fetch data
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            productStore.fetchAllProducts(),
            productDetailStore.fetchAllVariants(),
            attributeStore.fetchAttributes()
        ])
        console.log('Loaded variants:', productDetailStore.variants)
        console.log('Loaded products:', productStore.products)
    } finally {
        loading.value = false
    }
})

// Computed
const products = computed(() => productStore.products)
const allVariants = computed(() => productDetailStore.variants || [])

const filteredVariants = computed(() => {
    let variants = allVariants.value

    // Search filter
    if (filters.value.search) {
        const searchTerm = filters.value.search.toLowerCase()
        variants = variants.filter(variant => {
            const product = getProductById(variant.sanPhamId)
            return product?.tenSanPham?.toLowerCase().includes(searchTerm) ||
                variant.tenSP?.toLowerCase().includes(searchTerm)
        })
    }

    // Product filter
    if (filters.value.productId) {
        variants = variants.filter(variant => variant.sanPhamId === parseInt(filters.value.productId))
    }

    // Brand filter
    if (filters.value.brandId) {
        variants = variants.filter(variant => {
            const product = getProductById(variant.sanPhamId)
            return product?.hangId === parseInt(filters.value.brandId)
        })
    }

    // Price range filter
    if (filters.value.minPrice) {
        variants = variants.filter(variant => variant.giaBan >= parseFloat(filters.value.minPrice))
    }
    if (filters.value.maxPrice) {
        variants = variants.filter(variant => variant.giaBan <= parseFloat(filters.value.maxPrice))
    }

    // RAM filter
    if (filters.value.ramId) {
        variants = variants.filter(variant => variant.ramId === parseInt(filters.value.ramId))
    }

    // Storage filter
    if (filters.value.storageId) {
        variants = variants.filter(variant => variant.ocungId === parseInt(filters.value.storageId))
    }

    // Color filter
    if (filters.value.colorId) {
        variants = variants.filter(variant => variant.mauSacId === parseInt(filters.value.colorId))
    }

    // Status filter
    if (filters.value.status) {
        variants = variants.filter(variant => {
            const count = variant.imeiCount || 0
            switch (filters.value.status) {
                case 'in_stock': return count > 0
                case 'out_of_stock': return count === 0
                case 'low_stock': return count > 0 && count <= 5
                default: return true
            }
        })
    }

    return variants
})

const totalVariants = computed(() => allVariants.value.length)
const totalPages = computed(() => Math.ceil(filteredVariants.value.length / itemsPerPage.value))
const paginatedVariants = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredVariants.value.slice(start, end)
})

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

// Helper functions
const getProductById = (id) => {
    return products.value.find(p => p.id === id)
}

const getProductName = (productId) => {
    const product = getProductById(productId)
    return product?.tenSanPham || 'N/A'
}

const getVariantImage = (variant) => {
    if (variant.anhSanPhams && variant.anhSanPhams.length > 0) {
        const primaryImage = variant.anhSanPhams.find(img => img.isDefault)
        return primaryImage ? primaryImage.uri : variant.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/50x50?text=No+Image'
}

const getAttributeName = (type, id) => {
    if (!id) return 'N/A'
    const attribute = attributeStore.getAttributeById(type, id)
    return attribute?.ten || attribute?.tenThuocTinh || attribute?.dungLuong || attribute?.tenOCung || attribute?.tenMau || 'N/A'
}

const getStockBadgeClass = (count) => {
    const stock = count || 0
    if (stock === 0) return 'bg-danger'
    if (stock <= 5) return 'bg-warning'
    return 'bg-success'
}

const getStatusBadgeClass = (count) => {
    const stock = count || 0
    if (stock === 0) return 'bg-danger'
    if (stock <= 5) return 'bg-warning'
    return 'bg-success'
}

const getStatusText = (count) => {
    const stock = count || 0
    if (stock === 0) return 'Hết hàng'
    if (stock <= 5) return 'Sắp hết'
    return 'Còn hàng'
}

// Actions
const showAddForm = () => {
    currentVariant.value = null
    selectedProduct.value = null
    showModal.value = true
}

const editVariant = (variant) => {
    currentVariant.value = { ...variant }
    selectedProduct.value = getProductById(variant.sanPhamId)
    showModal.value = true
}

const viewVariant = (variant) => {
    router.push(`/products/${variant.sanPhamId}/variants/${variant.id}`)
}

const confirmDelete = (variantId) => {
    if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
        productDetailStore.deleteVariant(variantId)
    }
}

const closeModal = () => {
    showModal.value = false
}

const handleSave = async (variantData) => {
    if (currentVariant.value) {
        await productDetailStore.updateVariant(variantData)
    } else {
        await productDetailStore.addVariant(variantData)
    }
    closeModal()
}

const clearFilters = () => {
    filters.value = {
        search: '',
        productId: '',
        brandId: '',
        minPrice: '',
        maxPrice: '',
        ramId: '',
        storageId: '',
        colorId: '',
        status: ''
    }
    currentPage.value = 1
}

const applyFilters = () => {
    currentPage.value = 1
}

const exportData = () => {
    // TODO: Implement export functionality
    alert('Tính năng xuất Excel sẽ được phát triển sau')
}

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedVariants.value = paginatedVariants.value.map(v => v.id)
    } else {
        selectedVariants.value = []
    }
}

// Watch for changes
watch([filters, currentPage, itemsPerPage], () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = 1
    }
}, { deep: true })
</script>

<style scoped>
.product-variants-list {
    padding: 20px 0;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.card {
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid #e9ecef;
}

.variant-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 6px;
}

.product-info {
    min-width: 150px;
}

.variant-specs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 120px;
}

.spec-item {
    font-size: 0.875rem;
    color: #6c757d;
}

.empty-icon {
    color: #6c757d;
}

.view-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.results-summary {
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .header-actions {
        flex-direction: column;
        gap: 8px;
    }

    .view-controls {
        flex-direction: column;
        gap: 8px;
    }
}
</style>