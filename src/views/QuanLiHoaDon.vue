<template>
  <div class="invoice-management">
    <!-- Header -->
    <div class="header d-flex justify-content-between align-items-center mb-3">
      <h2 class="fw-bold">Quản lý đơn hàng</h2>
    </div>

    <!-- Filter -->
    <div class="filter-section mb-3 p-3 bg-light rounded">
      <div class="row g-2 align-items-center">
        <div class="col-12 position-relative">
          <i class="bi bi-search position-absolute"
            style="top: 50%; left: 16px; transform: translateY(-50%); color: #888"></i>
          <input v-model="searchQuery" type="text" class="form-control rounded-pill ps-5"
            placeholder="Nhập mã hóa đơn hoặc tên, SĐT người nhận" @keyup.enter="handleSearch" />
        </div>
        <div class="col-12">
          <div class="d-flex gap-2 align-items-center">
            <div class="flex-grow-1 d-flex gap-2">
              <div class="w-50">
                <label class="form-label mb-1 ms-1">Từ ngày</label>
                <input v-model="dateFrom" type="date" class="form-control rounded-pill" />
              </div>
              <div class="w-50">
                <label class="form-label mb-1 ms-1">Đến ngày</label>
                <input v-model="dateTo" type="date" class="form-control rounded-pill" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-12 d-flex align-items-end justify-content-between">
          <div class="w-50">
            <label class="form-label mb-1 ms-1">Loại đơn</label>
            <select v-model="typeFilter" class="form-select rounded-pill">
              <option value="">Tất cả</option>
              <option value="Tại quầy">Tại quầy</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm rounded-pill" @click="handleSearch">
              <i class="bi bi-search me-1"></i> Tìm kiếm
            </button>
            <button class="btn btn-dark btn-sm rounded-pill" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-1"></i> Reset
            </button>
            <button class="btn btn-dark btn-sm rounded-pill" @click="scanQR">
              <i class="bi bi-qr-code-scan me-1"></i> Quét QR
            </button>
            <button class="btn btn-dark btn-sm rounded-pill" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-1"></i> Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="status-counts mb-3">
      <span class="status-tab" :class="{ active: activeStatusTab === '' }" @click="activeStatusTab = ''"
        v-if="statusCounts.total">
        TẤT CẢ
        <span class="badge-count">{{ statusCounts.total }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'processing' }"
        @click="activeStatusTab = 'processing'" v-if="statusCounts.processing">
        CHỜ XÁC NHẬN
        <span class="badge-count">{{ statusCounts.processing }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'confirmed' }"
        @click="activeStatusTab = 'confirmed'" v-if="statusCounts.confirmed">
        ĐÃ XÁC NHẬN
        <span class="badge-count">{{ statusCounts.confirmed }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'delivering' }"
        @click="activeStatusTab = 'delivering'" v-if="statusCounts.delivering">
        CHỜ GIAO HÀNG
        <span class="badge-count">{{ statusCounts.delivering }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'shipping' }" @click="activeStatusTab = 'shipping'"
        v-if="statusCounts.shipping">
        ĐANG VẬN CHUYỂN
        <span class="badge-count">{{ statusCounts.shipping }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'delivered' }"
        @click="activeStatusTab = 'delivered'" v-if="statusCounts.delivered">
        HOÀN THÀNH
        <span class="badge-count">{{ statusCounts.delivered }}</span>
      </span>
      <span class="status-tab" :class="{ active: activeStatusTab === 'done' }" @click="activeStatusTab = 'done'"
        v-if="statusCounts.done">
        HOÀN TẤT
        <span class="badge-count">{{ statusCounts.done }}</span>
      </span>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr class="table-header">
            <th style="width: 50px">#</th>
            <th>Mã HĐ</th>
            <th style="width: 200px">Khách hàng</th>
            <th style="width: 100px">Loại HĐ</th>
            <th>Nhân viên</th>
            <th>Mã NV</th>
            <th style="width: 150px">Ngày tạo</th>
            <th style="width: 130px">Trạng thái</th>
            <th class="text-end" style="width: 130px">Tổng tiền</th>
            <th class="text-center" style="width: 100px">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading state -->
          <tr v-if="loading">
            <td colspan="10" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="hoaDons.length === 0">
            <td colspan="10" class="text-center py-5">
              <i class="bi bi-inbox fs-1 text-muted"></i>
              <p class="mt-2 text-muted">Không tìm thấy hóa đơn nào</p>
            </td>
          </tr>

          <!-- Data rows -->
          <tr v-else v-for="(hoaDon, index) in hoaDons" :key="hoaDon.id">
            <td>{{ currentPage * pageSize + index + 1 }}</td>
            <td class="fw-semibold">{{ hoaDon.ma }}</td>
            <td class="customer-col">
              <div class="customer-name" style="font-weight: normal">
                {{ hoaDon.tenKhachHang || 'Khách lẻ' }}
              </div>
              <div class="customer-phone" v-if="hoaDon.sdt">
                {{ hoaDon.sdt }}
              </div>
            </td>
            <td>
              <span class="badge bg-secondary">
                {{ hoaDon.loaiHoaDon === 0 ? 'Tại quầy' : 'Online' }}
              </span>
            </td>
            <td class="createdby-col">{{ hoaDon.tenNhanVien || 'N/A' }}</td>
            <td class="staffcode-col">{{ hoaDon.maNhanVien || 'N/A' }}</td>
            <td class="createdat-col">{{ formatDate(hoaDon.ngayTao) }}</td>
            <td>
              <span :class="['badge', getStatusBadgeClass(hoaDon.trangThai)]">
                {{ getTrangThaiLabel(hoaDon.trangThai) }}
              </span>
            </td>
            <td class="fw-semibold">{{ formatCurrency(hoaDon.tongTienSauGiam) }}</td>
            <td class="action-col">
              <button class="btn btn-outline-success btn-sm rounded-circle me-1" @click="openDetail(hoaDon)"
                title="Xem chi tiết">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-outline-dark btn-sm rounded-circle" @click="printInvoice(hoaDon)"
                title="In hóa đơn">
                <i class="bi bi-printer"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <div class="text-muted">
        Hiển thị {{ hoaDons.length }} / {{ totalElements }} hóa đơn
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a class="page-link" href="#" @click.prevent="prevPage">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>

          <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="goToPage(page)">
              {{ page + 1 }}
            </a>
          </li>

          <li class="page-item" :class="{ disabled: currentPage >= totalPages - 1 }">
            <a class="page-link" href="#" @click.prevent="nextPage">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal chi tiết -->
    <ChiTietHoaDonModal v-if="showDetailModal" :idHoaDon="selectedHoaDonId" @close="closeDetailModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getHoaDons } from '@/service/hoaDonService'
