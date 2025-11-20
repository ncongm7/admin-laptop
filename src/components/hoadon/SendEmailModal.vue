<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show" @click="close"></div>
  
  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 9999;" @click.self="close">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-envelope"></i> Gửi email hóa đơn
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close" :disabled="isSending"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSend">
            <!-- Email input -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-envelope-at"></i> Email người nhận
              </label>
              <input
                type="email"
                class="form-control"
                v-model="email"
                placeholder="example@email.com"
                required
                :disabled="isSending"
              />
              <small class="form-text text-muted">
                Email mặc định: {{ defaultEmail || 'Chưa có' }}
              </small>
            </div>

            <!-- Subject -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-tag"></i> Tiêu đề
              </label>
              <input
                type="text"
                class="form-control"
                v-model="subject"
                placeholder="Hóa đơn {{ invoice?.ma || '' }}"
                :disabled="isSending"
              />
            </div>

            <!-- Message -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-chat-left-text"></i> Lời nhắn (tùy chọn)
              </label>
              <textarea
                class="form-control"
                v-model="message"
                rows="3"
                placeholder="Xin chào, gửi bạn hóa đơn..."
                :disabled="isSending"
              ></textarea>
            </div>

            <!-- Error message -->
            <div v-if="error" class="alert alert-danger mb-0">
              <i class="bi bi-exclamation-triangle"></i> {{ error }}
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isSending">
            <i class="bi bi-x-circle"></i> Hủy
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSend"
            :disabled="!email || isSending"
          >
            <span v-if="isSending" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-send"></i>
            {{ isSending ? 'Đang gửi...' : 'Gửi email' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { sendInvoiceEmail } from '@/service/hoaDonService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  invoice: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'sent'])

const { success: showSuccess, error: showError } = useToast()

const email = ref('')
const subject = ref('')
const message = ref('')
const isSending = ref(false)
const error = ref('')

const defaultEmail = computed(() => {
  return props.invoice?.khachHang?.email || props.invoice?.email || ''
})

// Load initial data
watch(() => props.invoice, (newInvoice) => {
  if (newInvoice) {
    email.value = defaultEmail.value || ''
    subject.value = `Hóa đơn ${newInvoice.ma || ''}`
    message.value = `Xin chào,\n\nGửi bạn hóa đơn ${newInvoice.ma || ''}.\n\nTrân trọng!`
  }
}, { immediate: true })

/**
 * Handle send
 */
const handleSend = async () => {
  if (!email.value) {
    error.value = 'Vui lòng nhập email người nhận!'
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Email không hợp lệ!'
    return
  }

  isSending.value = true
  error.value = ''

  try {
    await sendInvoiceEmail(props.invoice.id, {
      email: email.value,
      subject: subject.value || `Hóa đơn ${props.invoice.ma || ''}`,
      message: message.value
    })

    showSuccess('Đã gửi email thành công!')
    emit('sent', { email: email.value })
    close()
  } catch (err) {
    console.error('❌ Lỗi khi gửi email:', err)
    error.value = err.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại!'
    showError(error.value)
  } finally {
    isSending.value = false
  }
}

/**
 * Close modal
 */
const close = () => {
  if (isSending.value) return
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

