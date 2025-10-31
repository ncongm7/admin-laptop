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
                Có thể nhập nhiều, cách nhau bằng dấu phẩy (,) hoặc chấm phẩy (;). Mỗi serial phải có đúng 7 ký tự gồm chữ và số (VD: ABC1234).
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
import { getSerialsByCtspId, createSerialsBatch, importSerialsFromExcel, updateSerial, updateSerialStatus, deleteSerial } from '@/service/sanpham/SanPhamService'

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
  const activeCount = localSerials.value.filter(s => s.trangThai === 1).length
  console.log('🔵 Stock count updated:', {
    totalSerials: localSerials.value.length,
    activeSerials: activeCount,
    hiddenSerials: localSerials.value.length - activeCount
  })
  return activeCount
})

// Watch for variant changes to load serials
watch(() => props.variant, async (newVariant) => {
  console.log('🔵 Variant changed:', newVariant)
  console.log('🔵 Variant ID:', newVariant?.id)
  console.log('🔵 Modal visible:', props.modelValue)
  
  if (newVariant?.id) {
    await loadSerials()
  } else {
    console.log('🔵 No variant ID, clearing localSerials')
    localSerials.value = []
  }
}, { immediate: true })

// Watch for modal open/close to reload serials
watch(() => props.modelValue, async (isVisible, wasVisible) => {
  console.log('🔵 Modal visibility changed:', { isVisible, wasVisible })
  
  // When modal opens, reload serials
  if (isVisible && !wasVisible) {
    console.log('🔵 Modal opened - loading serials...')
    if (props.variant?.id) {
      await loadSerials()
    }
  }
  
  // When modal closes, reset validation state
  if (!isVisible && wasVisible) {
    console.log('🔵 Modal closed - resetting state')
    serialInput.value = ''
    validationError.value = ''
    validationSuccess.value = false
  }
})

// Load serials from API or use existing data
const loadSerials = async () => {
  if (!props.variant) {
    console.log('⚠️ No variant provided')
    return
  }
  
  console.log('🔄 Loading serials for variant:', props.variant.id || 'preview')
  
  // If variant has ID, always load from API for fresh data
  if (props.variant.id) {
    try {
      console.log('🔵 Loading serials from API for variant:', props.variant.id)
      const response = await getSerialsByCtspId(props.variant.id)
      const backendSerials = response.data || []
      console.log('✅ Backend serials received:', backendSerials.length, 'serials')
      
      if (backendSerials.length > 0) {
        console.log('🔵 First serial example:', backendSerials[0])
      }
      
      localSerials.value = backendSerials.map(serial => ({
        id: serial.id,
        soSerial: serial.serialNo || serial.soSerial,
        trangThai: serial.trangThai // Don't use default, use actual value from backend
      }))
      originalSerials.value = JSON.parse(JSON.stringify(localSerials.value)) // Deep copy
      
      console.log('✅ Local serials updated - total:', localSerials.value.length)
    } catch (error) {
      console.error('❌ Error loading serials:', error)
      localSerials.value = []
      originalSerials.value = []
    }
  } else if (props.variant.serials && Array.isArray(props.variant.serials)) {
    // Preview mode - use prop data
    console.log('🔵 Using preview serials from props:', props.variant.serials.length)
    localSerials.value = [...props.variant.serials]
    originalSerials.value = JSON.parse(JSON.stringify(props.variant.serials)) // Deep copy
  } else {
    // New variant - empty serials
    console.log('🔵 New variant - empty serials')
    localSerials.value = []
    originalSerials.value = []
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
      validationError.value = `Serial không hợp lệ: ${invalidSerials.join(', ')} (phải có đúng 7 ký tự gồm chữ và số)`
    } else {
      validationSuccess.value = true
    }
  }
}

