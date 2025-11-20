<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show" @click="close"></div>
  
  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999;" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-warning text-dark">
          <h5 class="modal-title">
            <i class="bi bi-tag"></i> Giảm giá đặc biệt
          </h5>
          <button type="button" class="btn-close" @click="close" :disabled="isProcessing"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Thông tin sản phẩm -->
          <div class="product-info mb-3 p-3 bg-light rounded">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">{{ productInfo.tenSanPham || 'N/A' }}</h6>
                <small class="text-muted">Mã CTSP: {{ productInfo.maCTSP || 'N/A' }}</small>
              </div>
              <div class="text-end">
                <div class="text-muted small">Giá hiện tại</div>
                <div class="fw-bold text-primary">{{ formatCurrency(productInfo.donGia || 0) }}</div>
              </div>
            </div>
          </div>

          <!-- Form giảm giá -->
          <form @submit.prevent="handleSubmit">
            <!-- Loại giảm giá -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Loại giảm giá <span class="text-danger">*</span>
              </label>
              <div class="btn-group w-100" role="group">
                <input
                  type="radio"
                  class="btn-check"
                  id="discount-percent"
                  v-model="discountType"
                  value="percent"
                  :disabled="isProcessing"
                />
                <label class="btn btn-outline-primary" for="discount-percent">
                  <i class="bi bi-percent"></i> Theo phần trăm
                </label>

                <input
                  type="radio"
                  class="btn-check"
                  id="discount-amount"
                  v-model="discountType"
                  value="amount"
                  :disabled="isProcessing"
                />
                <label class="btn btn-outline-primary" for="discount-amount">
                  <i class="bi bi-currency-dollar"></i> Theo số tiền
                </label>
              </div>
            </div>

            <!-- Giá trị giảm -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Giá trị giảm <span class="text-danger">*</span>
              </label>
              <div class="input-group">
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.discountValue }"
                  v-model.number="discountValue"
                  :placeholder="discountType === 'percent' ? 'Nhập % giảm (0-100)' : 'Nhập số tiền giảm'"
                  :min="0"
                  :max="discountType === 'percent' ? 100 : productInfo.donGia"
                  step="0.01"
                  :disabled="isProcessing"
                  @input="validateDiscountValue"
                />
                <span class="input-group-text">
                  {{ discountType === 'percent' ? '%' : '₫' }}
                </span>
              </div>
              <div v-if="errors.discountValue" class="invalid-feedback d-block">
                {{ errors.discountValue }}
              </div>
              <div v-if="discountValue && !errors.discountValue" class="mt-2">
                <div class="alert alert-info mb-0 py-2">
                  <small>
                    <i class="bi bi-info-circle"></i>
                    Giá sau giảm: <strong>{{ formatCurrency(calculatedNewPrice) }}</strong>
                    <span v-if="discountType === 'percent'" class="text-muted">
                      (Giảm {{ formatCurrency(discountAmount) }})
                    </span>
                  </small>
                </div>
              </div>
            </div>

            <!-- Lý do giảm giá -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                Lý do giảm giá <span class="text-danger">*</span>
              </label>
              <textarea
                class="form-control"
                :class="{ 'is-invalid': errors.reason }"
                v-model="reason"
                rows="3"
                placeholder="Nhập lý do giảm giá (bắt buộc)..."
                :disabled="isProcessing"
                @input="validateReason"
                maxlength="500"
              ></textarea>
              <div v-if="errors.reason" class="invalid-feedback d-block">
                {{ errors.reason }}
              </div>
              <div class="form-text">
                <small>{{ reason.length }}/500 ký tự</small>
              </div>
            </div>

            <!-- Cảnh báo quyền -->
            <div v-if="!hasPriceOverridePermission" class="alert alert-warning mb-0">
              <i class="bi bi-exclamation-triangle"></i>
              <strong>Lưu ý:</strong> Bạn không có quyền giảm giá. Vui lòng liên hệ quản lý.
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isProcessing">
            <i class="bi bi-x-circle"></i> Hủy
          </button>
          <button
            type="button"
            class="btn btn-warning"
            @click="handleSubmit"
            :disabled="isProcessing || !isFormValid || !hasPriceOverridePermission"
          >
            <span v-if="isProcessing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-check-circle"></i>
            {{ isProcessing ? 'Đang xử lý...' : 'Xác nhận giảm giá' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { validatePrice, sanitizeInput, hasPermission } from '@/utils/validation'

const props = defineProps({
  productInfo: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      idHoaDonChiTiet: null,
      tenSanPham: '',
      maCTSP: '',
      donGia: 0
    })
  }
})

const emit = defineEmits(['close', 'price-overridden'])

const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useToast()

const discountType = ref('percent') // 'percent' | 'amount'
const discountValue = ref(null)
const reason = ref('')
const isProcessing = ref(false)
const errors = ref({
  discountValue: '',
  reason: ''
})

/**
 * Kiểm tra quyền giảm giá
 */
const hasPriceOverridePermission = computed(() => {
  const userRole = authStore.user?.role || authStore.user?.chucVu || ''
  // Chỉ ADMIN, QUANLY, TRUONGCA mới có quyền giảm giá
  return hasPermission(userRole, ['ADMIN', 'QUANLY', 'TRUONGCA', 'QUẢN LÝ', 'TRƯỞNG CA'])
})

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

/**
 * Tính toán giá mới
 */
