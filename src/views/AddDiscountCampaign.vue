<template>
  <div class="add-campaign-container">
    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">Trang chủ</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">Đợt giảm giá</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item active">Form đợt giảm giá</span>
    </div>

    <!-- Page Title -->
    <div class="page-header">
      <h1 class="page-title">Thêm Đợt Giảm Giá</h1>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel - Campaign Information -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="step-number">①</span>
            <span class="title-text">Thông Tin Đợt Giảm Giá</span>
            <i class="info-icon">ℹ️</i>
          </div>
        </div>

        <div class="form-container">
          <!-- Campaign Code -->
          <div class="form-group">
            <label class="form-label">Mã đợt giảm giá</label>
            <input 
              type="text" 
              class="form-input" 
              value="Mã tự động" 
              readonly
            />
          </div>

          <!-- Campaign Name -->
          <div class="form-group">
            <label class="form-label">Tên đợt giảm giá</label>
            <input 
              type="text" 
              class="form-input" 
              placeholder="Nhập tên đợt giảm giá"
              v-model="campaignData.name"
            />
          </div>

          <!-- Discount Type -->
          <div class="form-group">
            <label class="form-label">Loại giảm giá</label>
            <select class="form-select" v-model="campaignData.type">
              <option value="">Chọn loại giảm giá</option>
              <option value="percentage">Giảm theo phần trăm</option>
              <option value="fixed">Giảm theo số tiền</option>
            </select>
          </div>

          <!-- Discount Value -->
          <div class="form-group">
            <label class="form-label">Giá trị giảm giá</label>
            <input 
              type="number" 
              class="form-input" 
              v-model="campaignData.value"
              min="0"
            />
          </div>

          <!-- Discount Amount -->
          <div class="form-group">
            <label class="form-label">Số tiền giảm</label>
            <input 
              type="text" 
              class="form-input" 
              placeholder="Nhập số tiền giảm"
              v-model="campaignData.amount"
            />
          </div>

          <!-- Start Date -->
          <div class="form-group">
            <label class="form-label">Ngày bắt đầu</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-input date-input" 
                v-model="campaignData.startDate"
              />
              <i class="calendar-icon">📅</i>
            </div>
          </div>

          <!-- End Date -->
          <div class="form-group">
            <label class="form-label">Ngày kết thúc</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                class="form-input date-input" 
                v-model="campaignData.endDate"
              />
              <i class="calendar-icon">📅</i>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button class="btn btn-success" @click="addCampaign">
              Thêm
            </button>
            <button class="btn btn-secondary" @click="goBack">
              Quay Về
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel - Product List -->
      <div class="right-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span class="title-text">Danh Sách Sản Phẩm</span>
            <i class="table-icon">📊</i>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="filters-section">
          <div class="filter-row">
            <!-- Search -->
            <div class="filter-group">
              <div class="search-input-wrapper">
                <i class="search-icon">🔍</i>
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="Tìm kiếm theo tên, mã..."
                  v-model="productFilters.search"
                />
              </div>
            </div>

            <!-- Operating System -->
            <div class="filter-group">
              <select class="filter-select" v-model="productFilters.os">
                <option value="">Tất cả</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="windows">Windows</option>
              </select>
            </div>

            <!-- Manufacturer -->
            <div class="filter-group">
              <select class="filter-select" v-model="productFilters.manufacturer">
                <option value="">Tất cả</option>
                <option value="samsung">Samsung</option>
                <option value="apple">Apple</option>
                <option value="xiaomi">Xiaomi</option>
                <option value="oppo">OPPO</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Product Table -->
        <div class="table-container">
          <table class="product-table">
            <thead>
              <tr>
                <th>#</th>
                <th>STT</th>
                <th>Mã</th>
                <th>Tên SP</th>
                <th>Hãng</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(product, index) in filteredProducts" :key="product.id">
                <td>
                  <input 
                    type="checkbox" 
                    :value="product.id"
                    v-model="selectedProducts"
                  />
                </td>
                <td>{{ index + 1 }}</td>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td>{{ product.brand }}</td>
                <td>{{ product.quantity }}</td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="6" class="no-data">
                  <div class="no-data-content">
                    <i class="no-data-icon">📦</i>
                    <p>Không có sản phẩm nào</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
          <div class="pagination-info">
            <span>Hiển thị</span>
            <select class="page-size-select" v-model="pageSize">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>mục/trang</span>
          </div>
          <div class="pagination-display">
            Hiển thị {{ paginationInfo.start }}-{{ paginationInfo.end }} / {{ paginationInfo.total }} mục
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" @click="goToFirstPage" :disabled="currentPage === 1">
              <i class="icon">⏮️</i>
            </button>
            <button class="pagination-btn" @click="goToPreviousPage" :disabled="currentPage === 1">
              <i class="icon">◀️</i>
            </button>
            <button class="pagination-btn" @click="goToNextPage" :disabled="currentPage === totalPages">
              <i class="icon">▶️</i>
            </button>
            <button class="pagination-btn" @click="goToLastPage" :disabled="currentPage === totalPages">
              <i class="icon">⏭️</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Campaign data
