<template>
  <div v-if="visible" class="modal fade show d-block" style="z-index: 9999" @click.self="close">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">
            <i class="bi bi-funnel"></i> Tìm kiếm nâng cao
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSearch">
            <!-- Từ khóa -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-search"></i> Từ khóa
              </label>
              <input
                type="text"
                class="form-control"
                v-model="filters.keyword"
                placeholder="Tên sản phẩm, mã sản phẩm..."
              />
            </div>

            <!-- Khoảng giá -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">
                  <i class="bi bi-currency-dollar"></i> Giá từ (VND)
                </label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="filters.minPrice"
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">
                  <i class="bi bi-currency-dollar"></i> Giá đến (VND)
                </label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="filters.maxPrice"
                  min="0"
                  step="1000"
                  placeholder="Không giới hạn"
                />
              </div>
            </div>

            <!-- Tồn kho -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-box"></i> Tình trạng tồn kho
              </label>
              <select class="form-select" v-model="filters.coSanTon">
                <option :value="null">Tất cả</option>
                <option :value="true">Còn hàng</option>
                <option :value="false">Hết hàng</option>
              </select>
            </div>

            <!-- Sắp xếp -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-sort-down"></i> Sắp xếp theo
              </label>
              <select class="form-select" v-model="filters.sortBy">
                <option value="tenSanPham">Tên sản phẩm (A-Z)</option>
                <option value="tenSanPham,desc">Tên sản phẩm (Z-A)</option>
                <option value="giaBan">Giá (thấp → cao)</option>
                <option value="giaBan,desc">Giá (cao → thấp)</option>
                <option value="soLuongTon">Tồn kho (ít → nhiều)</option>
                <option value="soLuongTon,desc">Tồn kho (nhiều → ít)</option>
                <option value="ngayTao,desc">Mới nhất</option>
                <option value="ngayTao">Cũ nhất</option>
              </select>
            </div>

            <!-- Lưu bộ lọc yêu thích -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <label class="form-label mb-0">
                  <i class="bi bi-star"></i> Bộ lọc yêu thích
                </label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="saveFavoriteFilter"
                  :disabled="!canSaveFavorite"
                >
                  <i class="bi bi-bookmark-plus"></i> Lưu
                </button>
              </div>
              <select
                class="form-select mt-2"
                v-model="selectedFavoriteFilter"
                @change="loadFavoriteFilter"
              >
                <option value="">-- Chọn bộ lọc đã lưu --</option>
                <option v-for="(filter, name) in favoriteFilters" :key="name" :value="name">
                  {{ name }}
                </option>
              </select>
              <div v-if="Object.keys(favoriteFilters).length > 0" class="mt-2">
                <button
                  v-for="(filter, name) in favoriteFilters"
                  :key="name"
                  class="btn btn-sm btn-outline-secondary me-2 mb-1"
                  @click="applyFavoriteFilter(name)"
                >
                  {{ name }}
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="clearFavoriteFilters"
                  title="Xóa tất cả bộ lọc đã lưu"
                >
                  <i class="bi bi-trash"></i> Xóa tất cả
                </button>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="resetFilters">
            <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
          </button>
          <button type="button" class="btn btn-secondary" @click="close">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
          <button type="button" class="btn btn-primary" @click="handleSearch" :disabled="isSearching">
            <span v-if="isSearching" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-search"></i>
            {{ isSearching ? 'Đang tìm...' : 'Tìm kiếm' }}
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { timKiemSanPhamNangCao } from '@/service/banhang/sanPhamBanHangService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'search', 'results'])

const { success: showSuccess, error: showError } = useToast()

const isSearching = ref(false)

// Filters
const filters = ref({
  keyword: '',
  minPrice: null,
  maxPrice: null,
  coSanTon: null, // true: còn hàng, false: hết hàng, null: tất cả
  sortBy: 'ngayTao,desc',
  page: 0,
  size: 20
})

// Favorite filters (lưu trong localStorage)
const favoriteFilters = ref({})
const selectedFavoriteFilter = ref('')

const STORAGE_KEY = 'banhang_favorite_filters'

/**
 * Load favorite filters từ localStorage
 */
const loadFavoriteFilters = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      favoriteFilters.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Lỗi khi load favorite filters:', error)
  }
}

/**
 * Save favorite filters vào localStorage
 */
const saveFavoriteFilters = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteFilters.value))
  } catch (error) {
    console.error('Lỗi khi save favorite filters:', error)
  }
}

/**
 * Kiểm tra có thể lưu favorite filter không
 */
const canSaveFavorite = computed(() => {
  // Phải có ít nhất 1 filter được set
  return (
    filters.value.keyword ||
    filters.value.minPrice ||
    filters.value.maxPrice ||
    filters.value.coSanTon !== null
  )
})

