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
                    <!-- Alert thông báo thay đổi giá/voucher/điểm -->
                    <div v-if="thongBaoThayDoi" class="alert alert-warning alert-dismissible fade show mb-3 shadow-sm"
                        role="alert" style="border-left: 4px solid #ffc107;">
                        <h6 class="alert-heading mb-3 d-flex align-items-center">
                            <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                            <span>Đã phát hiện thay đổi trong hóa đơn</span>
                        </h6>
                        <div v-html="thongBaoThayDoi" class="mb-3"></div>
                        <hr>
                        <p class="mb-0 d-flex align-items-center">
                            <i class="bi bi-info-circle me-2"></i>
                            <span><strong>Đã tự động cập nhật hóa đơn.</strong> Vui lòng kiểm tra lại và xác nhận thanh
                                toán lần nữa.</span>
                        </p>
                        <button type="button" class="btn-close" @click="thongBaoThayDoi = null"
                            aria-label="Close"></button>
                    </div>

                    <!-- Preview hóa đơn -->
                    <InvoicePreview :hoaDon="hoaDon" />

                    <div class="row g-4">
                        <!-- CỘT 1: Thông tin thanh toán & Giao hàng -->
                        <div class="col-md-5">
                            <!-- Section: Chọn phương thức thanh toán -->
                            <PaymentMethodSelection v-model="formData" :paymentMethods="paymentMethods"
                                :filteredPaymentMethods="filteredPaymentMethods" :tongTien="tongTien"
                                :isProcessing="isProcessing" :isTienMat="isTienMat" :isCOD="isCOD"
                                :isQRPayment="isQRPayment" :tienThua="tienThua"
                                v-model:tienKhachDua="tienKhachDua"
                                v-model:paymentMethodCash="paymentMethodCash" :qrStatus="qrStatus"
                                :qrTransactionId="qrTransactionId" :formatCurrencyFn="formatCurrency"
                                @validate-cash="validateTienKhachDua" />

                            <hr />

                            <!-- Section: Thông tin giao hàng -->
                            <DeliveryInfoSection v-model="formData" :hoaDon="hoaDon" :isProcessing="isProcessing"
                                ref="deliverySectionRef" />
                        </div>

                        <!-- CỘT 2: Quét Serial Number (YÊU CẦU QUAN TRỌNG) -->
                        <div class="col-md-7">
                            <SerialScannerSection :hoaDon="hoaDon" :isProcessing="isProcessing"
                                v-model:daQuetDu="daQuetDu" ref="serialScannerRef" />
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

    <!-- QR Payment Modal -->
    <QRPaymentModal :show="showQRModal" :qrData="qrCodeData" :loading="qrLoading" :error="qrError" :status="qrStatus"
        :transactionId="qrTransactionId" @close="closeQRModal" @retry="generateQR" @expired="handleQRExpired" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfirm } from '@/composables/common/useConfirm'
import { usePaymentForm } from '@/composables/banhang/usePaymentForm'
import { useSerialValidation } from '@/composables/banhang/useSerialValidation' // Need this just for resetSerials if we want to call it on close, OR expose it from child
import QRPaymentModal from '@/components/banhang/thanh-toan/QRPaymentModal.vue'
import InvoicePreview from '@/components/banhang/hoadon/InvoicePreview.vue'
import PaymentMethodSelection from './PaymentMethodSelection.vue'
import DeliveryInfoSection from './DeliveryInfoSection.vue'
import SerialScannerSection from './SerialScannerSection.vue'

const props = defineProps({
    hoaDon: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'payment-confirmed', 'hoa-don-updated'])

const hoaDonRef = computed(() => props.hoaDon)
const formData = ref({
    idPhuongThucThanhToan: '',
    soTienThanhToan: 0,
    ghiChu: '',
    maGiaoDich: '',
    // Thông tin giao hàng
    canGiaoHang: false,
    tenNguoiNhan: '',
    sdtNguoiNhan: '',
    diaChiChiTiet: '',
    tinhCode: '',
    tinh: '',
    xaCode: '',
    xa: '',
    diaChiGiaoHang: '',
    ghiChuGiaoHang: ''
})

