<template>
    <div class="invoice-preview-section mb-4 p-3 bg-light rounded border">
        <h6 class="mb-3">
            <i class="bi bi-file-text"></i> Xem trước hóa đơn
        </h6>
        <div class="row g-2">
            <div class="col-6">
                <small class="text-muted">Mã hóa đơn:</small>
                <div class="fw-bold">{{ hoaDon?.ma || 'N/A' }}</div>
            </div>
            <div class="col-6">
                <small class="text-muted">Khách hàng:</small>
                <div class="fw-bold">{{ hoaDon?.khachHang?.hoTen || 'Khách lẻ' }}</div>
            </div>
            <div class="col-12">
                <small class="text-muted">Sản phẩm:</small>
                <div class="preview-products">
                    <div v-for="item in hoaDon?.hoaDonChiTiet || []" :key="item.id"
                        class="preview-product-item">
                        <span>{{ item.tenSanPham }}</span>
                        <span class="text-muted">× {{ item.soLuong }}</span>
                        <span class="fw-bold">{{ formatCurrency(item.thanhTien || (item.donGia * item.soLuong)) }}</span>
                    </div>
                </div>
            </div>
            <div class="col-12 mt-2 pt-2 border-top">
                <div class="d-flex justify-content-between mb-2">
                    <span>
                        <i class="bi bi-ticket-perforated"></i> Khuyến mãi:
                    </span>
                    <span class="fw-bold text-danger">
                        -{{ formatCurrency(hoaDon?.tienDuocGiam || 0) }}
                    </span>
                </div>
                <div class="d-flex justify-content-between">
                    <span class="fw-bold">Tổng cần trả:</span>
                    <span class="fw-bold text-danger fs-5">{{ formatCurrency(tongTien) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    hoaDon: {
        type: Object,
        required: true
    }
})

const tongTien = computed(() => {
    return props.hoaDon?.tongTienSauGiam || props.hoaDon?.tongTien || 0
})

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}
</script>

<style scoped>
.invoice-preview-section {
    max-height: 300px;
    overflow-y: auto;
}

.preview-products {
    max-height: 150px;
    overflow-y: auto;
}

.preview-product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid #e9ecef;
}

.preview-product-item:last-child {
    border-bottom: none;
}
</style>