/**
 * Lưu bộ lọc hiện tại
 */
const saveFavoriteFilter = () => {
  if (!canSaveFavorite.value) {
    showError('Vui lòng thiết lập ít nhất một bộ lọc trước khi lưu!')
    return
  }

  const name = prompt('Nhập tên cho bộ lọc này:')
  if (!name || !name.trim()) {
    return
  }

  // Lưu filter (loại bỏ page, size)
  const filterToSave = {
    keyword: filters.value.keyword,
    minPrice: filters.value.minPrice,
    maxPrice: filters.value.maxPrice,
    coSanTon: filters.value.coSanTon,
    sortBy: filters.value.sortBy
  }

  favoriteFilters.value[name.trim()] = filterToSave
  saveFavoriteFilters()

  showSuccess(`Đã lưu bộ lọc "${name.trim()}"!`)
}

/**
 * Áp dụng favorite filter
 */
const applyFavoriteFilter = (name) => {
  const filter = favoriteFilters.value[name]
  if (filter) {
    filters.value = {
      ...filter,
      page: 0,
      size: 20
    }
    showSuccess(`Đã áp dụng bộ lọc "${name}"!`)
  }
}

/**
 * Load favorite filter từ dropdown
 */
const loadFavoriteFilter = () => {
  if (!selectedFavoriteFilter.value) return
  applyFavoriteFilter(selectedFavoriteFilter.value)
}

/**
 * Xóa tất cả favorite filters
 */
const clearFavoriteFilters = () => {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả bộ lọc đã lưu?')) {
    favoriteFilters.value = {}
    saveFavoriteFilters()
    selectedFavoriteFilter.value = ''
    showSuccess('Đã xóa tất cả bộ lọc!')
  }
}

/**
 * Đặt lại filters
 */
const resetFilters = () => {
  filters.value = {
    keyword: '',
    minPrice: null,
    maxPrice: null,
    coSanTon: null,
    sortBy: 'ngayTao,desc',
    page: 0,
    size: 20
  }
  selectedFavoriteFilter.value = ''
}

/**
 * Xử lý tìm kiếm
 */
const handleSearch = async () => {
  isSearching.value = true

  try {
    // Validate filters
    if (filters.value.minPrice && filters.value.maxPrice) {
      if (filters.value.minPrice > filters.value.maxPrice) {
        showError('Giá từ không được lớn hơn giá đến!')
        isSearching.value = false
        return
      }
    }

    // Build params (chỉ gửi các params có giá trị)
    const params = {
      page: filters.value.page,
      size: filters.value.size
    }

    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.minPrice) params.minPrice = filters.value.minPrice
    if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice
    if (filters.value.coSanTon !== null) params.coSanTon = filters.value.coSanTon

    // Gọi API
    const response = await timKiemSanPhamNangCao(params)

    // Xử lý response
    let products = []
    if (response) {
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        products = response.data.content
      } else if (response.data && Array.isArray(response.data)) {
        products = response.data
      } else if (Array.isArray(response)) {
        products = response
      }
    }

    // Sắp xếp phía client nếu backend chưa hỗ trợ sortBy
    if (filters.value.sortBy && products.length > 0) {
      products = sortProducts(products, filters.value.sortBy)
    }

    // Emit results
    emit('results', products)
    emit('search', { filters: filters.value, results: products })

    showSuccess(`Tìm thấy ${products.length} sản phẩm!`)
  } catch (error) {
    console.error('❌ Lỗi khi tìm kiếm nâng cao:', error)
    showError(error.response?.data?.message || 'Không thể tìm kiếm. Vui lòng thử lại!')
    emit('results', [])
  } finally {
    isSearching.value = false
  }
}

/**
 * Sắp xếp sản phẩm phía client
 */
const sortProducts = (products, sortBy) => {
  const [field, direction] = sortBy.split(',')
  const isDesc = direction === 'desc'

  return [...products].sort((a, b) => {
    let aVal = a[field]
    let bVal = b[field]

    // Xử lý nested fields
    if (field === 'giaBan' || field === 'soLuongTon') {
      aVal = aVal || 0
      bVal = bVal || 0
    }

    if (aVal < bVal) return isDesc ? 1 : -1
    if (aVal > bVal) return isDesc ? -1 : 1
    return 0
  })
}

/**
 * Đóng modal
 */
const close = () => {
  emit('close')
}

// Lifecycle
onMounted(() => {
  loadFavoriteFilters()
})

// Watch visible để reset khi mở lại
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadFavoriteFilters()
  }
})
</script>

<style scoped>
.modal-backdrop {
  z-index: 9998;
}

.modal {
  z-index: 9999;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-label i {
  margin-right: 0.25rem;
}
</style>

