<template>
    <div class="modal fade show d-block" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-credit-card"></i> Thanh toán
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"
                        :disabled="isProcessing"></button>
                </div>

                <div class="modal-body">
                    <!-- Thông tin hóa đơn -->
                    <div class="invoice-summary">
                        <h6 class="mb-3">Thông tin hóa đơn</h6>
                        <div class="summary-row">
                            <span>Mã hóa đơn:</span>
                            <strong>{{ hoaDon?.ma || 'N/A' }}</strong>
                        </div>
                        <div class="summary-row">
                            <span>Tổng tiền:</span>
                            <strong class="text-danger fs-5">
                                {{ formatCurrency(tongTien) }}
                            </strong>
                        </div>
                    </div>

                    <hr />

                    <!-- Chọn phương thức thanh toán -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">
                            Phương thức thanh toán <span class="text-danger">*</span>
                        </label>
                        <select class="form-select" v-model="formData.idPhuongThucThanhToan" :disabled="isProcessing">
                            <option value="">-- Chọn phương thức --</option>
                            <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                                {{ method.tenPhuongThuc }}
                            </option>
                        </select>
                    </div>

                    <!-- Số tiền khách đưa (chỉ hiện với tiền mặt) -->
                    <div v-if="selectedMethodName === 'Tiền mặt'" class="mb-3">
                        <label class="form-label fw-semibold">
                            Số tiền khách đưa
                        </label>
                        <input type="number" class="form-control" v-model.number="tienKhachDua" :min="tongTien"
                            :step="1000" placeholder="Nhập số tiền khách đưa" :disabled="isProcessing" />
                        <div v-if="tienThua > 0" class="mt-2">
                            <span class="text-success fw-bold">
                                Tiền thừa trả khách: {{ formatCurrency(tienThua) }}
                            </span>
                        </div>
                        <div v-if="tienKhachDua > 0 && tienThua < 0" class="mt-2">
                            <span class="text-danger">
                                Số tiền chưa đủ: {{ formatCurrency(Math.abs(tienThua)) }}
                            </span>
                        </div>
                    </div>

                    <!-- Mã giao dịch (cho chuyển khoản/thẻ) -->
                    <div v-if="selectedMethodName !== 'Tiền mặt' && formData.idPhuongThucThanhToan" class="mb-3">
                        <label class="form-label fw-semibold">Mã giao dịch</label>
                        <input type="text" class="form-control" v-model="formData.maGiaoDich"
                            placeholder="Nhập mã giao dịch (nếu có)" :disabled="isProcessing" />
                    </div>

                    <!-- Ghi chú -->
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Ghi chú</label>
                        <textarea class="form-control" rows="2" v-model="formData.ghiChu"
                            placeholder="Ghi chú thanh toán (nếu có)" :disabled="isProcessing"></textarea>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close" :disabled="isProcessing">
                        <i class="bi bi-x-circle"></i> Hủy
                    </button>
                    <button type="button" class="btn btn-success" @click="handlePayment"
                        :disabled="!canPay || isProcessing">
                        <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-check-circle"></i>
                        {{ isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán' }}
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { layDanhSachPhuongThucThanhToan } from '@/service/banHangService'

const props = defineProps({
    hoaDon: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'payment-confirmed'])

const paymentMethods = ref([])
const formData = ref({
    idPhuongThucThanhToan: '',
    soTienThanhToan: 0,
    ghiChu: '',
    maGiaoDich: ''
})
const tienKhachDua = ref(0)
const isProcessing = ref(false)

// Computed
const tongTien = computed(() => {
    return props.hoaDon?.tongTienSauGiam || props.hoaDon?.tongTien || 0
})

const selectedMethodName = computed(() => {
    const method = paymentMethods.value.find(m => m.id === formData.value.idPhuongThucThanhToan)
    return method?.tenPhuongThuc || ''
})

const tienThua = computed(() => {
    if (selectedMethodName.value === 'Tiền mặt') {
        return tienKhachDua.value - tongTien.value
    }
    return 0
})

const canPay = computed(() => {
    if (!formData.value.idPhuongThucThanhToan) return false
    if (selectedMethodName.value === 'Tiền mặt') {
        return tienKhachDua.value >= tongTien.value
    }
    return true
})

// Methods
const loadPaymentMethods = async () => {
    try {
        const response = await layDanhSachPhuongThucThanhToan()
        paymentMethods.value = response.data || response || []
    } catch (error) {
        console.error('Lỗi khi tải phương thức thanh toán:', error)
        paymentMethods.value = []
    }
}

const handlePayment = async () => {
    if (!canPay.value) {
        alert('Vui lòng kiểm tra lại thông tin thanh toán!')
        return
    }

    isProcessing.value = true

    try {
        const payloadData = {
            ...formData.value,
            soTienThanhToan: tongTien.value
        }

        // Nếu là tiền mặt, lưu thêm thông tin tiền khách đưa và tiền thừa
        if (selectedMethodName.value === 'Tiền mặt') {
            payloadData.tienKhachDua = tienKhachDua.value
            payloadData.tienThua = tienThua.value
        }

        emit('payment-confirmed', payloadData)
    } catch (error) {
        console.error('Lỗi trong quá trình thanh toán:', error)
        alert('Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
        isProcessing.value = false
    }
}

const close = () => {
    if (!isProcessing.value) {
        emit('close')
    }
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value || 0)
}

// Lifecycle
onMounted(() => {
    loadPaymentMethods()

    // Tự động set số tiền khách đưa bằng tổng tiền (tiện lợi hơn)
    if (tongTien.value > 0) {
        tienKhachDua.value = tongTien.value
    }
})
</script>

<style scoped>
.modal-backdrop {
    opacity: 0.5;
}

.invoice-summary {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.form-label {
    margin-bottom: 0.5rem;
    color: #495057;
}

.btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}
</style>
