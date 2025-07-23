<template>
    <div class="products-management">
        <!-- Header Section -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">
                        <i class="bi bi-box-seam"></i>
                        Quản lý sản phẩm
                    </h1>
                    <p class="page-subtitle">Quản lý toàn bộ sản phẩm trong hệ thống</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-outline-primary me-2" @click="exportProducts">
                        <i class="bi bi-download"></i>
                        Xuất Excel
                    </button>
                    <button class="btn btn-primary" @click="showCreateModal">
                        <i class="bi bi-plus-lg"></i>
                        Thêm sản phẩm
                    </button>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-section">
            <div class="row g-3">
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card">
                        <div class="stats-icon bg-primary">
                            <i class="bi bi-box-seam"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ totalProducts }}</h3>
                            <p class="stats-label">Tổng sản phẩm</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card">
                        <div class="stats-icon bg-success">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ activeProducts }}</h3>
                            <p class="stats-label">Đang kinh doanh</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card">
                        <div class="stats-icon bg-warning">
                            <i class="bi bi-exclamation-triangle"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ lowStockProducts }}</h3>
                            <p class="stats-label">Sắp hết hàng</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card">
                        <div class="stats-icon bg-info">
                            <i class="bi bi-tags"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ totalVariants }}</h3>
                            <p class="stats-label">Tổng biến thể</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content-section">
            <!-- Filter Section -->
            <div class="filter-card">
                <ProductFilter @filter="applyFilter" @reset="resetFilter" />
            </div>

            <!-- Product List -->
            <div class="products-card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="bi bi-list-ul me-2"></i>
                        Danh sách sản phẩm
                        <span class="badge bg-primary ms-2">{{ filteredProducts.length }}</span>
                    </h5>
                    <div class="card-actions">
                        <div class="view-toggle">
                            <button class="btn btn-sm" :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'" @click="viewMode = 'grid'">
                                <i class="bi bi-grid-3x3-gap"></i>
                            </button>
                            <button class="btn btn-sm" :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'" @click="viewMode = 'list'">
                                <i class="bi bi-list"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <ProductList 
                        :products="filteredProducts" 
                        :loading="loading" 
                        :view-mode="viewMode"
                        @edit="editProduct" 
                        @view="viewDetail"
                        @delete="confirmDelete" 
                    />
                </div>
            </div>
        </div>

        <!-- Modals -->
        <ProductFormModal 
            v-if="showModal" 
            :product="selectedProduct" 
            @close="closeModal" 
            @save="saveProduct" 
        />
        
        <ProductDetailModal 
            v-if="showDetailModal" 
            :product="selectedProduct" 
            @close="closeDetailModal"
            @edit="editFromDetail" 
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import ProductFilter from '@/components/sanpham/quanlisanpham/ProductFilter.vue'
import ProductList from '@/components/sanpham/quanlisanpham/ProductList.vue'
import ProductFormModal from '@/components/sanpham/quanlisanpham/ProductFormModal.vue'
import ProductDetailModal from '@/components/sanpham/quanlisanpham/ProductDetailModal.vue'
import { useProductDetailStore } from '@/stores/productDetailStore'

const props = defineProps({
    showCreateModal: Boolean
})

const router = useRouter()
const productStore = useProductStore()
const useProductDetailStore1 = useProductDetailStore()

const loading = ref(true)
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedProduct = ref(null)
const viewMode = ref('list')
const filters = ref({
    brand: null,
    cpu: null,
    ram: null,
    gpu: null,
    minPrice: null,
    maxPrice: null,
    keyword: ''
})

const fetchData = async () => {
    try {
        loading.value = true
        await productStore.fetchAllProducts()
    } finally {
        loading.value = false
    }
}

const brands = computed(() => productStore.brands)
const cpus = computed(() => productStore.cpus)
const rams = computed(() => productStore.rams)
const gpus = computed(() => productStore.gpus)
const storages = computed(() => productStore.storages)
const colors = computed(() => productStore.colors)
const screens = computed(() => productStore.screens)
const displays = computed(() => productStore.displays)
const oses = computed(() => productStore.oses)
const batteries = computed(() => productStore.batteries)
const cameras = computed(() => productStore.cameras)

