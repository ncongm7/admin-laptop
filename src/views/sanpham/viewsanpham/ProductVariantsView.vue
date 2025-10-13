<template>
  <div class="product-variants-view">
    <!-- Header -->

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
          <!-- Row 1 -->
          <div class="col-md-3">
            <label class="form-label">CPU</label>
            <select class="form-select" v-model="filters.cpu">
              <option value="">Chọn CPU</option>
              <option value="intel-i5">Intel Core i5</option>
              <option value="intel-i7">Intel Core i7</option>
              <option value="amd-ryzen5">AMD Ryzen 5</option>
              <option value="amd-ryzen7">AMD Ryzen 7</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">RAM</label>
            <select class="form-select" v-model="filters.ram">
              <option value="">Chọn RAM</option>
              <option value="8gb">8GB</option>
              <option value="16gb">16GB</option>
              <option value="32gb">32GB</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">GPU</label>
            <select class="form-select" v-model="filters.gpu">
              <option value="">Chọn GPU</option>
              <option value="rtx-3060">RTX 3060</option>
              <option value="rtx-3070">RTX 3070</option>
              <option value="rtx-3080">RTX 3080</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Màu sắc</label>
            <select class="form-select" v-model="filters.color">
              <option value="">Chọn màu sắc</option>
              <option value="den">Đen</option>
              <option value="bac">Bạc</option>
              <option value="xam">Xám</option>
            </select>
          </div>

          <!-- Row 2 -->
          <div class="col-md-3">
            <label class="form-label">Bộ nhớ</label>
            <select class="form-select" v-model="filters.storage">
              <option value="">Chọn bộ nhớ</option>
              <option value="256ssd">256GB SSD</option>
              <option value="512ssd">512GB SSD</option>
              <option value="1tssd">1TB SSD</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Màn hình</label>
            <select class="form-select" v-model="filters.screen">
              <option value="">Chọn màn hình</option>
              <option value="14fhd">14" FHD</option>
              <option value="15fhd">15.6" FHD</option>
              <option value="17fhd">17" FHD</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Khoảng giá</label>
            <div class="price-range">
              <input
                type="range"
                class="form-range"
                min="0"
                max="62000000"
                step="100000"
                v-model="filters.maxPrice"
              />
              <div class="d-flex justify-content-between small text-muted mt-1">
                <span>0 ₫</span>
                <span>62.000.000 ₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Variants List Section -->
    <div class="variants-list-section">
      <div class="list-header d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
          <h5 class="mb-0">Danh sách biến thể</h5>
          <span class="badge bg-success">{{ filteredVariants.length }}</span>
        </div>
        <div class="search-box">
          <input
            type="text"
            class="form-control"
            placeholder="Tìm kiếm biến thể..."
            v-model="searchQuery"
          />
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
              <th width="100">SKU</th>
              <th width="60">Màu</th>
              <th width="80">CPU</th>
              <th width="60">RAM</th>
              <th width="70">GPU</th>
              <th width="70">Màn hình</th>
              <th width="50">Pin</th>
              <th width="70">Ổ cứng</th>
              <th width="75">Giá bán</th>
              <th width="60">Kho</th>
              <th width="65">Trạng thái</th>
              <th width="70">Tạo</th>
              <th width="70">Cập nhật</th>
              <th width="60">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="16" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredVariants.length === 0">
              <td colspan="16" class="text-center py-5 text-muted">
                <i class="bi bi-box-seam display-5"></i>
                <p class="mt-3">Không có biến thể nào</p>
              </td>
            </tr>
            <tr v-for="(variant, index) in filteredVariants" :key="variant.id">
              <td class="text-center">
                <input type="checkbox" v-model="selectedVariants" :value="variant.id" />
              </td>
              <td>{{ index + 1 }}</td>
              <td>
                <code class="sku-code">{{ variant.sku }}</code>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div
                    class="color-dot"
                    :style="{ backgroundColor: variant.color?.hex || '#000' }"
                  ></div>
                  <span>{{ variant.color?.name }}</span>
                </div>
              </td>
              <td>{{ variant.cpu?.name }}</td>
              <td>{{ variant.ram?.name }}</td>
              <td>{{ variant.gpu?.name }}</td>
              <td>{{ variant.screen?.name }}</td>
              <td>{{ variant.battery?.name }}</td>
              <td>{{ variant.storage?.name }}</td>
              <td>
                <span class="price-text">{{ formatCurrency(variant.giaBan) }}</span>
              </td>
              <td>
                <div class="stock-info">
                  <span :class="stockStatusClass(variant.soLuong)">{{ variant.soLuong }}</span>
                  <small class="text-muted d-block">{{ variant.soLuong }} có sẵn</small>
                </div>
              </td>
              <td>
                <span :class="statusClass(variant.trangThai)" class="badge">
                  {{ variant.trangThai === 'ACTIVE' ? 'Hoạt động' : 'Ẩn' }}
                </span>
              </td>
              <td>{{ formatDate(variant.ngayTao) }}</td>
              <td>{{ formatDate(variant.ngayCapNhat) }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="editVariant(variant)"
                    title="Chỉnh sửa"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-sm"
                    @click="settingsVariant(variant)"
                    title="Cài đặt"
                  >
                    <i class="bi bi-gear"></i>
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
        <button class="btn btn-outline-success btn-sm" @click="bulkEdit">
          <i class="bi bi-pencil"></i> Chỉnh sửa hàng loạt
        </button>
        <button class="btn btn-outline-success btn-sm" @click="bulkDelete">
          <i class="bi bi-trash"></i> Xóa hàng loạt
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper mt-4" v-if="!loading && filteredVariants.length > 0">
      <nav aria-label="Page navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Trước</a>
          </li>
          <li class="page-item active"><a class="page-link green-pagination" href="#">1</a></li>
          <li class="page-item"><a class="page-link green-pagination" href="#">2</a></li>
          <li class="page-item"><a class="page-link green-pagination" href="#">3</a></li>
          <li class="page-item">
            <a class="page-link green-pagination" href="#">Tiếp</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatCurrency } from '@/utils/helpers'
