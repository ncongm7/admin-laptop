<template>
    <!-- QR Payment Modal Overlay -->
    <div v-if="show" class="qr-payment-overlay" @click.self="handleClose">
        <div class="qr-modal-content">
            <!-- Header -->
            <div class="qr-header">
                <h5><i class="bi bi-qr-code"></i> Thanh toán QR Code</h5>
                <button class="btn-close btn-close-white" @click="handleClose"
                    :disabled="status === 'confirmed'"></button>
            </div>

            <!-- Body -->
            <div class="qr-body">
                <!-- Loading State -->
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tạo mã QR...</span>
                    </div>
                    <p class="text-muted mt-2">Đang tạo mã QR thanh toán...</p>
                </div>

                <!-- QR Code Display -->
                <div v-else-if="qrData && status !== 'expired'" class="qr-content">
                    <div class="text-center mb-3">
                        <h6 class="mb-3">Đưa mã QR cho khách quét để thanh toán</h6>

                        <!-- QR Code Image -->
                        <div class="qr-code-container">
                            <img :src="qrData.qrCodeUrl" alt="QR Code Thanh toán" class="qr-code-image"
                                @error="handleImageError" />
                        </div>

                        <!-- Timer -->
                        <div class="timer-display mt-3" :class="{
                            'text-warning': remainingTime < 300 && remainingTime > 0,
                            'text-danger': remainingTime <= 60
                        }">
                            <i class="bi bi-clock"></i>
                            <strong>{{ formatTime }}</strong>
                        </div>
                    </div>

                    <!-- Payment Info -->
                    <div class="payment-info-box">
                        <div class="info-row">
                            <span class="label">Ngân hàng:</span>
                            <span class="value">{{ qrData.bankInfo?.bankName || 'VietinBank' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Số TK:</span>
                            <span class="value fw-bold text-primary">{{ qrData.bankInfo?.accountNo || '0866668888'
                                }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Chủ TK:</span>
                            <span class="value">{{ qrData.bankInfo?.accountName || 'CONG TY TNHH VIETLAPTOP' }}</span>
                        </div>
                        <div class="info-row border-top pt-2 mt-2">
                            <span class="label">Số tiền:</span>
                            <span class="value fw-bold text-danger fs-5">{{ formatCurrency(qrData.amount) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Nội dung:</span>
                            <code class="value bg-light px-2 py-1">{{ qrData.orderCode }}</code>
                        </div>
                    </div>

                    <!-- Status Indicator -->
                    <div class="status-indicator mt-3">
                        <div v-if="status === 'checking'" class="alert alert-info mb-0">
                            <div class="spinner-border spinner-border-sm me-2"></div>
                            Đang chờ khách thanh toán...
                        </div>
                        <div v-else-if="status === 'confirmed'" class="alert alert-success mb-0">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            <strong>✅ Đã nhận thanh toán!</strong>
                            <div v-if="transactionId" class="small mt-1">
                                Mã GD: <code>{{ transactionId }}</code>
                            </div>
                        </div>
                        <div v-else class="alert alert-warning mb-0">
                            <i class="bi bi-info-circle me-2"></i>
                            Hệ thống sẽ tự động xác nhận khi nhận được thanh toán
                        </div>
                    </div>
                </div>

                <!-- Expired State -->
                <div v-else-if="status === 'expired'" class="text-center py-4">
                    <div class="alert alert-danger">
                        <i class="bi bi-x-circle-fill me-2"></i>
                        Mã QR đã hết hạn
                    </div>
                    <button class="btn btn-primary" @click="$emit('retry')">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Tạo lại QR Code
                    </button>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="text-center py-4">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        {{ error }}
                    </div>
                    <button class="btn btn-primary" @click="$emit('retry')">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Thử lại
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="qr-footer">
                <button type="button" class="btn btn-secondary" @click="handleClose" :disabled="status === 'confirmed'">
                    {{ status === 'confirmed' ? 'Đóng' : 'Hủy' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    qrData: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'pending'
    },
    transactionId: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'retry', 'expired'])

// State
const remainingTime = ref(0)
let countdownInterval = null

// Computed
const formatTime = computed(() => {
    const mins = Math.floor(remainingTime.value / 60)
    const secs = remainingTime.value % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
})

// Methods
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0)
}

const handleClose = () => {
    if (props.status !== 'confirmed') {
        emit('close')
    }
}

const handleImageError = () => {
    console.error('Failed to load QR code image')
}

const startCountdown = () => {
    if (!props.qrData?.expiryTime) return

    stopCountdown()

    const updateTimer = () => {
        const now = dayjs()
        const expiry = dayjs(props.qrData.expiryTime)
        remainingTime.value = expiry.diff(now, 'second')

        if (remainingTime.value <= 0) {
            remainingTime.value = 0
            stopCountdown()
            emit('expired')
        }
    }

    updateTimer()
    countdownInterval = setInterval(updateTimer, 1000)
}

const stopCountdown = () => {
    if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
    }
}

// Watchers
watch(() => props.qrData, (newData) => {
    if (newData) {
        startCountdown()
    }
}, { immediate: true })

watch(() => props.show, (newShow) => {
    if (!newShow) {
        stopCountdown()
    }
})

watch(() => props.status, (newStatus) => {
    if (newStatus === 'confirmed' || newStatus === 'expired') {
        stopCountdown()
    }
})

// Lifecycle
onUnmounted(() => {
    stopCountdown()
})
</script>

<style scoped>
.qr-payment-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.qr-modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.qr-header {
    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.qr-header h5 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.qr-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.qr-footer {
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.qr-code-container {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: inline-block;
}

.qr-code-image {
    width: 300px;
    height: 300px;
    border-radius: 8px;
}

.timer-display {
    font-size: 1.5rem;
    font-weight: bold;
    padding: 12px 24px;
    background: #f8f9fa;
    border-radius: 8px;
    display: inline-block;
}

.timer-display.text-warning {
    background: #fff3cd;
}

.timer-display.text-danger {
    background: #f8d7da;
    animation: pulse 1s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.payment-info-box {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.info-row .label {
    color: #6c757d;
    font-weight: 500;
}

.info-row .value {
    text-align: right;
}

.status-indicator .alert {
    border-radius: 8px;
}

@media (max-width: 768px) {
    .qr-modal-content {
        width: 95%;
    }

    .qr-code-image {
        width: 250px;
        height: 250px;
    }

    .timer-display {
        font-size: 1.25rem;
    }

    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .info-row .value {
        text-align: left;
    }
}
</style>
