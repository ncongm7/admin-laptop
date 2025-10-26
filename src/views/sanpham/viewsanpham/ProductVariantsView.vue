<!-- // Update ProductVariantsView.vue to fetch variants from API -->

<!-- Update ProductVariantsView.vue template -->
<template>
  <div class="product-variants-view">
    <!-- Debug Info (remove in production) -->
    <div class="debug-info mb-2" v-if="showDebug">
      <small class="text-muted">
        Debug: CPUs({{ productStore.cpus.length }}), RAMs({{ productStore.rams.length }}), 
        GPUs({{ productStore.gpus.length }}), Colors({{ productStore.colors.length }}), 
        Storages({{ productStore.storages.length }}), Screens({{ productStore.screens.length }})
      </small>
    </div>

    <!-- Filter Section -->
    <div class="filter-card mb-4">
      <div class="filter-header">
        <h5 class="filter-title">Bộ lọc biến thể</h5>
        <a href="#" class="clear-filters-link" @click.prevent="clearFilters">
          <i class="bi bi-funnel"></i> Xóa toàn bộ bộ lọc
        </a>
      </div>
      <div class="filter-content">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">CPU</label>
            <select class="form-select" v-model="filters.cpu">
              <option value="">Tất cả</option>
              <option v-if="productStore.cpus.length === 0" disabled>Đang tải...</option>
              <option v-for="c in productStore.cpus" :key="c.id" :value="c.tenCpu">{{ c.tenCpu }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">RAM</label>
            <select class="form-select" v-model="filters.ram">
              <option value="">Tất cả</option>
              <option v-if="productStore.rams.length === 0" disabled>Đang tải...</option>
              <option v-for="r in productStore.rams" :key="r.id" :value="r.tenRam">{{ r.tenRam }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">GPU</label>
            <select class="form-select" v-model="filters.gpu">
              <option value="">Tất cả</option>
              <option v-if="productStore.gpus.length === 0" disabled>Đang tải...</option>
              <option v-for="g in productStore.gpus" :key="g.id" :value="g.tenGpu">{{ g.tenGpu }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Màu sắc</label>
            <select class="form-select" v-model="filters.color">
              <option value="">Tất cả</option>
              <option v-if="productStore.colors.length === 0" disabled>Đang tải...</option>
              <option v-for="c in productStore.colors" :key="c.id" :value="c.tenMau">
                <span class="color-option">
                  {{ c.tenMau }} {{ c.hexCode ? `(${c.hexCode})` : '' }}
                </span>
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Ổ cứng</label>
            <select class="form-select" v-model="filters.storage">
              <option value="">Tất cả</option>
              <option v-if="productStore.storages.length === 0" disabled>Đang tải...</option>
              <option v-for="s in productStore.storages" :key="s.id" :value="s.dungLuong">{{ s.dungLuong }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Màn hình</label>
            <select class="form-select" v-model="filters.screen">
              <option value="">Tất cả</option>
              <option v-if="productStore.screens.length === 0" disabled>Đang tải...</option>
              <option v-for="sc in productStore.screens" :key="sc.id" :value="sc.kichThuoc">{{ sc.kichThuoc }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Giá từ</label>
            <input 
              type="number" 
              class="form-control" 
              placeholder="Giá tối thiểu"
              v-model.number="filters.minPrice"
              :min="0"
              :max="maxPrice || 100000000"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Giá đến</label>
            <input 
              type="number" 
              class="form-control" 
              placeholder="Giá tối đa"
              v-model.number="filters.maxPrice"
              :min="filters.minPrice || 0"
              :max="maxPrice || 100000000"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Variants List Section -->
    <div class="variants-list-section">
      <div class="list-header d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
          <h5 class="mb-0">Danh sách biến thể</h5>
          <span class="badge bg-success">{{ variantsList.length }}</span>
        </div>
        <div class="search-box">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Tìm theo sku, tên sản phẩm, CPU, RAM, GPU..."
              v-model="searchQuery" 
            />
            <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Variants Table -->
      <div class="table-responsive">
        <table class="table table-hover align-middle variants-table">
          <thead class="table-light">
            <tr>
              <th width="25" class="text-center">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              </th>
              <th width="30">STT</th>
              <th width="60">ẢNH</th>
              <th width="100">SKU</th>
              <th width="60">MÀU</th>
              <th width="80">CPU</th>
              <th width="60">RAM</th>
              <th width="70">GPU</th>
              <th width="70">MÀN HÌNH</th>
              <th width="50">PIN</th>
              <th width="70">Ổ CỨNG</th>
              <th width="75">GIÁ BÁN</th>
              <th width="60">SỐ LƯỢNG TỒN</th>
              <th width="65">TRẠNG THÁI</th>
              <th width="70">NGÀY TẠO</th>
              <th width="70">NGÀY CẬP NHẬT</th>
              <th width="60">TÁC VỤ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="17" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="variantsList.length === 0">
              <td colspan="17" class="text-center py-5 text-muted">
                <i class="bi bi-box-seam display-5"></i>
                <p class="mt-3">Không có biến thể nào</p>
              </td>
            </tr>
            <tr v-for="(variant, index) in paginatedVariants" :key="variant.id">
              <td class="text-center">
                <input type="checkbox" v-model="selectedVariants" :value="variant.id" />
              </td>
              <td>{{ (currentPage * pageSize) + index + 1 }}</td>
              <td>
                <div class="variant-image-cell">
                  <img 
                    v-if="variant.images && variant.images.length > 0"
                    :src="getVariantImageUrl(variant)"
                    :alt="variant.maCtsp"
                    class="variant-thumbnail"
                    @error="handleImageError"
                  />
                  <div v-else class="no-image-placeholder">
                    <i class="bi bi-image"></i>
                  </div>
                </div>
              </td>
              <td>
                <code class="sku-code">{{ variant.maCtsp }}</code>
              </td>
              <td>
                <div class="color-display" v-if="variant.mauSac">
                  <div class="d-flex align-items-center">
                    <span 
                      v-if="variant.mauSac.hexCode" 
                      class="color-preview me-2" 
                      :style="{ backgroundColor: variant.mauSac.hexCode }"
                      :title="variant.mauSac.hexCode"
                    ></span>
                    <div class="color-info">
                      <div class="color-name">{{ variant.mauSac?.tenMau }}</div>
                      <div v-if="variant.mauSac.hexCode" class="color-hex">{{ variant.mauSac.hexCode }}</div>
                    </div>
                  </div>
                </div>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ variant.tenCpu || 'N/A' }}</td>
              <td>{{ variant.tenRam || 'N/A' }}</td>
              <td>{{ variant.tenGpu || 'N/A' }}</td>
              <td>{{ variant.kichThuocManHinh || 'N/A' }}</td>
              <td>{{ variant.dungLuongPin || 'N/A' }}</td>
              <td>{{ variant.dungLuongOCung || 'N/A' }}</td>
              <td>
                <span class="price-text">{{ formatCurrency(variant.giaBan) }}</span>
              </td>
              <td>
                <div class="stock-info">
                  <span :class="stockStatusClass(variant.soLuongTon)">{{ variant.soLuongTon || 0 }}</span>
                  <small class="text-muted d-block">có sẵn</small>
                </div>
              </td>
              <td>
                <span :class="statusClass(variant.trangThai)" class="badge">
                  {{ variant.trangThai === 1 ? 'Hoạt động' : 'Ẩn' }}
                </span>
              </td>
              <td>{{ formatDate(variant.createdAt) || 'N/A' }}</td>
              <td>{{ formatDate(variant.updatedAt) || 'N/A' }}</td>
              <td class="text-center actions-column">
                <div class="btn-group btn-group-sm" role="group">
                  <button 
                    type="button" 
                    class="btn btn-outline-info btn-sm" 
                    @click="openSerialModal(variant)" 
                    title="Quản lý serial"
                  >
                    <i class="bi bi-list-ol"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm" 
                    @click="editVariant(variant)" 
                    title="Chỉnh sửa"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-danger btn-sm" 
                    @click="deleteVariant(variant)" 
                    title="Xóa biến thể"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedVariants.length > 0" class="bulk-actions mt-3 p-3 bg-light rounded">
      <div class="d-flex align-items-center gap-3">
        <span class="fw-semibold">{{ selectedVariants.length }} biến thể đã chọn</span>
        <button class="btn btn-outline-danger btn-sm" @click="bulkDelete">
          <i class="bi bi-trash"></i> Xóa hàng loạt
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper mt-4" v-if="!loading && totalElements > 0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="pagination-info">
          <span class="text-muted">
            Hiển thị {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} 
            trong tổng số {{ totalElements }} biến thể
          </span>
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)" 
                 :tabindex="currentPage === 0 ? -1 : 0">Trước</a>
            </li>
            <li v-for="page in visiblePages" :key="page" 
                class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link green-pagination" href="#" @click.prevent="goToPage(page)">{{ page + 1 }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
              <a class="page-link green-pagination" href="#" @click.prevent="goToPage(currentPage + 1)"
                 :tabindex="currentPage >= totalPages - 1 ? -1 : 0">Tiếp</a>
            </li>
          </ul>
        </nav>
        <div class="page-size-selector">
          <select class="form-select form-select-sm" v-model="pageSize" @change="changePageSize">
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
          </select>
        </div>
      </div>
    </div>

  </div>

  <!-- Edit Variant Modal -->
  <VariantEditModal 
    ref="editModal"
    @updated="handleVariantUpdated"
  />

  <!-- Serial Management Modal -->
  <SerialManagementModal 
    v-model="showSerialModal"
    :variant="currentVariant"
    @save="handleSerialSaved"
  />

  <!-- Simple Test Modal -->
  <div class="modal fade" id="testModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Test Modal</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <p>This is a test modal to check if Bootstrap is working.</p>
          <p>Variant ID: {{ selectedVariantForEdit?.id }}</p>
          <p>Variant Code: {{ selectedVariantForEdit?.maCtsp }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { formatCurrency } from '@/utils/helpers'
import { formatDate } from '@/utils/dateUtils'
import { useProductStore } from '@/stores/productStore'
import VariantEditModal from '@/components/sanpham/quanlisanpham/VariantEditModal.vue'
import SerialManagementModal from '@/components/sanpham/quanlisanpham/SerialManagementModal.vue'

const productStore = useProductStore()

const loading = computed(() => productStore.variantsLoading)
const variants = computed(() => productStore.variants)

// Pagination state
const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

const searchQuery = ref('')
const selectedVariants = ref([])
const selectAll = ref(false)
const showDebug = ref(false) // Set to false in production
const maxPrice = ref(100000000) // Dynamic max price

// Modal refs
const editModal = ref(null)
const selectedVariantForEdit = ref(null)

// Serial modal state
const showSerialModal = ref(false)
const currentVariant = ref(null)

const filters = ref({
  cpu: '',
  ram: '',
  gpu: '',
  color: '',
  storage: '',
  screen: '',
  minPrice: null,
  maxPrice: null,
})

// debounce + trigger fetch
let debounceTimer = null
const triggerFetch = () => {
  return new Promise((resolve) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const response = await productStore.fetchFilteredVariants({
          keyword: searchQuery.value?.trim() || null,
          cpu: filters.value.cpu || null,
          ram: filters.value.ram || null,
          gpu: filters.value.gpu || null,
          color: filters.value.color || null,
          storage: filters.value.storage || null,
          screen: filters.value.screen || null,
          minPrice: filters.value.minPrice || null,
          maxPrice: filters.value.maxPrice || null,
        }, currentPage.value, pageSize.value)
        
        // Update pagination info if response contains pagination data
        if (response && typeof response === 'object' && response.totalElements !== undefined) {
          totalElements.value = response.totalElements
          totalPages.value = response.totalPages
        } else {
          totalElements.value = variants.value.length
          totalPages.value = Math.ceil(totalElements.value / pageSize.value)
        }
        resolve(response)
      } catch (err) {
        console.error('Error fetching variants:', err)
        resolve(null)
      }
    }, 300)
  })
}


