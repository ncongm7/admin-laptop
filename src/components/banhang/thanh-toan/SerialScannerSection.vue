<template>
  <div class="serial-section">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">
        <i class="bi bi-upc-scan text-warning"></i>
        Quét Serial/IMEI sản phẩm
        <span class="badge bg-danger ms-2">Bắt buộc</span>
      </h6>
      <button class="btn btn-sm btn-outline-primary" @click="openCameraScanner" :disabled="isProcessing">
        <i class="bi bi-camera"></i>
        Bật quét
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
        {{ daQuetDu ? '✅ Đã quét đủ serial' : '⚠️ Cần quét serial cho tất cả sản phẩm' }}
      </small>
    </div>

    <!-- Danh sách sản phẩm cần quét serial -->
    <div class="product-serial-list">
      <div v-for="product in danhSachSanPhamCanQuet" :key="product.id" class="product-serial-item mb-3" :class="{
        'completed': product.hoanThanh,
        'active': currentProduct?.id === product.id
      }">
        <div class="product-header">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2">
                <h6 class="mb-1">
                  {{ getProductName(product) }}
                </h6>
                <button v-if="availableSerials[product.id]?.length > 0" class="btn btn-sm btn-outline-primary p-1"
                  @click="selectAllSerials(product)" :disabled="isLoading || isProcessing || product.hoanThanh"
                  title="Chọn tất cả serial khả dụng" style="font-size: 0.75rem; line-height: 1;">
                  <i class="bi bi-check-all"></i>
                  <span class="ms-1">Chọn tất cả</span>
                </button>
              </div>

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
          <div class="serial-status-indicator mb-2">
            <span class="badge" :class="{
              'bg-success': product.soLuongDaQuet > 0 && product.soLuongDaQuet < product.soLuongCanQuet,
              'bg-warning': product.soLuongDaQuet === 0,
              'bg-info': currentProduct?.id === product.id
            }">
              <i class="bi" :class="{
                'bi-check-circle': product.soLuongDaQuet > 0,
                'bi-hourglass-split': product.soLuongDaQuet === 0,
                'bi-cursor': currentProduct?.id === product.id
              }"></i>
              {{ getProductSerialStatusText(product) }}
            </span>
          </div>
          <div class="input-group">
            <input type="text" class="form-control" v-model="currentSerialInput" @keyup.enter="scanSerial(product)"
              @focus="handleSerialInputFocus(product)" @blur="handleSerialInputBlur"
              :placeholder="`Quét/nhập Serial ${product.soLuongDaQuet + 1}/${product.soLuongCanQuet}...`"
              :disabled="isLoading || isProcessing" :class="{
                'is-valid': scanSuccess[product.id],
                'is-invalid': scanError[product.id]
              }" ref="serialInputs" />
            <button class="btn btn-outline-secondary" @click="loadAvailableSerials(product)"
              :disabled="isLoadingSerials || isProcessing" title="Xem danh sách serial khả dụng">
              <span v-if="isLoadingSerials" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-list-ul"></i>
            </button>
            <button class="btn btn-primary" @click="scanSerial(product)"
              :disabled="!currentSerialInput || isLoading || isProcessing">
              <span v-if="isLoading && currentProduct?.id === product.id"
                class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-check-circle"></i>
              Xác nhận
            </button>
          </div>
          <!-- Thông báo trạng thái -->
          <div v-if="scanSuccess[product.id]" class="alert alert-success alert-sm mt-2 mb-0">
            <i class="bi bi-check-circle-fill"></i> Quét thành công!
          </div>
          <div v-if="scanError[product.id]" class="alert alert-danger alert-sm mt-2 mb-0">
            <i class="bi bi-exclamation-triangle-fill"></i> {{ scanError[product.id] }}
          </div>

          <!-- Dropdown danh sách serial khả dụng -->
          <div v-if="showSerialDropdown[product.id] && availableSerials[product.id]?.length > 0"
            class="serial-dropdown mt-2">
            <div class="dropdown-header">
              <strong>Chọn serial khả dụng ({{ availableSerials[product.id].length }})</strong>
              <button class="btn-close-dropdown" @click="showSerialDropdown[product.id] = false">
                <i class="bi bi-x"></i>
              </button>
            </div>
            <div class="serial-list">
              <div v-for="serial in availableSerials[product.id]" :key="serial.id" class="serial-item"
                :class="{ 'selected': isSerialSelected(product.id, serial) }"
                @click="selectSerialFromDropdown(product, serial)">
                <i class="bi bi-upc-scan"></i>
                <span class="serial-number">{{ getSerialDisplay(serial) }}</span>
                <span class="badge" :class="{
                  'bg-success': serial.trangThai === 1,
                  'bg-warning': serial.trangThai === 2,
                  'bg-danger': serial.trangThai === 0
                }">
                  {{ getSerialStatusText(serial.trangThai) }}
                </span>
                <span v-if="isSerialSelected(product.id, serial)" class="badge bg-primary ms-2">
                  <i class="bi bi-check-circle-fill"></i> Đã chọn
                </span>
              </div>
            </div>
          </div>

          <small v-if="showSerialDropdown[product.id] && availableSerials[product.id]?.length === 0"
            class="text-warning d-block mt-2">
            <i class="bi bi-exclamation-triangle"></i> Không có serial khả dụng
          </small>

          <small v-if="errorMessage && currentProduct?.id === product.id" class="text-danger">
            {{ errorMessage }}
          </small>
        </div>

        <!-- Danh sách serial đã quét cho sản phẩm này -->
        <div v-if="product.soLuongDaQuet > 0" class="scanned-serials mt-2">
          <div v-for="serial in getSerialsByProduct(product.id)" :key="serial.serialNumber" class="scanned-serial-item">
            <i class="bi bi-check-circle text-success"></i>
            <span>{{ serial.serialNumber }}</span>
            <button class="btn btn-sm btn-link text-danger p-0" @click="xoaSerial(serial.serialNumber)"
              :disabled="isProcessing">
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

    <!-- Camera Scanner Modal -->
    <div v-if="showCameraScanner" class="camera-scanner-modal">
      <div class="camera-header">
        <h6 class="mb-0"><i class="bi bi-camera"></i> Quét IMEI/Serial</h6>
        <button class="btn btn-sm btn-danger" @click="closeCameraScanner">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="camera-container">
        <StreamQrcodeBarcodeReader @decode="onBarcodeDetected" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { StreamQrcodeBarcodeReader } from 'vue3-barcode-qrcode-reader'