const campaignData = ref({
  name: '',
  type: '',
  value: 0,
  amount: '',
  startDate: '',
  endDate: ''
})

// Product filters
const productFilters = ref({
  search: '',
  os: '',
  manufacturer: ''
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const selectedProducts = ref([])

// Mock product data
const products = ref([
  {
    id: 1,
    code: 'SP001',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    quantity: 50,
    os: 'ios'
  },
  {
    id: 2,
    code: 'SP002',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    quantity: 30,
    os: 'android'
  },
  {
    id: 3,
    code: 'SP003',
    name: 'Xiaomi Redmi Note 13',
    brand: 'Xiaomi',
    quantity: 25,
    os: 'android'
  }
])

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value

  if (productFilters.value.search) {
    const searchTerm = productFilters.value.search.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.code.toLowerCase().includes(searchTerm)
    )
  }

  if (productFilters.value.os) {
    filtered = filtered.filter(product => 
      product.os === productFilters.value.os
    )
  }

  if (productFilters.value.manufacturer) {
    filtered = filtered.filter(product => 
      product.brand.toLowerCase() === productFilters.value.manufacturer.toLowerCase()
    )
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredProducts.value.length / pageSize.value)
)

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, filteredProducts.value.length)
  return {
    start: filteredProducts.value.length > 0 ? start : 0,
    end,
    total: filteredProducts.value.length
  }
})

// Methods
const addCampaign = () => {
  if (!campaignData.value.name || !campaignData.value.type) {
    alert('Vui lòng nhập đầy đủ thông tin bắt buộc!')
    return
  }

  console.log('Campaign data:', campaignData.value)
  console.log('Selected products:', selectedProducts.value)
  
  alert('Đợt giảm giá đã được tạo thành công!')
  router.push('/quan-li-giam-gia')
}

const goBack = () => {
  router.push('/quan-li-giam-gia')
}

const goToFirstPage = () => {
  currentPage.value = 1
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToLastPage = () => {
  currentPage.value = totalPages.value
}

// Lifecycle
onMounted(() => {
  console.log('Add Discount Campaign component mounted')
})
</script>

<style scoped>
.add-campaign-container {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #6c757d;
  cursor: pointer;
}

.breadcrumb-item:hover {
  color: #007bff;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #6c757d;
}

/* Page Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: start;
}

/* Panel Styles */
.left-panel, .right-panel {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.step-number {
  background: #007bff;
  color: #ffffff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.info-icon, .table-icon {
  font-size: 16px;
  margin-left: auto;
}

/* Form Container */
.form-container {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 6px;
}

.form-input, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input[readonly] {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

/* Date Input */
.date-input-wrapper {
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 14px;
  pointer-events: none;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-success {
  background: #28a745;
  color: #ffffff;
}

.btn-success:hover {
  background: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

/* Filters Section */
.filters-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #6c757d;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 8px 8px 8px 32px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 13px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 13px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Table Container */
.table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.product-table th {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.product-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.product-table tbody tr:hover {
  background: #f8f9fa;
}

/* No Data */
.no-data {
  text-align: center;
  padding: 48px 24px;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6c757d;
}

.no-data-icon {
  font-size: 48px;
  opacity: 0.5;
}

.no-data-content p {
  margin: 0;
  font-size: 16px;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 13px;
  background: #ffffff;
}

.pagination-display {
  font-size: 14px;
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  background: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 12px;
}

.pagination-btn:hover:not(:disabled) {
  background: #007bff;
  color: #ffffff;
  border-color: #007bff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .add-campaign-container {
    padding: 16px;
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 24px;
  }

  .panel-header {
    padding: 12px 16px;
  }

  .form-container {
    padding: 16px;
  }
}
</style> 