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
            <button class="btn btn-dark btn-sm rounded-pill" @click="openAdvancedSearch">
              <i class="bi bi-funnel me-1"></i> Tìm kiếm nâng cao
            </button>
            <button class="btn btn-dark btn-sm rounded-pill" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-1"></i> Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="selectedIds.length > 0" class="bulk-actions-bar mb-3 p-3 bg-primary text-white rounded">
      <div class="d-flex justify-content-between align-items-center">
        <span>
          <i class="bi bi-check-square"></i> Đã chọn <strong>{{ selectedIds.length }}</strong> hóa
          đơn
        </span>
        <div class="d-flex gap-2">
          <button class="btn btn-light btn-sm" @click="handleBulkConfirm" :disabled="isBulkProcessing">
            <span v-if="isBulkProcessing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-check-circle"></i>
            Xác nhận hàng loạt
          </button>
          <button class="btn btn-light btn-sm" @click="handleBulkCancel" :disabled="isBulkProcessing">
            <span v-if="isBulkProcessing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-x-circle"></i>
            Hủy hàng loạt
          </button>
          <button class="btn btn-light btn-sm" @click="exportExcel(true)" :disabled="isBulkProcessing">
            <i class="bi bi-file-earmark-excel"></i> Xuất Excel
          </button>
          <button class="btn btn-light btn-sm" @click="printBulkInvoices" :disabled="isBulkProcessing">
            <i class="bi bi-printer"></i> In hàng loạt
          </button>
          <button class="btn btn-light btn-sm" @click="selectedIds = []" :disabled="isBulkProcessing">
            <i class="bi bi-x"></i> Bỏ chọn
          </button>
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
            <th style="width: 50px">
              <input type="checkbox" @change="toggleSelectAll"
                :checked="selectedIds.length === hoaDons.length && hoaDons.length > 0"
                :indeterminate="selectedIds.length > 0 && selectedIds.length < hoaDons.length" />
            </th>
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
            <td colspan="11" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="hoaDons.length === 0">
            <td colspan="11" class="text-center py-5">
              <i class="bi bi-inbox fs-1 text-muted"></i>
              <p class="mt-2 text-muted">Không tìm thấy hóa đơn nào</p>
            </td>
          </tr>

          <!-- Data rows -->
          <tr v-else v-for="(hoaDon, index) in hoaDons" :key="hoaDon.id">
            <td>
              <input type="checkbox" :value="hoaDon.id" v-model="selectedIds" />
            </td>
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
              <span class="badge" :class="hoaDon.loaiHoaDon === 0 ? 'bg-success' : 'bg-info text-dark'">
                {{ hoaDon.loaiHoaDon === 0 ? 'Tại quầy' : 'Online' }}
              </span>
            </td>
            <td class="createdby-col">{{ hoaDon.tenNhanVien || 'N/A' }}</td>
            <td class="staffcode-col">{{ hoaDon.maNhanVien || 'N/A' }}</td>
            <td class="createdat-col">{{ formatDate(hoaDon.ngayTao) }}</td>
            <td>
              <span :class="['badge', getStatusBadgeClass(hoaDon)]">
                {{ getTrangThaiLabel(hoaDon) }}
              </span>
              <!-- Badge "CHỜ XÁC NHẬN" cho đơn online chưa được xác nhận -->
              <span v-if="
                hoaDon.loaiHoaDon === 1 &&
                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0)
              " class="badge bg-info text-white ms-1" title="Đơn hàng đang chờ admin xác nhận">
                <i class="bi bi-clock-history me-1"></i>CHỜ XÁC NHẬN
              </span>
              <!-- Badge thanh toán QR (chỉ hiện khi đã thanh toán QR) -->
              <span v-if="
                hoaDon.loaiHoaDon === 1 &&
                hoaDon.trangThaiThanhToan === 1 &&
                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0)
              " class="badge bg-success text-white ms-1" title="Đã thanh toán bằng QR Code">
                <i class="bi bi-qr-code me-1"></i>QR
              </span>
              <!-- Badge COD (chỉ hiện khi chưa thanh toán) -->
              <span v-else-if="
                hoaDon.loaiHoaDon === 1 &&
                (hoaDon.trangThaiThanhToan === 0 || hoaDon.trangThaiThanhToan === null) &&
                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0)
              " class="badge bg-warning text-dark ms-1" title="Thanh toán khi nhận hàng (COD)">
                <i class="bi bi-truck me-1"></i>COD
              </span>
            </td>
            <td class="fw-semibold">{{ formatCurrency(hoaDon.tongTienSauGiam) }}</td>
            <td class="action-col">
              <button class="btn btn-outline-success btn-sm rounded-circle me-1" @click="openDetail(hoaDon)"
                title="Xem chi tiết">
                <i class="bi bi-eye"></i>
              </button>
              <!-- Nút xác nhận đơn hàng online
                   Hiện khi: đơn online, chưa được xác nhận (trangThai = 0)
                   - COD: chưa thanh toán (trangThaiThanhToan = 0)
                   - QR: đã thanh toán (trangThaiThanhToan = 1)
              -->
              <button v-if="
                hoaDon.loaiHoaDon === 1 &&
                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0) &&
                hoaDon.trangThai !== 'DA_HUY' &&
                hoaDon.trangThai !== 2
              " class="btn btn-outline-primary btn-sm rounded-circle me-1" @click="xacNhanDonHang(hoaDon)" :title="hoaDon.trangThaiThanhToan === 1
                ? 'Xác nhận đơn hàng đã thanh toán QR và chuyển sang đang giao hàng'
                : 'Xác nhận đơn hàng COD và chuyển sang đang giao hàng'">
                <i class="bi bi-check-circle"></i>
              </button>
              <!-- Nút hủy đơn hàng online (chỉ hiện khi chưa xác nhận) -->
              <button v-if="
                hoaDon.loaiHoaDon === 1 &&
                (hoaDon.trangThai === 'CHO_THANH_TOAN' || hoaDon.trangThai === 0) &&
                hoaDon.trangThai !== 'DA_HUY' &&
                hoaDon.trangThai !== 2
              " class="btn btn-outline-danger btn-sm rounded-circle me-1" @click="huyDonHang(hoaDon)"
                title="Hủy đơn hàng">
                <i class="bi bi-x-circle"></i>
              </button>
              <!-- Nút chuyển trạng thái (chỉ hiện khi chưa hủy và chưa hoàn thành) -->
              <button v-if="canChangeStatus(hoaDon)" class="btn btn-outline-info btn-sm rounded-circle me-1"
                @click="openChangeStatusModal(hoaDon)" title="Chuyển trạng thái">
                <i class="bi bi-arrow-repeat"></i>
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
      <div class="text-muted">Hiển thị {{ hoaDons.length }} / {{ totalElements }} hóa đơn</div>
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
    <ChiTietHoaDonModal v-if="showDetailModal" :idHoaDon="selectedHoaDonId" @close="closeDetailModal"
      @order-confirmed="handleOrderConfirmed" @order-cancelled="handleOrderCancelled" />

    <!-- QR Scanner Modal -->
    <QRScannerModal v-if="showQRScanner" @close="closeQRScanner" @invoice-found="handleInvoiceFound" />

    <!-- Advanced Search Modal -->
    <AdvancedSearchModal v-if="showAdvancedSearch" :model-value="advancedFilters" @close="closeAdvancedSearch"
      @search="handleAdvancedSearch" />

    <!-- Modal chuyển trạng thái -->
    <div v-if="showChangeStatusModal" class="modal fade show d-block"
      style="z-index: 10000; background-color: rgba(0, 0, 0, 0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-arrow-repeat"></i> Chuyển trạng thái hóa đơn
            </h5>
            <button type="button" class="btn-close" @click="closeChangeStatusModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Trạng thái hiện tại:</label>
              <div>
                <span :class="['badge', getStatusBadgeClass(selectedHoaDonForStatus)]">
                  {{ getTrangThaiLabel(selectedHoaDonForStatus) }}
                </span>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Chuyển sang trạng thái:</label>
              <select v-model="newStatus" class="form-select">
                <option v-for="option in availableStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeChangeStatusModal">
              Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="handleChangeStatus" :disabled="changingStatus ||
              newStatus === null ||
              newStatus === getCurrentStatus(selectedHoaDonForStatus)
              ">
              <span v-if="changingStatus" class="spinner-border spinner-border-sm me-2"></span>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getHoaDons,
  xacNhanDonHang as xacNhanDonHangAPI,
  huyDonHang as huyDonHangAPI,
  getHoaDonStatusCounts,
  copyInvoice as copyInvoiceAPI,
  capNhatTrangThai,
} from '@/service/hoadon/hoaDonService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/common/useToast'
import { useConfirm } from '@/composables/common/useConfirm'
import { useErrorHandler } from '@/composables/common/useErrorHandler'
import { useAuthStore } from '@/stores/taikhoan/authStore'
import ChiTietHoaDonModal from '@/components/hoadon/ChiTietHoaDonModal.vue'
import QRScannerModal from '@/components/hoadon/QRScannerModal.vue'
import AdvancedSearchModal from '@/components/hoadon/AdvancedSearchModal.vue'
import InvoiceStats from '@/components/hoadon/InvoiceStats.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

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
const route = useRoute()
const router = useRouter()

