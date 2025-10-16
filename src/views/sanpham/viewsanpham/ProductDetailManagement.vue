<!-- Updated ProductDetailManagement.vue with new color scheme -->
<template>
    <div class="product-detail-management">
        <div class="container-fluid">
            <!-- Header Section -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="product-header">
                            <h2 class="mb-0">{{ selectedProduct?.tenSanPham || 'Chi tiết sản phẩm' }}</h2>
                            <p class="text-muted mb-0">Mã sản phẩm: {{ selectedProduct?.maSanPham }}</p>
                        </div>
                        <div class="header-actions">
                            <!-- <button class="btn btn-primary me-2" @click="editProduct">
                                <i class="bi bi-pencil"></i> Chỉnh sửa
                            </button>
                            <button class="btn btn-outline-secondary me-2" @click="refreshData">
                                <i class="bi bi-arrow-clockwise"></i> Làm mới
                            </button> -->
                            <button class="btn btn-outline-secondary" @click="goBack">
                                <i class="bi bi-arrow-left"></i> Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="row mb-4">
                <div class="col-12">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button 
                                class="nav-link active" 
                                data-bs-toggle="tab" 
                                data-bs-target="#basic-info" 
                                type="button" 
                                role="tab"
                                aria-controls="basic-info"
                                aria-selected="true"
                            >
                                <i class="bi bi-info-circle me-1"></i> Thông tin sản phẩm
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button 
                                class="nav-link" 
                                data-bs-toggle="tab" 
                                data-bs-target="#variants" 
                                type="button" 
                                role="tab"
                                aria-controls="variants"
                                aria-selected="false"
                            >
                                <i class="bi bi-list-task me-1"></i> Biến thể sản phẩm
                                <span class="badge bg-primary ms-1">{{ productVariants.length }}</span>
                            </button>
                        </li>
                        
                    </ul>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Basic Info Tab -->
                <div class="tab-pane fade show active" id="basic-info" role="tabpanel">
                    <div class="row g-4">
                        <!-- Left Column - Basic Information -->
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-body">
                                    <div class="info-section">
                                        <div class="section-title">
                                            <i class="bi bi-info-circle me-1"></i> Thông tin cơ bản
                                        </div>
                                        <div class="info-row">
                                            <strong>Mã sản phẩm:</strong>
                                            <span class="info-value">{{ selectedProduct?.maSanPham }}</span>
                                        </div>
                                        <div class="info-row">
                                            <strong>Tên sản phẩm:</strong>
                                            <span class="info-value">{{ selectedProduct?.tenSanPham }}</span>
                                        </div>
                                        <div class="info-row">
                                            <strong>Mô tả:</strong>
                                            <span class="info-value">{{ selectedProduct?.moTaNgan }}</span>
                                        </div>
                                        <div class="info-row">
                                            <strong>Ngày ra mắt:</strong>
                                            <span class="info-value">{{ formatDate(selectedProduct?.ngayRaMat) }}</span>
                                        </div>
                                        <div class="info-row">
                                            <strong>Trạng thái:</strong>
                                            <span :class="statusClass(selectedProduct?.trangThai)">
                                                {{ selectedProduct?.trangThai === 1 ? 'Hoạt động' : 'Ẩn' }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Classification & Images -->
                        <div class="col-lg-6">
                            <div class="card">
                                <div class="card-body">
                                    <div class="info-section">
                                        <div class="section-title">
                                            <i class="bi bi-tags me-1"></i> Hình ảnh
                                        </div>
                                
                                        <div class="info-row">
                                            <strong>Hình ảnh sản phẩm:</strong>
                                            <div class="image-container">
                                                <img 
                                                    :src="selectedProduct?.anhDaiDien || '/placeholder-product.jpg'" 
                                                    alt="Product Image" 
                                                    class="product-image"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Variants Tab -->
                <div class="tab-pane fade" id="variants" role="tabpanel">
                    <div class="row g-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0">Biến thể sản phẩm</h5>
                                        <div class="header-controls">
                                            <button class="btn btn-sm btn-outline-primary me-2" @click="viewMode = 'grid'">
                                                <i class="bi bi-grid-3x3-gap"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-primary me-2" @click="viewMode = 'list'">
                                                <i class="bi bi-list"></i>
                                            </button>
                                            <button class="btn btn-sm btn-success" @click="showAddForm">
                                                <i class="bi bi-plus-circle me-1"></i> Thêm biến thể
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-body">
                                    <!-- Grid View -->
                                    <div v-if="viewMode === 'grid'" class="row g-3">
                                        <div v-for="variant in productVariants" :key="variant.id" class="col-xl-4 col-lg-6 col-md-6">
                                            <div class="variant-card">
                                                <div class="variant-image">
                                                    <img :src="getVariantImage(variant)" alt="Variant" class="variant-thumbnail">
                                                </div>
                                                <div class="variant-details">
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
                                                    <div class="variant-price">
                                                        <span class="fw-bold text-success">
                                                            {{ formatCurrency(variant.giaBan) }}
                                                        </span>
                                                    </div>
                                                    <div class="variant-stock">
                                                        <span class="badge bg-info">
                                                            {{ variant.imeiCount || 0 }} sản phẩm
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="variant-actions">
                                                    <button class="btn btn-outline-primary btn-sm w-100 mb-1"
                                                        @click="editVariant(variant)">
                                                        <i class="bi bi-pencil"></i> Sửa
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm w-100"
                                                        @click="confirmDelete(variant.id)">
                                                        <i class="bi bi-trash"></i> Xóa
                                                    </button>
                                                </div>
                                            </div>
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="variant in productVariants" :key="variant.id">
                                                        <td>
                                                            <img :src="getVariantImage(variant)" alt="Variant" class="variant-thumbnail">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History Tab -->
                <div class="tab-pane fade" id="history" role="tabpanel">
                    <div class="row g-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <div class="timeline">
                                        <div v-for="(log, index) in auditLogs" :key="index" class="timeline-item">
                                            <div class="timeline-badge">
                                                <i class="bi bi-clock"></i>
                                            </div>
                                            <div class="timeline-content">
                                                <div class="timeline-date">
                                                    {{ formatDate(log.ngayTao) }}
                                                </div>
                                                <div class="timeline-action">
                                                    {{ log.thaoTac }}
                                                </div>
                                                <div class="timeline-user">
                                                    Người dùng: {{ log.tenNguoiDung }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Form -->
        <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.2)">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ mode === 'add' ? 'Thêm biến thể' : 'Sửa biến thể' }}</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-container">
                            <div class="form-group">
                                <label for="name">Tên biến thể</label>
                                <input type="text" id="name" v-model="currentVariant.tenSP" class="form-control" />
                            </div>
                            <div class="form-group">
                                <label for="ram">RAM</label>
                                <select id="ram" v-model="currentVariant.ram_id" class="form-select">
                                    <option value="">Chọn RAM</option>
                                    <option v-for="ram in attributeStore.attributes.rams" :value="ram.id">
                                        {{ ram.tenRam }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="storage">Ổ cứng</label>
                                <select id="storage" v-model="currentVariant.o_cung_id" class="form-select">
                                    <option value="">Chọn ổ cứng</option>
                                    <option v-for="storage in attributeStore.attributes.storages" :value="storage.id">
                                        {{ storage.dungLuong }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="color">Màu sắc</label>
                                <select id="color" v-model="currentVariant.mau_sac_id" class="form-select">
                                    <option value="">Chọn màu sắc</option>
                                    <option v-for="color in attributeStore.attributes.colors" :value="color.id">
                                        {{ color.tenMau }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="price">Giá bán</label>
                                <input type="number" id="price" v-model="currentVariant.giaBan" class="form-control" />
                            </div>
                            <div class="form-group">
                                <label for="warranty">Thời gian bảo hành</label>
                                <input type="number" id="warranty" v-model="currentVariant.thoiGianBaoHanh" class="form-control" />
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Đóng</button>
                        <button type="button" class="btn btn-primary" @click="handleSave(currentVariant)">Lưu</button>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show" @click="closeModal"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import { useAttributeStore } from '@/stores/attributeStore'
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

// Audit logs state
const auditLogs = ref([])

// Fetch data khi component mounted
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            productStore.fetchProductByIdSP(productId.value),
            productDetailStore.fetchProductVariants(productId.value),
            attributeStore.fetchAttributes(),
            fetchAuditLogs() // Fetch audit logs
        ])
    } finally {
        loading.value = false
    }
})