// Add serials with duplicate detection
const addSerialNumbers = () => {
  const serials = serialInput.value.split(/[,;]/).map(s => s.trim().toUpperCase()).filter(s => s)
  
  // Validate format first
  const invalidSerials = serials.filter(s => s.length !== 7 || !/^[A-Za-z0-9]+$/.test(s))
  if (invalidSerials.length > 0) {
    validationError.value = `❌ Serial không hợp lệ: ${invalidSerials.join(', ')}\n\nYêu cầu: Đúng 7 ký tự gồm chữ và số (VD: ABC1234)`
    alert(validationError.value)
    return
  }
  
  // Check for duplicates
  const existingSerials = localSerials.value.map(s => s.soSerial.toUpperCase())
  const duplicateSerials = []
  const newSerials = []
  
  serials.forEach(serial => {
    if (existingSerials.includes(serial)) {
      duplicateSerials.push(serial)
    } else {
      newSerials.push(serial)
      localSerials.value.push({
        id: null,
        soSerial: serial,
        trangThai: 1
      })
    }
  })
  
  // Clear input and validation state
  serialInput.value = ''
  validationError.value = ''
  validationSuccess.value = false
  
  // Show detailed results
  if (newSerials.length === 0 && duplicateSerials.length > 0) {
    // All duplicates
    const duplicateList = duplicateSerials.slice(0, 10).join(', ')
    const moreCount = duplicateSerials.length > 10 ? ` và ${duplicateSerials.length - 10} serial khác` : ''
    alert(`❌ Không thể thêm serial!\n\n🔴 Tất cả ${duplicateSerials.length} serial đã tồn tại:\n${duplicateList}${moreCount}\n\n💡 Mỗi serial chỉ có thể thêm 1 lần duy nhất.`)
  } else if (newSerials.length > 0 && duplicateSerials.length > 0) {
    // Mixed: some new, some duplicates
    const duplicateList = duplicateSerials.slice(0, 5).join(', ')
    const moreCount = duplicateSerials.length > 5 ? ` và ${duplicateSerials.length - 5} serial khác` : ''
    alert(`⚠️ Thêm một phần thành công!\n\n✅ Đã thêm: ${newSerials.length} serial mới\n🔴 Bị trùng: ${duplicateSerials.length} serial\n\nSerial trùng: ${duplicateList}${moreCount}\n\n💡 Serial trùng đã bỏ qua, chỉ thêm serial mới.`)
  } else if (newSerials.length > 0) {
    // All new
    alert(`✅ Thành công!\n\nĐã thêm ${newSerials.length} serial mới vào danh sách.\n\n💡 Nhớ nhấn nút "Lưu" để lưu vào database.`)
  }
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
  console.log('🔵 toggleSerialStatus called with index:', index)
  console.log('🔵 localSerials.value length:', localSerials.value.length)
  
  const serial = localSerials.value[index]
  if (!serial) {
    console.error('❌ Serial not found at index:', index)
    return
  }
  
  console.log('🔵 Found serial:', serial)
  const newStatus = serial.trangThai === 1 ? 0 : 1
  
  console.log('🔵 Toggling serial status:', { 
    serialId: serial.id, 
    serialNo: serial.soSerial,
    variantId: props.variant?.id, 
    currentStatus: serial.trangThai, 
    newStatus 
  })
  
  // If serial has ID (saved in DB), call API to update
  if (serial.id && props.variant?.id) {
    try {
      loading.value = true
      
      console.log('🔵 Calling updateSerialStatus API...')
      await updateSerialStatus(serial.id, newStatus)
      
      console.log('✅ Serial status updated successfully')
      
      // Reload serials to get fresh data from backend
      console.log('🔵 About to reload serials...')
      await loadSerials()
      
      console.log('✅ Serials reloaded from backend')
      console.log('🔵 Current localSerials after reload:', localSerials.value)
      
      // Force reactivity update
      localSerials.value = [...localSerials.value]
      
      // Emit save event to update parent component's stock count
      emit('save', {
        variantId: props.variant.id,
        serials: localSerials.value || []
      })
      
      alert(`Đã chuyển trạng thái serial sang "${newStatus === 1 ? 'Có sẵn' : 'Ẩn'}"`)
    } catch (error) {
      console.error('Error updating serial status:', error)
      alert('Có lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message))
    } finally {
      loading.value = false
    }
  } else {
    // Local serial (not saved yet), just update in array
    console.log('🔵 Updating local serial status...')
    
    // ✅ Update using index to ensure proper reactivity
    localSerials.value[index].trangThai = newStatus
    // Force trigger reactivity by creating new array reference
    localSerials.value = [...localSerials.value]
    
    console.log('✅ Local serial status updated')
    
    // ✅ Emit save event to update parent component's stock count immediately
    emit('save', {
      variantId: props.variant?.id,
      serials: localSerials.value || []
    })
    
    alert(`Đã chuyển trạng thái serial sang "${newStatus === 1 ? 'Có sẵn' : 'Ẩn'}"`)
  }
}

// Import from Excel
const importFromExcel = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  console.log('🔵 Import Excel called:', { 
    fileName: file.name, 
    fileType: file.type,
    fileSize: file.size,
    variantId: props.variant?.id,
    hasVariant: !!props.variant 
  })
  
  // Validate file type
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
  
  if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.xlsx')) {
    alert('Vui lòng chọn file CSV hoặc Excel (.csv, .xlsx)')
    event.target.value = ''
    return
  }
  
  try {
    loading.value = true
    
    // Always parse locally for better control
    console.log('Parsing file locally...')
    
    const serials = await parseExcelFileLocally(file)
    console.log('🔵 Parsed serials:', serials)
    
    if (serials.length === 0) {
      alert('Không có serial number nào được tìm thấy trong file.\n\nVui lòng đảm bảo:\n• File CSV hoặc Excel\n• Có cột "Serial Number" hoặc serial ở cột đầu tiên\n• Mỗi serial có đúng 7 ký tự gồm chữ và số\n• Ví dụ: ABC1234, DEF5678\n\nHãy tải file mẫu để tham khảo format đúng.')
      event.target.value = ''
      return
    }
    
    // Check for duplicates - ONLY classify, DON'T add to localSerials yet
    const existingSerials = localSerials.value.map(s => s.soSerial.toUpperCase())
    const duplicateSerials = []
    const newSerials = []
    
    serials.forEach(serial => {
      const serialUpper = serial.toUpperCase()
      if (existingSerials.includes(serialUpper)) {
        duplicateSerials.push(serial)
      } else {
        // Check if not duplicate within the same import batch
        if (!newSerials.map(s => s.toUpperCase()).includes(serialUpper)) {
          newSerials.push(serial)
        }
      }
    })
    
    console.log(`📊 Import check results: ${newSerials.length} new, ${duplicateSerials.length} duplicates`)
    
    // If ALL are duplicates, stop here - DON'T add to table
    if (newSerials.length === 0 && duplicateSerials.length > 0) {
      const duplicateList = duplicateSerials.slice(0, 15).join('\n')
      const moreText = duplicateSerials.length > 15 ? `\n... và ${duplicateSerials.length - 15} serial khác` : ''
      alert(`✖ Không thể thêm serial!\n\n🔴 Tất cả ${duplicateSerials.length} serial đã tồn tại:\n${duplicateList}${moreText}\n\n💡 Mỗi serial chỉ có thể thêm 1 lần duy nhất.`)
      event.target.value = ''
      loading.value = false
      return // ⛔ STOP - Don't add anything to table
    }
    
    // If variant is saved to DB, also save serials to backend
    if (props.variant?.id) {
      try {
        console.log('Saving serials to backend using import API...')
        
        // Use the import API for better handling
        const response = await importSerialsFromExcel(props.variant.id, file)
        console.log('✅ Import API response:', response)
        
        // Handle both old and new response formats
        let importedSerials = []
        let importCount = 0
        
        if (response.data?.success) {
          // New structured response format
          importedSerials = response.data.data || []
          importCount = response.data.count || importedSerials.length
          console.log('✅ New format - imported count:', importCount)
        } else if (Array.isArray(response.data)) {
          // Old format - direct array
          importedSerials = response.data
          importCount = importedSerials.length
          console.log('✅ Old format - imported count:', importCount)
        }
        
        // Always reload from backend to ensure consistency
        await loadSerials()
        console.log('✅ Reloaded serials from backend after import')
        
        // Show clear success message and emit only if successful
        if (importCount > 0 && duplicateSerials.length === 0) {
          // All imported successfully
          alert(`✅ Import thành công!\n\n🟢 Đã thêm ${importCount} serial mới.\n\n💡 Tổng serial hiện tại: ${localSerials.value.length}`)
          
          // ✅ Emit to close modal and refresh parent
          emit('save', {
            variantId: props.variant.id,
            serials: localSerials.value
          })
        } else if (importCount > 0 && duplicateSerials.length > 0) {
          // Partial success - had duplicates
          const duplicateList = duplicateSerials.slice(0, 15).join('\n')
          const moreText = duplicateSerials.length > 15 ? `\n... và ${duplicateSerials.length - 15} serial khác` : ''
          alert(`⚠️ Import một phần thành công!\n\n🟢 Đã thêm: ${importCount} serial mới\n🔴 Đã bỏ qua: ${duplicateSerials.length} serial trùng\n\nSerial bị trùng:\n${duplicateList}${moreText}\n\n💡 Mỗi serial chỉ có thể thêm 1 lần duy nhất.`)
          
          // ✅ Emit even with partial success to update parent
          emit('save', {
            variantId: props.variant.id,
            serials: localSerials.value
          })
        } else if (importCount === 0 && duplicateSerials.length > 0) {
          // All duplicates - DON'T emit, keep modal open
          const duplicateList = duplicateSerials.slice(0, 15).join('\n')
          const moreText = duplicateSerials.length > 15 ? `\n... và ${duplicateSerials.length - 15} serial khác` : ''
          alert(`✖ Không thể thêm serial!\n\n🔴 Tất cả ${duplicateSerials.length} serial đã tồn tại:\n${duplicateList}${moreText}\n\n💡 Mỗi serial chỉ có thể thêm 1 lần duy nhất.`)
          // ⛔ DON'T emit - keep modal open for user to add more serials
          console.log('⚠️ All duplicates - modal stays open')
        } else {
          alert('⚠️ Không tìm thấy serial mới trong file.\n\n💡 Vui lòng kiểm tra file có đúng format.')
          // ⛔ No new serials - keep modal open
        }
        
      } catch (error) {
        console.error('❌ Error using import API:', error)
        
        // Extract error message from response
        let errorMessage = 'Có lỗi khi import serial'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        alert(`✖ Import thất bại!\n\n🔴 Lỗi: ${errorMessage}\n\n💡 Vui lòng kiểm tra file và thử lại.`)
        // ⛔ DON'T emit on error - keep modal open
        // ⛔ DON'T add to localSerials - keep table clean
      }
    }
    
    // Preview mode - variant not saved yet
    // ONLY add to localSerials if there are new serials
    if (!props.variant?.id && newSerials.length > 0) {
      // Add new serials to local list for preview
      newSerials.forEach(serial => {
        localSerials.value.push({
          id: null,
          soSerial: serial,
          trangThai: 1
        })
      })
      
      // Force trigger reactivity
      localSerials.value = [...localSerials.value]
      
      if (duplicateSerials.length === 0) {
        alert(`✅ Thành công!\n\n🟢 Đã thêm ${newSerials.length} serial vào preview.\n\n💡 Lưu sản phẩm để lưu serial vào database.`)
      } else {
        const duplicateList = duplicateSerials.slice(0, 10).join('\n')
        const moreText = duplicateSerials.length > 10 ? `\n... và ${duplicateSerials.length - 10} serial khác` : ''
        alert(`⚠️ Thêm một phần thành công!\n\n🟢 Thêm mới: ${newSerials.length} serial\n🔴 Bỏ qua: ${duplicateSerials.length} serial trùng\n\nSerial trùng:\n${duplicateList}${moreText}\n\n💡 Lưu sản phẩm để lưu ${newSerials.length} serial mới.`)
      }
    }
    
    event.target.value = ''
    
    // NOTE: emit 'save' is now handled inside success blocks above
    // Only emit when there are new serials successfully added
    // DON'T emit when all duplicates or errors - keep modal open
    
  } catch (error) {
    console.error('Error importing serials:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import serial'
    alert(errorMessage)
    // ⛔ DON'T emit on error - keep modal open
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
        
        // Enhanced header detection
        const firstLine = lines[0].toLowerCase()
        let serialColumnIndex = 0
        let hasHeader = false
        
        // Check for various header patterns
        if (firstLine.includes('serial') || firstLine.includes('stt') || firstLine.includes('number')) {
          hasHeader = true
          const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase())
          console.log('🔵 Headers found:', headers)
          
          // Find serial column by various names
          serialColumnIndex = headers.findIndex(h => 
            h.includes('serial') || 
            h.includes('number') || 
            h === 'stt' ||
            h.includes('so')
          )
          
          if (serialColumnIndex === -1) {
            // If no specific header found, use first column
            serialColumnIndex = 0
          }
          
          console.log('🔵 Header detected, serial column index:', serialColumnIndex, 'header:', headers[serialColumnIndex])
          lines.shift() // Remove header
        } else {
          console.log('🔵 No header detected, assuming first column contains serials')
        }
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const parts = line.split(/[,;\t]/).map(p => p.trim().replace(/^["']|["']$/g, '')).filter(p => p)
          
          console.log(`🔵 Processing line ${i + 1}:`, line)
          console.log('🔵 Parts after split:', parts)
          
          if (parts.length > serialColumnIndex) {
            const serial = parts[serialColumnIndex].toUpperCase() // Convert to uppercase for consistency
            console.log(`🔵 Checking serial: "${serial}" (length: ${serial.length})`)
            
            // ✅ Enhanced validation with detailed logging
            if (serial.length === 7 && /^[A-Za-z0-9]+$/.test(serial)) {
              console.log('✅ Valid serial found:', serial)
              serials.push(serial)
            } else {
              console.warn('❌ Invalid serial skipped:', {
                serial: serial,
                length: serial.length,
                expected: 'exactly 7 characters',
                isAlphanumeric: /^[A-Za-z0-9]+$/.test(serial),
                line: i + 1
              })
            }
          } else {
            console.warn(`⚠️ Line ${i + 1} has insufficient columns:`, parts.length, 'needed:', serialColumnIndex + 1)
          }
        }
        
        // ✅ Fallback: If no serials found, try parsing each line as a single serial
        if (serials.length === 0) {
          console.log('🔵 No serials found with column parsing, trying fallback method...')
          
          const allLines = text.split(/\r?\n/).filter(line => line.trim())
          for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i].trim().toUpperCase()
            
            // Skip obvious header lines
            if (line.toLowerCase().includes('serial') || line.toLowerCase().includes('number')) {
              continue
            }
            
            // Try to extract serial from the entire line
            const potentialSerial = line.replace(/[^A-Z0-9]/g, '') // Remove all non-alphanumeric
            
            if (potentialSerial.length === 7 && /^[A-Za-z0-9]+$/.test(potentialSerial)) {
              console.log('✅ Fallback method found serial:', potentialSerial)
              serials.push(potentialSerial)
            }
          }
        }
        
        console.log('🔵 Final parsed serials:', serials.length, serials)
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
BCD7890
EFG1234
HIJ5678
KLM9012`
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

// Debug function for testing
const debugSerialModal = () => {
  console.log('🔧 Serial Modal Debug Info:')
  console.log('- props.variant:', props.variant)
  console.log('- localSerials.value:', localSerials.value)
  console.log('- stockCount.value:', stockCount.value)
  console.log('- loading.value:', loading.value)
  
  if (localSerials.value.length > 0) {
    console.log('- First serial:', localSerials.value[0])
    console.log('- Serial statuses:', localSerials.value.map(s => ({ serial: s.soSerial, status: s.trangThai, id: s.id })))
    console.log('- Serials with ID (saved):', localSerials.value.filter(s => s.id))
    console.log('- Serials without ID (new):', localSerials.value.filter(s => !s.id))
  }
  
  // Test save function
  console.log('🔧 Testing save logic:')
  if (props.variant?.id) {
    const newSerials = localSerials.value.filter(serial => !serial.id)
    console.log('- New serials to save:', newSerials)
  }
}

// Test import function
const testImportLogic = () => {
  console.log('🔧 Testing Import Logic:')
  console.log('- props.variant:', props.variant)
  console.log('- localSerials.value:', localSerials.value)
  
  if (props.variant?.id) {
    const existingSerials = localSerials.value.filter(s => s.id).map(s => s.soSerial)
    console.log('- Existing serials with ID:', existingSerials)
    
    // Simulate some test serials
    const testSerials = ['TEST001', 'TEST002', 'ABC1234']
    const newSerials = testSerials.filter(serial => !existingSerials.includes(serial))
    console.log('- Test serials:', testSerials)
    console.log('- New serials that would be saved:', newSerials)
  }
}

// Expose debug functions to window for easy testing
if (typeof window !== 'undefined') {
  window.debugSerialModal = debugSerialModal
  window.testImportLogic = testImportLogic
}

// Save serials
const handleSave = async () => {
  if (!props.variant) return
  
  try {
    loading.value = true
    
    // If variant has ID, save only new serials to DB
    if (props.variant.id) {
      // Only save serials that don't have ID (new serials)
      const newSerials = localSerials.value.filter(serial => !serial.id)
      
      if (newSerials.length > 0) {
        const serialRequests = newSerials.map(serial => ({
          ctspId: props.variant.id,
          serialNo: serial.soSerial,
          trangThai: serial.trangThai || 1
        }))
        
        console.log('Saving new serials to DB:', serialRequests)
        const response = await createSerialsBatch(serialRequests)
        
        // Update local serials with IDs from response instead of reloading
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((createdSerial, index) => {
            const localSerial = newSerials[index]
            if (localSerial) {
              localSerial.id = createdSerial.id
              console.log(`✅ Updated serial ${localSerial.soSerial} with ID: ${createdSerial.id}`)
            }
          })
        }
        
        alert(`Lưu thành công ${newSerials.length} serial mới!`)
      } else {
        alert('Không có serial mới để lưu!')
      }
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