// Initialize variants when component mounts
onMounted(async () => {
  try {
    // Load attributes first
    await productStore.loadAttributes()
    if (showDebug.value) {
      console.log('Attributes loaded')
      console.log('CPUs:', productStore.cpus.length)
      console.log('RAMs:', productStore.rams.length)
      console.log('GPUs:', productStore.gpus.length)
      console.log('Colors:', productStore.colors.length)
      console.log('Storages:', productStore.storages.length)
      console.log('Screens:', productStore.screens.length)
    }
    
    // Then fetch variants
    await triggerFetch()
    
    // Calculate and set max price after data is loaded
    nextTick(() => {
      maxPrice.value = calculateMaxPrice()
      if (!filters.value.maxPrice) {
        filters.value.maxPrice = maxPrice.value
      }
    })
  } catch (err) {
    console.error('Error initializing component:', err)
  }
})

// watch changes to auto-fetch
watch([
  searchQuery, 
  () => filters.value.cpu, 
  () => filters.value.ram, 
  () => filters.value.gpu, 
  () => filters.value.color, 
  () => filters.value.storage, 
  () => filters.value.screen, 
  () => filters.value.minPrice,
  () => filters.value.maxPrice
], () => {
  currentPage.value = 0 // Reset to first page when filters change
  triggerFetch()
})

