<template>
    <div class="product-detail-management">
        <div class="container-fluid">
            <!-- Header Section -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="mb-1">{{ selectedProduct?.tenSanPham || 'Chi tiết sản phẩm' }}</h2>
                            <nav aria-label="breadcrumb">
                                <ol class="breadcrumb mb-0">
                                    <li class="breadcrumb-item">
                                        <router-link to="/quan-li-san-pham">Sản phẩm</router-link>
                                    </li>
                                    <li class="breadcrumb-item active" aria-current="page">
                                        Chi tiết sản phẩm
                                    </li>
                                </ol>
                            </nav>
                        </div>

                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="row g-4">
                <!-- Left Sidebar - Product Info -->
                <div class="col-lg-3 col-md-4">
                    <div class="sticky-top" style="top: 20px;">
                        <ProductInfoSidebar :product="selectedProduct" @back="goBack" />
                    </div>
                </div>

                <!-- Right Content - Variants Management -->
                <div class="col-lg-9 col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-0">Biến thể sản phẩm</h5>
                                    <small class="text-muted">
                                        {{ productVariants.length }} biến thể
                                        <span v-if="totalInventory > 0" class="ms-2">
                                            • {{ totalInventory }} sản phẩm trong kho
                                        </span>
                                    </small>
                                </div>
                                <!-- Chỉ hiện nút thêm biến thể ở header card NẾU đã có biến thể -->
                                <div class="header-controls" v-if="productVariants.length > 0">
                                    <div class="btn-group me-2" role="group">
                                        <button class="btn btn-sm"
                                            :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'"
                                            @click="viewMode = 'grid'">
                                            <i class="bi bi-grid-3x3-gap"></i>
                                        </button>
                                        <button class="btn btn-sm"
                                            :class="viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'"
                                            @click="viewMode = 'list'">
                                            <i class="bi bi-list"></i>
                                        </button>
                                    </div>
                                    <button class="btn btn-primary btn-sm" @click="showAddForm">
                                        <i class="bi bi-plus-circle me-1"></i> Thêm biến thể
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="card-body">
                            <!-- Loading State -->
                            <div v-if="loading" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2 text-muted">Đang tải biến thể...</p>
                            </div>

                            <!-- Empty State: CHỈ hiện nút thêm biến thể đầu tiên khi chưa có biến thể -->
                            <div v-else-if="productVariants.length === 0" class="empty-state text-center py-5">
                                <div class="empty-icon mb-3">
                                    <i class="bi bi-box-seam display-1 text-muted"></i>
                                </div>
                                <h5 class="mb-2">Chưa có biến thể nào</h5>
                                <p class="text-muted mb-4">Thêm biến thể đầu tiên để bắt đầu quản lý sản phẩm</p>
                                <button class="btn btn-primary" @click="showAddForm">
                                    <i class="bi bi-plus-circle me-1"></i> Thêm biến thể đầu tiên
                                </button>
                            </div>

                            <!-- Variants List -->
                            <div v-else>
                                <!-- Grid View -->
                                <div v-if="viewMode === 'grid'" class="row g-3">
                                    <div v-for="variant in productVariants" :key="variant.id"
                                        class="col-xl-4 col-lg-6 col-md-6">
                                        <ProductVariantCard :variant="variant" @edit="editVariant" @view="viewVariant"
                                            @delete="confirmDelete" />
                                        <button class="btn btn-outline-info btn-sm mt-2 w-100"
                                            @click="openImeiModal(variant.id)">
                                            <i class="bi bi-qr-code"></i> Quản lý IMEI
                                        </button>
                                    </div>
                                </div>

                                <!-- List View -->
                                <div v-else class="variants-table">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Ảnh</th>
                                                    <th>Thông số</th>
                                                    <th>Giá bán</th>
                                                    <th>Tồn kho</th>
                                                    <th>Thao tác</th>
                                                    <th>IMEI</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="variant in productVariants" :key="variant.id">
                                                    <td>
                                                        <img :src="getVariantImage(variant)" alt="Variant"
                                                            class="variant-thumbnail">
                                                    </td>
                                                    <td>
                                                        <div class="variant-specs">
                                                            <div v-if="variant.ram_id" class="spec-item">
                                                                <i class="bi bi-memory me-1"></i>
                                                                {{ getAttributeName('rams', variant.ram_id) }}
                                                            </div>
                                                            <div v-if="variant.o_cung_id" class="spec-item">
                                                                <i class="bi bi-device-hdd me-1"></i>
                                                                {{ getAttributeName('storages', variant.o_cung_id) }}
                                                            </div>
                                                            <div v-if="variant.mau_sac_id" class="spec-item">
                                                                <i class="bi bi-palette me-1"></i>
                                                                {{ getAttributeName('colors', variant.mau_sac_id) }}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span class="fw-bold text-success">
                                                            {{ formatCurrency(variant.giaBan) }}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-info">
                                                            {{ variant.imeiCount || 0 }} sản phẩm
                                                        </span>
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
                                                    <td>
                                                        <button class="btn btn-outline-info btn-sm w-100"
                                                            @click="openImeiModal(variant.id)">
                                                            <i class="bi bi-qr-code"></i> Quản lý IMEI
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Form -->
        <ProductDetailFormModal v-if="showModal" :variant="currentVariant" :product="selectedProduct" :show="showModal"
            @close="closeModal" @save="handleSave" />

        <!-- Modal Quản lý IMEI -->
        <div v-if="showImeiModal">
            <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.2)">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Quản lý IMEI cho biến thể</h5>
                            <button type="button" class="btn-close" @click="closeImeiModal"></button>
                        </div>
                        <div class="modal-body">
                            <ImeiManagement :variantId="selectedVariantId" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show" @click="closeImeiModal"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import { useAttributeStore } from '@/stores/attributeStore'
