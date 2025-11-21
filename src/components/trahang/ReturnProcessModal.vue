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
                <p>
                  {{
                    returnRequest.maYeuCau ||
                    `#RT${returnRequest.id?.toString().padStart(6, '0') || 'N/A'}`
                  }}
                </p>
              </div>
              <div class="col-md-6">
                <label class="form-label">Mã đơn hàng</label>
                <p>
                  {{
                    returnRequest.maHoaDon ||
                    `#HD${returnRequest.idHoaDon?.toString().padStart(6, '0') || 'N/A'}`
                  }}
                </p>
              </div>
              <div class="col-md-6">
                <label class="form-label">Khách hàng</label>
                <p>{{ returnRequest.tenKhachHang || returnRequest.customerName || 'N/A' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tổng giá trị</label>
                <p>
                  {{ formatCurrency(returnRequest.soTienHoan || returnRequest.totalValue || 0) }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="isApproveAction">
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
                <input
                  v-model="refundAmount"
                  type="number"
                  class="form-control"
                  :max="returnRequest.totalValue"
                />
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

          <div v-else-if="isRejectAction">
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
          <button
            type="button"
            class="btn"
            :class="actionButtonClass"
            @click="processReturn"
            :disabled="processing || !canProcess"
          >
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
    required: true,
  },
  action: {
    type: [String, Number],
    required: true,
    // Có thể là số (1, 2) hoặc string ('DA_DUYET', 'TU_CHOI')
  },
})

const emit = defineEmits(['close', 'processed'])

const returnStore = useReturnStore()

// Form data
const refundMethod = ref('original')
const refundAmount = ref(props.returnRequest.soTienHoan || props.returnRequest.totalValue || 0)
const internalNote = ref('')
const rejectionReason = ref('')
const rejectionDetails = ref('')
const processing = ref(false)

// Computed - Xác định action là duyệt hay từ chối
const isApproveAction = computed(() => {
  return props.action === 1 || props.action === 'DA_DUYET' || props.action === '1'
})

const isRejectAction = computed(() => {
  return props.action === 2 || props.action === 'TU_CHOI' || props.action === '2'
})

const modalTitle = computed(() => {
  return isApproveAction.value ? 'Duyệt yêu cầu trả hàng' : 'Từ chối yêu cầu trả hàng'
})

const headerClass = computed(() => {
  return isApproveAction.value ? 'bg-success text-white' : 'bg-danger text-white'
})

const alertClass = computed(() => {
  return isApproveAction.value ? 'alert-success' : 'alert-danger'
})

const alertIcon = computed(() => {
  return isApproveAction.value ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
})

const alertMessage = computed(() => {
  return isApproveAction.value
    ? 'Bạn đang duyệt yêu cầu trả hàng này. Hệ thống sẽ tiến hành hoàn tiền cho khách hàng.'
    : 'Bạn đang từ chối yêu cầu trả hàng này. Vui lòng cung cấp lý do rõ ràng.'
})

const actionButtonText = computed(() => {
  return isApproveAction.value ? 'Xác nhận duyệt' : 'Xác nhận từ chối'
})

const actionButtonClass = computed(() => {
  return isApproveAction.value ? 'btn-success' : 'btn-danger'
})

const canProcess = computed(() => {
  if (isApproveAction.value) {
    const maxValue = props.returnRequest.soTienHoan || props.returnRequest.totalValue || 0
    return refundAmount.value > 0 && refundAmount.value <= maxValue
  } else {
    return rejectionReason.value !== ''
  }
})

// Methods
const processReturn = async () => {
  try {
    processing.value = true

    // Xác định trạng thái (1 = duyệt, 2 = từ chối)
    const trangThai = isApproveAction.value ? 1 : 2

    // Lý do từ chối (nếu có)
    let lyDoTuChoi = null
    if (isRejectAction.value) {
      lyDoTuChoi = rejectionReason.value
      if (rejectionDetails.value) {
        lyDoTuChoi += ': ' + rejectionDetails.value
      }
    }

    // Gọi API cập nhật trạng thái
    await returnStore.updateReturnStatus(
      props.returnRequest.id,
      trangThai,
      lyDoTuChoi,
      null, // idNhanVienXuLy - có thể lấy từ auth store sau
    )

    emit('processed')
    emit('close')
  } catch (error) {
    console.error('Error processing return:', error)
    alert('Có lỗi xảy ra: ' + (error.message || 'Vui lòng thử lại'))
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