const variantsList = computed(() => variants.value || [])

// Calculate max price from variants
const calculateMaxPrice = () => {
  try {
    if (!variantsList.value || !variantsList.value.length) return 100000000
    const prices = variantsList.value
      .filter(v => v && v.trangThai === 1 && v.giaBan) // Only active variants with price
      .map(v => Number(v.giaBan))
      .filter(price => !isNaN(price) && price > 0) // Filter out invalid prices
    
    if (prices.length === 0) return 100000000
    const calculatedMax = Math.max(...prices)
    return Math.ceil(calculatedMax / 1000000) * 1000000 // Round up to nearest million
  } catch (error) {
    console.warn('Error calculating max price:', error)
    return 100000000
  }
}

// Watch variants to update max price
watch(variantsList, () => {
  const newMaxPrice = calculateMaxPrice()
  if (newMaxPrice !== maxPrice.value) {
    maxPrice.value = newMaxPrice
    if (!filters.value.maxPrice || filters.value.maxPrice > newMaxPrice) {
      filters.value.maxPrice = newMaxPrice
    }
  }
}, { deep: true })

// Computed for client-side pagination (fallback)
const paginatedVariants = computed(() => {
  if (!variantsList.value.length) return []
  
  // If server-side pagination is working, return all variants
  // Otherwise, do client-side pagination
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return variantsList.value.slice(start, end)
})