const filteredProducts = computed(() => {
    return productStore.products.filter(product => {
        const matchesBrand = !filters.value.brand || product.brand?.id === filters.value.brand
        const matchesCPU = !filters.value.cpu || product.cpu?.id === filters.value.cpu
        const matchesRAM = !filters.value.ram || product.ram?.id === filters.value.ram
        const matchesGPU = !filters.value.gpu || product.gpu?.id === filters.value.gpu
        const matchesKeyword = !filters.value.keyword ||
            product.tenSanPham.toLowerCase().includes(filters.value.keyword.toLowerCase())
        const minPrice = filters.value.minPrice ? Number(filters.value.minPrice) : 0
        const maxPrice = filters.value.maxPrice ? Number(filters.value.maxPrice) : Infinity
        const matchesPrice = product.variants.some(variant =>
            variant.giaBan >= minPrice && variant.giaBan <= maxPrice)
        return matchesCPU && matchesRAM && matchesGPU &&
            matchesKeyword && matchesPrice
    })
})

// Stats computeds
const totalProducts = computed(() => productStore.products.length)
const activeProducts = computed(() => 
    productStore.products.filter(p => p.trangThai === 'ACTIVE').length
)
const lowStockProducts = computed(() => 
    productStore.products.filter(p => 
        p.variants.some(v => v.soLuongTon <= 10)
    ).length
)
const totalVariants = computed(() => 
    productStore.products.reduce((total, p) => total + (p.variants?.length || 0), 0)
)

const editProduct = (product) => {
    selectedProduct.value = { ...product }
    showModal.value = true
}

const viewDetail = async (product) => {
    const detail = await productStore.fetchProductByIdSP(product.id)
    selectedProduct.value = { id: product.id, ...product }
    useProductDetailStore1.productDetail = { ...detail }
    router.push(`/products/${product.id}/detail`)
}

const editFromDetail = () => {
    showDetailModal.value = false
    showModal.value = true
}

const confirmDelete = (product) => {
    // Implement delete confirmation
}

const saveProduct = async (productData) => {
    if (productData.id) {
        await productStore.updateProduct(productData)
    } else {
        await productStore.addProduct(productData)
    }
    closeModal()
}

const closeModal = () => {
    showModal.value = false
}

const closeDetailModal = () => {
    showDetailModal.value = false
}

const applyFilter = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
}

const resetFilter = () => {
    filters.value = {
        brand: null,
        cpu: null,
        ram: null,
        gpu: null,
        minPrice: null,
        maxPrice: null,
        keyword: ''
    }
}

const showCreateModal = () => {
    selectedProduct.value = null
    showModal.value = true
}

const exportProducts = () => {
    // Implement export functionality
    console.log('Exporting products...')
}

onMounted(() => {
    fetchData()
})

watch(() => props.showCreateModal, (val) => {
    if (val) {
        selectedProduct.value = null
        showModal.value = true
    }
})
</script>

<style scoped>
.products-management {
    background-color: #f8fafc;
    min-height: 100vh;
}

/* Header Section */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 2rem 3rem;
    margin-bottom: -1rem;
    position: relative;
}

.page-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2rem;
    background: #f8fafc;
    border-radius: 2rem 2rem 0 0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.page-subtitle {
    margin: 0.5rem 0 0;
    opacity: 0.9;
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.header-actions .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Stats Section */
.stats-section {
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.stats-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stats-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
}

.stats-content {
    flex: 1;
}

.stats-number {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
}

.stats-label {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Content Section */
.content-section {
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.filter-card,
.products-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.filter-card {
    padding: 1.5rem;
}

.products-card .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
}

.card-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.view-toggle {
    display: flex;
    gap: 0.25rem;
    background: #f1f5f9;
    padding: 0.25rem;
    border-radius: 0.5rem;
}

.view-toggle .btn {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
}

.products-card .card-body {
    padding: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }
    
    .header-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .header-actions .btn {
        justify-content: center;
    }
    
    .page-header {
        padding: 1.5rem 1rem 2.5rem;
    }
    
    .stats-section,
    .content-section {
        padding: 0 1rem 1rem;
    }
    
    .stats-card {
        padding: 1rem;
    }
    
    .stats-icon {
        width: 3rem;
        height: 3rem;
    }
    
    .stats-number {
        font-size: 1.5rem;
    }
    
    .products-card .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .card-actions {
        justify-content: space-between;
    }
}

/* Animation */
.stats-card,
.filter-card,
.products-card {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Background patterns */
.page-header {
    background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>