<template>
  <div class="modal fade" id="variantEditModal" tabindex="-1" aria-labelledby="variantEditModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="variantEditModalLabel">
            <i class="bi bi-pencil-square me-2"></i>
            Chỉnh sửa biến thể: {{ form.maCtsp }}
          </h5>
          <button type="button" class="btn-close" @click="handleClose" aria-label="Close"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row g-3">
              <!-- Mã CTSP (readonly) -->
              <div class="col-md-6">
                <label class="form-label">Mã chi tiết sản phẩm</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.maCtsp"
                  readonly
                  style="background-color: #f8f9fa;"
                />
              </div>

              <!-- CPU -->
              <div class="col-md-6">
                <label class="form-label">CPU</label>
                <select 
                  class="form-select" 
                  v-model="form.idCpu"
                >
                  <option value="">Chọn CPU</option>
                  <option v-if="productStore.cpus.length === 0" disabled>Đang tải...</option>
                  <option v-for="cpu in productStore.cpus" :key="cpu.id" :value="cpu.id">
                    {{ cpu.tenCpu }}
                  </option>
                </select>
              </div>

              <!-- RAM -->
              <div class="col-md-6">
                <label class="form-label">RAM</label>
                <select 
                  class="form-select" 
                  v-model="form.idRam"
                >
                  <option value="">Chọn RAM</option>
                  <option v-if="productStore.rams.length === 0" disabled>Đang tải...</option>
                  <option v-for="ram in productStore.rams" :key="ram.id" :value="ram.id">
                    {{ ram.tenRam }}
                  </option>
                </select>
              </div>

              <!-- GPU -->
              <div class="col-md-6">
                <label class="form-label">GPU</label>
                <select 
                  class="form-select" 
                  v-model="form.idGpu"
                >
                  <option value="">Chọn GPU</option>
                  <option v-if="productStore.gpus.length === 0" disabled>Đang tải...</option>
                  <option v-for="gpu in productStore.gpus" :key="gpu.id" :value="gpu.id">
                    {{ gpu.tenGpu }}
                  </option>
                </select>
              </div>

              <!-- Màu sắc -->
              <div class="col-md-6">
                <label class="form-label">Màu sắc</label>
                <select 
                  class="form-select" 
                  v-model="form.idMauSac"
                >
                  <option value="">Chọn màu sắc</option>
                  <option v-if="productStore.colors.length === 0" disabled>Đang tải...</option>
                  <option v-for="color in productStore.colors" :key="color.id" :value="color.id">
                    {{ color.tenMau }}
                  </option>
                </select>
              </div>

              <!-- Ổ cứng -->
              <div class="col-md-6">
                <label class="form-label">Ổ cứng</label>
                <select 
                  class="form-select" 
                  v-model="form.idOCung"
                >
                  <option value="">Chọn ổ cứng</option>
                  <option v-if="productStore.storages.length === 0" disabled>Đang tải...</option>
                  <option v-for="storage in productStore.storages" :key="storage.id" :value="storage.id">
                    {{ storage.dungLuong }}
                  </option>
                </select>
              </div>

              <!-- Màn hình -->
              <div class="col-md-6">
                <label class="form-label">Màn hình</label>
                <select 
                  class="form-select" 
                  v-model="form.idLoaiManHinh"
                >
                  <option value="">Chọn màn hình</option>
                  <option v-if="productStore.screens.length === 0" disabled>Đang tải...</option>
                  <option v-for="screen in productStore.screens" :key="screen.id" :value="screen.id">
                    {{ screen.kichThuoc }}
                  </option>
                </select>
              </div>

              <!-- Pin -->
              <div class="col-md-6">
                <label class="form-label">Pin</label>
                <select 
                  class="form-select" 
                  v-model="form.idPin"
                >
                  <option value="">Chọn pin</option>
                  <option v-if="productStore.batteries.length === 0" disabled>Đang tải...</option>
                  <option v-for="battery in productStore.batteries" :key="battery.id" :value="battery.id">
                    {{ battery.dungLuongPin }}
                  </option>
                </select>
              </div>

              <!-- Giá bán -->
              <div class="col-md-6">
                <label class="form-label">Giá bán (VNĐ) <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="form.giaBan"
                  :class="{ 'is-invalid': errors.giaBan }"
                  placeholder="Nhập giá bán"
                  min="0"
                  step="1000"
                />
                <div v-if="errors.giaBan" class="invalid-feedback">{{ errors.giaBan }}</div>
              </div>

              <!-- Trạng thái -->
              <div class="col-md-6">
                <label class="form-label">Trạng thái</label>
                <select class="form-select" v-model="form.trangThai">
                  <option :value="1">Hoạt động</option>
                  <option :value="0">Ẩn</option>
                </select>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="generalError" class="alert alert-danger mt-3">
              {{ generalError }}
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            <i class="bi bi-x-circle me-1"></i>
            Hủy
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="bi bi-check-circle me-1"></i>
            {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useProductStore } from '@/stores/productStore'