// Pagination helpers
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value - 1, start + maxVisible - 1)
  
  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    triggerFetch()
  }
}

const changePageSize = () => {
  currentPage.value = 0
  triggerFetch()
}

const applyFilters = () => {
  triggerFetch()
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedVariants.value = variantsList.value.map((v) => v.id)
  } else {
    selectedVariants.value = []
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    cpu: '',
    ram: '',
    gpu: '',
    color: '',
    storage: '',
    screen: '',
    minPrice: null,
    maxPrice: null,
  }
  // Reset to first page and reload all variants
  currentPage.value = 0
  triggerFetch()
}

const clearSearch = () => {
  searchQuery.value = ''
  // Reset all filters to show all variants
  filters.value = {
    cpu: '',
    ram: '',
    gpu: '',
    color: '',
    storage: '',
    screen: '',
    minPrice: null,
    maxPrice: null,
  }
  // Reset to first page and reload all variants
  currentPage.value = 0
  triggerFetch()
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'text-success'
  if (stock > 0) return 'text-warning'
  return 'text-danger'
}

const statusClass = (status) => {
  return status === 1 ? 'bg-success' : 'bg-secondary'
}

const editVariant = async (variant) => {
  console.log('Edit variant:', variant)
  
  try {
    // Ensure attributes are loaded
    await productStore.loadAttributes()
    
    // Wait for next tick to ensure modal is rendered
    await nextTick()
    
    // Load variant data into modal
    if (editModal.value) {
      editModal.value.resetForm()
      editModal.value.loadVariantData(variant)
    }
    
    // Show modal
    const modalElement = document.getElementById('variantEditModal')
    if (modalElement) {
      // Create new modal instance each time to avoid issues
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        // Dispose any existing instance first
        const existingModal = bootstrap.Modal.getInstance(modalElement)
        if (existingModal) {
          existingModal.dispose()
        }
        
        // Create new instance and show
        const modal = new bootstrap.Modal(modalElement, {
          backdrop: true,
          keyboard: true,
          focus: true
        })
        
        // Remove aria-hidden after modal is shown
        modalElement.addEventListener('shown.bs.modal', () => {
          modalElement.removeAttribute('aria-hidden')
        }, { once: true })
        
        modal.show()
      } else {
        // Manual show as fallback
        modalElement.classList.add('show', 'd-block')
        modalElement.style.display = 'block'
        modalElement.removeAttribute('aria-hidden')
        modalElement.setAttribute('aria-modal', 'true')
        modalElement.setAttribute('role', 'dialog')
        document.body.classList.add('modal-open')
        
        // Add backdrop
        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'
        backdrop.id = 'modal-backdrop'
        document.body.appendChild(backdrop)
      }
    }
  } catch (error) {
    console.error('Error opening edit modal:', error)
    alert('Có lỗi khi mở form chỉnh sửa: ' + error.message)
  }
}


