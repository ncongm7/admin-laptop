<template>
    <div>
        <div class="modal-backdrop fade show"></div>
        <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Chi tiết sản phẩm</h5>
                        <button type="button" class="btn-close btn-close-white" @click="close"></button>
                    </div>

                    <div class="modal-body">
                        <div class="row">
                            <!-- Left Column -->
                            <div class="col-md-5">
                                <!-- Main Image -->
                                <div class="main-image mb-4">
                                    <img :src="product.anhDaiDien || '/placeholder-product.jpg'"
                                        class="img-fluid rounded" alt="Product Image">
                                </div>

                                <!-- Image Gallery -->
                                <div class="image-gallery mb-4">
                                    <h6 class="section-title">Hình ảnh sản phẩm</h6>
                                    <div class="gallery-grid">
                                        <div v-for="(image, index) in product.images" :key="index" class="gallery-item">
                                            <img :src="image" class="img-thumbnail">
                                        </div>
                                    </div>
                                </div>

                                <!-- Variants -->
                                <div class="variants-section">
                                    <h6 class="section-title">Các biến thể</h6>
                                    <div class="variants-list">
                                        <div v-for="(variant, index) in product.variants" :key="index"
                                            class="variant-item">
                                            <div class="variant-info">
                                                <div class="variant-name">
                                                    {{ getVariantName(variant) }}
                                                </div>
                                                <div class="variant-price">
                                                    {{ formatCurrency(variant.giaBan) }}
                                                </div>
                                            </div>
                                            <div class="variant-stock">
                                                <span class="badge" :class="stockClass(variant.soLuong)">
                                                    {{ variant.soLuong }} sản phẩm
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column -->
                            <div class="col-md-7">
                                <!-- Product Info -->
                                <div class="product-info mb-4">
                                    <h2 class="product-name">{{ product.tenSanPham }}</h2>
                                    <div class="product-meta">
                                        <span class="badge bg-primary me-2">SKU: {{ product.maSanPham }}</span>
                                        <span class="badge" :class="statusClass(product.trangThai)">
                                            {{ product.trangThai === 'ACTIVE' ? 'Hiển thị' : 'Ẩn' }}
                                        </span>
                                    </div>
                                    <!-- <div class="product-brand mt-2">
                                        <strong>Hãng:</strong> {{ product.hang?.tenHang || 'N/A' }}
                                    </div> -->
                                </div>

                                <!-- Specifications -->
                                <div class="specifications mb-4">
                                    <h6 class="section-title">Thông số kỹ thuật</h6>
                                    <div class="specs-grid">
                                        <div class="spec-item" v-if="product.cpu">
                                            <div class="spec-label">CPU</div>
                                            <div class="spec-value">{{ product.cpu.tenCPU }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.ram">
                                            <div class="spec-label">RAM</div>
                                            <div class="spec-value">{{ product.ram.dungLuong }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.gpu">
                                            <div class="spec-label">GPU</div>
                                            <div class="spec-value">{{ product.gpu.tenGPU }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.oCung">
                                            <div class="spec-label">Ổ cứng</div>
                                            <div class="spec-value">{{ product.oCung.tenOCung }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.kichThuocManHinh">
                                            <div class="spec-label">Màn hình</div>
                                            <div class="spec-value">{{ product.kichThuocManHinh.giaTri }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.loaiManHinh">
                                            <div class="spec-label">Loại màn hình</div>
                                            <div class="spec-value">{{ product.loaiManHinh.congNghe }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.heDieuHanh">
                                            <div class="spec-label">Hệ điều hành</div>
                                            <div class="spec-value">{{ product.heDieuHanh.tenHĐH }}</div>
                                        </div>
                                        <div class="spec-item" v-if="product.dungLuongPin">
                                            <div class="spec-label">Pin</div>
                                            <div class="spec-value">{{ product.dungLuongPin.dungLuongWh }} Wh</div>
                                        </div>
                                        <div class="spec-item" v-if="product.camera">
                                            <div class="spec-label">Camera</div>
                                            <div class="spec-value">{{ product.camera.doPhanGiai }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="description mb-4">
                                    <h6 class="section-title">Mô tả sản phẩm</h6>
                                    <div class="description-content" v-html="product.moTaChiTiet"></div>
                                </div>

                                <!-- IMEI Management -->
                                <div class="imei-section">
                                    <h6 class="section-title">Quản lý IMEI</h6>
                                    <div class="imei-actions mb-3">
                                        <button class="btn btn-sm btn-outline-primary me-2">
                                            <i class="bi bi-upc-scan"></i> Quét IMEI
                                        </button>
                                        <button class="btn btn-sm btn-outline-secondary">
                                            <i class="bi bi-download"></i> Xuất danh sách
                                        </button>
                                    </div>
                                    <div class="imei-stats">
                                        <span class="badge bg-light text-dark me-2">
                                            Tổng: {{ product.totalImei || 0 }}
                                        </span>
                                        <span class="badge bg-success me-2">
                                            Trong kho: {{ product.availableImei || 0 }}
                                        </span>
                                        <span class="badge bg-primary me-2">
                                            Đã bán: {{ product.soldImei || 0 }}
                                        </span>
                                        <span class="badge bg-warning text-dark">
                                            Bảo hành: {{ product.warrantyImei || 0 }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="close">Đóng</button>
                        <button type="button" class="btn btn-primary" @click="edit">
                            <i class="bi bi-pencil"></i> Chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'

const props = defineProps({
    product: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'edit'])

const getVariantName = (variant) => {
    const parts = []
    if (variant.ram) parts.push(variant.ram.dungLuong)
    if (variant.oCung) parts.push(variant.oCung.tenOCung)
    if (variant.mauSac) parts.push(variant.mauSac.tenMau)
    return parts.join(' / ') || 'Biến thể không tên'
}

const stockClass = (stock) => {
    if (stock > 10) return 'bg-success'
    if (stock > 0) return 'bg-warning text-dark'
    return 'bg-danger'
}

const statusClass = (status) => {
    return status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
}

const edit = () => {
    emit('edit')
}

const close = () => {
    emit('close')
}
</script>

<style scoped>
.modal-content {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    z-index: 1050;
}

.modal-body {
    overflow-y: auto;
}

.main-image {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
}

.main-image img {
    max-height: 300px;
    object-fit: contain;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
}

.gallery-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.gallery-item {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.variants-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.variant-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.variant-info {
    flex: 1;
}

.variant-name {
    font-weight: 500;
}

.variant-price {
    font-size: 14px;
    color: #3b82f6;
    font-weight: 600;
}

.specs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.spec-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed #e2e8f0;
}

.spec-label {
    font-weight: 500;
    color: #64748b;
}

.spec-value {
    font-weight: 600;
}

.description-content {
    line-height: 1.6;
}

.imei-stats {
    margin-top: 12px;
}

.modal-backdrop {
    position: fixed !important;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1040;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
}
</style>