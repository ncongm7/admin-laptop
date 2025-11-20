<template>
  <div class="recent-transactions card">
    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="bi bi-clock-history"></i> Lịch sử giao dịch gần đây
      </h6>
      <button class="btn btn-sm btn-light" @click="refreshTransactions" :disabled="isLoading">
        <i class="bi" :class="isLoading ? 'bi-hourglass-split' : 'bi-arrow-clockwise'"></i>
      </button>
    </div>

    <div class="card-body">
      <!-- Search bar -->
      <div class="search-bar mb-3">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            v-model="searchKeyword"
            @input="handleSearch"
            @keyup.enter="handleSearch"
            placeholder="Tìm kiếm theo mã hóa đơn..."
          />
          <button class="btn btn-outline-primary" @click="handleSearch" :disabled="isLoading">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Transactions List -->
      <div v-else-if="transactions.length > 0" class="transactions-list">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
          @click="viewTransactionDetail(transaction)"
        >
          <div class="transaction-header">
            <div class="transaction-code">
              <i class="bi bi-receipt"></i>
              <strong>{{ transaction.ma || 'N/A' }}</strong>
            </div>
            <div class="transaction-date">
              <i class="bi bi-calendar"></i>
              {{ formatDate(transaction.ngayTao || transaction.createdAt) }}
            </div>
          </div>

          <div class="transaction-body">
            <div class="transaction-info">
              <div class="info-item">
                <span class="label">Khách hàng:</span>
                <span class="value">{{ transaction.khachHang?.hoTen || 'Khách lẻ' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số sản phẩm:</span>
                <span class="value">{{ getItemCount(transaction) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Tổng tiền:</span>
                <span class="value amount">{{ formatCurrency(transaction.tongTienSauGiam || transaction.tongTien || 0) }}</span>
              </div>
            </div>

            <div class="transaction-status">
              <span
                class="badge"
                :class="{
                  'bg-success': transaction.trangThaiThanhToan === 1,
                  'bg-warning': transaction.trangThaiThanhToan === 0,
                  'bg-danger': transaction.trangThai === 'HUY'
                }"
              >
                {{ getStatusText(transaction) }}
              </span>
            </div>
          </div>

          <div class="transaction-actions">
            <button
              class="btn btn-sm btn-outline-primary"
              @click.stop="viewTransactionDetail(transaction)"
              title="Xem chi tiết"
            >
              <i class="bi bi-eye"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-info"
              @click.stop="printTransaction(transaction)"
              title="In lại hóa đơn"
            >
              <i class="bi bi-printer"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state text-center py-4">
        <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
        <p class="text-muted mt-2 mb-0">Không có giao dịch nào</p>
      </div>
    </div>

    <!-- Modal chi tiết hóa đơn -->
    <div v-if="showDetailModal" class="modal fade show d-block" style="z-index: 9999" @click.self="closeDetailModal">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-file-text"></i> Chi tiết hóa đơn {{ selectedTransaction?.ma }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeDetailModal"></button>
          </div>
          <div class="modal-body" v-if="selectedTransaction">
            <div class="row g-3 mb-3">
              <div class="col-md-6">
                <h6>Thông tin hóa đơn</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Mã hóa đơn:</strong></td>
                    <td>{{ selectedTransaction.ma }}</td>
                  </tr>
                  <tr>
                    <td><strong>Ngày tạo:</strong></td>
                    <td>{{ formatDateTime(selectedTransaction.ngayTao || selectedTransaction.createdAt) }}</td>
                  </tr>
                  <tr>
                    <td><strong>Nhân viên:</strong></td>
                    <td>{{ selectedTransaction.nhanVien?.hoTen || 'N/A' }}</td>
                  </tr>
                  <tr>
                    <td><strong>Trạng thái:</strong></td>
                    <td>
                      <span
                        class="badge"
                        :class="{
                          'bg-success': selectedTransaction.trangThaiThanhToan === 1,
                          'bg-warning': selectedTransaction.trangThaiThanhToan === 0
                        }"
                      >
                        {{ getStatusText(selectedTransaction) }}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Thông tin khách hàng</h6>
                <table class="table table-sm">
                  <tr>
                    <td><strong>Tên:</strong></td>
                    <td>{{ selectedTransaction.khachHang?.hoTen || 'Khách lẻ' }}</td>
                  </tr>
                  <tr v-if="selectedTransaction.khachHang?.soDienThoai">
                    <td><strong>SĐT:</strong></td>
                    <td>{{ selectedTransaction.khachHang.soDienThoai }}</td>
                  </tr>
                  <tr v-if="selectedTransaction.khachHang?.email">
                    <td><strong>Email:</strong></td>
                    <td>{{ selectedTransaction.khachHang.email }}</td>
                  </tr>
                </table>
              </div>
            </div>

            <h6>Danh sách sản phẩm</h6>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in selectedTransaction.hoaDonChiTiet || selectedTransaction.chiTietList || []"
                    :key="item.id"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.tenSanPham }}</td>
                    <td>{{ item.soLuong }}</td>
                    <td>{{ formatCurrency(item.donGia) }}</td>
                    <!-- TODO: Backend nên trả về thanhTien, nếu không FE tính = donGia * soLuong -->
                    <td class="fw-bold">{{ formatCurrency(item.thanhTien || (item.donGia * item.soLuong)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="summary-section mt-3 p-3 bg-light rounded">
              <div class="row">
                <div class="col-md-6 offset-md-6">
                  <div class="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <strong>{{ formatCurrency(selectedTransaction.tongTien || 0) }}</strong>
                  </div>
                  <div v-if="selectedTransaction.tienDuocGiam" class="summary-row">
                    <span>Giảm giá:</span>
                    <strong class="text-success">-{{ formatCurrency(selectedTransaction.tienDuocGiam) }}</strong>
                  </div>
                  <div class="summary-row total">
                    <span>Tổng cần trả:</span>
                    <strong class="text-danger fs-5">
                      {{ formatCurrency(selectedTransaction.tongTienSauGiam || selectedTransaction.tongTien || 0) }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailModal">
              <i class="bi bi-x-circle"></i> Đóng
            </button>
            <button type="button" class="btn btn-primary" @click="printTransaction(selectedTransaction)">
              <i class="bi bi-printer"></i> In hóa đơn
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHoaDons } from '@/service/hoaDonService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'
import { format } from 'date-fns'

const { success: showSuccess, error: showError } = useToast()

const isLoading = ref(false)
const error = ref('')
const transactions = ref([])
const searchKeyword = ref('')
const showDetailModal = ref(false)
const selectedTransaction = ref(null)

let searchTimeout = null

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy')
  } catch {
    return dateString
  }
}

/**
 * Format date time
 */
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
  } catch {
    return dateString
  }
}