import { formatDate } from '@/utils/dateUtils'

const loading = ref(false)
const searchQuery = ref('')
const selectedVariants = ref([])
const selectAll = ref(false)

const filters = ref({
  cpu: '',
  ram: '',
  gpu: '',
  color: '',
  storage: '',
  screen: '',
  maxPrice: 62000000,
})

// Mock data - replace with actual API calls
const variants = ref([
  {
    id: 1,
    sku: 'SP1111-CPU003-RAM001-BN001-MS001-GPU001-MH001',
    color: { name: 'Đen', hex: '#000000' },
    cpu: { name: 'Intel Core i5 15400K' },
    ram: { name: '16 GB DDR4' },
    gpu: { name: 'RTX 5090' },
    screen: { name: '17" 4K' },
    battery: { name: '70Wh' },
    storage: { name: '512 GB SSD' },
    giaBan: 10000000,
    soLuong: 0,
    trangThai: 'ACTIVE',
    ngayTao: '2024-01-15',
    ngayCapNhat: '2024-01-15',
  },
  {
    id: 2,
    sku: 'SP1111-CPU003-RAM001-BN001-MS001-GPU001-MH002',
    color: { name: 'Đỏ', hex: '#FF0000' },
    cpu: { name: 'AMD Ryzen 7 5800H' },
    ram: { name: '32 GB DDR4' },
    gpu: { name: 'Radeon RX 7600M XT' },
    screen: { name: '14" FHD' },
    battery: { name: '50Wh' },
    storage: { name: '256 GB SSD' },
    giaBan: 8500000,
    soLuong: 5,
    trangThai: 'ACTIVE',
    ngayTao: '2024-01-15',
    ngayCapNhat: '2024-01-15',
  },
  {
    id: 3,
    sku: 'SP1111-CPU003-RAM001-BN001-MS001-GPU001-MH003',
    color: { name: 'Xanh lá cây', hex: '#16a34a' },
    cpu: { name: 'Intel Core i7 12700H' },
    ram: { name: '16 GB DDR5' },
    gpu: { name: 'RTX 3070' },
    screen: { name: '15.6" FHD' },
    battery: { name: '60Wh' },
    storage: { name: '1TB SSD' },
    giaBan: 12000000,
    soLuong: 3,
    trangThai: 'ACTIVE',
    ngayTao: '2024-01-15',
    ngayCapNhat: '2024-01-15',
  },
])

const filteredVariants = computed(() => {
  return variants.value.filter((variant) => {
    const matchesSearch =
      !searchQuery.value ||
      variant.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      variant.cpu?.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      variant.ram?.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      variant.gpu?.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCpu =
      !filters.value.cpu ||
      variant.cpu?.name.toLowerCase().includes(filters.value.cpu.toLowerCase())
    const matchesRam =
      !filters.value.ram ||
      variant.ram?.name.toLowerCase().includes(filters.value.ram.toLowerCase())
    const matchesGpu =
      !filters.value.gpu ||
      variant.gpu?.name.toLowerCase().includes(filters.value.gpu.toLowerCase())
    const matchesColor =
      !filters.value.color ||
      variant.color?.name.toLowerCase().includes(filters.value.color.toLowerCase())
    const matchesStorage =
      !filters.value.storage ||
      variant.storage?.name.toLowerCase().includes(filters.value.storage.toLowerCase())
    const matchesScreen =
      !filters.value.screen ||
      variant.screen?.name.toLowerCase().includes(filters.value.screen.toLowerCase())
    const matchesPrice = !filters.value.maxPrice || variant.giaBan <= filters.value.maxPrice

    return (
      matchesSearch &&
      matchesCpu &&
      matchesRam &&
      matchesGpu &&
      matchesColor &&
      matchesStorage &&
      matchesScreen &&
      matchesPrice
    )
  })
})

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedVariants.value = filteredVariants.value.map((v) => v.id)
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
    maxPrice: 62000000,
  }
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'text-success'
  if (stock > 0) return 'text-warning'
  return 'text-danger'
}

const statusClass = (status) => {
  return status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'
}

const editVariant = (variant) => {
  console.log('Edit variant:', variant)
}

const deleteVariant = (variant) => {
  console.log('Delete variant:', variant)
}

const bulkEdit = () => {
  console.log('Bulk edit variants:', selectedVariants.value)
}

const bulkDelete = () => {
  console.log('Bulk delete variants:', selectedVariants.value)
}

const settingsVariant = (variant) => {
  console.log('Settings variant:', variant)
}
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
</style>