import ChiTietHoaDonModal from '@/components/hoadon/ChiTietHoaDonModal.vue'

// State
const hoaDons = ref([])
const loading = ref(false)
const searchQuery = ref('')
const typeFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeStatusTab = ref('')
const showDetailModal = ref(false)
const selectedHoaDonId = ref(null)

// Pagination
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// Load data khi component mount
onMounted(() => {
  fetchHoaDons()
})

// Reload khi thay đổi page
watch(currentPage, () => {
  fetchHoaDons()
})

/**
 * Gọi API lấy danh sách hóa đơn
 */
const fetchHoaDons = async () => {
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchQuery.value || undefined,
      loaiHoaDon: typeFilter.value === 'Tại quầy' ? 0 : typeFilter.value === 'Online' ? 1 : undefined,
      trangThai: mapStatusToNumber(activeStatusTab.value),
      startDate: dateFrom.value || undefined,
      endDate: dateTo.value || undefined
    }

    const response = await getHoaDons(params)

    // Parse response
    const pageData = response.data
    hoaDons.value = pageData.content || []
    totalPages.value = pageData.totalPages || 0
    totalElements.value = pageData.totalElements || 0

    console.log('✅ Loaded hóa đơn:', hoaDons.value.length)
  } catch (error) {
    console.error('❌ Lỗi khi load hóa đơn:', error)
    alert('Không thể tải danh sách hóa đơn. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
}

/**
 * Map status tab sang số (theo DB)
 */
const mapStatusToNumber = (status) => {
  const map = {
    'CHO_THANH_TOAN': undefined, // Không lọc
    'CHO_XAC_NHAN': undefined,
    'DA_XAC_NHAN': undefined,
    'DANG_GIAO': undefined,
    'HOAN_THANH': undefined,
    'DA_HUY': undefined
  }
  return map[status]
}

/**
 * Tính số lượng hóa đơn theo trạng thái (cho tabs)
 */
const statusCounts = computed(() => {
  // TODO: Backend cần API riêng để lấy counts, tạm thời dùng client-side
  const counts = { total: hoaDons.value.length }
  hoaDons.value.forEach(hd => {
    const status = hd.trangThai
    counts[status] = (counts[status] || 0) + 1
  })
  return counts
})

/**
 * Tính các trang hiển thị trong pagination
 */
const visiblePages = computed(() => {
  const maxVisible = 5
  const pages = []

  let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible)

  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible)
  }

  for (let i = start; i < end; i++) {
    pages.push(i)
  }

  return pages
})