import { useConfirm } from '@/composables/common/useConfirm'
import { useToast } from '@/composables/common/useToast'
import { useSerialValidation } from '@/composables/banhang/useSerialValidation'
import { layDanhSachSerialKhaDung } from '@/service/banhang/banHangService'
import { validateSerialNumber, sanitizeInput } from '@/utils/validation'

const props = defineProps({
  hoaDon: {
    type: Object,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:daQuetDu'])

// ==================== SERIAL VALIDATION ====================
// Normalize hoaDon trước khi truyền vào useSerialValidation
const normalizedHoaDonRef = computed(() => {
  if (!props.hoaDon) return null
  return {
    ...props.hoaDon,
    hoaDonChiTiet: props.hoaDon.hoaDonChiTiet || props.hoaDon.chiTietList || [],
  }
})

const {
  isLoading,
  validatedSerials,
  currentSerialInput,
  currentProduct,
  errorMessage,
  tongSoLuongCanQuet,
  soLuongDaQuet,
  daQuetDu,
  progress,
  danhSachSanPhamCanQuet,
  xacThucMotSerial,
  xoaSerial: xoaSerialComposable,
  resetSerials,
  getSerialPayload
} = useSerialValidation(normalizedHoaDonRef)

// Watch daQuetDu change emit to parent
import { watch } from 'vue'
watch(daQuetDu, (val) => {
  emit('update:daQuetDu', val)
}, { immediate: true })

const { showConfirm } = useConfirm()
const { success: showSuccess, error: showError, warning: showWarning, info: showInfo } = useToast()

const serialInputs = ref([])
const showCameraScanner = ref(false)
const availableSerials = ref({})
const showSerialDropdown = ref({})
const isLoadingSerials = ref(false)
const scanSuccess = ref({})
const scanError = ref({})

// Helper methods
const getProductName = (product) => {
  return product.tenSanPham ||
    product.tenSP ||
    product.chiTietSanPham?.tenSP ||
    product.chiTietSanPham?.sanPham?.tenSanPham ||
    'Sản phẩm không tên'
}

const getSerialDisplay = (serial) => {
  return serial.serialNo || serial.soSerial || serial.serialNumber || 'N/A'
}

const getProductSerialStatusText = (product) => {
  if (product.hoanThanh) return 'Hoàn thành'
  if (product.soLuongDaQuet > 0) return `Đã quét ${product.soLuongDaQuet}/${product.soLuongCanQuet}`
  if (currentProduct.value?.id === product.id) return 'Đang quét...'
  return 'Chưa quét'
}

const getSerialStatusText = (trangThai) => {
  switch (trangThai) {
    case 1: return 'Trong kho'
    case 2: return 'Đã bán'
    case 0: return 'Hỏng'
    default: return 'Không xác định'
  }
}

const getSerialsByProduct = (productId) => {
  return validatedSerials.value.filter(s => s.idHoaDonChiTiet === productId)
}

const isSerialSelected = (productId, serial) => {
  const serialNumber = getSerialDisplay(serial)
  return validatedSerials.value.some(s =>
    s.idHoaDonChiTiet === productId &&
    (s.serialNumber === serialNumber || s.serialNo === serialNumber)
  )
}

const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch (error) {
    console.warn('Không thể phát âm thanh:', error)
  }
}

const handleSerialInputFocus = (product) => {
  currentProduct.value = product
  loadAvailableSerials(product)
  scanSuccess.value[product.id] = false
  scanError.value[product.id] = null
}

const handleSerialInputBlur = () => { }

const loadAvailableSerials = async (product) => {
  const idChiTietSanPham = product.idChiTietSanPham || product.idCtsp || product.chiTietSanPham?.id || product.chiTietSanPhamId
  if (!idChiTietSanPham) return

  if (availableSerials.value[product.id]) {
    showSerialDropdown.value[product.id] = true
    return
  }

  isLoadingSerials.value = true
  try {
    const serials = await layDanhSachSerialKhaDung(idChiTietSanPham)
    availableSerials.value[product.id] = serials.filter(s => {
      const trangThai = s.trangThai !== undefined ? s.trangThai : (s.trang_thai !== undefined ? s.trang_thai : s.status)
      return trangThai === 1
    })
    showSerialDropdown.value[product.id] = true
  } catch (error) {
    console.error('Lỗi khi load serial:', error)
    availableSerials.value[product.id] = []
  } finally {
    isLoadingSerials.value = false
  }
}

const selectSerialFromDropdown = async (product, serial) => {
  const serialNumber = getSerialDisplay(serial)
  currentSerialInput.value = serialNumber
  showSerialDropdown.value[product.id] = false
  await scanSerial(product)
}

const selectAllSerials = async (product) => {
  const soLuongConThieu = product.soLuongCanQuet - product.soLuongDaQuet
  if (soLuongConThieu <= 0) {
    showInfo('Đã quét đủ serial cho sản phẩm này!')
    return
  }

  if (!availableSerials.value[product.id] || availableSerials.value[product.id].length === 0) {
    await loadAvailableSerials(product)
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  const serials = availableSerials.value[product.id] || []
  if (serials.length === 0) {
    showWarning('Không có serial khả dụng để chọn!')
    return
  }

  const availableToSelect = serials.filter(serial => {
    return serial.trangThai === 1 && !isSerialSelected(product.id, serial)
  })

  if (availableToSelect.length === 0) {
    showInfo('Tất cả serial khả dụng đã được chọn!')
    return
  }

  const serialsToSelect = availableToSelect.slice(0, soLuongConThieu)
  if (serialsToSelect.length === 0) {
    showWarning('Không có serial khả dụng để chọn!')
    return
  }

  // Chọn từng serial
  // Lưu ý: isProcessing là prop, không set được. 
  // TODO: Có thể emit event 'processing' nếu cần, nhưng tạm thời chỉ disable nút local
  try {
    for (const serial of serialsToSelect) {
      const serialNumber = getSerialDisplay(serial)
      currentSerialInput.value = serialNumber
      await scanSerial(product)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    showSuccess(`Đã chọn ${serialsToSelect.length} serial!`)
  } catch (error) {
    console.error('Lỗi khi chọn tất cả serial:', error)
    showError('Có lỗi xảy ra khi chọn serial.')
  }
}

const scanSerial = async (product) => {
  if (!currentSerialInput.value || !currentSerialInput.value.trim()) {
    errorMessage.value = 'Vui lòng nhập Serial Number'
    scanError.value[product.id] = 'Vui lòng nhập Serial Number'
    return
  }

  const sanitizedSerial = sanitizeInput(currentSerialInput.value.trim())
  if (!validateSerialNumber(sanitizedSerial)) {
    errorMessage.value = 'Serial Number không hợp lệ! (7-20 ký tự, chữ và số)'
    scanError.value[product.id] = 'Serial Number không hợp lệ!'
    return
  }

  scanSuccess.value[product.id] = false
  scanError.value[product.id] = null

  const success = await xacThucMotSerial(sanitizedSerial, product)

  if (success) {
    scanSuccess.value[product.id] = true
    playSuccessSound()
    currentSerialInput.value = ''
    errorMessage.value = ''
    await nextTick()
    focusNextSerialInput(product)
    setTimeout(() => { scanSuccess.value[product.id] = false }, 2000)
  } else {
    scanError.value[product.id] = errorMessage.value || 'Serial không hợp lệ'
  }
}

const focusNextSerialInput = (currentProduct) => {
  if (!serialInputs.value || serialInputs.value.length === 0) return
  const currentIndex = danhSachSanPhamCanQuet.value.findIndex(p => p.id === currentProduct.id)
  if (!currentProduct.hoanThanh) {
    // Focus lại vào chính nó nếu chưa xong
    // Logic tìm input ref hơi phức tạp vì danh sách phẳng
    // Tạm thời bỏ qua focus tự động phức tạp, chỉ focus lại current nếu còn
  }
}

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

const openCameraScanner = () => { showCameraScanner.value = true }
const closeCameraScanner = () => { showCameraScanner.value = false }
const onBarcodeDetected = async (result) => {
  showCameraScanner.value = false
  if (currentProduct.value) {
    currentSerialInput.value = result
    await scanSerial(currentProduct.value)
  } else {
    currentSerialInput.value = result
  }
}

// Expose methods for parent
defineExpose({
  getSerialPayload,
  resetSerials,
  daQuetDu
})
</script>

<style scoped>
.serial-section {
    background-color: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

.product-serial-item {
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 10px;
    background-color: #f8f9fa;
    transition: all 0.2s;
}

.product-serial-item.active {
    border-color: #0d6efd;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(13, 110, 253, 0.2);
}

.product-serial-item.completed {
    border-color: #198754;
    background-color: #f0fff4;
}

.scanned-serial-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    margin-bottom: 4px;
}

.serial-dropdown {
    position: relative;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 100 !important;
}

.dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
    border-radius: 6px 6px 0 0;
}

.serial-list {
    max-height: 200px;
    overflow-y: auto;
}

.serial-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #f1f1f1;
}

.serial-item:hover {
    background-color: #e9ecef;
}
.serial-item.selected {
    background-color: #e8f0fe;
}

.serial-number {
    font-family: monospace;
    font-weight: bold;
    flex: 1;
}

.camera-scanner-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    background: white;
    z-index: 10000;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    overflow: hidden;
}

.camera-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: #212529;
    color: white;
}
</style>