// Pagination
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// Status counts
const statusCountsData = ref(null)
const isLoadingCounts = ref(false)
const isLoadStatusCountsInProgress = ref(false) // Prevent infinite loop

// Bulk actions
const selectedIds = ref([])
const isBulkProcessing = ref(false)

// Change status modal
const showChangeStatusModal = ref(false)
const selectedHoaDonForStatus = ref(null)
const newStatus = ref(null)
const changingStatus = ref(false)

// Prevent infinite loop
const isFetching = ref(false)

// Toast & Confirm
const { success: showSuccess, error: showError, warning: showWarning } = useToast()
const { showConfirm } = useConfirm()
const { handleError: handleErrorWithRetry } = useErrorHandler()
const authStore = useAuthStore()

// Keyboard shortcuts
const handleKeyPress = (event) => {
  // Ctrl/Cmd + F: Focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    document.querySelector('input[type="text"]')?.focus()
  }

  // Ctrl/Cmd + E: Export Excel
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault()
    exportExcel()
  }

  // Esc: Close modals
  if (event.key === 'Escape') {
    if (showDetailModal.value) closeDetailModal()
    if (showQRScanner.value) closeQRScanner()
    if (showAdvancedSearch.value) closeAdvancedSearch()
  }

  // Enter: Search (when in search input)
  if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
    handleSearch()
  }
}

// Load data khi component mount
onMounted(() => {
  fetchHoaDons()
  loadStatusCounts()
  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('open-invoice-detail', handleExternalOpenDetail)
  openInvoiceFromRoute()
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('open-invoice-detail', handleExternalOpenDetail)
})