import ProductInfoSidebar from '@/components/chitietsanpham/ProductInfoSidebar.vue'
import ProductDetailFormModal from '@/components/chitietsanpham/ProductDetailFormModal.vue'
import ProductVariantCard from '@/components/chitietsanpham/ProductVariantCard.vue'
import ImeiManagement from '@/components/chitietsanpham/ImeiManagement.vue'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const productDetailStore = useProductDetailStore()
const attributeStore = useAttributeStore()

const productId = ref(route.params.productId)
const showModal = ref(false)
const currentVariant = ref({})
const mode = ref('add')
const viewMode = ref('grid') // 'grid' or 'list'
const loading = ref(false)

// IMEI modal state
const showImeiModal = ref(false)
const selectedVariantId = ref(null)

const openImeiModal = (variantId) => {
    selectedVariantId.value = variantId
    showImeiModal.value = true
}
const closeImeiModal = () => {
    showImeiModal.value = false
    selectedVariantId.value = null
}

// Fetch data khi component mounted
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            productStore.fetchProductByIdSP(productId.value),
            productDetailStore.fetchProductVariants(productId.value),
            attributeStore.fetchAttributes()
        ])
    } finally {
        loading.value = false
    }
})

const selectedProduct = computed(() => productDetailStore.productDetail)
const productVariants = computed(() => productDetailStore.variants)
const totalInventory = computed(() => {
    return productVariants.value.reduce((total, variant) => total + (variant.imeiCount || 0), 0)
})

// Helper functions
const getVariantImage = (variant) => {
    if (variant.anhSanPhams && variant.anhSanPhams.length > 0) {
        const primaryImage = variant.anhSanPhams.find(img => img.is_default)
        return primaryImage ? primaryImage.uri : variant.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/50x50?text=No+Image'
}

const getAttributeName = (type, id) => {
    if (!id) return 'N/A'
    const attribute = attributeStore.getAttributeById(type, id)
    return attribute?.ten || attribute?.tenThuocTinh || 'N/A'
}

const showAddForm = () => {
    mode.value = 'add'
    currentVariant.value = {
        tenSP: '',
        ram_id: null,
        o_cung_id: null,
        mau_sac_id: null,
        giaBan: 0,
        thoiGianBaoHanh: 12,
        anhSanPhams: []
    }
    showModal.value = true
}

const editVariant = (variant) => {
    console.log('Editing variant:', variant)
    mode.value = 'edit'
    currentVariant.value = { ...variant }
    console.log('Current variant set to:', currentVariant.value)
    showModal.value = true
}

const viewVariant = (variant) => {
    router.push(`/products/${productId.value}/variants/${variant.id}`)
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
    console.log('handleSave called with mode:', mode.value)
    console.log('productId.value:', productId.value)

    if (mode.value === 'add') {
        await productDetailStore.addVariant({
            ...variantData,
            san_pham_id: productId.value
        })
    } else {
        // Đảm bảo productIdGlobal được set trước khi update
        productDetailStore.productIdGlobal = productId.value
        await productDetailStore.updateVariant(variantData)
    }
    closeModal()
}

const goBack = () => {
    router.push('/quan-li-san-pham')
}
</script>

<style scoped>
.product-detail-management {
    padding: 32px 0;
    background: linear-gradient(120deg, #f8fafc 60%, #f1f5f9 100%);
    min-height: 100vh;
}

.card {
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(80, 80, 180, 0.08);
    border: none;
    background: #fff;
    transition: box-shadow 0.2s;
}

.card:hover {
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.13);
}

.card-header {
    background: linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%);
    border-bottom: 1px solid #e0e7ff;
    border-radius: 18px 18px 0 0;
    padding: 1.25rem 2rem;
}

.header-controls .btn-primary {
    background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
    border: none;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
    transition: background 0.2s, box-shadow 0.2s;
}

.header-controls .btn-primary:hover {
    background: linear-gradient(90deg, #4f46e5 60%, #818cf8 100%);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}

.empty-state {
    background: #f1f5f9;
    border-radius: 16px;
    border: 2px dashed #c7d2fe;
    color: #6366f1;
    animation: fadeIn 0.5s;
}

.empty-icon i {
    font-size: 4rem;
    color: #a5b4fc;
    margin-bottom: 1rem;
    animation: bounce 1.2s infinite alternate;
}

@keyframes bounce {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(-10px);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.variant-thumbnail {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 10px;
    border: 2px solid #e0e7ff;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}

.variants-table th,
.variants-table td {
    vertical-align: middle;
    font-size: 1rem;
}

.variants-table tr:hover {
    background: #f1f5fd;
    transition: background 0.2s;
}

.btn-group .btn {
    border-radius: 8px;
    font-size: 1.05rem;
}

.header-actions .btn-outline-secondary {
    border-radius: 8px;
    font-weight: 500;
    color: #6366f1;
    border: 1.5px solid #a5b4fc;
    background: #f8fafc;
    transition: background 0.2s, color 0.2s;
}

.header-actions .btn-outline-secondary:hover {
    background: #e0e7ff;
    color: #4f46e5;
}

@media (max-width: 768px) {
    .product-detail-management {
        padding: 12px 0;
    }

    .card-header {
        padding: 1rem 1rem;
    }
}
</style>