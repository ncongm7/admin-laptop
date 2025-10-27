<template>
    <div class="chi-tiet-hoa-don">
        <div class="card">
            <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0">
                    <i class="bi bi-receipt"></i> Chi tiết hóa đơn
                    <span v-if="hoaDon?.ma" class="ms-2 badge bg-light text-dark">
                        {{ hoaDon.ma }}
                    </span>
                </h5>
            </div>

            <div class="card-body p-0">
                <!-- Danh sách sản phẩm -->
                <div v-if="!hoaDon || !hoaDon.hoaDonChiTiet || hoaDon.hoaDonChiTiet.length === 0" class="empty-cart">
                    <i class="bi bi-cart-x"></i>
                    <p>Chưa có sản phẩm nào trong hóa đơn</p>
                </div>

                <div v-else class="product-list">
                    <div v-for="(item, index) in hoaDon.hoaDonChiTiet" :key="item.id" class="product-item">
                        <div class="item-index">{{ index + 1 }}</div>

                        <img :src="getProductImage(item)" :alt="item.tenSanPham" class="product-image" />

                        <div class="product-details">
                            <h6 class="product-name">{{ item.tenSanPham }}</h6>
                            <small class="text-muted">Mã: {{ item.maChiTietSanPham }}</small>
                            <div class="product-price">
                                {{ formatCurrency(item.donGia) }} x {{ item.soLuong }}
                            </div>
                        </div>

                        <div class="product-total">
                            <div class="total-price">
                                {{ formatCurrency(item.thanhTien) }}
                            </div>
                            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(item)"
                                title="Xóa sản phẩm">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tổng kết -->
            <div class="card-footer">
                <div class="summary">
                    <div class="summary-item">
                        <span>Tổng tiền hàng:</span>
                        <span class="fw-bold">{{ formatCurrency(hoaDon?.tongTien || 0) }}</span>
                    </div>

                    <div class="summary-item" v-if="hoaDon?.tienDuocGiam > 0">
                        <span>Giảm giá:</span>
                        <span class="text-danger">-{{ formatCurrency(hoaDon.tienDuocGiam) }}</span>
                    </div>

                    <hr />

                    <div class="summary-item total">
                        <span>Thành tiền:</span>
                        <span class="total-amount">
                            {{ formatCurrency(hoaDon?.tongTienSauGiam || hoaDon?.tongTien || 0) }}
                        </span>
                    </div>
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
        default: null
    }
})

const emit = defineEmits(['delete-item'])

const confirmDelete = (item) => {
    if (confirm(`Bạn có chắc muốn xóa "${item.tenSanPham}" khỏi hóa đơn?`)) {
        emit('delete-item', item.id)
    }
}

const getProductImage = (item) => {
    // TODO: Lấy ảnh từ chi tiết sản phẩm nếu có
    return 'https://via.placeholder.com/60x60?text=' + encodeURIComponent(item.tenSanPham?.substring(0, 10) || 'SP')
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}
</script>

<style scoped>
.chi-tiet-hoa-don {
    height: 100%;
}

.card {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-body {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
}

.empty-cart {
    text-align: center;
    padding: 3rem 1rem;
    color: #6c757d;
}

.empty-cart i {
    font-size: 4rem;
    margin-bottom: 1rem;
    display: block;
    opacity: 0.5;
}

.product-list {
    padding: 0.5rem;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.product-item:hover {
    background-color: #f8f9fa;
}

.product-item:last-child {
    border-bottom: none;
}

.item-index {
    width: 24px;
    height: 24px;
    background: #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
}

.product-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.product-details {
    flex: 1;
}

.product-name {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
}

.product-price {
    font-size: 0.9rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

.product-total {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.total-price {
    font-size: 1.1rem;
    font-weight: 700;
    color: #dc3545;
}

.summary {
    padding: 0.5rem 0;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.95rem;
}

.summary-item.total {
    font-size: 1.1rem;
    font-weight: 700;
    padding-top: 0.75rem;
}

.total-amount {
    font-size: 1.5rem;
    color: #198754;
}

.card-footer {
    background-color: #f8f9fa;
    border-top: 2px solid #dee2e6;
}
</style>