const calculatedNewPrice = computed(() => {
  if (!discountValue.value || !props.productInfo.donGia) return props.productInfo.donGia

  if (discountType.value === 'percent') {
    const discount = (props.productInfo.donGia * discountValue.value) / 100
    return Math.max(0, props.productInfo.donGia - discount)
  } else {
    return Math.max(0, props.productInfo.donGia - discountValue.value)
  }
})

/**
 * Tính số tiền giảm
 */
const discountAmount = computed(() => {
  if (!discountValue.value || !props.productInfo.donGia) return 0

  if (discountType.value === 'percent') {
    return (props.productInfo.donGia * discountValue.value) / 100
  } else {
    return discountValue.value
  }
})

/**
 * Validate giá trị giảm
 */
const validateDiscountValue = () => {
  errors.value.discountValue = ''

  if (discountValue.value === null || discountValue.value === undefined || discountValue.value === '') {
    errors.value.discountValue = 'Vui lòng nhập giá trị giảm'
    return false
  }

  const num = Number(discountValue.value)

  if (isNaN(num) || num < 0) {
    errors.value.discountValue = 'Giá trị giảm phải là số dương'
    return false
  }

  if (discountType.value === 'percent') {
    if (num > 100) {
      errors.value.discountValue = 'Phần trăm giảm không được vượt quá 100%'
      return false
    }
    if (num > 50) {
      // Cảnh báo nếu giảm > 50%
      console.warn('⚠️ Giảm giá > 50% - cần xác nhận từ quản lý')
    }
  } else {
    if (num > props.productInfo.donGia) {
      errors.value.discountValue = `Số tiền giảm không được vượt quá giá gốc (${formatCurrency(props.productInfo.donGia)})`
      return false
    }
    if (num > props.productInfo.donGia * 0.5) {
      // Cảnh báo nếu giảm > 50% giá
      console.warn('⚠️ Giảm giá > 50% giá gốc - cần xác nhận từ quản lý')
    }
  }

  return true
}

/**
 * Validate lý do
 */
const validateReason = () => {
  errors.value.reason = ''
  const sanitized = sanitizeInput(reason.value)

  if (!sanitized || sanitized.trim().length === 0) {
    errors.value.reason = 'Vui lòng nhập lý do giảm giá'
    return false
  }

  if (sanitized.trim().length < 10) {
    errors.value.reason = 'Lý do giảm giá phải có ít nhất 10 ký tự'
    return false
  }

  if (sanitized.length > 500) {
    errors.value.reason = 'Lý do giảm giá không được vượt quá 500 ký tự'
    return false
  }

  return true
}

/**
 * Kiểm tra form hợp lệ
 */
const isFormValid = computed(() => {
  return (
    discountValue.value !== null &&
    discountValue.value !== undefined &&
    discountValue.value !== '' &&
    !errors.value.discountValue &&
    reason.value.trim().length >= 10 &&
    !errors.value.reason
  )
})

/**
 * Watch discountType để reset discountValue
 */
watch(discountType, () => {
  discountValue.value = null
  errors.value.discountValue = ''
})

/**
 * Xử lý submit
 */
const handleSubmit = async () => {
  // Validate lại
  if (!validateDiscountValue() || !validateReason()) {
    showError('Vui lòng kiểm tra lại thông tin nhập vào')
    return
  }

  if (!isFormValid.value) {
    showError('Vui lòng điền đầy đủ thông tin')
    return
  }

  if (!hasPriceOverridePermission.value) {
    showError('Bạn không có quyền giảm giá')
    return
  }

  isProcessing.value = true

  try {
    // TODO: Gọi API backend để cập nhật giá
    // const response = await capNhatGiaDacBiet({
    //   idHoaDonChiTiet: props.productInfo.idHoaDonChiTiet,
    //   giaMoi: calculatedNewPrice.value,
    //   lyDo: sanitizeInput(reason.value),
    //   loaiGiamGia: discountType.value,
    //   giaTriGiam: discountValue.value
    // })

    // Tạm thời emit event để parent component xử lý
    emit('price-overridden', {
      idHoaDonChiTiet: props.productInfo.idHoaDonChiTiet,
      giaMoi: calculatedNewPrice.value,
      giaGoc: props.productInfo.donGia,
      soTienGiam: discountAmount.value,
      lyDo: sanitizeInput(reason.value),
      loaiGiamGia: discountType.value,
      giaTriGiam: discountValue.value
    })

    showSuccess(`Đã giảm giá thành công! Giá mới: ${formatCurrency(calculatedNewPrice.value)}`)
    close()
  } catch (error) {
    console.error('❌ Lỗi khi giảm giá:', error)
    showError(error.response?.data?.message || 'Không thể giảm giá. Vui lòng thử lại!')
  } finally {
    isProcessing.value = false
  }
}

/**
 * Đóng modal
 */
const close = () => {
  if (isProcessing.value) return
  emit('close')
}

// Lifecycle
onMounted(() => {
  // Focus vào input đầu tiên
  setTimeout(() => {
    const firstInput = document.querySelector('.modal-body input[type="number"]')
    if (firstInput) firstInput.focus()
  }, 100)
})
</script>

<style scoped>
.modal-backdrop {
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  z-index: 9999 !important;
}

.product-info {
  border-left: 4px solid #ffc107;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.invalid-feedback {
  display: block;
  font-size: 0.875rem;
}
</style>