const deleteVariant = async (variant) => {
  // Enhanced confirmation dialog
  const confirmMessage = `Bạn có chắc chắn muốn xóa biến thể "${variant.maCtsp}"?\n\nThông tin biến thể:\n- CPU: ${variant.tenCpu || 'N/A'}\n- RAM: ${variant.tenRam || 'N/A'}\n- Màu sắc: ${variant.mauSac?.tenMau || 'N/A'}\n- Giá bán: ${formatCurrency(variant.giaBan)}\n\nLưu ý: Hệ thống sẽ tự động xóa tất cả dữ liệu liên quan (serial, hình ảnh) trước khi xóa biến thể.\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    try {
      console.log('Deleting variant:', variant)
      console.log('Variant ID:', variant.id)
      
      // Call API to delete variant
      await productStore.removeVariant(variant.id)
      
      // Clear selection if this variant was selected
      selectedVariants.value = selectedVariants.value.filter(id => id !== variant.id)
      
      // Reload the variants list
      await triggerFetch()
      
      // Show success message
      alert('Xóa biến thể thành công!')
      console.log('Variant deleted successfully')
    } catch (error) {
      console.error('Error deleting variant:', error)
      
      // Handle specific error types
      let errorMessage = 'Có lỗi khi xóa biến thể: '
      
      if (error.message && error.message.includes('REFERENCE constraint')) {
        errorMessage = 'Không thể xóa biến thể mặc dù hệ thống đã thử xóa dữ liệu liên quan.\n\nCó thể do:\n1. Biến thể đang được sử dụng trong đơn hàng\n2. Có dữ liệu liên quan khác chưa được xóa\n3. Lỗi quyền truy cập\n\nVui lòng liên hệ quản trị viên.'
      } else if (error.response?.status === 404) {
        errorMessage += 'Biến thể không tồn tại hoặc đã bị xóa'
      } else if (error.response?.status === 403) {
        errorMessage += 'Không có quyền xóa biến thể này'
      } else if (error.response?.status === 500) {
        errorMessage += 'Lỗi server. Có thể do dữ liệu liên quan (serial, đơn hàng)'
      } else {
        errorMessage += error.message || 'Vui lòng thử lại'
      }
      
      alert(errorMessage)
      
      // Reload to refresh state
      await triggerFetch()
    }
  }
}

const bulkDelete = async () => {
  if (selectedVariants.value.length === 0) {
    alert('Vui lòng chọn ít nhất một biến thể để xóa')
    return
  }
  
  // Get selected variant details for confirmation
  const selectedVariantDetails = variantsList.value
    .filter(v => selectedVariants.value.includes(v.id))
    .map(v => `- ${v.maCtsp} (${v.tenCpu || 'N/A'}, ${v.tenRam || 'N/A'}, ${v.mauSac?.tenMau || 'N/A'})`)
    .slice(0, 5) // Show only first 5 for readability
  
  const moreCount = selectedVariants.value.length - selectedVariantDetails.length
  const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedVariants.value.length} biến thể đã chọn?\n\nDanh sách biến thể sẽ bị xóa:\n${selectedVariantDetails.join('\n')}${moreCount > 0 ? `\n... và ${moreCount} biến thể khác` : ''}\n\nLưu ý: Các biến thể có serial liên quan sẽ không thể xóa được.\nHành động này không thể hoàn tác!`
  
  if (confirm(confirmMessage)) {
    try {
      console.log('Bulk deleting variants:', selectedVariants.value)
      
      // Track success and failures
      const results = []
      let successCount = 0
      let failureCount = 0
      
      // Delete variants one by one to handle individual errors
      for (const id of selectedVariants.value) {
        try {
          await productStore.removeVariant(id)
          results.push({ id, success: true })
          successCount++
        } catch (error) {
          console.warn(`Failed to delete variant ${id}:`, error)
          results.push({ id, success: false, error: error.message })
          failureCount++
        }
      }
      
      // Clear selection and reload
      selectedVariants.value = []
      selectAll.value = false
      await triggerFetch()
      
      // Show detailed results
      if (failureCount === 0) {
        alert(`Xóa thành công tất cả ${successCount} biến thể!`)
      } else if (successCount === 0) {
        alert(`Không thể xóa được biến thể nào. Có thể do dữ liệu serial liên quan.\n\nVui lòng xóa serial trước khi xóa biến thể.`)
      } else {
        alert(`Kết quả xóa:\n- Thành công: ${successCount} biến thể\n- Thất bại: ${failureCount} biến thể\n\nCác biến thể thất bại có thể do có serial liên quan.`)
      }
      
    } catch (error) {
      console.error('Error in bulk delete process:', error)
      alert('Có lỗi trong quá trình xóa hàng loạt: ' + (error.message || 'Vui lòng thử lại'))
      
      // Clear selection and reload
      selectedVariants.value = []
      selectAll.value = false
      await triggerFetch()
    }
  }
}

