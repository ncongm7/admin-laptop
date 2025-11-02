<template>
    <!-- Backdrop -->
    <div class="modal-backdrop fade show"></div>

    <!-- Modal -->
    <div class="modal fade show d-block" tabindex="-1" aria-hidden="true" style="z-index: 9999;">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-credit-card"></i> Thanh toán
                    </h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"
                        :disabled="isProcessing"></button>
                </div>

                <div class="modal-body">
                    <div class="row g-4">
                        <!-- CỘT 1: Thông tin thanh toán -->
                        <div class="col-md-5">
                            <!-- Thông tin hóa đơn -->
                            <div class="invoice-summary">
                                <h6 class="mb-3"><i class="bi bi-file-text"></i> Thông tin hóa đơn</h6>
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

                                <!-- Cảnh báo khi không có phương thức thanh toán -->
                                <div v-if="paymentMethods.length === 0" class="alert alert-warning mb-2">
                                    <i class="bi bi-exclamation-triangle"></i>
                                    <strong>Chưa có phương thức thanh toán!</strong>
                                    <br>
                                    Vui lòng chạy file <code>SQL_INSERT_PHUONG_THUC_THANH_TOAN.sql</code> trong thư mục
                                    backend.
                                </div>

                                <select class="form-select" v-model="formData.idPhuongThucThanhToan"
                                    :disabled="isProcessing || paymentMethods.length === 0">
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
                            <div v-if="selectedMethodName !== 'Tiền mặt' && formData.idPhuongThucThanhToan"
                                class="mb-3">
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

                        <!-- CỘT 2: Quét Serial Number (YÊU CẦU QUAN TRỌNG) -->
                        <div class="col-md-7">
                            <div class="serial-section">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">
                                        <i class="bi bi-upc-scan text-warning"></i>
                                        Quét Serial/IMEI sản phẩm
                                        <span class="badge bg-danger ms-2">Bắt buộc</span>
                                    </h6>
                                    <button class="btn btn-sm btn-outline-primary" @click="toggleScanMode"
                                        :class="{ 'active': scanMode }" :disabled="isProcessing">
                                        <i class="bi bi-camera"></i>
                                        {{ scanMode ? 'Tắt quét' : 'Bật quét' }}
                                    </button>
                                </div>

                                <!-- Progress bar -->
                                <div class="mb-3">
                                    <div class="progress" style="height: 25px;">
                                        <div class="progress-bar" :class="{
                                            'bg-success': daQuetDu,
                                            'bg-warning': !daQuetDu && progress > 0,
                                            'bg-secondary': progress === 0
                                        }" :style="{ width: progress + '%' }" role="progressbar">
                                            {{ soLuongDaQuet }} / {{ tongSoLuongCanQuet }} Serial
                                        </div>
                                    </div>
                                    <small class="text-muted">
                                        {{ daQuetDu ? '✅ Đã quét đủ serial' : '⚠️ Cần quét serial cho tất cả sản phẩm'
                                        }}
                                    </small>
                                </div>

                                <!-- Danh sách sản phẩm cần quét serial -->
                                <div class="product-serial-list">
                                    <div v-for="product in danhSachSanPhamCanQuet" :key="product.id"
                                        class="product-serial-item mb-3" :class="{
                                            'completed': product.hoanThanh,
                                            'active': currentProduct?.id === product.id
                                        }">
                                        <div class="product-header">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 class="mb-1">{{ product.tenSanPham }}</h6>
                                                    <small class="text-muted">Mã: {{ product.maCTSP }}</small>
                                                </div>
                                                <div class="text-end">
                                                    <span class="badge" :class="{
                                                        'bg-success': product.hoanThanh,
                                                        'bg-warning': !product.hoanThanh && product.soLuongDaQuet > 0,
                                                        'bg-secondary': product.soLuongDaQuet === 0
                                                    }">
                                                        {{ product.soLuongDaQuet }} / {{ product.soLuongCanQuet }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Input quét serial cho sản phẩm này -->
                                        <div v-if="!product.hoanThanh" class="serial-input-group mt-2">
                                            <div class="input-group">
                                                <input type="text" class="form-control" v-model="currentSerialInput"
                                                    @keyup.enter="scanSerial(product)" @focus="currentProduct = product"
                                                    :placeholder="`Quét/nhập Serial ${product.soLuongDaQuet + 1}...`"
                                                    :disabled="isLoading || isProcessing" ref="serialInputs" />
                                                <button class="btn btn-primary" @click="scanSerial(product)"
                                                    :disabled="!currentSerialInput || isLoading || isProcessing">
                                                    <span v-if="isLoading && currentProduct?.id === product.id"
                                                        class="spinner-border spinner-border-sm"></span>
                                                    <i v-else class="bi bi-check-circle"></i>
                                                    Xác nhận
                                                </button>
                                            </div>
                                            <small v-if="errorMessage && currentProduct?.id === product.id"
                                                class="text-danger">
                                                {{ errorMessage }}
                                            </small>
                                        </div>

                                        <!-- Danh sách serial đã quét cho sản phẩm này -->
                                        <div v-if="product.soLuongDaQuet > 0" class="scanned-serials mt-2">
                                            <div v-for="serial in getSerialsByProduct(product.id)"
                                                :key="serial.serialNumber" class="scanned-serial-item">
                                                <i class="bi bi-check-circle text-success"></i>
                                                <span>{{ serial.serialNumber }}</span>
                                                <button class="btn btn-sm btn-link text-danger p-0"
                                                    @click="xoaSerial(serial.serialNumber)" :disabled="isProcessing">
                                                    <i class="bi bi-x-circle"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Không có sản phẩm -->
                                    <div v-if="danhSachSanPhamCanQuet.length === 0" class="text-center text-muted py-4">
                                        <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                                        <p class="mb-0">Không có sản phẩm nào trong hóa đơn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { layDanhSachPhuongThucThanhToan } from '@/service/banHangService'
import { useSerialValidation } from '@/composables/useSerialValidation'

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
const serialInputs = ref([])

// ==================== SERIAL VALIDATION ====================
const hoaDonRef = computed(() => props.hoaDon)
const {
    isLoading,
    validatedSerials,
    currentSerialInput,
    currentProduct,
    errorMessage,
    scanMode,
    tongSoLuongCanQuet,
    soLuongDaQuet,
    daQuetDu,
    progress,
    danhSachSanPhamCanQuet,
    xacThucMotSerial,
    xoaSerial: xoaSerialComposable,
    resetSerials,
    getSerialPayload,
    toggleScanMode
} = useSerialValidation(hoaDonRef)

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
    // Phải chọn phương thức thanh toán
    if (!formData.value.idPhuongThucThanhToan) return false

    // Phải quét đủ serial (YÊU CẦU QUAN TRỌNG)
    if (!daQuetDu.value) return false

    // Nếu là tiền mặt, phải đủ tiền
    if (selectedMethodName.value === 'Tiền mặt') {
        return tienKhachDua.value >= tongTien.value
    }

    return true
})

