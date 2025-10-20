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
                <label class="form-label">CPU <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idCpu"
                  :class="{ 'is-invalid': errors.idCpu }"
                >
                  <option value="">Chọn CPU</option>
                  <option v-for="cpu in productStore.cpus" :key="cpu.id" :value="cpu.id">
                    {{ cpu.tenCpu }}
                  </option>
                </select>
                <div v-if="errors.idCpu" class="invalid-feedback">{{ errors.idCpu }}</div>
              </div>

              <!-- RAM -->
              <div class="col-md-6">
                <label class="form-label">RAM <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idRam"
                  :class="{ 'is-invalid': errors.idRam }"
                >
                  <option value="">Chọn RAM</option>
                  <option v-for="ram in productStore.rams" :key="ram.id" :value="ram.id">
                    {{ ram.tenRam }}
                  </option>
                </select>
                <div v-if="errors.idRam" class="invalid-feedback">{{ errors.idRam }}</div>
              </div>

              <!-- GPU -->
              <div class="col-md-6">
                <label class="form-label">GPU <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idGpu"
                  :class="{ 'is-invalid': errors.idGpu }"
                >
                  <option value="">Chọn GPU</option>
                  <option v-for="gpu in productStore.gpus" :key="gpu.id" :value="gpu.id">
                    {{ gpu.tenGpu }}
                  </option>
                </select>
                <div v-if="errors.idGpu" class="invalid-feedback">{{ errors.idGpu }}</div>
              </div>

              <!-- Màu sắc -->
              <div class="col-md-6">
                <label class="form-label">Màu sắc <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idMauSac"
                  :class="{ 'is-invalid': errors.idMauSac }"
                >
                  <option value="">Chọn màu sắc</option>
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
                <div v-if="errors.idMauSac" class="invalid-feedback">{{ errors.idMauSac }}</div>
              </div>

              <!-- Ổ cứng -->
              <div class="col-md-6">
                <label class="form-label">Ổ cứng <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idOCung"
                  :class="{ 'is-invalid': errors.idOCung }"
                >
                  <option value="">Chọn ổ cứng</option>
                  <option v-for="storage in productStore.storages" :key="storage.id" :value="storage.id">
                    {{ storage.dungLuong }}
                  </option>
                </select>
                <div v-if="errors.idOCung" class="invalid-feedback">{{ errors.idOCung }}</div>
              </div>

              <!-- Màn hình -->
              <div class="col-md-6">
                <label class="form-label">Màn hình <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idLoaiManHinh"
                  :class="{ 'is-invalid': errors.idLoaiManHinh }"
                >
                  <option value="">Chọn màn hình</option>
                  <option v-for="screen in productStore.screens" :key="screen.id" :value="screen.id">
                    {{ screen.kichThuoc }}
                  </option>
                </select>
                <div v-if="errors.idLoaiManHinh" class="invalid-feedback">{{ errors.idLoaiManHinh }}</div>
              </div>

              <!-- Pin -->
              <div class="col-md-6">
                <label class="form-label">Pin <span class="text-danger">*</span></label>
                <select 
                  class="form-select" 
                  v-model="form.idPin"
                  :class="{ 'is-invalid': errors.idPin }"
                >
                  <option value="">Chọn pin</option>
                  <option v-for="battery in productStore.batteries" :key="battery.id" :value="battery.id">
                    {{ battery.dungLuongPin }}
                  </option>
                </select>
                <div v-if="errors.idPin" class="invalid-feedback">{{ errors.idPin }}</div>
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
  if (!variant || !variant.id) return
  
  Object.assign(form, {
    id: variant.id,
    maCtsp: variant.maCtsp || '',
    tenSanPham: variant.tenSanPham || '',
    idCpu: variant.idCpu || variant.cpu?.id || '',
    idRam: variant.idRam || variant.ram?.id || '',
    idGpu: variant.idGpu || variant.gpu?.id || '',
    idMauSac: variant.idMauSac || variant.mauSac?.id || '',
    idOCung: variant.idOCung || variant.oCung?.id || '',
    idLoaiManHinh: variant.idLoaiManHinh || variant.loaiManHinh?.id || '',
    idPin: variant.idPin || variant.pin?.id || '',
    giaBan: variant.giaBan || 0,
    soLuongTon: variant.soLuongTon || 0,
    trangThai: variant.trangThai ?? 1
  })
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
  
  // Validate required dropdowns
  if (!form.idCpu) newErrors.idCpu = 'Vui lòng chọn CPU'
  if (!form.idRam) newErrors.idRam = 'Vui lòng chọn RAM'
  if (!form.idGpu) newErrors.idGpu = 'Vui lòng chọn GPU'
  if (!form.idMauSac) newErrors.idMauSac = 'Vui lòng chọn màu sắc'
  if (!form.idOCung) newErrors.idOCung = 'Vui lòng chọn ổ cứng'
  if (!form.idLoaiManHinh) newErrors.idLoaiManHinh = 'Vui lòng chọn màn hình'
  if (!form.idPin) newErrors.idPin = 'Vui lòng chọn pin'
  
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
  if (!validateForm()) return
  
  loading.value = true
  generalError.value = ''
  
  try {
    await productStore.updateVariant(form.id, {
      tenSanPham: form.tenSanPham,
      idCpu: form.idCpu,
      idRam: form.idRam,
      idGpu: form.idGpu,
      idMauSac: form.idMauSac,
      idOCung: form.idOCung,
      idLoaiManHinh: form.idLoaiManHinh,
      idPin: form.idPin,
      giaBan: form.giaBan,
      soLuongTon: form.soLuongTon,
      trangThai: form.trangThai
    })
    
    emit('updated')
    
    // Close modal after successful update using the same cleanup method
    const modal = document.getElementById('variantEditModal')
    if (modal) {
      // Try Bootstrap 5 first
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        let bsModal = bootstrap.Modal.getInstance(modal)
        if (bsModal) {
          bsModal.hide()
          // Dispose to ensure clean state for next time
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
    
    // Reset form after successful update
    resetForm()
    
  } catch (error) {
    console.error('Error updating variant:', error)
    generalError.value = error.message || 'Có lỗi xảy ra khi cập nhật biến thể'
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