/**
 * Tìm kiếm khi user nhấn enter hoặc click nút
 */
const handleSearch = () => {
  currentPage.value = 0 // Reset về trang đầu
  fetchHoaDons()
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getTrangThaiLabel = (trangThai) => {
  const labels = {
    'CHO_THANH_TOAN': 'Chờ thanh toán',
    'CHO_XAC_NHAN': 'Chờ xác nhận',
    'DA_XAC_NHAN': 'Đã xác nhận',
    'DANG_GIAO': 'Đang giao hàng',
    'HOAN_THANH': 'Hoàn thành',
    'DA_HUY': 'Đã hủy'
  }
  return labels[trangThai] || trangThai
}

const getStatusBadgeClass = (trangThai) => {
  const classes = {
    'CHO_THANH_TOAN': 'bg-secondary',
    'CHO_XAC_NHAN': 'bg-warning',
    'DA_XAC_NHAN': 'bg-info',
    'DANG_GIAO': 'bg-primary',
    'HOAN_THANH': 'bg-success',
    'DA_HUY': 'bg-danger'
  }
  return classes[trangThai] || 'bg-secondary'
}

const openDetail = (hoaDon) => {
  selectedHoaDonId.value = hoaDon.id
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedHoaDonId.value = null
}

const printInvoice = (hoaDon) => {
  alert(`In hóa đơn: ${hoaDon.ma}`)
}

const scanQR = () => {
  alert('Chức năng Quét QR đang được phát triển!')
}

const exportExcel = () => {
  alert('Chức năng Xuất Excel đang được phát triển!')
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  activeStatusTab.value = ''
  currentPage.value = 0
  fetchHoaDons()
}

// Pagination
const goToPage = (page) => {
  currentPage.value = page
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}
</script>

<style scoped>
/* --- TỔNG QUAN --- */
.invoice-management {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #212529;
}

/* --- HEADER --- */
.header h2 {
  font-size: 1.8rem;
  color: #000;
  font-weight: 800;
}

/* --- KHUNG FILTER --- */
.filter-section {
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.filter-section label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.filter-section .form-control,
.filter-section .form-select {
  font-size: 0.95rem;
  border-color: #dee2e6;
}

/* --- CÁC TAB LỌC TRẠNG THÁI --- */
.status-counts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.status-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  background: #fff;
  /* Nền trắng */
  color: #16a34a;
  /* Chữ xanh lá */
  border: 1px solid #16a34a;
  /* Viền xanh lá */
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.status-tab.active {
  background: #16a34a;
  /* Nền xanh lá */
  color: #fff;
  border-color: #16a34a;
}

.status-tab:hover:not(.active) {
  background: #f0fdf4;
  /* Nền xanh lá cây rất nhạt */
}

.status-tab .badge-count {
  background: #16a34a;
  /* Nền xanh lá */
  color: #fff;
  border: 2px solid #fff;
  font-size: 0.8rem;
  border-radius: 50%;
  padding: 1px 6px;
  font-weight: 700;
  position: absolute;
  top: -10px;
  right: -10px;
}

/* --- BẢNG DỮ LIỆU --- */
.table {
  font-size: 0.9rem;
}

.table th {
  background: #f8f9fa;
  color: #212529;
  font-weight: 600;
  text-align: center;
  vertical-align: middle;
  padding: 12px 8px;
}

.table td {
  text-align: center;
  vertical-align: middle;
  padding: 10px 8px;
}

.customer-col {
  text-align: left !important;
  white-space: normal;
}

.customer-phone {
  color: #6c757d;
  font-size: 0.85rem;
}

/* --- CÁC BADGE TRONG BẢNG --- */
.badge {
  display: inline-block;
  padding: 5px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
  background-color: #e9ecef;
  color: #212529;
}

/* --- CÁC NÚT HÀNH ĐỘNG --- */
.action-col button {
  width: 32px;
  height: 32px;
  border-color: #ced4da;
  color: #495057;
}

.action-col button:hover {
  background-color: #212529;
  border-color: #212529;
  color: #fff;
}

.btn-dark {
  background: #f0fdf4;
  /* Nền xanh lá nhạt */
  color: #16a34a;
  /* Chữ xanh lá */
  border-color: #a7f3d0;
  font-weight: 600;
}

.btn-dark:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
}
</style>
