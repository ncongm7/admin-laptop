<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show" @click="close"></div>
  
  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999;" @click.self="close">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-pencil-square"></i> Cập nhật hóa đơn
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close" :disabled="isSaving"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSave">
            <!-- Ghi chú -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-sticky"></i> Ghi chú
              </label>
              <textarea
                v-model="formData.ghiChu"
                class="form-control"
                rows="3"
                placeholder="Nhập ghi chú cho hóa đơn..."
                :disabled="isSaving"
              ></textarea>
              <small class="form-text text-muted">Tối đa 500 ký tự</small>
            </div>

            <!-- Địa chỉ giao hàng (chỉ hiển thị nếu là đơn online) -->
            <div v-if="isOnlineOrder" class="mb-3">
              <label class="form-label">
                <i class="bi bi-geo-alt"></i> Địa chỉ giao hàng
              </label>
              <textarea
                v-model="formData.diaChiGiaoHang"
                class="form-control"
                rows="3"
                placeholder="Nhập địa chỉ giao hàng..."
                :disabled="isSaving"
              ></textarea>
              <small class="form-text text-muted">Tối đa 500 ký tự</small>
            </div>

            <!-- Error message -->
            <div v-if="error" class="alert alert-danger mb-0">
              <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isSaving">
            <i class="bi bi-x-circle"></i> Hủy
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSave"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-check-circle"></i>
            {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { capNhatHoaDon } from '@/service/hoaDonService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const { success: showSuccess, error: showError } = useToast()

const formData = ref({
  ghiChu: '',
  diaChiGiaoHang: ''
})

const isSaving = ref(false)
const error = ref('')

const isOnlineOrder = computed(() => {
  return props.invoice?.loaiHoaDon === 1 || props.invoice?.loaiHoaDon === 'Online'
})

// Load initial data
watch(() => props.invoice, (newInvoice) => {
  if (newInvoice) {
    formData.value = {
      ghiChu: newInvoice.ghiChu || '',
      diaChiGiaoHang: newInvoice.diaChiGiaoHang || newInvoice.diaChi || ''
    }
  }
}, { immediate: true })

/**
 * Validate form
 */
const validate = () => {
  error.value = ''

  if (formData.value.ghiChu && formData.value.ghiChu.length > 500) {
    error.value = 'Ghi chú không được vượt quá 500 ký tự'
    return false
  }

  if (isOnlineOrder.value && formData.value.diaChiGiaoHang && formData.value.diaChiGiaoHang.length > 500) {
    error.value = 'Địa chỉ giao hàng không được vượt quá 500 ký tự'
    return false
  }

  return true
}

/**
 * Handle save
 */
const handleSave = async () => {
  if (!validate()) {
    return
  }

  isSaving.value = true
  error.value = ''

  try {
    const response = await capNhatHoaDon(props.invoice.id, {
      ghiChu: formData.value.ghiChu || null,
      diaChiGiaoHang: isOnlineOrder.value ? (formData.value.diaChiGiaoHang || null) : undefined
    })

    showSuccess('Cập nhật hóa đơn thành công!')
    emit('updated', response.data)
    close()
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật hóa đơn:', err)
    error.value = err.response?.data?.message || 'Không thể cập nhật hóa đơn. Vui lòng thử lại!'
    showError(error.value)
  } finally {
    isSaving.value = false
  }
}

/**
 * Close modal
 */
const close = () => {
  if (isSaving.value) return
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  z-index: 9999 !important;
}
</style>

