<!-- // Update ProductFilter.vue to use advancedSearchPage for pagination -->
<template>
  <div class="product-filter">
    <div class="filter-header">
      <h3 class="filter-title">Bộ lọc sản phẩm</h3>
    </div>

    <div class="filter-content">
      <div class="row g-3">
        <!-- Tìm kiếm (Tên hoặc Mã sản phẩm) -->
        <div class="col-md-4">
          <div class="form-group">
            <label class="form-label">Tìm kiếm</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nhập tên hoặc mã sản phẩm"
              v-model="localFilters.search"
            />
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="col-md-4">
          <div class="form-group">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" v-model="localFilters.trangThai">
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Ẩn</option>
            </select>
          </div>
        </div>

        <!-- Khoảng giá -->
        <div class="col-md-8">
          <div class="form-group">
            <label class="form-label">Khoảng giá</label>
            <div class="price-range">
              <div class="range-inputs">
                <input
                  type="range"
                  :min="minBound"
                  :max="maxBound"
                  step="1000000"
                  v-model.number="localFilters.minPrice"
                />
                <input
                  type="range"
                  :min="minBound"
                  :max="maxBound"
                  step="1000000"
                  v-model.number="localFilters.maxPrice"
                />
              </div>
              <div class="d-flex justify-content-between small mt-1 text-muted">
                <span>{{ formatCurrency(localFilters.minPrice || minBound) }}</span>
                <span>{{ formatCurrency(localFilters.maxPrice || maxBound) }}</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-footer d-flex justify-content-end gap-2">
      <button class="btn btn-sm btn-outline-success" @click="resetFilters" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ spin: loading }" v-if="loading"></i>
        Làm mới
      </button>
      <button class="btn btn-sm btn-success" @click="applyFilters" :disabled="loading">
        <i class="bi bi-hourglass-split" v-if="loading"></i>
        Áp dụng bộ lọc
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductStore } from '@/stores/productStore'
import { formatCurrency } from '@/utils/helpers'
import { advancedSearch, advancedSearchPage } from '@/service/sanpham/SanPhamService'

const emit = defineEmits(['filter', 'reset', 'loading', 'filtered-data'])

const localFilters = ref({
  search: '',
  trangThai: '',
  minPrice: null,
  maxPrice: null,
})

const productStore = useProductStore()
const loading = ref(false)
const error = ref(null) // Thêm để hiển thị lỗi nếu cần

// Calculate dynamic price bounds based on product status
const allPrices = computed(() => {
  const prices = []
  const statusFilter = localFilters.value.trangThai
  
  for (const p of productStore.products || []) {
    
    // Filter products by status if status filter is applied
    if (statusFilter !== '' && statusFilter !== null && statusFilter !== undefined) {
      const productStatus = parseInt(statusFilter)
      if (p.trangThai !== productStatus) {
        continue // Skip products that don't match the status filter
      }
    }
    
    // Try to get price from various possible fields
    const possiblePrices = [
      p.giaThapNhat,
      p.giaCaoNhat, 
      p.giaBan,
      p.gia
    ].filter(price => {
      const numPrice = Number(price)
      return !Number.isNaN(numPrice) && numPrice > 0
    }).map(price => Number(price))
    
    if (possiblePrices.length > 0) {
      prices.push(...possiblePrices)
    }
    
    // Also check variants if they exist
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      for (const v of p.variants) {
        // Filter variants by status if status filter is applied
        if (statusFilter !== '' && statusFilter !== null && statusFilter !== undefined) {
          const productStatus = parseInt(statusFilter)
          if (v.trangThai !== undefined && v.trangThai !== productStatus) {
            continue // Skip variants that don't match the status filter
          }
        }
        
        const price = Number(v.giaBan || v.gia || 0)
        if (!Number.isNaN(price) && price > 0) {
          prices.push(price)
        }
      }
    }
  }
  
  return prices
})

const minBound = computed(() => {
  if (!allPrices.value.length) {
    return 0
  }
  const min = Math.max(0, Math.min(...allPrices.value))
  return min
})

const MAX_CAP = 100000000 // 100 million VND
const maxBound = computed(() => {
  if (!allPrices.value.length) {
    return MAX_CAP
  }
  const max = Math.min(Math.max(...allPrices.value), MAX_CAP)
  return max
})

