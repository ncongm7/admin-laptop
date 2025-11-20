<template>
  <div class="invoice-management">
    <style v-html="quickViewTooltipStyles"></style>
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
          <i class="bi bi-check-square"></i> Đã chọn <strong>{{ selectedIds.length }}</strong> hóa đơn
        </span>
        <div class="d-flex gap-2">
          <button
            class="btn btn-light btn-sm"
            @click="handleBulkConfirm"
            :disabled="isBulkProcessing"
          >
            <span v-if="isBulkProcessing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-check-circle"></i>
            Xác nhận hàng loạt
          </button>
          <button
            class="btn btn-light btn-sm"
            @click="handleBulkCancel"
            :disabled="isBulkProcessing"
          >
            <span v-if="isBulkProcessing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-x-circle"></i>
            Hủy hàng loạt
          </button>
          <button
            class="btn btn-light btn-sm"
            @click="exportExcel(true)"
            :disabled="isBulkProcessing"
          >
            <i class="bi bi-file-earmark-excel"></i> Xuất Excel
          </button>
          <button
            class="btn btn-light btn-sm"
            @click="printBulkInvoices"
            :disabled="isBulkProcessing"
          >
            <i class="bi bi-printer"></i> In hàng loạt
          </button>
          <button
            class="btn btn-light btn-sm"
            @click="selectedIds = []"
            :disabled="isBulkProcessing"
          >
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
              <!-- Badge đặc biệt cho đơn online chờ xác nhận -->
              <span v-if="hoaDon.loaiHoaDon === 1 && hoaDon.trangThai === 'CHO_THANH_TOAN'" 
                    class="badge bg-warning text-dark ms-1">
                CHỜ XÁC NHẬN
              </span>
            </td>
            <td class="fw-semibold">{{ formatCurrency(hoaDon.tongTienSauGiam) }}</td>
            <td class="action-col">
              <button class="btn btn-outline-success btn-sm rounded-circle me-1" @click="openDetail(hoaDon)"
                title="Xem chi tiết">
                <i class="bi bi-eye"></i>
              </button>
              <!-- Nút xác nhận đơn hàng online (chỉ hiện khi là đơn online và chờ thanh toán) -->
              <button v-if="hoaDon.loaiHoaDon === 1 && hoaDon.trangThai === 'CHO_THANH_TOAN'"
                      class="btn btn-outline-primary btn-sm rounded-circle me-1" 
                      @click="xacNhanDonHang(hoaDon)"
                      title="Xác nhận đơn hàng">
                <i class="bi bi-check-circle"></i>
              </button>
              <!-- Nút hủy đơn hàng online (chỉ hiện khi là đơn online và chờ thanh toán) -->
              <button v-if="hoaDon.loaiHoaDon === 1 && hoaDon.trangThai === 'CHO_THANH_TOAN'"
                      class="btn btn-outline-danger btn-sm rounded-circle me-1" 
                      @click="huyDonHang(hoaDon)"
                      title="Hủy đơn hàng">
                <i class="bi bi-x-circle"></i>
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
    
    <!-- QR Scanner Modal -->
    <QRScannerModal v-if="showQRScanner" @close="closeQRScanner" @invoice-found="handleInvoiceFound" />
    
    <!-- Advanced Search Modal -->
    <AdvancedSearchModal
      v-if="showAdvancedSearch"
      :model-value="advancedFilters"
      @close="closeAdvancedSearch"
      @search="handleAdvancedSearch"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getHoaDons, xacNhanDonHang as xacNhanDonHangAPI, huyDonHang as huyDonHangAPI, getHoaDonStatusCounts, copyInvoice as copyInvoiceAPI } from '@/service/hoaDonService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useErrorHandler } from '@/composables/useErrorHandler'
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

// Pagination
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// Status counts
const statusCountsData = ref(null)
const isLoadingCounts = ref(false)

// Toast & Confirm
const { success: showSuccess, error: showError, warning: showWarning } = useToast()
const { showConfirm } = useConfirm()
const { handleError: handleErrorWithRetry } = useErrorHandler()

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
})

// Cleanup
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
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

    // Cache response
    apiCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    console.log('✅ Loaded hóa đơn:', hoaDons.value.length)
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => fetchHoaDons(), // Retry function
      'Không thể tải danh sách hóa đơn. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 3 }
    )
  } finally {
    loading.value = false
  }
}

/**
 * Map status tab sang số (theo DB)
 * TrangThaiHoaDon enum: 0=CHO_THANH_TOAN, 1=DA_THANH_TOAN, 2=DA_HUY, 3=DANG_GIAO, 4=HOAN_THANH
 */
const mapStatusToNumber = (status) => {
  const map = {
    '': undefined, // Tất cả
    'processing': 0, // CHO_THANH_TOAN - Chờ thanh toán (bao gồm chờ xác nhận)
    'confirmed': 1, // DA_THANH_TOAN - Đã thanh toán/Đã xác nhận
    'delivering': 3, // DANG_GIAO - Đang giao hàng
    'shipping': 3, // DANG_GIAO - Đang vận chuyển
    'delivered': 4, // HOAN_THANH - Hoàn thành
    'done': 4, // HOAN_THANH - Hoàn tất
    'cancelled': 2 // DA_HUY - Đã hủy
  }
  return map[status]
}