// Methods
const loadPaymentMethods = async () => {
    try {
        const response = await layDanhSachPhuongThucThanhToan()
        // Response đã được parse trong service, trực tiếp là array
        paymentMethods.value = Array.isArray(response) ? response : []

        if (paymentMethods.value.length === 0) {
            console.warn('⚠️ Không có phương thức thanh toán nào. Vui lòng chạy script SQL để thêm dữ liệu!')
        }
    } catch (error) {
        console.error('❌ Lỗi khi tải phương thức thanh toán:', error)
        paymentMethods.value = []
    }
}

const scanSerial = async (product) => {
    if (!currentSerialInput.value || !currentSerialInput.value.trim()) {
        errorMessage.value = 'Vui lòng nhập Serial Number'
        return
    }

    const success = await xacThucMotSerial(currentSerialInput.value, product)

    if (success) {
        currentSerialInput.value = ''
        errorMessage.value = ''

        // Focus lại input để tiếp tục quét
        await nextTick()
        if (serialInputs.value && serialInputs.value.length > 0) {
            serialInputs.value[0]?.focus()
        }
    }
}

// Import composables
import { useConfirm } from '@/composables/useConfirm'
import { useToast } from '@/composables/useToast'

const { showConfirm } = useConfirm()
const { error: showError, warning: showWarning } = useToast()

