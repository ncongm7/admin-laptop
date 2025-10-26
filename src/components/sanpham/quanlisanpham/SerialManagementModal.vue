<template>
  <!-- Modal Backdrop -->
  <div v-if="modelValue" class="modal-backdrop fade show" @click="handleClose"></div>
  
  <!-- Modal Dialog -->
  <div v-if="modelValue" class="modal fade show" tabindex="-1" style="display: block;">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-list-ol me-2"></i>
            Quản lý Serial Numbers - {{ variant?.maCtsp || 'Biến thể' }}
          </h5>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>
        
        <div class="modal-body">
          <div class="serial-management-container">
            <!-- Variant Info -->
            <div class="variant-info-card mb-4">
              <div class="row">
                <div class="col-md-6">
                  <div class="info-item">
                    <strong>Mã biến thể:</strong> 
                    <code class="ms-2">{{ variant?.maCtsp || 'N/A' }}</code>
                  </div>
                  <div class="info-item">
                    <strong>Cấu hình:</strong> 
                    <span class="ms-2">{{ getVariantSpecs() }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <strong>Giá bán:</strong> 
                    <span class="ms-2 text-success fw-bold">{{ formatCurrency(variant?.giaBan) }}</span>
                  </div>
                  <div class="info-item">
                    <strong>Số lượng tồn:</strong> 
                    <span class="ms-2 badge bg-primary">{{ stockCount }}</span>
                    <small class="text-muted ms-2">({{ localSerials.length }} serial, {{ stockCount }} có sẵn)</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add Serial Number -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Thêm Serial Number:</label>
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': validationError, 'is-valid': validationSuccess }"
                  v-model="serialInput"
                  @input="validateSerialInput"
                  placeholder="Nhập serial (VD: ABC1234, 9B2KX13)"
                  maxlength="50"
                  @keyup.enter="addSerialNumbers"
                />
                <button type="button" class="btn btn-success" @click="addSerialNumbers">
                  <i class="bi bi-plus-lg"></i> Thêm
                </button>
              </div>
              <div v-if="validationError" class="text-warning small mt-1">
                <i class="bi bi-exclamation-triangle"></i> {{ validationError }}
              </div>
              <small class="text-muted">
                Có thể nhập nhiều, cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;). Mỗi serial phải có đúng 7 ký tự gồm cả chữ và số.
              </small>
            </div>

            <!-- Import from Excel -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Import từ Excel/CSV:</label>
              <div class="d-flex gap-2">
                <input
                  type="file"
                  ref="excelFileInput"
                  accept=".xlsx,.xls,.csv"
                  class="d-none"
                  @change="importFromExcel"
                />
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  @click="$refs.excelFileInput?.click()"
                >
                  <i class="bi bi-file-earmark-arrow-up"></i> Chọn file
                </button>
                <button
                  type="button"
                  class="btn btn-outline-info btn-sm"
                  @click="downloadExcelTemplate"
                >
                  <i class="bi bi-download"></i> Tải mẫu
                </button>
              </div>
              <small class="text-muted">Hỗ trợ file .xlsx, .csv</small>
            </div>

            <!-- Serial Numbers List -->
            <div class="serial-list-section">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <h6 class="section-title mb-0">Danh sách Serial Numbers:</h6>
                <span class="badge bg-info">{{ localSerials.length }} serials</span>
              </div>

              <div
                v-if="localSerials.length > 0"
                class="table-responsive"
                style="max-height: 300px"
              >
                <table class="table table-hover serial-table">
                  <thead>
                    <tr>
                      <th style="width: 15%">STT</th>
                      <th style="width: 40%">Serial Number</th>
                      <th style="width: 20%">Trạng thái</th>
                      <th style="width: 25%">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(serial, idx) in localSerials" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td class="fw-medium">
                        {{ serial.soSerial }}
                        <i 
                          v-if="!serial.id" 
                          class="bi bi-circle-fill text-warning ms-1" 
                          title="Chưa lưu vào database"
                          style="font-size: 6px;"
                        ></i>
                        <i 
                          v-else 
                          class="bi bi-check-circle-fill text-success ms-1" 
                          title="Đã lưu vào database"
                          style="font-size: 10px;"
                        ></i>
                      </td>
                      <td>
                        <span 
                          class="badge" 
                          :class="serial.trangThai === 1 ? 'bg-success' : 'bg-secondary'"
                        >
                          {{ serial.trangThai === 1 ? 'Có sẵn' : 'Ẩn' }}
                        </span>
                      </td>
                      <td>
                        <div class="d-flex gap-1">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            @click="toggleSerialStatus(idx)"
                            :title="serial.trangThai === 1 ? 'Chuyển sang Ẩn' : 'Chuyển sang Có sẵn'"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            @click="removeSerial(idx)"
                            title="Xóa serial"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>Chưa có serial number nào</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="d-flex align-items-center me-auto" v-if="localSerials.length > 0">
            <small class="text-muted">
              <i class="bi bi-info-circle"></i>
              Tổng: {{ localSerials.length }} serial
              <span v-if="getUnsavedSerialsCount() > 0" class="text-warning ms-2">
                ({{ getUnsavedSerialsCount() }} chưa lưu)
              </span>
            </small>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-secondary" @click="handleClose">
              <i class="bi bi-x-lg"></i> Đóng
            </button>
            <button 
              type="button" 
              class="btn btn-success" 
              @click="handleSave"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-check-lg"></i> 
              {{ getSaveButtonText() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getSerialsByCtspId, createSerialsBatch, importSerialsFromExcel, updateSerial, deleteSerial } from '@/service/sanpham/SanPhamService'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  variant: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// State
const localSerials = ref([])
const originalSerials = ref([]) // Track original serials for comparison
const serialInput = ref('')
const validationError = ref('')
const validationSuccess = ref(false)
const loading = ref(false)
const excelFileInput = ref(null)

// Computed: Stock count (only count serials with trangThai = 1)
const stockCount = computed(() => {
  return localSerials.value.filter(s => s.trangThai === 1).length
})

// Watch for variant changes to load serials
watch(() => props.variant, async (newVariant) => {
  if (newVariant) {
    await loadSerials()
  }
}, { immediate: true })

// Load serials from API or use existing data
const loadSerials = async () => {
  if (!props.variant) return
  
  // If variant has serials array, use it (for preview mode)
  if (props.variant.serials && Array.isArray(props.variant.serials)) {
    localSerials.value = [...props.variant.serials]
    originalSerials.value = JSON.parse(JSON.stringify(props.variant.serials)) // Deep copy
    return
  }
  
  // If variant has ID, load from API
  if (props.variant.id) {
    try {
      const response = await getSerialsByCtspId(props.variant.id)
      const backendSerials = response.data || []
      localSerials.value = backendSerials.map(serial => ({
        id: serial.id,
        soSerial: serial.serialNo,
        trangThai: serial.trangThai || 1
      }))
      originalSerials.value = JSON.parse(JSON.stringify(localSerials.value)) // Deep copy
    } catch (error) {
      console.error('Error loading serials:', error)
      localSerials.value = []
      originalSerials.value = []
    }
  } else {
    // New variant - empty serials
    localSerials.value = []
  }
}

// Validation
const validateSerialInput = () => {
  validationError.value = ''
  validationSuccess.value = false
  
  if (serialInput.value.trim()) {
    const serials = serialInput.value.split(/[,;]/).map(s => s.trim()).filter(s => s)
    const invalidSerials = serials.filter(s => s.length !== 7 || !/^[A-Za-z0-9]+$/.test(s))
    
    if (invalidSerials.length > 0) {
      validationError.value = `Serial không hợp lệ: ${invalidSerials.join(', ')}`
    } else {
      validationSuccess.value = true
    }
  }
}

// Add serials
const addSerialNumbers = () => {
  const serials = serialInput.value.split(/[,;]/).map(s => s.trim()).filter(s => s)
  const invalidSerials = serials.filter(s => s.length !== 7 || !/^[A-Za-z0-9]+$/.test(s))
  
  if (invalidSerials.length > 0) {
    validationError.value = `Serial không hợp lệ: ${invalidSerials.join(', ')}`
    return
  }
  
  serials.forEach(serial => {
    if (!localSerials.value.find(s => s.soSerial === serial)) {
      localSerials.value.push({
        id: null,
        soSerial: serial,
        trangThai: 1
      })
    }
  })
  
  serialInput.value = ''
  validationError.value = ''
  validationSuccess.value = false
}

// Remove serial
const removeSerial = async (index) => {
  const serial = localSerials.value[index]
  
  // If serial has ID (saved in DB), call API to delete
  if (serial?.id && props.variant?.id) {
    if (!confirm('Bạn có chắc chắn muốn xóa serial này?')) {
      return
    }
    
    try {
      loading.value = true
      await deleteSerial(serial.id)
      localSerials.value.splice(index, 1)
      alert('Đã xóa serial thành công!')
      
      // Reload serials to update stock count
      await loadSerials()
      
      // Emit save event to update parent component
      emit('save', {
        variantId: props.variant.id,
        serials: localSerials.value
      })
    } catch (error) {
      console.error('Error deleting serial:', error)
      alert('Có lỗi khi xóa serial: ' + (error.response?.data?.message || error.message))
    } finally {
      loading.value = false
    }
  } else {
    // Local serial (not saved yet), just remove from array
    localSerials.value.splice(index, 1)
  }
}

// Toggle serial status
const toggleSerialStatus = async (index) => {
  const serial = localSerials.value[index]
  if (!serial) {
    console.error('Serial not found at index:', index)
    return
  }
  
  const newStatus = serial.trangThai === 1 ? 0 : 1
  
  console.log('🔵 Toggling serial status:', { 
    serialId: serial.id, 
    variantId: props.variant?.id, 
    currentStatus: serial.trangThai, 
    newStatus 
  })
  
  // If serial has ID (saved in DB), call API to update
  if (serial.id && props.variant?.id) {
    try {
      loading.value = true
      
      console.log('🔵 Calling updateSerial API...')
      await updateSerial(serial.id, {
        ctspId: props.variant.id,
        serialNo: serial.soSerial,
        trangThai: newStatus
      })
      
      // Update local state
      serial.trangThai = newStatus
      
      alert(`Đã chuyển trạng thái serial sang "${newStatus === 1 ? 'Có sẵn' : 'Ẩn'}"`)
      
      // Reload serials to update stock count
      await loadSerials()
      
      // Emit save event to update parent component's stock count
      emit('save', {
        variantId: props.variant.id,
        serials: localSerials.value
      })
    } catch (error) {
      console.error('Error updating serial status:', error)
      alert('Có lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message))
    } finally {
      loading.value = false
    }
  } else {
    // Local serial (not saved yet), just update in array
    serial.trangThai = newStatus
  }
}

// Import from Excel
const importFromExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  console.log('🔵 Import Excel called:', { 
    fileName: file.name, 
    variantId: props.variant?.id,
    hasVariant: !!props.variant 
  })
  
  try {
    loading.value = true
    
    // Check if variant has ID (saved to DB) or is preview
    if (!props.variant?.id) {
      // Preview mode - parse file locally
      console.log('Preview mode: Parsing Excel/CSV file locally...')
      
      const serials = await parseExcelFileLocally(file)
      
      if (serials.length === 0) {
        alert('Không có serial number nào được tìm thấy trong file')
        event.target.value = ''
        return
      }
      
      // Add to local serials list
      serials.forEach(serial => {
        if (!localSerials.value.find(s => s.soSerial === serial)) {
          localSerials.value.push({
            id: null,
            soSerial: serial,
            trangThai: 1
          })
        }
      })
      
      alert(`Đã import thành công ${serials.length} serial number!`)
      event.target.value = ''
      
    } else {
      // Saved variant - call API
      console.log('Saved variant: Calling API to import serials...')
      console.log('🔵 File details:', { 
        name: file.name, 
        type: file.type, 
        size: file.size,
        lastModified: file.lastModified
      })
      
      // Read file content for debugging
      const fileContent = await file.text()
      console.log('🔵 File content (first 500 chars):', fileContent.substring(0, 500))
      console.log('🔵 File lines:', fileContent.split('\n').slice(0, 10))
      
      const response = await importSerialsFromExcel(props.variant.id, file)
      console.log('🔵 API Response:', response)
      console.log('🔵 Response.data:', response.data)
      console.log('🔵 Response.data type:', typeof response.data, Array.isArray(response.data))
      console.log('🔵 Full response object:', JSON.stringify(response, null, 2))
      
      // ✅ FIX: Handle different response formats
      let importedSerials = []
      if (Array.isArray(response.data)) {
        importedSerials = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        importedSerials = response.data.data
      } else if (response.data?.serials && Array.isArray(response.data.serials)) {
        importedSerials = response.data.serials
      }
      
      console.log('🔵 Imported serials:', importedSerials.length, importedSerials)
      
      // ✅ FALLBACK: If backend returns empty, try parsing locally
      if (importedSerials.length === 0) {
        console.warn('⚠️ Backend returned empty array, trying local parsing...')
        
        try {
          const localSerials = await parseExcelFileLocally(file)
          console.log('🔵 Locally parsed serials:', localSerials.length, localSerials)
          
          if (localSerials.length > 0) {
            // Save to backend using batch create
            const serialRequests = localSerials.map(serial => ({
              ctspId: props.variant.id,
              serialNo: serial,
              trangThai: 1
            }))
            
            console.log('🔵 Creating serials via batch API:', serialRequests)
            const batchResponse = await createSerialsBatch(serialRequests)
            console.log('🔵 Batch create response:', batchResponse)
            
            // Reload from API
            await loadSerials()
            
            alert(`✅ Đã import thành công ${localSerials.length} serial number (via local parsing)!`)
            event.target.value = ''
            return
          }
        } catch (localError) {
          console.error('❌ Local parsing also failed:', localError)
        }
        
        alert('Không có serial number nào được import. Vui lòng kiểm tra file có đúng format không:\n- CSV hoặc Excel\n- Có cột "Serial Number" hoặc "serialNo"\n- Mỗi serial 7 ký tự gồm chữ và số')
        event.target.value = ''
        return
      }
      
      // Add to local serials list
      importedSerials.forEach(serialResponse => {
        const newSerial = {
          id: serialResponse.id || serialResponse.serialId,
          soSerial: serialResponse.serialNo || serialResponse.soSerial || serialResponse.serial,
          trangThai: serialResponse.trangThai || 1
        }
        console.log('🔵 Adding serial:', newSerial)
        localSerials.value.push(newSerial)
      })
      
      // Reload from API to get latest data
      await loadSerials()
      
      alert(`Đã import thành công ${importedSerials.length} serial number!`)
      event.target.value = ''
    }
    
  } catch (error) {
    console.error('Error importing serials:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import serial'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// Parse Excel/CSV locally
const parseExcelFileLocally = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        console.log('🔵 Parsing file locally, content length:', text.length)
        const serials = []
        
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        console.log('🔵 Total lines:', lines.length, 'First 5 lines:', lines.slice(0, 5))
        
        // Smart header detection
        const firstLine = lines[0].toLowerCase()
        let serialColumnIndex = 0
        
        if (firstLine.includes('serial')) {
          // Has header - find which column has "serial"
          const headers = lines[0].split(/[,;\t]/).map(h => h.trim())
          serialColumnIndex = headers.findIndex(h => h.toLowerCase().includes('serial'))
          if (serialColumnIndex === -1) serialColumnIndex = 0
          console.log('🔵 Header detected, serial column index:', serialColumnIndex)
          lines.shift() // Remove header
        }
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const parts = line.split(/[,;\t]/).map(p => p.trim().replace(/^["']|["']$/g, '')).filter(p => p)
          
          if (parts.length > serialColumnIndex) {
            const serial = parts[serialColumnIndex]
            // ✅ FIX: Accept 5-20 characters (more flexible)
            if (serial.length >= 5 && serial.length <= 20 && /^[A-Za-z0-9]+$/.test(serial)) {
              console.log('🔵 Valid serial found:', serial)
              serials.push(serial)
            } else {
              console.warn('⚠️ Invalid serial skipped:', serial, 'length:', serial.length)
            }
          }
        }
        
        console.log('🔵 Parsed serials:', serials.length, serials)
        resolve(serials)
      } catch (error) {
        console.error('❌ Parse error:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Không thể đọc file'))
    }
    
    reader.readAsText(file)
  })
}

// Download template
const downloadExcelTemplate = () => {
  const csv = `Serial Number
ABC1234
DEF5678
GHI9012
JKL3456
MNO7890
PQR1234
STU5678
VWX9012
YZA3456
BCD7890`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'serial_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Save serials
const handleSave = async () => {
  if (!props.variant) return
  
  try {
    loading.value = true
    
    // If variant has ID, save to DB
    if (props.variant.id) {
      const serialRequests = localSerials.value.map(serial => ({
        ctspId: props.variant.id,
        serialNo: serial.soSerial,
        trangThai: serial.trangThai || 1
      }))
      
      await createSerialsBatch(serialRequests)
      alert('Lưu serial thành công!')
    }
    
    // Emit save event with updated serials
    emit('save', {
      variantId: props.variant.id,
      serials: localSerials.value
    })
    
    handleClose()
    
  } catch (error) {
    console.error('Error saving serials:', error)
    alert('Có lỗi khi lưu serial')
  } finally {
    loading.value = false
  }
}

// Close modal
const handleClose = () => {
  emit('update:modelValue', false)
}

// Helper functions
const getVariantSpecs = () => {
  if (!props.variant) return 'N/A'
  const specs = []
  if (props.variant.tenCpu) specs.push(props.variant.tenCpu)
  if (props.variant.tenRam) specs.push(props.variant.tenRam)
  if (props.variant.tenGpu) specs.push(props.variant.tenGpu)
  if (props.variant.dungLuongOCung) specs.push(props.variant.dungLuongOCung)
  return specs.join(' | ') || 'N/A'
}

const formatCurrency = (price) => {
  if (!price) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const getUnsavedSerialsCount = () => {
  return localSerials.value.filter(s => !s.id).length
}

const getSaveButtonText = () => {
  const unsavedCount = getUnsavedSerialsCount()
  if (unsavedCount > 0) {
    return `Lưu (${unsavedCount} mới)`
  }
  return 'Lưu'
}
</script>

<style scoped>
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998 !important;
}

.modal {
  z-index: 9999 !important;
  position: fixed !important;
}

.modal-dialog {
  z-index: 10000 !important;
  position: relative;
}

.modal-content {
  z-index: 10001 !important;
  position: relative;
  background: white;
}

.serial-management-container {
  padding: 1rem 0;
}

.variant-info-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.info-item {
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.serial-list-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.serial-table {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.serial-table thead {
  background-color: #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.serial-table th {
  font-weight: 600;
  color: #4b5563;
  padding: 0.75rem 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.serial-table td {
  padding: 0.75rem 0.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #f3f4f6;
}

.serial-table tbody tr:hover {
  background-color: #f9fafb;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
</style>