/**
 * Load status counts từ API
 */
const loadStatusCounts = async () => {
  isLoadingCounts.value = true
  try {
    const response = await getHoaDonStatusCounts()
    if (response && response.data) {
      statusCountsData.value = response.data
    } else {
      // Fallback về client-side nếu API chưa có
      statusCountsData.value = null
    }
  } catch (error) {
    console.warn('⚠️ Không thể load status counts từ API, dùng client-side:', error)
    statusCountsData.value = null
  } finally {
    isLoadingCounts.value = false
  }
}

/**
 * Tính số lượng hóa đơn theo trạng thái (cho tabs)
 * Ưu tiên dùng data từ API, fallback về client-side calculation
 */
const statusCounts = computed(() => {
  // Nếu có data từ API, dùng data đó
  if (statusCountsData.value) {
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
    cancelled: 0
  }
  
  hoaDons.value.forEach(hd => {
    const status = hd.trangThai
    if (status === 'CHO_THANH_TOAN' || status === 0) counts.processing++
    else if (status === 'DA_THANH_TOAN' || status === 1) counts.confirmed++
    else if (status === 'DANG_GIAO' || status === 3) {
      counts.delivering++
      counts.shipping++
    }
    else if (status === 'HOAN_THANH' || status === 4) {
      counts.delivered++
      counts.done++
    }
    else if (status === 'DA_HUY' || status === 2) counts.cancelled++
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
    'DA_THANH_TOAN': 'Đã thanh toán',
    'DA_HUY': 'Đã hủy',
    'DANG_GIAO': 'Đang giao hàng',
    'HOAN_THANH': 'Hoàn thành'
  }
  return labels[trangThai] || trangThai
}

const getStatusBadgeClass = (trangThai) => {
  const classes = {
    'CHO_THANH_TOAN': 'bg-warning text-dark', // Chờ thanh toán - màu vàng
    'DA_THANH_TOAN': 'bg-info', // Đã thanh toán - màu xanh dương
    'DA_HUY': 'bg-danger', // Đã hủy - màu đỏ
    'DANG_GIAO': 'bg-primary', // Đang giao hàng - màu xanh
    'HOAN_THANH': 'bg-success' // Hoàn thành - màu xanh lá
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

// Toast
const { success: showSuccess, error: showError } = useToast()

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
    type: 'info'
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
      { showRetry: true, maxRetries: 2 }
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
      'STT': index + 1,
      'Mã HĐ': hd.ma || '',
      'Khách hàng': hd.khachHang?.hoTen || hd.tenKhachHang || 'Khách lẻ',
      'SĐT': hd.khachHang?.soDienThoai || hd.soDienThoai || '',
      'Loại HĐ': hd.loaiHoaDon === 0 ? 'Tại quầy' : hd.loaiHoaDon === 1 ? 'Online' : '',
      'Nhân viên': hd.nhanVien?.hoTen || '',
      'Mã NV': hd.nhanVien?.maNhanVien || '',
      'Ngày tạo': hd.ngayTao ? new Date(hd.ngayTao).toLocaleString('vi-VN') : '',
      'Trạng thái': getTrangThaiLabel(hd.trangThai),
      'Tổng tiền': hd.tongTien || 0,
      'Đã thanh toán': hd.trangThaiThanhToan === 1 ? 'Có' : 'Chưa'
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const colWidths = [
      { wch: 5 },   // STT
      { wch: 18 },  // Mã HĐ
      { wch: 25 },  // Khách hàng
      { wch: 12 },  // SĐT
      { wch: 12 },  // Loại HĐ
      { wch: 20 },  // Nhân viên
      { wch: 10 },  // Mã NV
      { wch: 20 },  // Ngày tạo
      { wch: 15 },  // Trạng thái
      { wch: 15 },  // Tổng tiền
      { wch: 12 }   // Đã thanh toán
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
  loadStatusCounts() // Reload counts khi reset
}

/**
 * Xác nhận đơn hàng online
 */
const xacNhanDonHang = async (hoaDon) => {
  const confirmed = await showConfirm({
    title: 'Xác nhận đơn hàng',
    message: `Bạn có chắc chắn muốn xác nhận đơn hàng ${hoaDon.ma}?\n\nLưu ý: Hệ thống sẽ trừ kho khi xác nhận.`,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'warning'
  })

  if (!confirmed) {
    return
  }

  try {
    await xacNhanDonHangAPI(hoaDon.id)
    showSuccess('Xác nhận đơn hàng thành công!')
    fetchHoaDons() // Reload danh sách
    if (showDetailModal.value && selectedHoaDonId.value === hoaDon.id) {
      closeDetailModal()
    }
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => xacNhanDonHang(hoaDon), // Retry function
      error.response?.data?.message || error.message || 'Không thể xác nhận đơn hàng. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 }
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
    type: 'danger'
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
      { showRetry: true, maxRetries: 2 }
    )
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