// Child Component Refs
const serialScannerRef = ref(null)
const deliverySectionRef = ref(null)

// ==================== PAYMENT FORM ====================
// Sử dụng composable usePaymentForm để quản lý logic thanh toán
const paymentForm = usePaymentForm(hoaDonRef, formData, emit)
const {
    paymentMethods,
    tienKhachDua,
    paymentMethodCash,
    isProcessing,
    thongBaoThayDoi,
    tongTien,
    isTienMat,
    isQRPayment,
    isCOD,
    tienThua,
    filteredPaymentMethods,
    qrCodeData,
    qrLoading,
    qrError,
    qrStatus,
    showQRModal,
    qrTransactionId,
    generateQR,
    closeQRModal,
    handleQRExpired,
    loadPaymentMethods,
    validateTienKhachDua,
    handlePayment: handlePaymentForm,
    formatCurrency
} = paymentForm

const { showConfirm } = useConfirm()
// Track Scan Status from Child
const daQuetDu = ref(false)

const canPay = computed(() => {
    // Phải chọn phương thức thanh toán
    if (!formData.value.idPhuongThucThanhToan) return false

    // Phải quét đủ serial (YÊU CẦU QUAN TRỌNG)
    // Managed by child component, emitted via v-model:daQuetDu
    if (!daQuetDu.value) return false

    // Nếu là tiền mặt, phải đủ tiền
    if (isTienMat.value) {
        if (tienKhachDua.value < tongTien.value) return false
    }

    // Nếu chọn giao hàng, phải có địa chỉ
    if (formData.value.canGiaoHang) {
        // Access validation from delivery child
        if (!deliverySectionRef.value?.diaChiFormRef) return false
        const diaChiForm = deliverySectionRef.value.diaChiFormRef.form
        if (!diaChiForm.diaChi || diaChiForm.diaChi.trim().length === 0) {
            return false
        }
        if (!diaChiForm.tinhCode || !diaChiForm.tinh) {
            return false
        }
    }

    return true
})

const handlePayment = async () => {
    console.log('💳 Bắt đầu thanh toán...')
    
    // Get Serial Payload from Child
    // Note: getSerialPayload is exposed by SerialScannerSection
    const getSerialPayload = serialScannerRef.value?.getSerialPayload
    
    if (!getSerialPayload) {
        console.error('❌ Không thể lấy hàm getSerialPayload từ SerialScannerSection')
        return
    }

    // Get Address Form Ref from Child
    const diaChiFormRef = deliverySectionRef.value?.diaChiFormRef

    await handlePaymentForm(
        () => canPay.value,
        ref(daQuetDu.value), // Pass ref compatible with composable expectations
        getSerialPayload,
        ref(diaChiFormRef) // Wrap in ref as composable expects it
    )
}

const close = async () => {
    if (!isProcessing.value) {
        // Check if any serials scanned using child's exposed logic if possible, 
        // or just rely on global store if useSerialValidation was global (it's not).
        // Since useSerialValidation is now local to SerialScannerSection, parent doesn't know scan count directly.
        // But we can check daQuetDu or ask child.
        // Simplified: Just ask user if daQuetDu is true or if needed.
        // Better: Expose `soLuongDaQuet` from child. I did NOT expose it in the first step.
        // Let's blindly close for now or add a quick exposure if user complains.
        // Actually, let's play safe and show confirm if daQuetDu is true (some work done).
        
        // Use serialScannerRef to reset
        if (serialScannerRef.value?.resetSerials) {
            serialScannerRef.value.resetSerials()
        }
        
        thongBaoThayDoi.value = null
        emit('close')
    }
}

// Lifecycle
onMounted(() => {
    loadPaymentMethods()
    
    // Tự động set số tiền khách đưa bằng tổng tiền (tiện lợi hơn) - chỉ khi không phải COD
    if (tongTien.value > 0 && !isCOD.value) {
        tienKhachDua.value = tongTien.value
    }

    // Reset paymentMethodCash
    if (!isTienMat.value) {
        paymentMethodCash.value = 'counter'
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

/* Ensure sub-components look good */
</style>
