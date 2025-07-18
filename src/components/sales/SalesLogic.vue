<template>
    <div class="sales-logic">
        <!-- ===== SALES FLOW ===== -->
        <div class="sales-flow mb-4">
            <h5 class="text-primary mb-3">
                <i class="bi bi-diagram-3"></i> Quy trình bán hàng
            </h5>

            <div class="row">
                <div class="col-md-3">
                    <div class="flow-step" :class="{ active: currentStep === 1 }">
                        <div class="step-number">1</div>
                        <div class="step-title">Chọn sản phẩm</div>
                        <div class="step-desc">Tìm và thêm sản phẩm vào giỏ hàng</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="flow-step" :class="{ active: currentStep === 2 }">
                        <div class="step-number">2</div>
                        <div class="step-title">Thông tin khách hàng</div>
                        <div class="step-desc">Nhập hoặc tìm khách hàng</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="flow-step" :class="{ active: currentStep === 3 }">
                        <div class="step-number">3</div>
                        <div class="step-title">Áp dụng giảm giá</div>
                        <div class="step-desc">Voucher, khuyến mãi</div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="flow-step" :class="{ active: currentStep === 4 }">
                        <div class="step-number">4</div>
                        <div class="step-title">Thanh toán</div>
                        <div class="step-desc">Hoàn tất giao dịch</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== SALES STATISTICS ===== -->
        <div class="sales-stats mb-4">
            <h5 class="text-primary mb-3">
                <i class="bi bi-graph-up"></i> Thống kê bán hàng
            </h5>

            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary">
                            <i class="bi bi-cart"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ salesStore.cartItemCount }}</div>
                            <div class="stat-label">Sản phẩm trong giỏ</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-success">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(salesStore.subtotal) }}</div>
                            <div class="stat-label">Tổng tiền hàng</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-warning">
                            <i class="bi bi-tag"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(salesStore.currentBill.discount) }}</div>
                            <div class="stat-label">Giảm giá</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-info">
                            <i class="bi bi-receipt"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">{{ formatCurrency(salesStore.total) }}</div>
                            <div class="stat-label">Thành tiền</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ===== QUICK ACTIONS ===== -->
        <div class="quick-actions mb-4">
            <h5 class="text-primary mb-3">
                <i class="bi bi-lightning"></i> Thao tác nhanh
            </h5>

            <div class="row">
                <div class="col-md-2">
                    <button class="btn btn-outline-primary w-100 mb-2" @click="scanImei">
                        <i class="bi bi-upc-scan"></i><br>
                        Quét IMEI
                    </button>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-outline-success w-100 mb-2" @click="createCustomer">
                        <i class="bi bi-person-plus"></i><br>
                        Tạo KH mới
                    </button>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-outline-warning w-100 mb-2" @click="applyVoucher">
                        <i class="bi bi-tag"></i><br>
                        Áp voucher
                    </button>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-outline-info w-100 mb-2" @click="savePending">
                        <i class="bi bi-save"></i><br>
                        Lưu chờ
                    </button>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-outline-secondary w-100 mb-2" @click="clearCart">
                        <i class="bi bi-trash"></i><br>
                        Xóa giỏ hàng
                    </button>
                </div>

                <div class="col-md-2">
                    <button class="btn btn-outline-danger w-100 mb-2" @click="cancelBill">
                        <i class="bi bi-x-circle"></i><br>
                        Hủy hóa đơn
                    </button>
                </div>
            </div>
        </div>

        <!-- ===== BILL STATUS ===== -->
        <div class="bill-status mb-4">
            <h5 class="text-primary mb-3">
                <i class="bi bi-info-circle"></i> Trạng thái hóa đơn
            </h5>

            <div class="row">
                <div class="col-md-6">
                    <div class="status-card">
                        <div class="status-header">
                            <i class="bi bi-person"></i>
                            <span>Khách hàng</span>
                        </div>
                        <div class="status-content">
                            <div v-if="salesStore.currentBill.customer" class="customer-info">
                                <strong>{{ salesStore.currentBill.customer.tenKhachHang }}</strong><br>
                                <small>{{ salesStore.currentBill.customer.soDienThoai }}</small>
                            </div>
                            <div v-else class="text-muted">
                                Chưa chọn khách hàng
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="status-card">
                        <div class="status-header">
                            <i class="bi bi-tag"></i>
                            <span>Voucher</span>
                        </div>
                        <div class="status-content">
                            <div v-if="salesStore.currentBill.voucher" class="voucher-info">
                                <strong>{{ salesStore.currentBill.voucher.maVoucher }}</strong><br>
                                <small>Giảm {{ salesStore.currentBill.voucher.giaTri }}%</small>
                            </div>
                            <div v-else class="text-muted">
                                Chưa áp dụng voucher
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSalesStore } from '@/stores/salesStore'

