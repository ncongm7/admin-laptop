<template>
  <div class="voucher-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Quản Lý Phiếu Giảm Giá</h1>
      <div class="breadcrumb">Trang chủ / Phiếu giảm giá</div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <i class="filter-icon">🔍</i>
        <h3 class="filter-title">Bộ Lọc Tìm Kiếm</h3>
      </div>
      
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Tìm kiếm phiếu</label>
            <div class="search-input-wrapper">
              <i class="search-icon">🔍</i>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Mã phiếu, tên phiếu..."
                v-model="searchQuery"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Loại phiếu</label>
            <select class="filter-select" v-model="selectedType">
              <option value="">Tất cả loại phiếu</option>
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Tiền mặt</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Trạng thái</label>
            <select class="filter-select" v-model="selectedStatus">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang diễn ra</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="expired">Đã kết thúc</option>
            </select>
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Khoảng thời gian</label>
            <div class="date-range">
              <div class="date-input-wrapper">
                <input 
                  type="date" 
                  class="date-input" 
                  placeholder="dd/mm/yyyy"
                  v-model="startDate"
                />
                <i class="calendar-icon">📅</i>
              </div>
              <span class="date-separator">đến</span>
              <div class="date-input-wrapper">
                <input 
                  type="date" 
                  class="date-input" 
                  placeholder="dd/mm/yyyy"
                  v-model="endDate"
                />
                <i class="calendar-icon">📅</i>
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Giá trị phiếu</label>
            <div class="value-slider-container">
              <div class="value-slider">
                <div class="slider-track">
                  <div class="slider-fill"></div>
                  <div class="slider-thumb" :style="{ left: sliderValue + '%' }"></div>
                </div>
                <div class="slider-labels">
                  <span>0 ₫</span>
                  <span>5.000.000 ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <button class="btn btn-secondary" @click="resetFilters">
            Đặt lại bộ lọc
          </button>
          <button class="btn btn-primary" @click="exportExcel">
            Xuất Excel
          </button>
          <button class="btn btn-primary" @click="addVoucher">
            Thêm Phiếu Giảm Giá
          </button>
        </div>
      </div>
    </div>

    <!-- Voucher List Section -->
    <div class="voucher-list-section">
      <div class="list-header">
        <div class="list-title-wrapper">
          <i class="list-icon">📋</i>
          <h3 class="list-title">Danh Sách Phiếu Giảm Giá</h3>
        </div>
        <div class="list-summary">{{ filteredVouchers.length }} phiếu giảm giá</div>
      </div>
      
      <div class="table-container">
        <table class="voucher-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã Phiếu</th>
              <th>Giá Trị</th>
              <th>Loại Phiếu</th>
              <th>Trạng Thái</th>
              <th>Ngày Bắt Đầu</th>
              <th>Ngày Kết Thúc</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(voucher, index) in paginatedVouchers" :key="voucher.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ voucher.code }}</td>
              <td>{{ voucher.value }}</td>
              <td>{{ voucher.type }}</td>
              <td>
                <span class="status-badge" :class="voucher.status">
                  {{ voucher.statusText }}
                </span>
              </td>
              <td>{{ voucher.startDate }}</td>
              <td>{{ voucher.endDate }}</td>
              <td>
                <div class="action-buttons">
                  <label class="switch">
                    <input type="checkbox" :checked="voucher.status === 'active'" @change="toggleVoucherStatus(voucher)" />
                    <span class="slider round"></span>
                  </label>
                  <button class="action-btn edit" @click="editVoucher(voucher)">
                    ✏️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredVouchers.length === 0">
              <td colspan="8" class="no-data">
                Không có dữ liệu phù hợp
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span>Hiển thị {{ itemsPerPage }} mục / trang</span>
          <span>Hiển thị {{ startIndex + 1 }} - {{ endIndex }} / {{ filteredVouchers.length }} mục</span>
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" @click="goToFirstPage" :disabled="currentPage === 1">
            &lt;&lt;
          </button>
          <button class="pagination-btn" @click="goToPreviousPage" :disabled="currentPage === 1">
            &lt;
          </button>
          <button class="pagination-btn" @click="goToNextPage" :disabled="currentPage >= totalPages">
            &gt;
          </button>
          <button class="pagination-btn" @click="goToLastPage" :disabled="currentPage >= totalPages">
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PhieuGiamGiaForm from '../components/phieugiamgia/PhieuGiamGiaForm.vue'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const startDate = ref('')
const endDate = ref('')
const sliderValue = ref(100)
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Dữ liệu mẫu (fix cứng)
const vouchers = ref([
  {
    id: 1,
    code: 'PGG001',
    value: '10%',
    type: 'percentage',
    status: 'active',
    statusText: 'Đang diễn ra',
    startDate: '2024-06-01',
    endDate: '2024-07-01',
    ten: 'Phiếu giảm giá mùa hè',
    loai: '%',
    gia_tri: 10,
    giam_toi_da: 50000,
    so_luong: 100,
    dieu_kien: 200000,
    kieu: 'toan_bo',
    tu_ngay: '2024-06-01',
    den_ngay: '2024-07-01',
  },
  {
    id: 2,
    code: 'PGG002',
    value: '200000đ',
    type: 'fixed',
    status: 'upcoming',
    statusText: 'Sắp diễn ra',
    startDate: '2024-08-01',
    endDate: '2024-09-01',
    ten: 'Phiếu sinh viên',
    loai: 'VND',
    gia_tri: 200000,
    giam_toi_da: 0,
    so_luong: 50,
    dieu_kien: 500000,
    kieu: 'ca_nhan',
    tu_ngay: '2024-08-01',
    den_ngay: '2024-09-01',
  }
])