const handleVariantUpdated = async () => {
  console.log('ProductVariantsView: Handling variant updated event')
  
  try {
    // Reload variants list after successful update
    await triggerFetch()
    console.log('ProductVariantsView: Variants list refreshed successfully')
  } catch (error) {
    console.error('ProductVariantsView: Error refreshing variants list:', error)
  }
}

const getColorHex = (tenMau) => {
  const colorMap = {
    'Đen': '#000000',
    'Bạc': '#C0C0C0',
    'Xám': '#808080',
  }
  return colorMap[tenMau] || '#000000'
}

// Serial Management Functions
const openSerialModal = async (variant) => {
  currentVariant.value = variant
  showSerialModal.value = true
}

const handleSerialSaved = async ({ variantId, serials }) => {
  // Count only active serials (trangThai = 1)
  const activeSerialCount = serials.filter(s => s.trangThai === 1).length
  console.log('Serials saved for variant:', variantId, 'Total:', serials.length, 'Active:', activeSerialCount)
  
  showSerialModal.value = false
  currentVariant.value = null
  
  // Reload variants list to reflect updated stock (backend should return updated soLuongTon)
  await triggerFetch()
}

const getVariantSpecs = (variant) => {
  if (!variant) return ''
  const specs = []
  if (variant.tenCpu) specs.push(variant.tenCpu)
  if (variant.tenRam) specs.push(variant.tenRam)
  if (variant.tenGpu) specs.push(variant.tenGpu)
  if (variant.dungLuongOCung) specs.push(variant.dungLuongOCung)
  return specs.join(' | ') || 'N/A'
}

const getVariantImageUrl = (variant) => {
  if (variant.images && variant.images.length > 0) {
    const firstImage = variant.images[0]
    if (typeof firstImage === 'string') {
      return firstImage
    } else if (firstImage && firstImage.url) {
      return firstImage.url
    } else if (firstImage && firstImage.uri) {
      return firstImage.uri
    }
  }
  return null
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/50x50?text=No+Image'
}