// Initialize and watch price bounds
watch(
  () => [minBound.value, maxBound.value],
  ([min, max]) => {
    if (localFilters.value.minPrice == null || localFilters.value.minPrice < min) {
      localFilters.value.minPrice = min
    }
    if (localFilters.value.maxPrice == null || localFilters.value.maxPrice > max) {
      localFilters.value.maxPrice = max
    }
  },
  { immediate: true },
)

// Watch status changes to update price bounds
watch(
  () => localFilters.value.trangThai,
  (newStatus, oldStatus) => {
    // Force recalculation by accessing computed values
    const newMin = minBound.value
    const newMax = maxBound.value
    
    // Reset price filters to new bounds when status changes
    localFilters.value.minPrice = newMin
    localFilters.value.maxPrice = newMax
  },
  { immediate: false },
)

// Watch filters to ensure minPrice <= maxPrice
watch(
  localFilters,
  (newVal) => {
    if (newVal.minPrice > newVal.maxPrice) {
      const temp = newVal.minPrice
      newVal.minPrice = newVal.maxPrice
      newVal.maxPrice = temp
    }
  },
  { deep: true },
)

// Apply filters function
const applyFilters = async () => {
  loading.value = true
  emit('loading', true)
  error.value = null

  try {
    const keyword = localFilters.value.search?.trim() || undefined
    const trangThai = localFilters.value.trangThai ? parseInt(localFilters.value.trangThai) : undefined
    const minPrice = localFilters.value.minPrice != null ? localFilters.value.minPrice : undefined
    const maxPrice = localFilters.value.maxPrice != null ? localFilters.value.maxPrice : undefined

    // Use advancedSearchPage for pagination
    const response = await advancedSearchPage(keyword, trangThai, minPrice, maxPrice, 0, 10)

    let data = response
    if (response.data) data = response.data
    else if (response.content) data = response.content

    const resultData = Array.isArray(data)
      ? data
      : data.content && Array.isArray(data.content)
        ? data.content
        : []
    emit('filtered-data', resultData)
    emit('filter', { keyword, trangThai, minPrice, maxPrice })
  } catch (err) {
    error.value = err.message || 'Lỗi khi áp dụng bộ lọc'
    console.error('Filter error:', err)
    emit('filtered-data', productStore.products || [])
  } finally {
    loading.value = false
    emit('loading', false)
  }
}

// Reset filters function
const resetFilters = async () => {
  localFilters.value = {
    search: '',
    trangThai: '',
    minPrice: minBound.value,
    maxPrice: maxBound.value,
  }

  loading.value = true
  emit('loading', true)
  error.value = null

  try {
    // Use advancedSearchPage for pagination
    const response = await advancedSearchPage('', '', null, null, 0, 10)

    let data = response
    if (response.data) data = response.data
    else if (response.content) data = response.content

    const resultData = Array.isArray(data)
      ? data
      : data.content && Array.isArray(data.content)
        ? data.content
        : []
    emit('filtered-data', resultData)
  } catch (err) {
    error.value = err.message || 'Lỗi khi tải lại sản phẩm'
    console.error('Reset error:', err)
    emit('filtered-data', productStore.products || [])
  } finally {
    loading.value = false
    emit('loading', false)
  }

  emit('reset')
}
</script>

<style scoped>
.product-filter {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.filter-content {
  padding: 16px 24px;
}

.price-range {
  position: relative;
}

.price-range .range-inputs {
  position: relative;
  height: 6px;
}

.price-range .range-inputs input[type='range'] {
  position: absolute;
  top: 0;
  left: 0;
  appearance: none;
  width: 100%;
  height: 6px;
  background: transparent;
  pointer-events: none;
}

.price-range .range-inputs input[type='range']::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
}

.price-range .range-inputs::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: #e2f5ea;
  border-radius: 999px;
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
  display: block;
}

.form-control,
.form-select {
  height: 36px;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 8px;
  border-color: #e2e8f0;
}

.form-control:focus,
.form-select:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 0.2rem rgba(22, 163, 74, 0.25);
}

.btn-success {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
  transition: all 0.2s ease;
}

.btn-success:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

.btn-outline-success {
  background: #fff;
  color: #16a34a;
  border: 1px solid #16a34a;
  transition: all 0.2s ease;
}

.btn-outline-success:hover {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.filter-footer {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
  text-align: right;
}

/* Thêm style cho lỗi nếu cần */
.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}
</style>