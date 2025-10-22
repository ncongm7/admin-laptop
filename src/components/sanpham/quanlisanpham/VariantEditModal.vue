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
              
              <!-- Tên sản phẩm (editable) -->
              <div class="col-md-6">
                <label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.tenSanPham"
                  :class="{ 'is-invalid': errors.tenSanPham }"
                  placeholder="Nhập tên sản phẩm"
                />
                <div v-if="errors.tenSanPham" class="invalid-feedback">{{ errors.tenSanPham }}</div>
              </div>

              <!-- CPU -->
              <div class="col-md-6">
                <label class="form-label">CPU</label>
                <select 
                  class="form-select" 
                  v-model="form.idCpu"
                >
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
                  <option v-for="color in productStore.colors" :key="color.id" :value="color.id">
                    <span class="d-flex align-items-center">
                      <span 
                        class="color-preview me-2" 
                        :style="{ backgroundColor: color.hexCode }"
                      ></span>
                      {{ color.tenMau }}
                    </span>
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
                  <option v-for="battery in productStore.batteries" :key="battery.id" :value="battery.id">
                    {{ battery.dungLuongPin }}
                  </option>
                </select>
              </div>

              <!-- Giá bán -->
              <div class="col-md-6">
                <label class="form-label">Giá bán <span class="text-danger">*</span></label>
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

              <!-- Số lượng tồn -->
              <div class="col-md-6">
                <label class="form-label">Số lượng tồn <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="form.soLuongTon"
                  :class="{ 'is-invalid': errors.soLuongTon }"
                  placeholder="Nhập số lượng tồn"
                  min="0"
                />
                <div v-if="errors.soLuongTon" class="invalid-feedback">{{ errors.soLuongTon }}</div>
              </div>

              <!-- Trạng thái -->
              <div class="col-md-12">
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

// State
const loading = ref(false)
const errors = ref({})
const generalError = ref('')

// Methods
const resetForm = () => {
  Object.assign(form, {
    id: '',
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
    soLuongTon: Number(variant.soLuongTon) || 0,
    trangThai: variant.trangThai ?? 1
  }
  
  console.log('VariantEditModal: Mapped form data:', formData)
  
  Object.assign(form, formData)
  
  console.log('VariantEditModal: Form after assignment:', { ...form })
}

const validateForm = () => {
  const newErrors = {}
  
  // Validate product name
  if (!form.tenSanPham || form.tenSanPham.trim().length === 0) {
    newErrors.tenSanPham = 'Vui lòng nhập tên sản phẩm'
  } else if (form.tenSanPham.trim().length < 3) {
    newErrors.tenSanPham = 'Tên sản phẩm phải có ít nhất 3 ký tự'
  } else if (form.tenSanPham.trim().length > 255) {
    newErrors.tenSanPham = 'Tên sản phẩm không được vượt quá 255 ký tự'
  }
  
  // Only validate price and quantity - attributes are optional
  
  // Validate price
  if (!form.giaBan || form.giaBan <= 0) {
    newErrors.giaBan = 'Giá bán phải lớn hơn 0'
  } else if (form.giaBan > 1000000000) { // 1 billion VND max
    newErrors.giaBan = 'Giá bán không được vượt quá 1 tỷ VND'
  }
  
  // Validate quantity
  if (form.soLuongTon === null || form.soLuongTon === undefined) {
    newErrors.soLuongTon = 'Vui lòng nhập số lượng tồn'
  } else if (form.soLuongTon < 0) {
    newErrors.soLuongTon = 'Số lượng tồn không được âm'
  } else if (!Number.isInteger(form.soLuongTon)) {
    newErrors.soLuongTon = 'Số lượng tồn phải là số nguyên'
  } else if (form.soLuongTon > 1000000) { // 1 million max
    newErrors.soLuongTon = 'Số lượng tồn không được vượt quá 1 triệu'
  }
  
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
    // Try Bootstrap 5 first
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      let bsModal = bootstrap.Modal.getInstance(modal)
      if (bsModal) {
        bsModal.hide()
        // Dispose the modal instance to prevent issues
        bsModal.dispose()
      }
    }
    
    // Always do manual cleanup to ensure everything is clean
    modal.classList.remove('show', 'd-block')
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeAttribute('role')
    
    // Clean up body and backdrop
    document.body.classList.remove('modal-open')
    
    // Remove all modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop')
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
    // Prepare payload with proper data types - only send valid values
    const payload = {
      tenSanPham: form.tenSanPham?.trim(),
      giaBan: Number(form.giaBan) || 0,
      soLuongTon: Number(form.soLuongTon) || 0,
      trangThai: Number(form.trangThai) ?? 1
    }
    
    // Only include attribute IDs if they have valid values
    if (form.idCpu) payload.idCpu = Number(form.idCpu)
    if (form.idRam) payload.idRam = Number(form.idRam)
    if (form.idGpu) payload.idGpu = Number(form.idGpu)
    if (form.idMauSac) payload.idMauSac = Number(form.idMauSac)
    if (form.idOCung) payload.idOCung = Number(form.idOCung)
    if (form.idLoaiManHinh) payload.idLoaiManHinh = Number(form.idLoaiManHinh)
    if (form.idPin) payload.idPin = Number(form.idPin)
    
    console.log('VariantEditModal: Prepared payload:', payload)
    
    // Only validate required fields (name, price, quantity)
    if (!payload.tenSanPham) {
      throw new Error('Tên sản phẩm không được để trống')
    }
    
    if (!payload.giaBan || payload.giaBan <= 0) {
      throw new Error('Giá bán phải lớn hơn 0')
    }
    
    if (payload.soLuongTon < 0) {
      throw new Error('Số lượng tồn không được âm')
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

// Expose methods for parent component
defineExpose({
  resetForm,
  loadVariantData
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