const fetchAuditLogs = async () => {
    try {
        // This would be a real API call to fetch audit logs
        // For now, we'll simulate some data
        auditLogs.value = [
            {
                ngayTao: new Date().toISOString(),
                thaoTac: 'Cập nhật thông tin sản phẩm',
                tenNguoiDung: 'Admin'
            },
            {
                ngayTao: new Date(Date.now() - 86400000).toISOString(),
                thaoTac: 'Thêm biến thể mới',
                tenNguoiDung: 'Admin'
            }
        ]
    } catch (error) {
        console.error('Error fetching audit logs:', error)
    }
}

const selectedProduct = computed(() => productDetailStore.productDetail)
const productVariants = computed(() => productDetailStore.variants)

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
    mode.value = 'edit'
    currentVariant.value = { ...variant }
    showModal.value = true
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

const refreshData = async () => {
    try {
        loading.value = true
        await Promise.all([
            productStore.fetchProductByIdSP(productId.value),
            productDetailStore.fetchProductVariants(productId.value),
            attributeStore.fetchAttributes(),
            fetchAuditLogs()
        ])
    } finally {
        loading.value = false
    }
}

const editProduct = () => {
    // Handle edit product functionality
    alert('Edit product functionality not implemented yet')
}

const statusClass = (status) => {
    return status === 1 ? 'bg-success' : 'bg-secondary'
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
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

.info-section {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
}

.info-row {
    display: flex;
    margin-bottom: 0.75rem;
    align-items: center;
}

.info-row strong {
    width: 150px;
    font-weight: 500;
    color: #6b7280;
    margin-right: 1rem;
}

.info-value {
    flex: 1;
    color: #374151;
}

.image-container {
    margin-top: 1rem;
}

.product-image {
    width: 100%;
    max-width: 200px;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
}

.variant-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.variant-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.variant-image {
    height: 120px;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
}

.variant-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.variant-details {
    padding: 1rem;
    background: #fff;
}

.variant-specs {
    margin-bottom: 1rem;
}

.spec-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.spec-item i {
    margin-right: 0.5rem;
    color: #6b7280;
}

.variant-price {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.variant-stock {
    margin-bottom: 1rem;
}

.variant-actions {
    padding: 1rem;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
}

.btn-group {
    gap: 0.5rem;
}

.tab-content {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
}

.timeline {
    list-style: none;
    padding: 0;
    margin: 0;
}

.timeline-item {
    position: relative;
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.timeline-item:last-child {
    border-bottom: none;
}

.timeline-badge {
    position: absolute;
    left: 0;
    top: 0;
    width: 12px;
    height: 12px;
    background: #6366f1;
    border-radius: 50%;
    z-index: 1;
}

.timeline-content {
    padding-left: 2rem;
}

.timeline-date {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.timeline-action {
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
}

.timeline-user {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Custom styles for tab navigation */
.nav-tabs .nav-link {
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-weight: 500;
    color: #6b7280;
    background-color: transparent;
    transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
    color: #16a34a;
    background-color: #f8fafc;
    border-color: #16a34a;
    font-weight: 600;
}

.nav-tabs .nav-link:hover {
    color: #16a34a;
    background-color: #f8fafc;
    border-color: #16a34a;
}

.nav-tabs .nav-link:focus {
    outline: none;
    box-shadow: none;
}

/* Custom styles for add variant button */
.btn-success {
    background-color: #16a34a;
    border-color: #16a34a;
    color: white;
    font-weight: 500;
}

.btn-success:hover {
    background-color: #15803d;
    border-color: #15803d;
}

/* Custom styles for variants header controls */
.header-controls .btn-outline-primary {
    border-color: #16a34a;
    color: #16a34a;
}

.header-controls .btn-outline-primary:hover {
    background-color: #16a34a;
    color: white;
    border-color: #16a34a;
}

/* Custom styles for variant card borders */
.variant-card {
    border-color: #16a34a;
}

.variant-card:hover {
    border-color: #15803d;
}

/* Custom styles for variant buttons */
.btn-outline-primary {
    border-color: #16a34a;
    color: #16a34a;
}

.btn-outline-primary:hover {
    background-color: #16a34a;
    color: white;
    border-color: #16a34a;
}

/* Custom styles for variant delete button */
.btn-outline-danger {
    border-color: #dc2626;
    color: #dc2626;
}

.btn-outline-danger:hover {
    background-color: #dc2626;
    color: white;
    border-color: #dc2626;
}

@media (max-width: 768px) {
    .product-detail-management {
        padding: 12px 0;
    }

    .card-header {
        padding: 1rem 1rem;
    }

    .info-row {
        flex-direction: column;
    }

    .info-row strong {
        width: auto;
        margin-bottom: 0.5rem;
        margin-right: 0;
    }

    .product-image {
        max-width: 150px;
    }
}
</style>