const productStore = useProductStore()

// Props
const props = defineProps({
  variant: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['updated', 'close'])

// Form data
const form = reactive({
  id: '',
  idSanPham: '',
  maCtsp: '',
  tenSanPham: '',
  idCpu: '',
  idRam: '',
  idGpu: '',
  idMauSac: '',
  idOCung: '',
  idLoaiManHinh: '',
  idPin: '',
  giaBan: 0,
  soLuongTon: 0,  // Hidden field, keep current value
  trangThai: 1
})

// State
const loading = ref(false)
const errors = ref({})
const generalError = ref('')

// Methods
const resetForm = () => {
  Object.assign(form, {
    id: '',
    idSanPham: '',
    maCtsp: '',
    tenSanPham: '',
    idCpu: '',
    idRam: '',
    idGpu: '',
    idMauSac: '',
    idOCung: '',
    idLoaiManHinh: '',
    idPin: '',
    giaBan: 0,
    soLuongTon: 0,
    trangThai: 1
  })
  errors.value = {}
  generalError.value = ''
}

const loadVariantData = (variant) => {
  console.log('VariantEditModal: Loading variant data:', variant)
  
  if (!variant || !variant.id) {
    console.error('VariantEditModal: Invalid variant data')
    return
  }
  
  // Clear previous errors
  errors.value = {}
  generalError.value = ''
  
  // Debug: Log productStore attributes
  console.log('VariantEditModal: productStore attributes:', {
    cpus: productStore.cpus.length,
    rams: productStore.rams.length,
    gpus: productStore.gpus.length,
    colors: productStore.colors.length,
    storages: productStore.storages.length,
    screens: productStore.screens.length,
    batteries: productStore.batteries.length
  })
  
  // Map variant data to form with comprehensive field mapping
  // Use the first available CPU if variant doesn't have one
  const defaultCpu = productStore.cpus.length > 0 ? productStore.cpus[0].id : ''
  const defaultRam = productStore.rams.length > 0 ? productStore.rams[0].id : ''
  const defaultGpu = productStore.gpus.length > 0 ? productStore.gpus[0].id : ''
  const defaultColor = productStore.colors.length > 0 ? productStore.colors[0].id : ''
  const defaultStorage = productStore.storages.length > 0 ? productStore.storages[0].id : ''
  const defaultScreen = productStore.screens.length > 0 ? productStore.screens[0].id : ''
  const defaultBattery = productStore.batteries.length > 0 ? productStore.batteries[0].id : ''
  
  const formData = {
    id: variant.id,
    idSanPham: variant.idSanPham || variant.sanPhamId || '',
    maCtsp: variant.maCtsp || '',
    tenSanPham: variant.tenSanPham || variant.sanPham?.tenSanPham || '',
    // Use existing values or default to first available option
    idCpu: variant.idCpu || variant.cpu?.id || variant.cpuId || defaultCpu,
    idRam: variant.idRam || variant.ram?.id || variant.ramId || defaultRam,
    idGpu: variant.idGpu || variant.gpu?.id || variant.gpuId || defaultGpu,
    idMauSac: variant.idMauSac || variant.mauSac?.id || variant.colorId || defaultColor,
    idOCung: variant.idOCung || variant.oCung?.id || variant.storageId || defaultStorage,
    idLoaiManHinh: variant.idLoaiManHinh || variant.loaiManHinh?.id || variant.screenId || defaultScreen,
    idPin: variant.idPin || variant.pin?.id || variant.batteryId || defaultBattery,
    giaBan: Number(variant.giaBan) || 0,
    soLuongTon: Number(variant.soLuongTon) || 0,  // Keep current value
    trangThai: variant.trangThai ?? 1
  }
  
  console.log('VariantEditModal: Mapped form data:', formData)
  
  Object.assign(form, formData)
  
  console.log('VariantEditModal: Form after assignment:', { ...form })
  
  // Debug: Check if form IDs match with productStore options
  console.log('VariantEditModal: Checking ID matches:')
  console.log('- CPU ID in form:', form.idCpu, '→ exists in options?', productStore.cpus.some(c => c.id === form.idCpu))
  console.log('- RAM ID in form:', form.idRam, '→ exists in options?', productStore.rams.some(r => r.id === form.idRam))
  console.log('- GPU ID in form:', form.idGpu, '→ exists in options?', productStore.gpus.some(g => g.id === form.idGpu))
  console.log('- Color ID in form:', form.idMauSac, '→ exists in options?', productStore.colors.some(c => c.id === form.idMauSac))
  console.log('- Storage ID in form:', form.idOCung, '→ exists in options?', productStore.storages.some(s => s.id === form.idOCung))
  console.log('- Screen ID in form:', form.idLoaiManHinh, '→ exists in options?', productStore.screens.some(s => s.id === form.idLoaiManHinh))
  console.log('- Battery ID in form:', form.idPin, '→ exists in options?', productStore.batteries.some(b => b.id === form.idPin))
}

const validateForm = () => {
  const newErrors = {}
  
  // Only validate price and quantity - attributes are optional
  
  // Validate price
  if (!form.giaBan || form.giaBan <= 0) {
    newErrors.giaBan = 'Giá bán phải lớn hơn 0'
  } else if (form.giaBan > 1000000000) { // 1 billion VND max
    newErrors.giaBan = 'Giá bán không được vượt quá 1 tỷ VND'
  }
  
  // Số lượng tồn không cần validate vì đã bỏ khỏi form
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleClose = () => {
  if (confirm('Bạn có chắc chắn muốn đóng form chỉnh sửa không?')) {
    closeModal()
  }
}

const handleCancel = () => {
  if (confirm('Bạn có chắc chắn muốn hủy chỉnh sửa không?')) {
    closeModal()
  }
}

const closeModal = () => {
  // Reset form first
  resetForm()
  
  // Close modal
  const modal = document.getElementById('variantEditModal')
  if (modal) {
    try {
      // Try Bootstrap 5 first
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        let bsModal = bootstrap.Modal.getInstance(modal)
        if (bsModal) {
          bsModal.hide()
          // Dispose the modal instance to prevent issues
          bsModal.dispose()
        }
      } else if (typeof $ !== 'undefined') {
        // Try jQuery Bootstrap
        $(modal).modal('hide')
      }
    } catch (error) {
      console.error('Error closing modal with Bootstrap:', error)
    }
    
    // Always do manual cleanup to ensure everything is clean
    modal.classList.remove('show', 'd-block')
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeAttribute('role')
    
    // Clean up body and backdrop
    document.body.classList.remove('modal-open')
    
    // Remove all modal backdrops (including our custom one)
    const backdrops = document.querySelectorAll('.modal-backdrop, #variantEditModalBackdrop')
    backdrops.forEach(backdrop => backdrop.remove())
    
    // Reset body styles that might be left over
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

const handleSubmit = async () => {
  console.log('VariantEditModal: Starting form submission')
  console.log('VariantEditModal: Current form data:', { ...form })
  
  if (!validateForm()) {
    console.log('VariantEditModal: Form validation failed:', errors.value)
    return
  }
  
  loading.value = true
  generalError.value = ''
  
  try {
    // Prepare payload with proper data types - keep UUIDs as strings
    const payload = {
      idSanPham: form.idSanPham,
      maCtsp: form.maCtsp,
      tenSanPham: form.tenSanPham?.trim(),
      giaBan: Number(form.giaBan) || 0,
      soLuongTon: Number(form.soLuongTon) || 0,  // Include current value
      trangThai: Number(form.trangThai) ?? 1
    }
    
    // Include attribute IDs as strings (UUIDs)
    if (form.idCpu) payload.idCpu = form.idCpu
    if (form.idRam) payload.idRam = form.idRam
    if (form.idGpu) payload.idGpu = form.idGpu
    if (form.idMauSac) payload.idMauSac = form.idMauSac
    if (form.idOCung) payload.idOCung = form.idOCung
    if (form.idLoaiManHinh) payload.idLoaiManHinh = form.idLoaiManHinh
    if (form.idPin) payload.idPin = form.idPin
    
    console.log('VariantEditModal: Prepared payload:', payload)
    
    // Only validate required fields (price)
    if (!payload.giaBan || payload.giaBan <= 0) {
      throw new Error('Giá bán phải lớn hơn 0')
    }
    
    console.log('VariantEditModal: Calling productStore.updateVariant')
    await productStore.updateVariant(form.id, payload)
    
    console.log('VariantEditModal: Update successful, emitting updated event')
    emit('updated')
    
    // Show success message
    alert('Cập nhật biến thể thành công!')
    
    // Close modal after successful update
    closeModal()
    
  } catch (error) {
    console.error('VariantEditModal: Error updating variant:', error)
    
    let errorMessage = 'Có lỗi xảy ra khi cập nhật biến thể'
    
    if (error.response?.status === 400) {
      errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Biến thể không tồn tại hoặc đã bị xóa.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Bạn không có quyền cập nhật biến thể này.'
    } else if (error.response?.status === 500) {
      errorMessage = 'Lỗi server. Vui lòng thử lại sau.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    generalError.value = errorMessage
  } finally {
    loading.value = false
  }
}

// Method to open modal with variant data
const openModal = (variant) => {
  if (variant) {
    loadVariantData(variant)
  } else {
    resetForm()
  }
  
  // Show the modal using Bootstrap - try multiple approaches
  const modalElement = document.getElementById('variantEditModal')
  if (modalElement) {
    try {
      // Method 1: Use Bootstrap 5 Modal API
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalElement)
        modal.show()
      } else {
        // Method 2: Use jQuery if Bootstrap is not available
        if (typeof $ !== 'undefined') {
          $(modalElement).modal('show')
        } else {
          // Method 3: Manual show using CSS classes
          modalElement.classList.add('show')
          modalElement.style.display = 'block'
          modalElement.setAttribute('aria-modal', 'true')
          modalElement.removeAttribute('aria-hidden')
          
          // Add backdrop
          const backdrop = document.createElement('div')
          backdrop.className = 'modal-backdrop fade show'
          backdrop.id = 'variantEditModalBackdrop'
          document.body.appendChild(backdrop)
          document.body.classList.add('modal-open')
        }
      }
    } catch (error) {
      console.error('Error opening modal:', error)
      // Fallback: manual show
      modalElement.classList.add('show')
      modalElement.style.display = 'block'
    }
  }
}

// Expose methods for parent component
defineExpose({
  resetForm,
  loadVariantData,
  openModal
})
</script>

<style scoped>
.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  display: inline-block;
}

.form-label {
  font-weight: 500;
  color: #374151;
}

.text-danger {
  color: #dc3545 !important;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  color: #495057;
  font-weight: 600;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}
</style>