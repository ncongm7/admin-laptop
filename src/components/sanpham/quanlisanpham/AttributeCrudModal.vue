<template>
  <div class="attr-modal fade show d-block" tabindex="-1">
    <div class="attr-dialog">
      <div class="attr-content">
        <div class="attr-header d-flex justify-content-between align-items-center">
          <h5 class="attr-title mb-0">Quản lý {{ title }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="attr-body">
          <form @submit.prevent="saveItem">
            <div class="row g-2">
              <div class="col-md-3">
                <label class="form-label small">Mã</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors.code }"
                  required
                />
                <div v-if="errors.code" class="invalid-feedback">{{ errors.code }}</div>
              </div>
              <div class="col-md-5">
                <label class="form-label small">{{ getFieldLabel('name') }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors.name }"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              </div>
              <div class="col-md-4">
                <label class="form-label small">Trạng thái</label>
                <select v-model="form.status" class="form-select form-select-sm">
                  <option value=1>Hoạt động</option>
                  <option value=0>Ẩn</option>
                </select>
              </div>
              <!-- Color picker for MauSac -->
              <div v-if="props.type === 'color'" class="col-md-4">
                <label class="form-label small">Mã màu (Hex)</label>
                <div class="color-picker-group">
                  <input
                    v-model="form.colorHex"
                    type="color"
                    class="form-control form-control-color"
                    style="width: 50px; height: 38px;"
                  />
                  <input
                    v-model="form.colorHex"
                    type="text"
                    class="form-control form-control-sm ms-2"
                    :class="{ 'is-invalid': errors.colorHex }"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <div v-if="errors.colorHex" class="invalid-feedback">{{ errors.colorHex }}</div>
              </div>
              <div class="col-12">
                <label class="form-label small">Mô tả</label>
                <textarea
                  v-model="form.description"
                  class="form-control form-control-sm"
                  rows="2"
                  :class="{ 'is-invalid': errors.description }"
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
              </div>
            </div>
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-primary btn-sm" type="button" @click="showSaveConfirm" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ editingIndex === -1 ? 'Thêm' : 'Cập nhật' }}
              </button>
              <button 
                class="btn btn-secondary btn-sm" 
                type="button" 
                @click="showResetConfirm" 
                :disabled="loading"
                title="Làm mới form (Ctrl+R)"
              >
                <i class="bi bi-arrow-clockwise me-1"></i>
                Làm mới
              </button>
            </div>
            <div v-if="generalError" class="alert alert-danger alert-sm mt-2">
              {{ generalError }}
            </div>
          </form>

          <div class="table-responsive mt-2">
            <table class="table table-sm align-middle">
              <thead class="table-light">
                <tr>
                  <th width="60">#</th>
                  <th>Mã</th>
                  <th>{{ getFieldLabel('name') }}</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th width="110">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="items.length === 0">
                  <td colspan="6" class="text-center text-muted py-3">Chưa có dữ liệu</td>
                </tr>
                <tr v-else v-for="(it, idx) in items" :key="it.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <span v-if="props.type === 'color' && it.colorHex" 
                            class="color-preview me-2" 
                            :style="{ backgroundColor: it.colorHex }"></span>
                      {{ it.code }}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <span v-if="props.type === 'color' && it.colorHex" 
                            class="color-preview me-2" 
                            :style="{ backgroundColor: it.colorHex }"></span>
                      {{ it.name }}
                    </div>
                  </td>
                  <td>{{ it.description }}</td>
                  <td>
                    <span
                      :class="['badge', it.status === 1 ? 'bg-success' : 'bg-secondary']"
                    >
                      {{ it.status === 1 ? 'Hoạt động' : 'Ẩn' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" @click="showEditConfirm(it, idx)" :disabled="loading">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" @click="showDeleteConfirm(it, idx)" :disabled="loading">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="attr-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
    <div class="attr-backdrop fade show"></div>
    
    <!-- Toast Notifications -->
    <NotificationToast ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  getCPUList, createCPU, updateCPU, deleteCPU,
  getGPUList, createGPU, updateGPU, deleteGPU,
  getRamList, createRam, updateRam, deleteRam,
  getOCungList, createOCung, updateOCung, deleteOCung,
  getMauSacList, createMauSac, updateMauSac, deleteMauSac,
  getLoaiManHinhList, createLoaiManHinh, updateLoaiManHinh, deleteLoaiManHinh,
  getPinList, createPin, updatePin, deletePin,
} from '@/service/sanpham/SanPhamService'
import NotificationToast from '@/components/common/NotificationToast.vue'
import { useConfirm } from '@/composables/useConfirm'

const props = defineProps({
  type: { type: String, required: true },
})

const emit = defineEmits(['close'])

// Use confirm composable
const { showConfirm } = useConfirm()

const mapTitle = {
  cpu: 'CPU',
  ram: 'RAM',
  gpu: 'GPU',
  color: 'Màu sắc',
  storage: 'Ổ cứng',
  'screen-type': 'Loại màn hình',
  battery: 'Pin',
}

const mapApiFunction = {
  cpu: { 
    list: getCPUList, 
    create: createCPU, 
    update: updateCPU, 
    delete: deleteCPU,
    fields: { code: 'maCpu', name: 'tenCpu', description: 'moTa', status: 'trangThai' }
  },
  ram: { 
    list: getRamList, 
    create: createRam, 
    update: updateRam, 
    delete: deleteRam,
    fields: { code: 'maRam', name: 'tenRam', description: 'moTa', status: 'trangThai' }
  },
  gpu: { 
    list: getGPUList, 
    create: createGPU, 
    update: updateGPU, 
    delete: deleteGPU,
    fields: { code: 'maGpu', name: 'tenGpu', description: 'moTa', status: 'trangThai' }
  },
  color: { 
    list: getMauSacList, 
    create: createMauSac, 
    update: updateMauSac, 
    delete: deleteMauSac,
    fields: { code: 'maMau', name: 'tenMau', description: 'moTa', status: 'trangThai' }
  },
  storage: { 
    list: getOCungList, 
    create: createOCung, 
    update: updateOCung, 
    delete: deleteOCung,
    fields: { code: 'maOCung', name: 'dungLuong', description: 'moTa', status: 'trangThai' }
  },
  'screen-type': { 
    list: getLoaiManHinhList, 
    create: createLoaiManHinh, 
    update: updateLoaiManHinh, 
    delete: deleteLoaiManHinh,
    fields: { code: 'maLoaiManHinh', name: 'kichThuoc', description: 'moTa', status: 'trangThai' }
  },
  battery: { 
    list: getPinList, 
    create: createPin, 
    update: updatePin, 
    delete: deletePin,
    fields: { code: 'maPin', name: 'dungLuongPin', description: 'moTa', status: 'trangThai' }
  },
}

const title = computed(() => mapTitle[props.type] || 'Thuộc tính')

const items = ref([])
const editingIndex = ref(-1)
const editingItem = ref(null)
const loading = ref(false)
const errors = ref({})
const generalError = ref('')
const form = ref({ 
  code: '', 
  name: '', 
  description: '', 
  status: 1,
  colorHex: '#000000' // For color type
})

// Toast notification ref
const toast = ref(null)

// Load data from API
const loadData = async () => {
  if (!mapApiFunction[props.type]) {
    return
  }

  loading.value = true
  try {
    const response = await mapApiFunction[props.type].list()
    const data = response.data || response

    if (Array.isArray(data)) {
      const fields = mapApiFunction[props.type].fields
      // Map the API response to our expected format and sort by newest first
      items.value = data.map((item, index) => ({
        id: item.id,
        code: item[fields.code] || '',
        name: item[fields.name] || '',
        description: item[fields.description] || '',
        status: item[fields.status] || 1,
        colorHex: item.hexCode || item.mauHex || '#000000', // For color type
        originalData: item, // Keep original data for updates
        createdAt: item.createdAt || item.created_at || item.ngayTao || new Date(Date.now() - index * 1000).toISOString() // Fallback ordering
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      console.log('Loaded items:', items.value.length, 'items')
    } else {
      items.value = []
    }
  } catch (err) {
    console.error('Error loading data:', err)
    
    // Check if API endpoint exists
    if (err.response && err.response.status === 404) {
      generalError.value = `API endpoint cho ${title.value} chưa được implement`
      // Use mock data for development
      items.value = generateMockData()
    } else {
      generalError.value = 'Không thể tải dữ liệu: ' + (err.message || 'Lỗi không xác định')
    }
  } finally {
    loading.value = false
  }
}

// Generate mock data for testing when API fails
const generateMockData = () => {
  const mockData = {
    cpu: [
      { code: 'CPU-001', name: 'Intel Core i5-12400F', description: '6 nhân 12 luồng, 2.5GHz' },
      { code: 'CPU-002', name: 'Intel Core i7-12700F', description: '12 nhân 20 luồng, 2.1GHz' },
      { code: 'CPU-003', name: 'AMD Ryzen 5 5600X', description: '6 nhân 12 luồng, 3.7GHz' },
      { code: 'CPU-004', name: 'AMD Ryzen 7 5700X', description: '8 nhân 16 luồng, 3.4GHz' },
    ],
    ram: [
      { code: 'RAM-001', name: '8GB DDR4', description: '8GB DDR4 2666MHz' },
      { code: 'RAM-002', name: '16GB DDR4', description: '16GB DDR4 3200MHz' },
      { code: 'RAM-003', name: '32GB DDR4', description: '32GB DDR4 3200MHz' },
    ],
    gpu: [
      { code: 'GPU-001', name: 'RTX 3060', description: 'NVIDIA GeForce RTX 3060 12GB' },
      { code: 'GPU-002', name: 'RTX 3070', description: 'NVIDIA GeForce RTX 3070 8GB' },
      { code: 'GPU-003', name: 'GTX 1650', description: 'NVIDIA GeForce GTX 1650 4GB' },
    ],
    color: [
      { code: 'COLOR-001', name: 'Đen', description: 'Màu đen' },
      { code: 'COLOR-002', name: 'Trắng', description: 'Màu trắng' },
      { code: 'COLOR-003', name: 'Xám', description: 'Màu xám' },
      { code: 'COLOR-004', name: 'Bạc', description: 'Màu bạc' },
    ],
    storage: [
      { code: 'SSD-001', name: '256GB SSD', description: 'SSD NVMe 256GB' },
      { code: 'SSD-002', name: '512GB SSD', description: 'SSD NVMe 512GB' },
      { code: 'SSD-003', name: '1TB SSD', description: 'SSD NVMe 1TB' },
    ],
    'screen-type': [
      { code: 'SCREEN-001', name: 'IPS', description: 'Màn hình IPS' },
      { code: 'SCREEN-002', name: 'OLED', description: 'Màn hình OLED' },
      { code: 'SCREEN-003', name: 'VA', description: 'Màn hình VA' },
    ],
    battery: [
      { code: 'BAT-001', name: '3000mAh', description: 'Pin 3000mAh' },
      { code: 'BAT-002', name: '4000mAh', description: 'Pin 4000mAh' },
      { code: 'BAT-003', name: '5000mAh', description: 'Pin 5000mAh' },
    ],
  }

  return (mockData[props.type] || []).map((item, index) => ({
    id: index + 1,
    code: item.code,
    name: item.name,
    description: item.description,
    status: 'ACTIVE',
  }))
}

function resetForm() {
  // Reset editing state
  editingIndex.value = -1
  editingItem.value = null
  
  // Reset form data to initial state
  form.value = { 
    code: '', 
    name: '', 
    description: '', 
    status: 1,
    colorHex: '#000000'
  }
  
  // Clear all errors
  errors.value = {}
  generalError.value = ''
  
  
  console.log('✅ Form has been reset to initial state')
}

// Get field labels based on type
const getFieldLabel = (field) => {
  const labels = {
    cpu: { name: 'Tên CPU' },
    ram: { name: 'Dung lượng RAM' },
    gpu: { name: 'Tên GPU' },
    color: { name: 'Tên màu' },
    storage: { name: 'Dung lượng ổ cứng' },
    'screen-type': { name: 'Kích thước màn hình' },
    battery: { name: 'Dung lượng pin' },
  }
  return labels[props.type]?.[field] || 'Tên'
}

// Frontend validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.code?.trim()) {
    newErrors.code = 'Mã không được để trống'
  }
  
  if (!form.value.name?.trim()) {
    newErrors.name = 'Tên không được để trống'
  }
  
  // Check for duplicate code
  const isDuplicate = items.value.some((item, index) => 
    item.code.toLowerCase() === form.value.code.toLowerCase() && 
    (editingIndex.value === -1 || index !== editingIndex.value)
  )
  
  if (isDuplicate) {
    newErrors.code = 'Mã này đã tồn tại, vui lòng chọn mã khác'
  }
  
  // Validate hex code for color type
  if (props.type === 'color' && form.value.colorHex) {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    if (!hexPattern.test(form.value.colorHex)) {
      newErrors.colorHex = 'Mã màu phải có định dạng #RRGGBB (ví dụ: #FF0000)'
    }
  }
  
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Show validation error confirmation
function showValidationError() {
  const errorMessages = Object.values(errors.value).filter(msg => msg)
  const message = errorMessages.length > 0 
    ? errorMessages.join('\n') 
    : 'Vui lòng kiểm tra lại thông tin nhập vào'
    
  showConfirm({
    title: 'Thông tin không hợp lệ',
    message: message,
    confirmText: 'Đã hiểu',
    type: 'warning'
  })
}

// Show save confirmation
async function showSaveConfirm() {
  // Clear previous errors
  errors.value = {}
  generalError.value = ''
  
  // Frontend validation
  if (!validateForm()) {
    showValidationError()
    return
  }
  
  const isCreating = editingIndex.value === -1
  const title_text = isCreating ? 'Xác nhận thêm mới' : 'Xác nhận cập nhật'
  const message = isCreating 
    ? `Bạn có chắc chắn muốn thêm ${title.value.toLowerCase()} "${form.value.name}"?`
    : `Bạn có chắc chắn muốn cập nhật ${title.value.toLowerCase()} "${form.value.name}"?`
  const confirmText = isCreating ? 'Thêm' : 'Cập nhật'
  
  const confirmed = await showConfirm({
    title: title_text,
    message: message,
    confirmText: confirmText,
    type: 'info'
  })
  
  if (confirmed) {
    await saveItem()
  }
}

// Show reset confirmation
async function showResetConfirm() {
  const confirmed = await showConfirm({
    title: 'Xác nhận làm mới',
    message: 'Bạn có chắc chắn muốn xóa tất cả thông tin đã nhập?',
    confirmText: 'Làm mới',
    type: 'warning'
  })
  
  if (confirmed) {
    resetForm()
    // Show success notification for reset
    toast.value?.addToast({
      type: 'success',
      title: 'Làm mới thành công!',
      message: 'Form đã được làm mới và sẵn sàng để nhập dữ liệu mới.',
      duration: 3000
    })
  }
}

// Show edit confirmation
async function showEditConfirm(item, index) {
  const confirmed = await showConfirm({
    title: 'Xác nhận chỉnh sửa',
    message: `Bạn có muốn chỉnh sửa ${title.value.toLowerCase()} "${item.name}"?`,
    confirmText: 'Chỉnh sửa',
    type: 'info'
  })
  
  if (confirmed) {
    editItem(index)
  }
}

async function saveItem() {
  if (!mapApiFunction[props.type]) return
  
  loading.value = true

  console.log('Saving item:', {
    type: props.type,
    isCreating: editingIndex.value === -1,
    form: form.value
  })

  try {
    const fields = mapApiFunction[props.type].fields
    const payload = {
      [fields.code]: form.value.code,
      [fields.name]: form.value.name,
      [fields.description]: form.value.description,
      [fields.status]: Number(form.value.status)
    }

    // Add hex code for color type
    if (props.type === 'color') {
      payload.hexCode = form.value.colorHex
      payload.mauHex = form.value.colorHex
    }
    

    const isCreating = editingIndex.value === -1
    let response
    
    if (isCreating) {
      // Create new item
      response = await mapApiFunction[props.type].create(payload)
    } else {
      // Update existing item
      const itemId = editingItem.value.id
      response = await mapApiFunction[props.type].update(itemId, payload)
    }

    console.log('Save successful, response:', response)
    
    // Create new item object for immediate display
    const newItem = {
      id: response.data?.id || response.id || Date.now(),
      code: form.value.code,
      name: form.value.name,
      description: form.value.description,
      status: Number(form.value.status),
      colorHex: form.value.colorHex || '#000000',
      createdAt: new Date().toISOString(),
      originalData: response.data || response
    }
    
    if (isCreating) {
      // Add new item to the beginning of the array
      items.value.unshift(newItem)
    } else {
      // Update existing item and move to top
      items.value.splice(editingIndex.value, 1)
      items.value.unshift(newItem)
    }
    
    resetForm()
    
    console.log('Showing success toast:', {
      isCreating,
      title: title.value,
      toastRef: toast.value
    })
    
    // Show success notification
    toast.value?.addToast({
      type: 'success',
      title: isCreating ? 'Thêm thành công!' : 'Cập nhật thành công!',
      message: `${title.value} đã được ${isCreating ? 'thêm mới' : 'cập nhật'} thành công.`,
      duration: 3000
    })
    
  } catch (err) {
    console.error('Error saving item:', err)
    
    // Check if API endpoint exists
    if (err.response && err.response.status === 404) {
      generalError.value = `API endpoint cho ${title.value} chưa được implement`
      toast.value?.addToast({
        type: 'warning',
        title: 'API chưa sẵn sàng',
        message: `Chức năng quản lý ${title.value} chưa được triển khai trên server`,
        duration: 5000
      })
      return
    }
    
    // Handle validation errors from backend
    if (err.response && err.response.data) {
      const errorData = err.response.data
      
      if (errorData.errors) {
        // Field-specific errors - map backend field names to frontend field names
        const fields = mapApiFunction[props.type].fields
        const fieldMapping = {
          [fields.code]: 'code',
          [fields.name]: 'name', 
          [fields.description]: 'description',
          [fields.status]: 'status',
          'hexCode': 'colorHex',
          'mauHex': 'colorHex'
        }
        
        Object.keys(errorData.errors).forEach(backendField => {
          const frontendField = fieldMapping[backendField] || backendField
          errors.value[frontendField] = errorData.errors[backendField]
        })
        
        generalError.value = 'Vui lòng kiểm tra lại thông tin nhập vào'
      } else {
        // General error message
        generalError.value = errorData.message || 'Có lỗi xảy ra khi lưu dữ liệu'
      }
    } else {
      generalError.value = 'Không thể lưu dữ liệu: ' + (err.message || 'Lỗi không xác định')
    }
    
    // Show error notification
    toast.value?.addToast({
      type: 'error',
      title: 'Lỗi!',
      message: generalError.value,
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}

function editItem(index) {
  editingIndex.value = index
  editingItem.value = items.value[index]
  form.value = { 
    code: items.value[index].code,
    name: items.value[index].name,
    description: items.value[index].description,
    status: items.value[index].status,
    colorHex: items.value[index].colorHex || '#000000'
  }
  errors.value = {}
  generalError.value = ''
}

async function showDeleteConfirm(item, index) {
  const confirmed = await showConfirm({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa "${item.name}"? Hành động này không thể hoàn tác.`,
    confirmText: 'Xóa',
    type: 'danger'
  })
  
  if (confirmed) {
    await deleteItem(item, index)
  }
}


async function deleteItem(item, index) {
  if (!mapApiFunction[props.type]) return

  loading.value = true
  try {
    await mapApiFunction[props.type].delete(item.id)
    
    // Remove from local array
    items.value.splice(index, 1)
    
    // Reset form if editing this item
    if (editingIndex.value === index) {
      resetForm()
    }
    
    // Show success notification
    toast.value?.addToast({
      type: 'success',
      title: 'Xóa thành công!',
      message: `${item.name} đã được xóa khỏi hệ thống.`,
      duration: 3000
    })
    
  } catch (err) {
    console.error('Error deleting item:', err)
    const errorMessage = 'Không thể xóa: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định')
    generalError.value = errorMessage
    
    // Show error notification
    toast.value?.addToast({
      type: 'error',
      title: 'Lỗi xóa!',
      message: errorMessage,
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}


// Handle keyboard shortcuts
const handleKeyDown = (event) => {
  // Ctrl+R for reset form
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault()
    if (!loading.value) {
      showResetConfirm()
    }
  }
  // Escape to close modal
  else if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}

// Load data when component mounts or type changes
onMounted(() => {
  loadData()
  
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyDown)
})

// Clean up event listener on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

watch(
  () => props.type,
  () => {
    loadData()
  },
)
</script>

<style scoped>
.attr-modal {
  position: fixed;
  top: 0;
  left: 240px; /* align with sidebar */
  width: calc(100% - 240px);
  height: 100%;
  z-index: 1500;
}
.attr-backdrop {
  position: fixed;
  left: 240px;
  width: calc(100% - 240px);
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1490;
}
.attr-dialog {
  margin: 0 0 0 auto;
  width: 720px;
  max-width: 100%;
  height: 100%;
}
.attr-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px 0 0 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}
.attr-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.attr-title {
  font-size: 20px;
  font-weight: 700;
}
.attr-body {
  padding: 12px;
  overflow: auto;
}
.attr-footer {
  padding: 14px 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

@media (max-width: 991px) {
  .attr-modal,
  .attr-backdrop {
    left: 180px;
    width: calc(100% - 180px);
  }
}
@media (max-width: 767px) {
  .attr-modal,
  .attr-backdrop {
    left: 0;
    width: 100%;
  }
}

/* Color picker styles */
.color-picker-group {
  display: flex;
  align-items: center;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  display: inline-block;
  flex-shrink: 0;
}

.form-control-color {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.form-control-color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.form-control-color::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

/* Loading and error styles */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alert-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}
</style>
