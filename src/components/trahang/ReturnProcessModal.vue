<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header" :class="headerClass">
                    <h5 class="modal-title">{{ modalTitle }}</h5>
                    <button type="button" class="btn-close" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="alert" :class="alertClass">
                        <i class="bi" :class="alertIcon"></i>
                        {{ alertMessage }}
                    </div>

                    <div class="mb-4">
                        <h6>Thông tin yêu cầu trả hàng</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label">Mã yêu cầu</label>
                                <p>#RT{{ returnRequest.id.toString().padStart(6, '0') }}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Mã đơn hàng</label>
                                <p>#HD{{ returnRequest.hoa_don_id.toString().padStart(6, '0') }}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Khách hàng</label>
                                <p>{{ returnRequest.customerName }}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Tổng giá trị</label>
                                <p>{{ formatCurrency(returnRequest.totalValue) }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-if="action === 'DA_DUYET'">
                        <div class="mb-3">
                            <label class="form-label">Hình thức hoàn tiền</label>
                            <select v-model="refundMethod" class="form-select">
                                <option value="original">Hoàn tiền theo phương thức thanh toán gốc</option>
                                <option value="cash">Hoàn tiền mặt</option>
                                <option value="bank">Chuyển khoản ngân hàng</option>
                                <option value="credit">Hoàn vào ví điện tử</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Số tiền hoàn</label>
                            <div class="input-group">
                                <span class="input-group-text">VND</span>
                                <input v-model="refundAmount" type="number" class="form-control"
                                    :max="returnRequest.totalValue">
                            </div>
                            <div class="form-text">
                                Số tiền tối đa: {{ formatCurrency(returnRequest.totalValue) }}
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Ghi chú nội bộ</label>
                            <textarea v-model="internalNote" class="form-control" rows="3"></textarea>
                        </div>
                    </div>

                    <div v-else-if="action === 'TU_CHOI'">
                        <div class="mb-3">
                            <label class="form-label">Lý do từ chối <span class="text-danger">*</span></label>
                            <select v-model="rejectionReason" class="form-select">
                                <option value="">Chọn lý do từ chối</option>
                                <option value="Quá thời hạn trả hàng">Quá thời hạn trả hàng</option>
                                <option value="Sản phẩm không đủ điều kiện">Sản phẩm không đủ điều kiện</option>
                                <option value="Không đúng chính sách">Không đúng chính sách</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div class="mb-3" v-if="rejectionReason">
                            <label class="form-label">Mô tả chi tiết</label>
                            <textarea v-model="rejectionDetails" class="form-control" rows="3"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">Hủy bỏ</button>
                    <button type="button" class="btn" :class="actionButtonClass" @click="processReturn"
                        :disabled="processing || !canProcess">
                        <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
                        {{ actionButtonText }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReturnStore } from '@/stores/returnStore'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
    returnRequest: {
        type: Object,
        required: true
    },
    action: {
        type: String,
        required: true,
        validator: value => ['DA_DUYET', 'TU_CHOI'].includes(value)
    }
})

const emit = defineEmits(['close', 'processed'])

const returnStore = useReturnStore()

// Form data
const refundMethod = ref('original')
const refundAmount = ref(props.returnRequest.totalValue)
const internalNote = ref('')
const rejectionReason = ref('')
const rejectionDetails = ref('')
const processing = ref(false)

// Computed
const modalTitle = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'Duyệt yêu cầu trả hàng'
        : 'Từ chối yêu cầu trả hàng'
})

const headerClass = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'bg-success text-white'
        : 'bg-danger text-white'
})

const alertClass = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'alert-success'
        : 'alert-danger'
})

const alertIcon = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'bi-check-circle-fill'
        : 'bi-exclamation-triangle-fill'
})

const alertMessage = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'Bạn đang duyệt yêu cầu trả hàng này. Hệ thống sẽ tiến hành hoàn tiền cho khách hàng.'
        : 'Bạn đang từ chối yêu cầu trả hàng này. Vui lòng cung cấp lý do rõ ràng.'
})

const actionButtonText = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'Xác nhận duyệt'
        : 'Xác nhận từ chối'
})

const actionButtonClass = computed(() => {
    return props.action === 'DA_DUYET'
        ? 'btn-success'
        : 'btn-danger'
})

const canProcess = computed(() => {
    if (props.action === 'DA_DUYET') {
        return refundAmount.value > 0 && refundAmount.value <= props.returnRequest.totalValue
    } else {
        return rejectionReason.value !== ''
    }
})

// Methods
const processReturn = async () => {
    try {
        processing.value = true

        const data = {
            returnId: props.returnRequest.id,
            action: props.action
        }

        if (props.action === 'DA_DUYET') {
            data.refundMethod = refundMethod.value
            data.refundAmount = refundAmount.value
            data.internalNote = internalNote.value
        } else {
            data.rejectionReason = rejectionReason.value
            data.rejectionDetails = rejectionDetails.value
        }

        await returnStore.processReturn(data)
        emit('processed')
        emit('close')
    } catch (error) {
        console.error('Error processing return:', error)
    } finally {
        processing.value = false
    }
}
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
}

.modal-header {
    padding: 15px 20px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.modal-title {
    font-weight: 600;
}

.modal-body {
    padding: 20px;
}

.alert {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.alert i {
    margin-right: 10px;
    font-size: 1.2rem;
}

.form-label {
    font-weight: 500;
    margin-bottom: 5px;
}

.form-select,
.form-control {
    border-radius: 8px;
    padding: 10px 15px;
}

.btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
}

.btn:disabled {
    opacity: 0.65;
}
</style>