// Modal edit
const showEditModal = ref(false)
const editingVoucher = ref(null)

// Computed properties
const filteredVouchers = computed(() => {
  return vouchers.value.filter(voucher => {
    // Search filter
    if (searchQuery.value && !voucher.code.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (selectedType.value && voucher.type !== selectedType.value) {
      return false
    }
    
    // Status filter
    if (selectedStatus.value && voucher.status !== selectedStatus.value) {
      return false
    }
    
    // Date range filter
    if (startDate.value && new Date(voucher.startDate) < new Date(startDate.value)) {
      return false
    }
    if (endDate.value && new Date(voucher.endDate) > new Date(endDate.value)) {
      return false
    }
    
    return true
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredVouchers.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredVouchers.value.length)
})

const paginatedVouchers = computed(() => {
  return filteredVouchers.value.slice(startIndex.value, endIndex.value)
})

// Methods
function resetFilters() {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
  startDate.value = ''
  endDate.value = ''
  sliderValue.value = 100
  currentPage.value = 1
}

function exportExcel() {
  // TODO: Implement Excel export
  console.log('Export Excel')
}

function addVoucher() {
  // Navigate to add voucher form
  router.push('/quan-li-phieu-giam-gia/add')
}

function editVoucher(voucher) {
  router.push(`/quan-li-phieu-giam-gia/edit/${voucher.id}`)
}

function handleSaveEdit(edited) {
  // Tìm và cập nhật lại voucher trong mảng vouchers
  const idx = vouchers.value.findIndex(v => v.id === edited.id)
  if (idx !== -1) {
    vouchers.value[idx] = { ...edited,
      code: edited.ma || edited.code,
      value: edited.loai === '%' ? edited.gia_tri + '%' : (edited.gia_tri ? edited.gia_tri + 'đ' : ''),
      type: edited.loai === '%' ? 'percentage' : 'fixed',
      statusText: vouchers.value[idx].statusText, // giữ nguyên statusText
      status: vouchers.value[idx].status, // giữ nguyên status
      startDate: edited.tu_ngay,
      endDate: edited.den_ngay
    }
  }
  showEditModal.value = false
}

function viewVoucher(voucher) {
  // TODO: Show voucher detail modal
  console.log('View voucher:', voucher)
}

function deleteVoucher(voucher) {
  // TODO: Show delete confirmation
  console.log('Delete voucher:', voucher)
}

function toggleVoucherStatus(voucher) {
  // Đảo trạng thái active/upcoming/expired (demo logic)
  if (voucher.status === 'active') {
    voucher.status = 'expired';
    voucher.statusText = 'Đã kết thúc';
  } else if (voucher.status === 'upcoming') {
    voucher.status = 'active';
    voucher.statusText = 'Đang diễn ra';
  } else {
    voucher.status = 'upcoming';
    voucher.statusText = 'Sắp diễn ra';
  }
}

function goToFirstPage() {
  currentPage.value = 1
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function goToLastPage() {
  currentPage.value = totalPages.value
}
</script>

<style scoped>
/* --- FILTER SECTION: Style đồng bộ DiscountFilter.vue --- */
.voucher-management {
  padding: 24px;
  background: #fafbfc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 100%;
}

.filter-section {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 12px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.filter-icon {
  font-size: 14px;
  color: #6c757d;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-content {
  padding: 12px;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: end;
}

.filter-group {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
}

.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 6px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: #6c757d;
  font-size: 12px;
}

.search-input {
  width: 100%;
  padding: 6px 6px 6px 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  height: 32px;
}

.search-input:focus {
  outline: none;
  border-color: #28a745;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 32px;
}

.filter-select:focus {
  outline: none;
  border-color: #28a745;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input-wrapper {
  position: relative;
  flex: 1;
}

.calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 10px;
  pointer-events: none;
}

.date-input {
  width: 100%;
  padding: 6px 6px 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  background: #f8f9fa;
  transition: all 0.2s ease;
  height: 32px;
}

.date-input:focus {
  outline: none;
  border-color: #28a745;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.date-separator {
  color: #6c757d;
  font-size: 11px;
  white-space: nowrap;
  margin: 0 4px;
}

.value-slider-container {
  padding: 8px 0;
}

.value-slider {
  position: relative;
}

.slider-track {
  position: relative;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 12px 0 6px;
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #28a745;
  border-radius: 3px;
  width: 100%;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #28a745;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #6c757d;
  margin-top: 4px;
}

.filter-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
  position: relative;
  z-index: 5;
  margin-top: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 10;
  pointer-events: auto;
  user-select: none;
}

.btn-primary {
  background: #28a745;
  color: #ffffff;
}

.btn-primary:hover {
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

/* --- TABLE, BADGE, ACTION, PAGINATION: Khôi phục style cũ --- */
.voucher-list-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.list-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-icon {
  font-size: 18px;
  color: #666;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.list-summary {
  font-size: 14px;
  color: #666;
}

.table-container {
  overflow-x: auto;
}

.voucher-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.voucher-table th {
  background: #f8f9fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.voucher-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

.voucher-table tbody tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-badge.upcoming {
  background: #fff3e0;
  color: #f57c00;
}
.status-badge.expired {
  background: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
}
.action-btn.edit {
  background: #e3f2fd;
  color: #1976d2;
}
.action-btn.edit:hover {
  background: #bbdefb;
}
.action-btn.view {
  background: #f3e5f5;
  color: #7b1fa2;
}
.action-btn.view:hover {
  background: #e1bee7;
}
.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}
.action-btn.delete:hover {
  background: #ffcdd2;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 16px;
  font-style: italic;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.pagination-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}
.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Switch styles */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #28a745;
}

input:focus + .slider {
  box-shadow: 0 0 1px #28a745;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

@media (max-width: 1200px) {
  .filter-row {
    flex-direction: column;
    gap: 6px;
  }
  .filter-group {
    min-width: auto;
  }
}
@media (max-width: 768px) {
  .voucher-management {
    padding: 12px;
  }
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }
  .pagination-info {
    justify-content: center;
  }
}
</style> 