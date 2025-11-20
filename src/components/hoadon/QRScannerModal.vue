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
            <i class="bi bi-qr-code-scan"></i> Quét QR Code hóa đơn
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close" :disabled="isScanning"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Scanner -->
          <div class="scanner-container">
            <div v-if="!isScanning" class="scanner-placeholder text-center py-5">
              <i class="bi bi-camera-video" style="font-size: 4rem; color: #ccc;"></i>
              <p class="text-muted mt-3">Nhấn "Bắt đầu quét" để mở camera</p>
            </div>
            
            <div v-else class="scanner-wrapper">
              <BarcodeScanner
                v-if="isScanning"
                @decode="onDecode"
                @loaded="onScannerLoaded"
                @error="onScannerError"
                class="scanner-video"
              />
              <div class="scanner-overlay">
                <div class="scanner-frame"></div>
                <p class="scanner-hint">Đưa QR code vào khung</p>
              </div>
            </div>
          </div>

          <!-- Manual input fallback -->
          <div class="mt-3">
            <label class="form-label small">Hoặc nhập mã hóa đơn thủ công:</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                v-model="manualCode"
                @keyup.enter="handleManualSearch"
                placeholder="Nhập mã hóa đơn (VD: HD-20241201-0001)"
                :disabled="isScanning"
              />
              <button
                class="btn btn-outline-primary"
                @click="handleManualSearch"
                :disabled="!manualCode || isSearching"
              >
                <span v-if="isSearching" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-search"></i>
                Tìm
              </button>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="alert alert-danger mt-3 mb-0">
            <i class="bi bi-exclamation-triangle"></i> {{ error }}
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isScanning">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
          <button
            type="button"
            class="btn"
            :class="isScanning ? 'btn-danger' : 'btn-primary'"
            @click="toggleScanner"
            :disabled="isSearching"
          >
            <i class="bi" :class="isScanning ? 'bi-stop-circle' : 'bi-play-circle'"></i>
            {{ isScanning ? 'Dừng quét' : 'Bắt đầu quét' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { BarcodeScanner } from 'vue3-barcode-qrcode-reader'
import { getHoaDonDetailByCode } from '@/service/hoaDonService'
import { useToast } from '@/composables/useToast'

const emit = defineEmits(['close', 'invoice-found'])

const { success: showSuccess, error: showError } = useToast()

const isScanning = ref(false)
const isSearching = ref(false)
const error = ref('')
const manualCode = ref('')

/**
 * Toggle scanner
 */
const toggleScanner = () => {
  if (isScanning.value) {
    stopScanner()
  } else {
    startScanner()
  }
}

/**
 * Start scanner
 */
const startScanner = () => {
  isScanning.value = true
  error.value = ''
}

/**
 * Stop scanner
 */
const stopScanner = () => {
  isScanning.value = false
}

/**
 * Handle QR code decoded
 */
const onDecode = async (decodedText) => {
  console.log('📱 [QRScanner] Decoded:', decodedText)
  
  if (!decodedText) return
  
  // Stop scanner
  stopScanner()
  
  // Extract invoice code from QR (format: HD-YYYYMMDD-XXXX or just the code)
  const invoiceCode = decodedText.trim()
  
  // Search for invoice
  await searchInvoice(invoiceCode)
}

/**
 * Handle scanner loaded
 */
const onScannerLoaded = () => {
  console.log('✅ [QRScanner] Scanner loaded')
  showSuccess('Camera đã sẵn sàng!')
}

/**
 * Handle scanner error
 */
const onScannerError = (err) => {
  console.error('❌ [QRScanner] Scanner error:', err)
  error.value = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera.'
  stopScanner()
}

/**
 * Search invoice by code
 */
const searchInvoice = async (code) => {
  if (!code) {
    error.value = 'Vui lòng nhập mã hóa đơn'
    return
  }

  isSearching.value = true
  error.value = ''

  try {
    const response = await getHoaDonDetailByCode(code)
    
    if (response && response.data) {
      showSuccess('Đã tìm thấy hóa đơn!')
      emit('invoice-found', response.data)
      close()
    } else {
      error.value = 'Không tìm thấy hóa đơn với mã: ' + code
    }
  } catch (err) {
    console.error('❌ [QRScanner] Error searching invoice:', err)
    error.value = err.response?.data?.message || 'Không tìm thấy hóa đơn. Vui lòng kiểm tra lại mã!'
  } finally {
    isSearching.value = false
  }
}

/**
 * Handle manual search
 */
const handleManualSearch = async () => {
  if (!manualCode.value) {
    error.value = 'Vui lòng nhập mã hóa đơn'
    return
  }
  
  await searchInvoice(manualCode.value.trim())
}

/**
 * Close modal
 */
const close = () => {
  stopScanner()
  emit('close')
}

// Lifecycle
onMounted(() => {
  // Auto-start scanner
  // startScanner()
})

onUnmounted(() => {
  stopScanner()
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

.scanner-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.scanner-placeholder {
  color: #fff;
}

.scanner-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid #0dcaf0;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  position: relative;
}

.scanner-frame::before,
.scanner-frame::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #0dcaf0;
}

.scanner-frame::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scanner-frame::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scanner-hint {
  margin-top: 1rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>