/**
 * Get item count
 */
const getItemCount = (transaction) => {
  const items = transaction.hoaDonChiTiet || transaction.chiTietList || []
  return items.length
}

/**
 * Get status text
 */
const getStatusText = (transaction) => {
  if (transaction.trangThaiThanhToan === 1) {
    return 'Đã thanh toán'
  }
  if (transaction.trangThai === 'HUY') {
    return 'Đã hủy'
  }
  return 'Chưa thanh toán'
}

/**
 * Load recent transactions
 */
const loadTransactions = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const params = {
      page: 0,
      size: 10,
      trangThaiThanhToan: 1, // Chỉ lấy hóa đơn đã thanh toán
      sort: 'ngayTao,desc'
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value.trim()
    }

    const response = await getHoaDons(params)

    let data = []
    if (response?.data?.content && Array.isArray(response.data.content)) {
      data = response.data.content
    } else if (response?.data && Array.isArray(response.data)) {
      data = response.data
    } else if (Array.isArray(response)) {
      data = response
    }

    transactions.value = data
    console.log('✅ Đã load', data.length, 'giao dịch gần đây')

  } catch (err) {
    console.error('❌ Lỗi khi load giao dịch:', err)
    error.value = err.response?.data?.message || 'Không thể tải lịch sử giao dịch. Vui lòng thử lại!'
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Handle search
 */
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadTransactions()
  }, 300)
}

/**
 * View transaction detail
 */
const viewTransactionDetail = async (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

/**
 * Close detail modal
 */
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedTransaction.value = null
}

/**
 * Print transaction
 */
const printTransaction = async (transaction) => {
  if (!transaction?.id) {
    showError('Không có thông tin hóa đơn để in!')
    return
  }

  try {
    const blob = await inHoaDon(transaction.id)

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
        // Fallback: download
        const link = document.createElement('a')
        link.href = url
        link.download = `HoaDon_${transaction.ma || transaction.id}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
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
        link.download = `HoaDon_${transaction.ma || transaction.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      showSuccess('Đang mở hộp thoại in...')
    }
  } catch (err) {
    console.error('❌ Lỗi khi in hóa đơn:', err)
    showError('Không thể in hóa đơn. Vui lòng thử lại!')
  }
}

/**
 * Refresh transactions
 */
const refreshTransactions = async () => {
  await loadTransactions()
}

// Lifecycle
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.recent-transactions {
  height: fit-content;
  max-height: calc(100vh - 200px);
}

.search-bar {
  margin-bottom: 1rem;
}

.transactions-list {
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction-item {
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.transaction-item:hover {
  background: #e9ecef;
  border-color: #0dcaf0;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.transaction-code {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
}

.transaction-date {
  font-size: 0.85rem;
  color: #6c757d;
}

.transaction-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.transaction-info {
  flex: 1;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.info-item .label {
  color: #6c757d;
  font-weight: 500;
}

.info-item .value {
  color: #212529;
}

.info-item .value.amount {
  font-weight: 700;
  color: #dc3545;
}

.transaction-status {
  flex-shrink: 0;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.summary-row.total {
  font-size: 1.1rem;
  padding-top: 0.75rem;
  border-top: 2px solid #dee2e6;
}

.modal-backdrop {
  z-index: 9998;
}

.modal {
  z-index: 9999;
}

/* Responsive */
@media (max-width: 767.98px) {
  .transaction-item {
    padding: 0.75rem;
  }
  
  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .transaction-body {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .transaction-actions {
    width: 100%;
  }
  
  .transaction-actions .btn {
    flex: 1;
  }
}
</style>

