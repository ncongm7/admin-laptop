<template>
    <div class="invoice-details card">
        <div class="card-header bg-dark text-white">
            <h6 class="mb-0">
                <i class="bi bi-receipt-cutoff"></i> Chi tiết hóa đơn
            </h6>
            <small v-if="hoaDon?.ma" class="text-light">{{ hoaDon.ma }}</small>
        </div>

        <div class="card-body p-0">
            <!-- Danh sách sản phẩm -->
            <div class="products-section">
                <div v-if="!hoaDon || !hoaDon.hoaDonChiTiet || hoaDon.hoaDonChiTiet.length === 0" 
                    class="empty-cart text-center py-4">
                    <i class="bi bi-cart-x" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-2 mb-0">Chưa có sản phẩm</p>
                </div>

                <div v-else class="product-list">
                    <div v-for="(item, index) in hoaDon.hoaDonChiTiet" :key="item.id" 
                        class="product-item">
                        <div class="item-number">{{ index + 1 }}</div>
                        
                        <div class="item-details">
                            <h6 class="item-name">{{ item.tenSanPham }}</h6>
                            <div class="item-code text-muted small">{{ item.maChiTietSanPham }}</div>
                            <div class="item-quantity-price">
                                <span class="quantity">{{ formatCurrency(item.donGia) }} × {{ item.soLuong }}</span>
                            </div>
                        </div>

                        <div class="item-total-action">
                            <div class="item-total">{{ formatCurrency(item.thanhTien) }}</div>
                            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(item)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Phần tổng kết và khuyến mãi -->
        <div class="card-footer p-3">
            <!-- Tổng tiền hàng -->
            <div class="summary-row">
                <span>Tổng tiền hàng:</span>
                <span class="fw-bold">{{ formatCurrency(hoaDon?.tongTien || 0) }}</span>
            </div>

            <!-- Voucher/Giảm giá -->
            <div class="voucher-section mt-2">
                <label class="form-label small fw-semibold mb-1">
                    <i class="bi bi-ticket-perforated"></i> Mã giảm giá
                </label>
                <div class="input-group input-group-sm">
                    <input 
                        type="text" 
                        class="form-control" 
                        v-model="voucherCode"
                        placeholder="Nhập mã voucher..." />
                    <button class="btn btn-outline-primary" @click="applyVoucher" :disabled="!voucherCode">
                        Áp dụng
                    </button>
                </div>
                <div v-if="hoaDon?.tienDuocGiam > 0" class="voucher-applied mt-1">
                    <small class="text-success">
                        <i class="bi bi-check-circle-fill"></i> 
                        Đã giảm: {{ formatCurrency(hoaDon.tienDuocGiam) }}
                    </small>
                </div>
            </div>

            <!-- Sử dụng điểm tích lũy -->
            <div v-if="hoaDon?.khachHang && hoaDon.khachHang.diemTichLuy > 0" class="points-section mt-2">
                <div class="form-check">
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="usePoints"
                        v-model="usePoints" 
                        @change="toggleUsePoints" />
                    <label class="form-check-label small" for="usePoints">
                        <i class="bi bi-star-fill text-warning"></i>
                        Dùng <strong>{{ hoaDon.khachHang.diemTichLuy }}</strong> điểm 
                        (≈ {{ formatCurrency(pointsToMoney(hoaDon.khachHang.diemTichLuy)) }})
                    </label>
                </div>
            </div>

            <hr class="my-2" />

            <!-- Khách cần trả -->
            <div class="summary-row total-row">
                <span class="fw-bold">Khách cần trả:</span>
                <span class="total-amount">
                    {{ formatCurrency(hoaDon?.tongTienSauGiam || hoaDon?.tongTien || 0) }}
                </span>
            </div>
        </div>

        <!-- Các nút hành động -->
        <div class="card-footer p-3 bg-light">
            <button 
                class="btn btn-success btn-lg w-100 mb-2" 
                @click="$emit('complete-payment')"
                :disabled="!canPayment">
                <i class="bi bi-credit-card"></i> <strong>THANH TOÁN</strong>
            </button>

            <div class="row g-2">
                <div class="col-6">
                    <button class="btn btn-sm btn-outline-secondary w-100" @click="$emit('save-draft')">
                        <i class="bi bi-save"></i> Lưu tạm
                    </button>
                </div>
                <div class="col-6">
                    <button class="btn btn-sm btn-outline-danger w-100" @click="$emit('cancel-bill')">
                        <i class="bi bi-x-circle"></i> Hủy đơn
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    hoaDon: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['delete-item', 'apply-voucher', 'use-points', 'complete-payment', 'save-draft', 'cancel-bill'])

// State
const voucherCode = ref('')
const usePoints = ref(false)

// Computed
const canPayment = computed(() => {
    return props.hoaDon && 
           props.hoaDon.hoaDonChiTiet && 
           props.hoaDon.hoaDonChiTiet.length > 0
})

// Methods
const confirmDelete = (item) => {
    if (confirm(`Bạn có chắc muốn xóa "${item.tenSanPham}" khỏi hóa đơn?`)) {
        emit('delete-item', item.id)
    }
}

const applyVoucher = () => {
    if (!voucherCode.value || !voucherCode.value.trim()) {
        alert('Vui lòng nhập mã voucher!')
        return
    }
    emit('apply-voucher', voucherCode.value.trim())
}

const toggleUsePoints = () => {
    if (usePoints.value) {
        const pointsValue = props.hoaDon?.khachHang?.diemTichLuy || 0
        emit('use-points', pointsValue)
    } else {
        emit('use-points', 0)
    }
}

const pointsToMoney = (points) => {
    // Quy đổi: 100 điểm = 10,000 VND (có thể điều chỉnh theo nghiệp vụ)
    return points * 100
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

// Watch hoaDon để reset state khi chuyển hóa đơn
watch(() => props.hoaDon, () => {
    voucherCode.value = ''
    usePoints.value = false
})
</script>

<style scoped>
.invoice-details {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
}

.card-header small {
    display: block;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.products-section {
    max-height: 300px;
    overflow-y: auto;
}

.product-list {
    padding: 0.5rem;
}

.product-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
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

.item-number {
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
    flex-shrink: 0;
}

.item-details {
    flex: 1;
    min-width: 0;
}

.item-name {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #212529;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.item-code {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
}

.item-quantity-price {
    font-size: 0.85rem;
    color: #6c757d;
}

.item-total-action {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.item-total {
    font-size: 1rem;
    font-weight: 700;
    color: #dc3545;
    white-space: nowrap;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.95rem;
}

.total-row {
    font-size: 1.1rem;
    padding-top: 0.75rem;
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #198754;
}

.voucher-section,
.points-section {
    padding: 0.5rem 0;
}

.voucher-applied {
    display: flex;
    align-items: center;
}

.btn-success.btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

.btn-success.btn-lg:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(25, 135, 84, 0.4);
}

.btn-success.btn-lg:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Scrollbar styling */
.products-section::-webkit-scrollbar {
    width: 6px;
}

.products-section::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
}

.products-section::-webkit-scrollbar-thumb:hover {
    background: #999;
}
</style>