// Removed: All serial management functions are now handled by SerialManagementModal component
</script>

<style scoped>
.product-variants-view {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
}

.filter-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.clear-filters-link {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.clear-filters-link:hover {
  color: #16a34a;
}

.filter-content {
  padding: 20px;
}

.variants-list-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.search-box {
  width: 300px;
}

.search-box .form-control {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
}

.table-container {
  width: 100%;
  overflow: visible;
}

.variants-table {
  margin: 0;
  table-layout: fixed;
  width: 100%;
  font-size: 14px;
}

.variants-table th {
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.3px;
  padding: 8px 6px;
  border-bottom: 2px solid #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.variants-table td {
  vertical-align: middle;
  padding: 8px 6px;
  border-bottom: 1px solid #f8fafc;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.sku-code {
  background: #f1f5f9;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #475569;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.stock-info {
  text-align: center;
}

.stock-info small {
  font-size: 11px;
  line-height: 1.2;
}

.bulk-actions {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.pagination-wrapper {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.pagination-info {
  font-size: 14px;
}

.page-size-selector {
  width: 120px;
}

.page-size-selector .form-select {
  font-size: 13px;
  padding: 4px 8px;
}

/* Debug info styling */
.debug-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: monospace;
}

.price-input-group {
  position: relative;
}

.price-range-slider {
  margin-top: 8px;
}

.price-range-slider .form-range {
  height: 4px;
}

.price-range-slider .form-range::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  background-color: #16a34a;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.price-range-slider .form-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background-color: #16a34a;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Search box improvements */
.search-box {
  width: 500px;
}

.search-box .input-group .btn {
  border-left: none;
}

.search-box .form-control:focus + .btn {
  border-color: #86efac;
}

/* Color display styles */
.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  display: inline-block;
  flex-shrink: 0;
  cursor: help;
}

.color-info {
  display: flex;
  flex-direction: column;
}

.color-name {
  font-weight: 500;
  font-size: 13px;
  color: #1f2937;
}

.color-hex {
  font-size: 11px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

/* Button styling for consistency */
.btn-outline-success {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
  transition: all 0.2s ease;
  font-size: 13px;
  padding: 6px 12px;
}

.btn-outline-success:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

.btn-group-sm .btn {
  font-size: 12px;
  padding: 4px 8px;
}

.badge {
  font-size: 11px;
  padding: 3px 7px;
}

.price-text {
  color: #000000 !important;
  font-weight: normal;
}

.green-pagination {
  color: #16a34a !important;
}

.green-pagination:hover {
  color: #15803d !important;
  background-color: #f0fdf4;
}

.page-item.active .green-pagination {
  background-color: #16a34a;
  border-color: #16a34a;
  color: white !important;
}

/* Price range slider styling */
.form-range::-webkit-slider-thumb {
  background-color: #16a34a;
}

.form-range::-moz-range-thumb {
  background-color: #16a34a;
  border: none;
}

.form-range::-webkit-slider-track {
  background-color: #dcfce7;
}

.form-range::-moz-range-track {
  background-color: #dcfce7;
}

/* Checkbox styling */
input[type='checkbox']:checked {
  background-color: #16a34a;
  border-color: #16a34a;
}

input[type='checkbox']:focus {
  border-color: #86efac;
  box-shadow: 0 0 0 0.2rem rgba(22, 163, 74, 0.25);
}

input[type='checkbox']:checked {
  background-color: #16a34a;
  border-color: #16a34a;
}

input[type='checkbox']:focus {
  border-color: #86efac;
  box-shadow: 0 0 0 0.2rem rgba(22, 163, 74, 0.25);
}

/* Variant Image Styles */
.variant-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.variant-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.variant-thumbnail:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.no-image-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #9ca3af;
  font-size: 1.25rem;
}

/* Serial Modal Styles */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
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

/* Actions column */
.actions-column {
  min-width: 120px !important;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>