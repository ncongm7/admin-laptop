<template>
  <div class="invoice-print-container">
    <!-- Nút in hóa đơn -->
    <button
      class="btn btn-outline-primary btn-sm"
      @click="handlePrintInvoice"
      :disabled="isLoading || !hoaDon?.id"
      :title="hoaDon?.id ? 'In hóa đơn' : 'Chưa có hóa đơn'"
    >
      <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
      <i v-else class="bi bi-printer"></i>
      {{ isLoading ? 'Đang tải...' : 'In hóa đơn' }}
    </button>

    <!-- Modal preview hóa đơn (nếu cần) -->
    <div v-if="showPreviewModal" class="modal fade show d-block" style="z-index: 9999" @click.self="closePreview">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-printer"></i> Xem trước hóa đơn
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closePreview"></button>
          </div>
          <div class="modal-body">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </div>
            <div v-else-if="previewError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle"></i> {{ previewError }}
            </div>
            <iframe
              v-else
              ref="previewFrame"
              :src="previewUrl"
              style="width: 100%; height: 600px; border: none"
            ></iframe>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closePreview">
              <i class="bi bi-x-circle"></i> Đóng
            </button>
            <button type="button" class="btn btn-primary" @click="printFromPreview" :disabled="!previewUrl">
              <i class="bi bi-printer"></i> In
            </button>
            <button type="button" class="btn btn-success" @click="downloadPDF" :disabled="!previewUrl">
              <i class="bi bi-download"></i> Tải PDF
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showPreviewModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/common/useToast'

const props = defineProps({
  hoaDon: {
    type: Object,
    default: null
  },
  // Có thể in hóa đơn chờ (chưa thanh toán) hoặc đã thanh toán
  allowDraft: {
    type: Boolean,
    default: true
  },
  // Tự động mở dialog in sau khi mở preview (mặc định: true)
  autoPrint: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['printed'])

const { success: showSuccess, error: showError } = useToast()

const isLoading = ref(false)
const showPreviewModal = ref(false)
const previewUrl = ref('')
const previewError = ref('')
const previewFrame = ref(null)

/**
 * Xử lý in hóa đơn
 * Backend trả về blob (PDF hoặc HTML)
 */
const handlePrintInvoice = async () => {
  if (!props.hoaDon?.id) {
    showError('Không có hóa đơn để in!')
    return
  }

  // Kiểm tra nếu là hóa đơn chờ và không cho phép in draft
  if (!props.allowDraft && props.hoaDon.trangThaiThanhToan === 0) {
    showError('Chỉ có thể in hóa đơn đã thanh toán!')
    return
  }

  isLoading.value = true
  previewError.value = ''

  try {
    const blob = await inHoaDon(props.hoaDon.id)

    // Backend trả về HTML, luôn xử lý như HTML
    const contentType = blob.type || 'text/html'
    const isHTML = contentType.includes('html') || contentType.includes('text')

    console.log('📄 Loại file hóa đơn:', contentType)

    if (isHTML) {
      // Xử lý HTML: hiển thị preview trong modal và cho phép in
      const url = URL.createObjectURL(blob)
      previewUrl.value = url
      showPreviewModal.value = true
      
      // Tự động mở dialog in sau 500ms (để modal load xong) - chỉ khi autoPrint = true
      if (props.autoPrint) {
        setTimeout(() => {
          if (previewFrame.value && previewFrame.value.contentWindow) {
            previewFrame.value.contentWindow.print()
          }
        }, 500)
        showSuccess('Đang mở hộp thoại in...')
      } else {
        showSuccess('Đã mở preview hóa đơn!')
      }
    } else {
      // Fallback: tải file về
      downloadBlob(blob, `HoaDon_${props.hoaDon.ma || props.hoaDon.id}.html`)
      showSuccess('Đã tải hóa đơn!')
    }

    emit('printed', props.hoaDon.id)
  } catch (error) {
    console.error('❌ Lỗi khi in hóa đơn:', error)
    previewError.value = error.response?.data?.message || 'Không thể in hóa đơn. Vui lòng thử lại!'
    showError(previewError.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Tải file PDF về máy
 */
const downloadPDF = () => {
  if (!previewUrl.value) return

  // Fetch lại blob từ URL
  fetch(previewUrl.value)
    .then((res) => res.blob())
    .then((blob) => {
      downloadBlob(blob, `HoaDon_${props.hoaDon.ma || props.hoaDon.id}.pdf`)
      showSuccess('Đã tải hóa đơn về máy!')
    })
    .catch((error) => {
      console.error('Lỗi khi tải PDF:', error)
      showError('Không thể tải PDF. Vui lòng thử lại!')
    })
}

/**
 * In từ preview
 */
const printFromPreview = () => {
  if (previewFrame.value && previewFrame.value.contentWindow) {
    previewFrame.value.contentWindow.print()
  }
}

/**
 * Đóng modal preview
 */
const closePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  showPreviewModal.value = false
  previewError.value = ''
}

/**
 * Helper: Tải blob về máy
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Expose method để có thể gọi từ component cha
defineExpose({
  handlePrintInvoice
})
</script>

<style scoped>
.invoice-print-container {
  display: inline-block;
}

.modal-backdrop {
  z-index: 9998;
}

.modal {
  z-index: 9999;
}
</style>