const xoaSerial = async (serialNumber) => {
    const confirmed = await showConfirm({
        title: 'Xác nhận xóa serial',
        message: `Bạn có chắc chắn muốn xóa serial "${serialNumber}"?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning'
    })
    
    if (confirmed) {
        xoaSerialComposable(serialNumber)
    }
}

const getSerialsByProduct = (productId) => {
    return validatedSerials.value.filter(s => s.idHoaDonChiTiet === productId)
}

const handlePayment = async () => {
    if (!canPay.value) {
        showWarning('Vui lòng kiểm tra lại thông tin thanh toán và đảm bảo đã quét đủ serial!')
        return
    }

    isProcessing.value = true

    try {
        const payloadData = {
            ...formData.value,
            soTienThanhToan: tongTien.value,
            serialNumbers: getSerialPayload() // QUAN TRỌNG: Gửi kèm serial numbers
        }

        // Nếu là tiền mặt, lưu thêm thông tin tiền khách đưa và tiền thừa
        if (selectedMethodName.value === 'Tiền mặt') {
            payloadData.tienKhachDua = tienKhachDua.value
            payloadData.tienThua = tienThua.value
        }

        console.log('💰 Payload thanh toán:', payloadData)

        emit('payment-confirmed', payloadData)
    } catch (error) {
        console.error('Lỗi trong quá trình thanh toán:', error)
        showError('Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
        isProcessing.value = false
    }
}

const close = async () => {
    if (!isProcessing.value) {
        if (soLuongDaQuet.value > 0) {
            const confirmed = await showConfirm({
                title: 'Xác nhận đóng',
                message: 'Bạn đã quét một số serial. Đóng cửa sổ sẽ mất dữ liệu. Bạn có chắc chắn muốn tiếp tục?',
                confirmText: 'Đóng',
                cancelText: 'Hủy',
                type: 'warning'
            })
            
            if (!confirmed) return
        }
        resetSerials()
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
/* Fix z-index để modal không bị backdrop che và không bị sidebar/menu che */
.modal-backdrop {
    opacity: 0.5;
    z-index: 9998 !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal {
    z-index: 9999 !important;
}

.modal-dialog {
    position: relative;
    z-index: 1;
}

.modal-content {
    position: relative;
    z-index: 1;
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

/* Serial Section Styles */
.serial-section {
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 400px;
}

.product-serial-list {
    max-height: 400px;
    overflow-y: auto;
}

.product-serial-item {
    background-color: white;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
}

.product-serial-item.completed {
    border-color: #28a745;
    background-color: #f0fff4;
}

.product-serial-item.active {
    border-color: #0dcaf0;
    box-shadow: 0 0 10px rgba(13, 202, 240, 0.3);
}

.product-header h6 {
    margin: 0;
    font-size: 0.95rem;
    color: #212529;
}

.serial-input-group {
    margin-top: 0.75rem;
}

.scanned-serials {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #dee2e6;
}

.scanned-serial-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background-color: #f8f9fa;
    border-radius: 4px;
    margin-bottom: 0.4rem;
    font-size: 0.9rem;
}

.scanned-serial-item i.bi-check-circle {
    flex-shrink: 0;
}

.scanned-serial-item span {
    flex: 1;
    font-family: 'Courier New', monospace;
    font-weight: 500;
}

.btn.active {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #000;
}

/* Progress bar */
.progress {
    border-radius: 12px;
    overflow: hidden;
}

.progress-bar {
    transition: width 0.3s ease;
    font-weight: 600;
    font-size: 0.9rem;
}
</style>