const salesStore = useSalesStore()

// ===== REACTIVE DATA =====
const currentStep = ref(1)

// ===== COMPUTED =====
const hasItems = computed(() => salesStore.cartItems.length > 0)
const hasCustomer = computed(() => salesStore.currentBill.customer !== null)
const hasVoucher = computed(() => salesStore.currentBill.voucher !== null)

// ===== METHODS =====
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

const scanImei = () => {
    // Emit event để mở modal quét IMEI
    emit('scan-imei')
}

const createCustomer = () => {
    // Emit event để mở modal tạo khách hàng
    emit('create-customer')
}

const applyVoucher = () => {
    const voucherCode = prompt('Nhập mã voucher:')
    if (voucherCode) {
        salesStore.applyVoucher(voucherCode)
    }
}

const savePending = async () => {
    if (!hasItems.value) {
        alert('Giỏ hàng trống!')
        return
    }

    const result = await salesStore.savePendingBill()
    if (result.success) {
        alert('Đã lưu hóa đơn chờ!')
    } else {
        alert(result.message || 'Lỗi khi lưu hóa đơn')
    }
}

const clearCart = () => {
    if (confirm('Bạn có chắc muốn xóa giỏ hàng?')) {
        salesStore.clearCart()
    }
}

const cancelBill = () => {
    if (confirm('Bạn có chắc muốn hủy hóa đơn này?')) {
        salesStore.createNewBill()
    }
}

// ===== WATCHERS =====
watch(() => salesStore.cartItems, (items) => {
    if (items.length > 0 && currentStep.value === 1) {
        currentStep.value = 2
    }
}, { deep: true })

watch(() => salesStore.currentBill.customer, (customer) => {
    if (customer && currentStep.value === 2) {
        currentStep.value = 3
    }
})

watch(() => salesStore.currentBill.voucher, (voucher) => {
    if (voucher && currentStep.value === 3) {
        currentStep.value = 4
    }
})

// ===== EMITS =====
const emit = defineEmits(['scan-imei', 'create-customer'])
</script>

<style scoped>
.sales-logic {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

/* Flow Steps */
.flow-step {
    text-align: center;
    padding: 15px;
    border-radius: 8px;
    background: white;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    margin-bottom: 10px;
}

.flow-step.active {
    border-color: #007bff;
    background: #f8f9ff;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #007bff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin: 0 auto 10px;
}

.step-title {
    font-weight: bold;
    margin-bottom: 5px;
}

.step-desc {
    font-size: 0.9em;
    color: #6c757d;
}

/* Stat Cards */
.stat-card {
    display: flex;
    align-items: center;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 15px;
}

.stat-value {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
}

.stat-label {
    font-size: 0.9em;
    color: #6c757d;
}

/* Status Cards */
.status-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.status-header {
    background: #f8f9fa;
    padding: 10px 15px;
    border-bottom: 1px solid #e9ecef;
    font-weight: bold;
}

.status-header i {
    margin-right: 8px;
}

.status-content {
    padding: 15px;
}

.customer-info,
.voucher-info {
    color: #28a745;
}

/* Quick Actions */
.btn {
    padding: 10px;
    font-size: 0.9em;
}

.btn i {
    font-size: 1.2em;
    margin-bottom: 5px;
}
</style>