function openInvoiceFromRoute() {
  const invoiceId = route.query.openInvoiceId
  const invoiceCode = route.query.openInvoiceCode

  if (!invoiceId && !invoiceCode) {
    return
  }

  if (invoiceId) {
    selectedHoaDonId.value = invoiceId
    showDetailModal.value = true
  } else if (invoiceCode) {
    const foundInvoice = hoaDons.value.find((item) => item.ma === invoiceCode)
    if (foundInvoice) {
      openDetail(foundInvoice)
    } else {
      showWarning(`Không tìm thấy hóa đơn với mã ${invoiceCode}.`)
    }
  }

  const cleanedQuery = { ...route.query }
  delete cleanedQuery.openInvoiceId
  delete cleanedQuery.openInvoiceCode
  delete cleanedQuery._invoiceTs

  router.replace({ query: cleanedQuery }).catch(() => { })
}

// Reload khi thay đổi page (chỉ khi không đang fetch)
watch(currentPage, () => {
  if (!isFetching.value) {
    fetchHoaDons()
  }
})

// Reload khi thay đổi status tab (chỉ khi không đang fetch)
watch(
  activeStatusTab,
  () => {
    if (!isFetching.value) {
      currentPage.value = 0 // Reset về trang đầu
      fetchHoaDons()
      // KHÔNG gọi loadStatusCounts() ở đây để tránh vòng lặp
      // Status counts sẽ được cập nhật khi cần thiết (sau khi xác nhận/hủy đơn)
    }
  },
  { immediate: false },
) // Không chạy ngay khi mount

watch(
  () => route.query._invoiceTs,
  () => {
    openInvoiceFromRoute()
  },
)

/**
 * Gọi API lấy danh sách hóa đơn
 */
const fetchHoaDons = async () => {
  // Prevent concurrent calls
  if (isFetching.value) {
    return
  }

  isFetching.value = true
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchQuery.value || undefined,
      loaiHoaDon:
        typeFilter.value === 'Tại quầy' ? 0 : typeFilter.value === 'Online' ? 1 : undefined,
      trangThai: mapStatusToNumber(activeStatusTab.value),
      startDate: dateFrom.value || undefined,
      endDate: dateTo.value || undefined,
    }

    const response = await getHoaDons(params)

    // Parse response
    const pageData = response.data
    hoaDons.value = pageData.content || []
    totalPages.value = pageData.totalPages || 0
    totalElements.value = pageData.totalElements || 0

    console.log('✅ Loaded hóa đơn:', hoaDons.value.length)
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => {
        isFetching.value = false
        fetchHoaDons() // Retry function
      },
      'Không thể tải danh sách hóa đơn. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 3 },
    )
  } finally {
    loading.value = false
    isFetching.value = false
  }
}

/**
 * Map status tab sang số (theo DB)
 * TrangThaiHoaDon enum: 0=CHO_THANH_TOAN, 1=DA_THANH_TOAN, 2=DA_HUY, 3=DANG_GIAO, 4=HOAN_THANH
 *
 * Lưu ý: Đối với đơn online, trạng thái CHO_THANH_TOAN (0) có thể có 2 trường hợp:
 * - Chờ thanh toán (chưa thanh toán)
 * - Đã thanh toán nhưng chờ xác nhận từ admin
 *
 * Backend nên có thêm field trangThaiThanhToan để phân biệt:
 * - trangThai = 0 && trangThaiThanhToan = 0: Chờ thanh toán
 * - trangThai = 0 && trangThaiThanhToan = 1: Đã thanh toán, chờ xác nhận
 */
const mapStatusToNumber = (status) => {
  const map = {
    '': undefined, // Tất cả
    processing: 0, // CHO_THANH_TOAN - Chờ thanh toán/chờ xác nhận
    confirmed: 1, // DA_THANH_TOAN - Đã thanh toán/Đã xác nhận
    delivering: 3, // DANG_GIAO - Đang giao hàng
    shipping: 3, // DANG_GIAO - Đang vận chuyển
    delivered: 4, // HOAN_THANH - Hoàn thành
    done: 4, // HOAN_THANH - Hoàn tất
    cancelled: 2, // DA_HUY - Đã hủy
  }
  return map[status]
}

/**
 * Load status counts từ API
 */
const loadStatusCounts = async () => {
  // Prevent infinite loop - nếu đang load thì không load lại
  if (isLoadStatusCountsInProgress.value) {
    console.warn('⚠️ [loadStatusCounts] Đang load, bỏ qua request mới')
    return
  }

  console.log('🔵 [loadStatusCounts] Bắt đầu load status counts')
  console.trace('🔵 [loadStatusCounts] Stack trace:') // Debug: xem ai gọi function này

  isLoadStatusCountsInProgress.value = true
  isLoadingCounts.value = true

  try {
    const response = await getHoaDonStatusCounts()
    if (response && response.data) {
      console.log('✅ [loadStatusCounts] Nhận được data:', response.data)
      statusCountsData.value = response.data
    } else {
      // Fallback về client-side nếu API chưa có
      console.log('⚠️ [loadStatusCounts] Không có data, set null')
      statusCountsData.value = null
    }
  } catch (error) {
    console.warn('⚠️ Không thể load status counts từ API, dùng client-side:', error)
    statusCountsData.value = null
  } finally {
    isLoadingCounts.value = false
    isLoadStatusCountsInProgress.value = false
    console.log('🔵 [loadStatusCounts] Hoàn thành load status counts')
  }
}

/**
 * Tính số lượng hóa đơn theo trạng thái (cho tabs)
 * Ưu tiên dùng data từ API, fallback về client-side calculation
 */
const statusCounts = computed(() => {
  // Nếu có data từ API, dùng data đó
  if (statusCountsData.value) {
    // Không log ở đây vì computed được gọi nhiều lần khi render
    return statusCountsData.value
  }

  // Fallback: tính từ dữ liệu hiện tại (chỉ trang hiện tại)
  const counts = {
    total: totalElements.value || hoaDons.value.length,
    processing: 0,
    confirmed: 0,
    delivering: 0,
    shipping: 0,
    delivered: 0,
    done: 0,
    cancelled: 0,
  }

  hoaDons.value.forEach((hd) => {
    const status = hd.trangThai
    const loaiHoaDon = hd.loaiHoaDon
    const trangThaiThanhToan = hd.trangThaiThanhToan

    // Đếm đơn chờ xác nhận (bao gồm cả chờ thanh toán và đã thanh toán chờ xác nhận)
    if (status === 'CHO_THANH_TOAN' || status === 0) {
      counts.processing++
      // Đơn online đã thanh toán nhưng chờ xác nhận cũng được đếm vào processing
      if (loaiHoaDon === 1 && trangThaiThanhToan === 1) {
        // Đã được đếm vào processing rồi
      }
    } else if (status === 'DA_THANH_TOAN' || status === 1) counts.confirmed++
    else if (status === 'DANG_GIAO' || status === 3) {
      counts.delivering++
      counts.shipping++
    } else if (status === 'HOAN_THANH' || status === 4) {
      counts.delivered++
      counts.done++
    } else if (status === 'DA_HUY' || status === 2) counts.cancelled++
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
    year: 'numeric',
  })
}

/**
 * Lấy label trạng thái hóa đơn
 * Logic rõ ràng cho đơn online:
 * - COD (trangThaiThanhToan = 0): "Chờ thanh toán" + badge "Chờ xác nhận"
 * - QR (trangThaiThanhToan = 1): "Đã thanh toán" + badge "Chờ xác nhận"
 */
const getTrangThaiLabel = (hoaDon) => {
  // Mapping theo enum TrangThaiHoaDon:
  // 0: CHO_THANH_TOAN, 1: DA_THANH_TOAN, 2: DA_HUY, 3: DANG_GIAO, 4: HOAN_THANH

  // Nếu hoaDon là string (trạng thái cũ), xử lý tương thích
  if (typeof hoaDon === 'string') {
    const labels = {
      CHO_THANH_TOAN: 'Chờ thanh toán',
      DA_THANH_TOAN: 'Đã thanh toán',
      DA_HUY: 'Đã hủy',
      DANG_GIAO: 'Đang giao hàng',
      HOAN_THANH: 'Hoàn thành',
    }
    return labels[hoaDon] || hoaDon
  }

  // Nếu hoaDon là object (format mới)
  const trangThai = hoaDon.trangThai
  const loaiHoaDon = hoaDon.loaiHoaDon
  const trangThaiThanhToan = hoaDon.trangThaiThanhToan

  // Xử lý đặc biệt cho đơn ONLINE (loaiHoaDon = 1)
  if (loaiHoaDon === 1 && (trangThai === 'CHO_THANH_TOAN' || trangThai === 0)) {
    // Đơn online chưa được xác nhận (trangThai = 0)
    if (trangThaiThanhToan === 1) {
      // Đã thanh toán QR nhưng chờ xác nhận
      return 'Đã thanh toán'
    } else {
      // Chưa thanh toán (COD) - chờ thanh toán khi nhận hàng
      return 'Chờ thanh toán'
    }
  }

  // Mapping theo enum (ưu tiên number)
  if (typeof trangThai === 'number') {
    const labels = {
      0: 'Chờ thanh toán', // CHO_THANH_TOAN
      1: 'Đã thanh toán', // DA_THANH_TOAN
      2: 'Đã hủy', // DA_HUY
      3: 'Đang giao hàng', // DANG_GIAO
      4: 'Hoàn thành', // HOAN_THANH
    }
    return labels[trangThai] || `Trạng thái ${trangThai}`
  }

  // Mapping theo string (tương thích)
  const labels = {
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    DA_HUY: 'Đã hủy',
    DANG_GIAO: 'Đang giao hàng',
    HOAN_THANH: 'Hoàn thành',
  }

  return labels[trangThai] || trangThai || 'Không xác định'
}

/**
 * Kiểm tra có phải thanh toán QR không
 */
const isQRPayment = (hoaDon) => {
  const methodName = (
    hoaDon.phuongThucThanhToan ||
    hoaDon.tenPhuongThucThanhToan ||
    ''
  ).toLowerCase()
  return (
    methodName.includes('qr') ||
    methodName.includes('chuyển khoản qr') ||
    methodName.includes('chuyen khoan qr')
  )
}

/**
 * Lấy class badge cho trạng thái
 * Logic rõ ràng:
 * - Đơn online COD (chưa thanh toán): vàng (bg-warning)
 * - Đơn online QR (đã thanh toán): xanh dương (bg-info)
 */
const getStatusBadgeClass = (hoaDon) => {
  // Mapping theo enum TrangThaiHoaDon:
  // 0: CHO_THANH_TOAN, 1: DA_THANH_TOAN, 2: DA_HUY, 3: DANG_GIAO, 4: HOAN_THANH

  // Tương thích với format cũ (string)
  if (typeof hoaDon === 'string') {
    const classes = {
      CHO_THANH_TOAN: 'bg-warning text-dark',
      DA_THANH_TOAN: 'bg-info text-white',
      DA_HUY: 'bg-danger text-white',
      DANG_GIAO: 'bg-primary text-white',
      HOAN_THANH: 'bg-success text-white',
    }
    return classes[hoaDon] || 'bg-secondary'
  }

  // Format mới (object)
  const trangThai = hoaDon.trangThai
  const loaiHoaDon = hoaDon.loaiHoaDon
  const trangThaiThanhToan = hoaDon.trangThaiThanhToan

  // Xử lý đặc biệt cho đơn ONLINE (loaiHoaDon = 1) chưa được xác nhận
  if (loaiHoaDon === 1 && (trangThai === 'CHO_THANH_TOAN' || trangThai === 0)) {
    if (trangThaiThanhToan === 1) {
      // Đã thanh toán QR - màu xanh dương (bg-info)
      return 'bg-info text-white'
    } else {
      // Chưa thanh toán COD - màu vàng (bg-warning)
      return 'bg-warning text-dark'
    }
  }

  // Mapping theo number (ưu tiên)
  if (typeof trangThai === 'number') {
    const classes = {
      0: 'bg-warning text-dark', // CHO_THANH_TOAN - Chờ thanh toán (vàng)
      1: 'bg-info text-white', // DA_THANH_TOAN - Đã thanh toán (xanh dương)
      2: 'bg-danger text-white', // DA_HUY - Đã hủy (đỏ)
      3: 'bg-primary text-white', // DANG_GIAO - Đang giao hàng (xanh)
      4: 'bg-success text-white', // HOAN_THANH - Hoàn thành (xanh lá)
    }
    return classes[trangThai] || 'bg-secondary'
  }

  // Mapping theo string (tương thích)
  const classes = {
    CHO_THANH_TOAN: 'bg-warning text-dark',
    DA_THANH_TOAN: 'bg-info text-white',
    DA_HUY: 'bg-danger text-white',
    DANG_GIAO: 'bg-primary text-white',
    HOAN_THANH: 'bg-success text-white',
  }

  return classes[trangThai] || 'bg-secondary'
}

const openDetail = (hoaDon) => {
  selectedHoaDonId.value = hoaDon.id
  showDetailModal.value = true
}

const handleExternalOpenDetail = (event) => {
  const detail = event?.detail || {}
  const orderId = detail.orderId || detail.idHoaDon || detail.id
  const orderCode = detail.orderCode || detail.ma

  if (orderId) {
    selectedHoaDonId.value = orderId
    showDetailModal.value = true
    return
  }

  if (orderCode) {
    const found = hoaDons.value.find((item) => item.ma === orderCode)
    if (found) {
      openDetail(found)
      return
    }

    showWarning(`Không tìm thấy hóa đơn với mã ${orderCode}.`)
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedHoaDonId.value = null
}

// Handle order confirmed from modal
const handleOrderConfirmed = (orderId) => {
  fetchHoaDons() // Refresh list
  // Chỉ reload status counts sau khi fetch xong, không gọi ngay để tránh vòng lặp
  setTimeout(() => {
    if (!isLoadStatusCountsInProgress.value) {
      loadStatusCounts()
    }
  }, 500)
}

// Handle order cancelled from modal
const handleOrderCancelled = (orderId) => {
  fetchHoaDons() // Refresh list
  // Chỉ reload status counts sau khi fetch xong, không gọi ngay để tránh vòng lặp
  setTimeout(() => {
    if (!isLoadStatusCountsInProgress.value) {
      loadStatusCounts()
    }
  }, 500)
}

/**
 * In hóa đơn
 */
const copyInvoice = async (hoaDon) => {
  if (!hoaDon?.id) {
    showError('Không có thông tin hóa đơn để sao chép!')
    return
  }

  const confirmed = await showConfirm({
    title: 'Sao chép hóa đơn',
    message: `Bạn có muốn sao chép hóa đơn ${hoaDon.ma}? Hóa đơn mới sẽ có trạng thái "Chờ thanh toán".`,
    confirmText: 'Sao chép',
    cancelText: 'Hủy',
    type: 'info',
  })

  if (!confirmed) return

  try {
    const response = await copyInvoiceAPI(hoaDon.id)
    showSuccess('Sao chép hóa đơn thành công!')
    fetchHoaDons()
    // Mở hóa đơn mới nếu có
    if (response?.data?.id) {
      selectedHoaDonId.value = response.data.id
      showDetailModal.value = true
    }
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => copyInvoice(hoaDon),
      'Không thể sao chép hóa đơn. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

const printInvoice = async (hoaDon) => {
  if (!hoaDon?.id) {
    showError('Không có thông tin hóa đơn để in!')
    return
  }

  try {
    const blob = await inHoaDon(hoaDon.id)

    // Backend trả về HTML, không phải PDF
    const contentType = blob.type || 'text/html'
    const isHTML = contentType.includes('html') || contentType.includes('text')

    if (isHTML) {
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          setTimeout(() => {
            URL.revokeObjectURL(url)
          }, 1000)
        }
      } else {
        // Fallback: download nếu popup bị chặn
        const link = document.createElement('a')
        link.href = url
        link.download = `HoaDon_${hoaDon.ma || hoaDon.id}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        showSuccess('Đã tải hóa đơn về máy!')
        return
      }

      showSuccess('Đang mở hộp thoại in...')
    } else {
      // Fallback cho PDF nếu backend thay đổi
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          setTimeout(() => {
            URL.revokeObjectURL(url)
          }, 1000)
        }
      } else {
        const link = document.createElement('a')
        link.href = url
        link.download = `HoaDon_${hoaDon.ma || hoaDon.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        showSuccess('Đã tải hóa đơn về máy!')
        return
      }

      showSuccess('Đang mở hộp thoại in...')
    }
  } catch (err) {
    console.error('❌ Lỗi khi in hóa đơn:', err)
    showError('Không thể in hóa đơn. Vui lòng thử lại!')
  }
}

// QR Scanner
const showQRScanner = ref(false)

const scanQR = () => {
  showQRScanner.value = true
}

const closeQRScanner = () => {
  showQRScanner.value = false
}

const handleInvoiceFound = (invoice) => {
  // Mở modal chi tiết khi tìm thấy hóa đơn
  selectedHoaDonId.value = invoice.id
  showDetailModal.value = true
  closeQRScanner()
}

// Advanced Search
const showAdvancedSearch = ref(false)
const advancedFilters = ref({})

const openAdvancedSearch = () => {
  showAdvancedSearch.value = true
}

const closeAdvancedSearch = () => {
  showAdvancedSearch.value = false
}

const handleAdvancedSearch = (filters) => {
  advancedFilters.value = filters
  currentPage.value = 0
  fetchHoaDons()
  closeAdvancedSearch()
}

const exportExcel = async () => {
  try {
    // Import xlsx dynamically
    const XLSX = await import('xlsx')

    // Prepare data
    const exportData = hoaDons.value.map((hd, index) => ({
      STT: index + 1,
      'Mã HĐ': hd.ma || '',
      'Khách hàng': hd.khachHang?.hoTen || hd.tenKhachHang || 'Khách lẻ',
      SĐT: hd.khachHang?.soDienThoai || hd.soDienThoai || '',
      'Loại HĐ': hd.loaiHoaDon === 0 ? 'Tại quầy' : hd.loaiHoaDon === 1 ? 'Online' : '',
      'Nhân viên': hd.nhanVien?.hoTen || '',
      'Mã NV': hd.nhanVien?.maNhanVien || '',
      'Ngày tạo': hd.ngayTao ? new Date(hd.ngayTao).toLocaleString('vi-VN') : '',
      'Trạng thái': getTrangThaiLabel(hd),
      'Tổng tiền': hd.tongTien || 0,
      'Đã thanh toán': hd.trangThaiThanhToan === 1 ? 'Có' : 'Chưa',
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = [
      { wch: 5 }, // STT
      { wch: 18 }, // Mã HĐ
      { wch: 25 }, // Khách hàng
      { wch: 12 }, // SĐT
      { wch: 12 }, // Loại HĐ
      { wch: 20 }, // Nhân viên
      { wch: 10 }, // Mã NV
      { wch: 20 }, // Ngày tạo
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Tổng tiền
      { wch: 12 }, // Đã thanh toán
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách hóa đơn')

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const filename = `Danh_sach_hoa_don_${dateStr}.xlsx`

    // Export
    XLSX.writeFile(wb, filename)

    showSuccess(`Đã xuất Excel thành công! (${exportData.length} hóa đơn)`)
  } catch (error) {
    console.error('❌ Lỗi khi xuất Excel:', error)
    showError('Không thể xuất Excel. Vui lòng thử lại!')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  activeStatusTab.value = ''
  currentPage.value = 0
  fetchHoaDons()
  // Chỉ reload status counts sau khi fetch xong, không gọi ngay để tránh vòng lặp
  setTimeout(() => {
    if (!isLoadStatusCountsInProgress.value) {
      loadStatusCounts()
    }
  }, 500)
}

/**
 * Xác nhận đơn hàng online
 * Logic rõ ràng:
 * - COD: Chưa thanh toán, sẽ thanh toán khi giao hàng
 * - QR: Đã thanh toán, chỉ cần xác nhận và chuyển sang đang giao
 */
const xacNhanDonHang = async (hoaDon) => {
  const isQR = hoaDon.trangThaiThanhToan === 1
  const isCOD = hoaDon.trangThaiThanhToan === 0 || hoaDon.trangThaiThanhToan === null

  const paymentInfo = isQR
    ? '✅ Đã thanh toán QR\n'
    : '⏳ Thanh toán khi nhận hàng (COD)\n'

  const confirmed = await showConfirm({
    title: 'Xác nhận đơn hàng',
    message: `Bạn có chắc chắn muốn xác nhận đơn hàng ${hoaDon.ma}?\n\n`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning',
  })

  if (!confirmed) {
    return
  }

  try {
    // Lấy thông tin nhân viên hiện tại
    const currentNhanVienId = authStore.getUserId ||
      authStore.user?.userId ||
      authStore.user?.user_id ||
      localStorage.getItem('currentNhanVienId') ||
      localStorage.getItem('userId')

    if (!currentNhanVienId) {
      showError('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!')
      return
    }

    console.log('👤 [QuanLiHoaDon] Xác nhận đơn hàng với nhân viên ID:', currentNhanVienId)

    await xacNhanDonHangAPI(hoaDon.id, currentNhanVienId)
    showSuccess(
      `✅ Xác nhận đơn hàng ${hoaDon.ma} thành công!\nHệ thống đã trừ kho và cập nhật serial.`,
    )
    fetchHoaDons() // Reload danh sách
    if (showDetailModal.value && selectedHoaDonId.value === hoaDon.id) {
      // Không đóng modal, để user có thể xem kết quả
      // closeDetailModal()
    }
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => xacNhanDonHang(hoaDon), // Retry function
      error.response?.data?.message ||
      error.message ||
      'Không thể xác nhận đơn hàng. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

/**
 * Hủy đơn hàng online
 */
const huyDonHang = async (hoaDon) => {
  const confirmed = await showConfirm({
    title: 'Hủy đơn hàng',
    message: `Bạn có chắc chắn muốn hủy đơn hàng ${hoaDon.ma}?`,
    confirmText: 'Hủy đơn',
    cancelText: 'Không',
    type: 'danger',
  })

  if (!confirmed) {
    return
  }

  try {
    await huyDonHangAPI(hoaDon.id)
    showSuccess('Hủy đơn hàng thành công!')
    fetchHoaDons() // Reload danh sách
    if (showDetailModal.value && selectedHoaDonId.value === hoaDon.id) {
      closeDetailModal()
    }
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => huyDonHang(hoaDon), // Retry function
      error.response?.data?.message || error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

/**
 * Bulk Actions - Xử lý hàng loạt
 */
const handleBulkConfirm = async () => {
  if (selectedIds.value.length === 0) return

  const confirmed = await showConfirm({
    title: 'Xác nhận hàng loạt',
    message: `Bạn có chắc chắn muốn xác nhận ${selectedIds.value.length} đơn hàng?`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning',
  })

  if (!confirmed) return

  isBulkProcessing.value = true
  try {
    let successCount = 0
    let failCount = 0

    // Lấy thông tin nhân viên hiện tại
    const currentNhanVienId = authStore.getUserId ||
      authStore.user?.userId ||
      authStore.user?.user_id ||
      localStorage.getItem('currentNhanVienId') ||
      localStorage.getItem('userId')

    if (!currentNhanVienId) {
      showError('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!')
      isBulkProcessing.value = false
      return
    }

    for (const id of selectedIds.value) {
      try {
        await xacNhanDonHangAPI(id, currentNhanVienId)
        successCount++
      } catch (error) {
        failCount++
        console.error(`Lỗi xác nhận đơn ${id}:`, error)
      }
    }

    if (successCount > 0) {
      showSuccess(`Đã xác nhận ${successCount} đơn hàng thành công!`)
    }
    if (failCount > 0) {
      showError(`Có ${failCount} đơn hàng xác nhận thất bại!`)
    }

    selectedIds.value = []
    fetchHoaDons()
    // Chỉ reload status counts sau khi fetch xong, không gọi ngay để tránh vòng lặp
    setTimeout(() => {
      if (!isLoadStatusCountsInProgress.value) {
        loadStatusCounts()
      }
    }, 500)
  } catch (error) {
    showError('Có lỗi xảy ra khi xác nhận hàng loạt!')
  } finally {
    isBulkProcessing.value = false
  }
}

const handleBulkCancel = async () => {
  if (selectedIds.value.length === 0) return

  const confirmed = await showConfirm({
    title: 'Hủy hàng loạt',
    message: `Bạn có chắc chắn muốn hủy ${selectedIds.value.length} đơn hàng?`,
    confirmText: 'Hủy đơn',
    cancelText: 'Không',
    type: 'danger',
  })

  if (!confirmed) return

  isBulkProcessing.value = true
  try {
    let successCount = 0
    let failCount = 0

    for (const id of selectedIds.value) {
      try {
        await huyDonHangAPI(id)
        successCount++
      } catch (error) {
        failCount++
        console.error(`Lỗi hủy đơn ${id}:`, error)
      }
    }

    if (successCount > 0) {
      showSuccess(`Đã hủy ${successCount} đơn hàng thành công!`)
    }
    if (failCount > 0) {
      showError(`Có ${failCount} đơn hàng hủy thất bại!`)
    }

    selectedIds.value = []
    fetchHoaDons()
    // Chỉ reload status counts sau khi fetch xong, không gọi ngay để tránh vòng lặp
    setTimeout(() => {
      if (!isLoadStatusCountsInProgress.value) {
        loadStatusCounts()
      }
    }, 500)
  } catch (error) {
    showError('Có lỗi xảy ra khi hủy hàng loạt!')
  } finally {
    isBulkProcessing.value = false
  }
}

const printBulkInvoices = async () => {
  if (selectedIds.value.length === 0) return

  try {
    for (const id of selectedIds.value) {
      const hoaDon = hoaDons.value.find((hd) => hd.id === id)
      if (hoaDon) {
        await printInvoice(hoaDon)
        // Delay giữa các lần in để tránh spam
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    showSuccess(`Đã mở hộp thoại in cho ${selectedIds.value.length} hóa đơn!`)
  } catch (error) {
    showError('Có lỗi xảy ra khi in hàng loạt!')
  }
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

/**
 * Toggle select all
 */
const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedIds.value = hoaDons.value.map((hd) => hd.id)
  } else {
    selectedIds.value = []
  }
}

// Kiểm tra có thể chuyển trạng thái không
const canChangeStatus = (hoaDon) => {
  if (!hoaDon) return false
  // Chỉ cho phép chuyển trạng thái nếu chưa hủy và chưa hoàn thành
  const trangThai =
    typeof hoaDon.trangThai === 'number'
      ? hoaDon.trangThai
      : hoaDon.trangThai === 'CHO_THANH_TOAN'
        ? 0
        : hoaDon.trangThai === 'DA_THANH_TOAN'
          ? 1
          : hoaDon.trangThai === 'DA_HUY'
            ? 2
            : hoaDon.trangThai === 'DANG_GIAO'
              ? 3
              : hoaDon.trangThai === 'HOAN_THANH'
                ? 4
                : null
  return trangThai !== 4 && trangThai !== 2 // Không cho chuyển nếu đã hủy hoặc hoàn thành
}

// Lấy trạng thái hiện tại dạng số
const getCurrentStatus = (hoaDon) => {
  if (!hoaDon) return null
  if (typeof hoaDon.trangThai === 'number') return hoaDon.trangThai
  const map = {
    CHO_THANH_TOAN: 0,
    DA_THANH_TOAN: 1,
    DA_HUY: 2,
    DANG_GIAO: 3,
    HOAN_THANH: 4,
  }
  return map[hoaDon.trangThai] ?? null
}

// Mở modal chuyển trạng thái
const openChangeStatusModal = (hoaDon) => {
  selectedHoaDonForStatus.value = hoaDon
  newStatus.value = getCurrentStatus(hoaDon)
  showChangeStatusModal.value = true
}

// Đóng modal chuyển trạng thái
const closeChangeStatusModal = () => {
  showChangeStatusModal.value = false
  selectedHoaDonForStatus.value = null
  newStatus.value = null
}

// Các tùy chọn trạng thái khả dụng dựa trên trạng thái hiện tại
// Logic rõ ràng cho đơn online:
// - COD (trangThai=0, trangThaiThanhToan=0): Chỉ có thể chuyển sang DANG_GIAO (3) hoặc DA_HUY (2)
// - QR (trangThai=0, trangThaiThanhToan=1): Chỉ có thể chuyển sang DANG_GIAO (3) hoặc DA_HUY (2)
// - Không cho phép chuyển từ 0 sang 1 (DA_THANH_TOAN) vì:
//   + COD: thanh toán sẽ được xử lý khi giao hàng (thanhToanCOD)
//   + QR: đã thanh toán rồi, chỉ cần xác nhận và chuyển sang DANG_GIAO
const availableStatusOptions = computed(() => {
  const hoaDon = selectedHoaDonForStatus.value
  if (!hoaDon) return []

  const current = getCurrentStatus(hoaDon)
  const loaiHoaDon = hoaDon.loaiHoaDon
  const trangThaiThanhToan = hoaDon.trangThaiThanhToan

  const allOptions = [
    { value: 0, label: 'Chờ thanh toán' },
    { value: 1, label: 'Đã thanh toán' },
    { value: 2, label: 'Đã hủy' },
    { value: 3, label: 'Đang giao hàng' },
    { value: 4, label: 'Hoàn thành' },
  ]

  if (current === null) return allOptions

  return allOptions.filter(opt => {
    // Luôn hiện trạng thái hiện tại
    if (opt.value === current) return true

    // Luôn cho phép hủy (trừ khi đã hoàn thành/hủy - đã chặn ở canChangeStatus)
    if (opt.value === 2) return true

    // Logic đặc biệt cho đơn ONLINE (loaiHoaDon = 1) chưa được xác nhận
    if (loaiHoaDon === 1 && current === 0) {
      // Đơn online chưa xác nhận (COD hoặc QR) chỉ có thể:
      // - Chuyển sang DANG_GIAO (3) - xác nhận đơn hàng
      // - Chuyển sang DA_HUY (2) - hủy đơn (đã được xử lý ở trên)
      // KHÔNG cho phép chuyển sang DA_THANH_TOAN (1) vì:
      //   + COD: thanh toán sẽ được xử lý khi giao hàng
      //   + QR: đã thanh toán rồi (trangThaiThanhToan = 1)
      return opt.value === 3
    }

    // Logic chặn quay lại (Forward only) cho các trạng thái khác
    // 1 (Đã thanh toán) -> 3, 4 (Không quay lại 0)
    if (current === 1) return [3, 4].includes(opt.value)

    // 3 (Đang giao) -> 4 (Không quay lại 0, 1)
    if (current === 3) return [4].includes(opt.value)

    // 0 (Chờ thanh toán) - cho đơn tại quầy hoặc các trường hợp khác
    if (current === 0 && loaiHoaDon !== 1) {
      return [1, 3, 4].includes(opt.value)
    }

    return false
  })
})

// Xử lý chuyển trạng thái
const handleChangeStatus = async () => {
  if (!selectedHoaDonForStatus.value || newStatus.value === null) {
    showError('Vui lòng chọn trạng thái mới!')
    return
  }

  const currentStatus = getCurrentStatus(selectedHoaDonForStatus.value)
  if (newStatus.value === currentStatus) {
    showError('Trạng thái mới phải khác trạng thái hiện tại!')
    return
  }

  const confirmed = await showConfirm({
    title: 'Xác nhận chuyển trạng thái',
    message: `Bạn có chắc chắn muốn chuyển hóa đơn ${selectedHoaDonForStatus.value.ma} từ "${getTrangThaiLabel(selectedHoaDonForStatus.value)}" sang "${getTrangThaiLabel({ trangThai: newStatus.value })}"?`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'info',
  })

  if (!confirmed) return

  changingStatus.value = true

  try {
    await capNhatTrangThai(selectedHoaDonForStatus.value.id, newStatus.value)
    showSuccess('Chuyển trạng thái thành công!')

    // Reload danh sách
    fetchHoaDons()

    // Reload status counts
    setTimeout(() => {
      if (!isLoadStatusCountsInProgress.value) {
        loadStatusCounts()
      }
    }, 500)

    // Đóng modal
    closeChangeStatusModal()
  } catch (err) {
    console.error('❌ Lỗi khi chuyển trạng thái:', err)
    showError(err.response?.data?.message || 'Không thể chuyển trạng thái. Vui lòng thử lại!')
  } finally {
    changingStatus.value = false
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
