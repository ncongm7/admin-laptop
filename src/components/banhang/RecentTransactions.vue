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
      <!-- Status filter tabs -->
      <div class="status-filter mb-3">
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm"
            :class="selectedStatusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="selectedStatusFilter = 'all'">
            Tất cả
          </button>
          <button type="button" class="btn btn-sm"
            :class="selectedStatusFilter === 'CHO_XAC_NHAN' ? 'btn-info' : 'btn-outline-info'"
            @click="selectedStatusFilter = 'CHO_XAC_NHAN'">
            Chờ xác nhận
          </button>
          <button type="button" class="btn btn-sm"
            :class="selectedStatusFilter === 'DA_THANH_TOAN' ? 'btn-success' : 'btn-outline-success'"
            @click="selectedStatusFilter = 'DA_THANH_TOAN'">
            Đã thanh toán
          </button>
          <button type="button" class="btn btn-sm"
            :class="selectedStatusFilter === 'DANG_GIAO' ? 'btn-warning' : 'btn-outline-warning'"
            @click="selectedStatusFilter = 'DANG_GIAO'">
            Đang giao
          </button>
          <button type="button" class="btn btn-sm"
            :class="selectedStatusFilter === 'HOAN_THANH' ? 'btn-info' : 'btn-outline-info'"
            @click="selectedStatusFilter = 'HOAN_THANH'">
            Hoàn thành
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-bar mb-3">
        <div class="input-group">
          <input type="text" class="form-control" v-model="searchKeyword" @input="handleSearch"
            @keyup.enter="handleSearch" placeholder="Tìm kiếm theo mã hóa đơn..." />
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
        <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item"
          @click="viewTransactionDetail(transaction)">
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
                <span class="value">{{ getCustomerName(transaction) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số sản phẩm:</span>
                <span class="value">{{ getItemCount(transaction) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Tổng tiền:</span>
                <span class="value amount">{{ formatCurrency(transaction.tongTienSauGiam || transaction.tongTien || 0)
                }}</span>
              </div>
            </div>

            <div class="transaction-status">
              <span class="badge" :class="getStatusBadgeClass(transaction)">
                {{ getStatusText(transaction) }}
              </span>
              <!-- Badge COD nếu là hóa đơn COD -->
              <span v-if="isCOD(transaction)" class="badge bg-danger ms-2">
                <i class="bi bi-truck"></i> COD
              </span>
            </div>
          </div>

          <div class="transaction-actions">
            <!-- Button xác nhận thanh toán COD (chỉ hiện với hóa đơn COD) -->
            <button v-if="isCOD(transaction)" class="btn btn-sm btn-success me-1"
              @click.stop="handleThanhToanCOD(transaction)" title="Xác nhận thanh toán COD" :disabled="isProcessingCOD">
              <i class="bi" :class="isProcessingCOD ? 'bi-hourglass-split' : 'bi-cash-coin'"></i>
              {{ isProcessingCOD ? 'Đang xử lý...' : 'Thanh toán COD' }}
            </button>
            <button class="btn btn-sm btn-outline-primary" @click.stop="viewTransactionDetail(transaction)"
              title="Xem chi tiết">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-info" @click.stop="printTransaction(transaction)"
              title="In lại hóa đơn">
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
    <div v-if="showDetailModal" class="modal fade show d-block"
      style="z-index: 1050; position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: auto;"
      @click.self="closeDetailModal">
      <div class="modal-dialog modal-xl modal-dialog-scrollable" style="margin: 2rem auto;" @click.stop>
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
                      <span class="badge" :class="getStatusBadgeClass(selectedTransaction)">
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
                    <td>{{ getCustomerName(selectedTransaction) }}</td>
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
              <table class="table table-hover table-bordered">
                <thead class="table-light">
                  <tr>
                    <th style="width: 50px">STT</th>
                    <th style="min-width: 180px">Mã CTSP</th>
                    <th style="min-width: 200px">Sản phẩm</th>
                    <th style="min-width: 150px">Thông số</th>
                    <th class="text-center" style="width: 80px">SL</th>
                    <th class="text-end" style="width: 120px">Đơn giá</th>
                    <th class="text-end" style="width: 120px">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in selectedTransaction.hoaDonChiTiet || selectedTransaction.chiTietList || []"
                    :key="item.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>
                      <!-- Mã CTSP - NỔI BẬT -->
                      <span class="ctsp-badge-small">
                        <i class="bi bi-tag-fill me-1"></i>
                        <code class="ctsp-code-text">{{ getCTSPCode(item) }}</code>
                      </span>
                    </td>
                    <td>
                      <strong>{{ item.tenSanPham || item.tenSP || 'N/A' }}</strong>
                    </td>
                    <td>
                      <!-- Thông số biến thể -->
                      <div v-if="getCTSPSpecs(item)" class="ctsp-specs-cell">
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).cpu">
                          <i class="bi bi-cpu"></i> {{ getCTSPSpecs(item).cpu }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).ram">
                          <i class="bi bi-memory"></i> {{ getCTSPSpecs(item).ram }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).storage">
                          <i class="bi bi-hdd"></i> {{ getCTSPSpecs(item).storage }}
                        </div>
                        <div class="spec-item-small" v-if="getCTSPSpecs(item).color">
                          <i class="bi bi-palette"></i> {{ getCTSPSpecs(item).color }}
                        </div>
                      </div>
                      <span v-else class="text-muted small">-</span>

                      <!-- Serial numbers (nếu có) -->
                      <div v-if="getSerialsForItem(item)" class="mt-1">
                        <small class="text-info">
                          <i class="bi bi-upc-scan"></i>
                          <span v-for="(serial, idx) in getSerialsForItem(item)" :key="idx">
                            {{ serial }}<span v-if="idx < getSerialsForItem(item).length - 1">, </span>
                          </span>
                        </small>
                      </div>
                    </td>
                    <td class="text-center">{{ item.soLuong || 0 }}</td>
                    <td class="text-end">{{ formatCurrency(item.donGia) }}</td>
                    <td class="text-end fw-bold text-danger">{{ formatCurrency(item.thanhTien || (item.donGia *
                      item.soLuong)) }}</td>
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

            <!-- Timeline trạng thái đơn hàng -->
            <div class="order-timeline-section mt-4 p-3 bg-light rounded border">
              <h6 class="mb-3">
                <i class="bi bi-clock-history text-primary"></i> Trạng thái đơn hàng
              </h6>
              <div class="order-timeline">
                <div class="timeline-steps">
                  <div class="timeline-step" :class="{
                    'completed': isStepCompleted(selectedTransaction, 'CHO_THANH_TOAN'),
                    'active': isStepActive(selectedTransaction, 'CHO_THANH_TOAN')
                  }">
                    <div class="step-marker">
                      <i v-if="isStepCompleted(selectedTransaction, 'CHO_THANH_TOAN')"
                        class="bi bi-check-circle-fill"></i>
                      <i v-else-if="isStepActive(selectedTransaction, 'CHO_THANH_TOAN')" class="bi bi-circle-fill"></i>
                      <i v-else class="bi bi-circle"></i>
                    </div>
                    <div class="step-info">
                      <div class="step-title">Đặt hàng</div>
                      <div v-if="selectedTransaction.ngayTao" class="step-date">{{
                        formatDateTime(selectedTransaction.ngayTao) }}</div>
                      <div v-else class="step-pending">Chờ xử lý</div>
                    </div>
                  </div>

                  <div class="timeline-connector"
                    :class="{ 'active': isStepCompleted(selectedTransaction, 'CHO_THANH_TOAN') }"></div>

                  <div class="timeline-step" :class="{
                    'completed': isStepCompleted(selectedTransaction, 'DA_THANH_TOAN'),
                    'active': isStepActive(selectedTransaction, 'DA_THANH_TOAN')
                  }">
                    <div class="step-marker">
                      <i v-if="isStepCompleted(selectedTransaction, 'DA_THANH_TOAN')"
                        class="bi bi-check-circle-fill"></i>
                      <i v-else-if="isStepActive(selectedTransaction, 'DA_THANH_TOAN')" class="bi bi-circle-fill"></i>
                      <i v-else class="bi bi-circle"></i>
                    </div>
                    <div class="step-info">
                      <div class="step-title">Xác nhận</div>
                      <div v-if="selectedTransaction.ngayThanhToan" class="step-date">{{
                        formatDateTime(selectedTransaction.ngayThanhToan) }}</div>
                      <div v-else class="step-pending">Chờ xử lý</div>
                    </div>
                  </div>

                  <div class="timeline-connector"
                    :class="{ 'active': isStepCompleted(selectedTransaction, 'DA_THANH_TOAN') }"></div>

                  <div class="timeline-step" :class="{
                    'completed': isStepCompleted(selectedTransaction, 'DANG_GIAO'),
                    'active': isStepActive(selectedTransaction, 'DANG_GIAO')
                  }">
                    <div class="step-marker">
                      <i v-if="isStepCompleted(selectedTransaction, 'DANG_GIAO')" class="bi bi-check-circle-fill"></i>
                      <i v-else-if="isStepActive(selectedTransaction, 'DANG_GIAO')" class="bi bi-circle-fill"></i>
                      <i v-else class="bi bi-circle"></i>
                    </div>
                    <div class="step-info">
                      <div class="step-title">Đang giao</div>
                      <div v-if="selectedTransaction.ngayGiaoHang" class="step-date">{{
                        formatDateTime(selectedTransaction.ngayGiaoHang) }}</div>
                      <div v-else class="step-pending">Chờ xử lý</div>
                    </div>
                  </div>

                  <div class="timeline-connector"
                    :class="{ 'active': isStepCompleted(selectedTransaction, 'DANG_GIAO') }"></div>

                  <div class="timeline-step" :class="{
                    'completed': isStepCompleted(selectedTransaction, 'HOAN_THANH'),
                    'active': isStepActive(selectedTransaction, 'HOAN_THANH')
                  }">
                    <div class="step-marker">
                      <i v-if="isStepCompleted(selectedTransaction, 'HOAN_THANH')" class="bi bi-check-circle-fill"></i>
                      <i v-else-if="isStepActive(selectedTransaction, 'HOAN_THANH')" class="bi bi-circle-fill"></i>
                      <i v-else class="bi bi-circle"></i>
                    </div>
                    <div class="step-info">
                      <div class="step-title">Hoàn thành</div>
                      <div v-if="selectedTransaction.ngayHoanThanh" class="step-date">{{
                        formatDateTime(selectedTransaction.ngayHoanThanh) }}</div>
                      <div v-else class="step-pending">Chờ xử lý</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thanh chuyển trạng thái (chỉ hiện với hóa đơn đang giao) -->
            <div v-if="isDangGiao(selectedTransaction)"
              class="status-progress-section mt-4 p-3 bg-light rounded border">
              <h6 class="mb-3">
                <i class="bi bi-arrow-right-circle text-primary"></i> Chuyển trạng thái hóa đơn
              </h6>
              <button type="button" class="btn btn-success w-100" @click="handleChuyenTrangThai"
                :disabled="isProcessingStatus">
                <i class="bi" :class="isProcessingStatus ? 'bi-hourglass-split' : 'bi-arrow-right-circle'"></i>
                {{ isProcessingStatus ? 'Đang xử lý...' : 'Chuyển sang Hoàn thành' }}
              </button>
            </div>

            <!-- Nút xác nhận đơn hàng (chỉ hiện với đơn online chờ xác nhận) -->
            <div v-if="isChoXacNhan(selectedTransaction)"
              class="status-progress-section mt-4 p-3 bg-light rounded border">
              <h6 class="mb-3">
                <i class="bi bi-check-circle text-primary"></i> Xác nhận đơn hàng
              </h6>
              <button type="button" class="btn btn-primary w-100" @click="handleXacNhanDonHang"
                :disabled="isProcessingStatus">
                <i class="bi" :class="isProcessingStatus ? 'bi-hourglass-split' : 'bi-check-circle'"></i>
                {{ isProcessingStatus ? 'Đang xử lý...' : 'Xác nhận đơn hàng' }}
              </button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineExpose } from 'vue'
import { getHoaDons, getHoaDonDetail, xacNhanDonHang } from '@/service/hoaDonService'
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
const selectedStatusFilter = ref('all') // 'all', 'CHO_XAC_NHAN', 'DA_THANH_TOAN', 'DANG_GIAO', 'HOAN_THANH'
const isProcessingCOD = ref(false)
const isProcessingStatus = ref(false)

const STATUS_NUMERIC_MAP = {
  CHO_XAC_NHAN: 0, // Cho xác nhận = CHO_THANH_TOAN (0)
  DA_THANH_TOAN: 1,
  DANG_GIAO: 3,
  HOAN_THANH: 4
}

const STATUS_LABEL_MAP = {
  DA_THANH_TOAN: 'Đã thanh toán',
  DANG_GIAO: 'Đang giao',
  HOAN_THANH: 'Hoàn thành',
  DA_HUY: 'Đã hủy',
  HUY: 'Đã hủy',
  CHO_THANH_TOAN: 'Chờ thanh toán',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  CHO: 'Chờ thanh toán'
}

const STATUS_BADGE_MAP = {
  DA_THANH_TOAN: 'bg-success',
  DANG_GIAO: 'bg-warning',
  HOAN_THANH: 'bg-info',
  DA_HUY: 'bg-danger',
  HUY: 'bg-danger',
  CHO_THANH_TOAN: 'bg-secondary',
  CHO_XAC_NHAN: 'bg-info',
  CHO: 'bg-secondary'
}

const ALLOWED_STATUSES = ['CHO_XAC_NHAN', 'DA_THANH_TOAN', 'DANG_GIAO', 'HOAN_THANH']

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
 * Get customer name from transaction
 */
const getCustomerName = (transaction) => {
  if (!transaction) return 'Khách lẻ'

  // Thử nhiều cách lấy tên khách hàng
  if (transaction.khachHang?.hoTen) {
    return transaction.khachHang.hoTen
  }
  if (transaction.tenKhachHang) {
    return transaction.tenKhachHang
  }
  if (transaction.khachHang?.tenKhachHang) {
    return transaction.khachHang.tenKhachHang
  }
  if (transaction.khachHang?.name) {
    return transaction.khachHang.name
  }
  if (transaction.customer?.hoTen) {
    return transaction.customer.hoTen
  }
  if (transaction.customer?.name) {
    return transaction.customer.name
  }

  return 'Khách lẻ'
}

/**
 * Get item count - Tính tổng số lượng sản phẩm
 */
const getItemCount = (transaction) => {
  if (!transaction) return 0

  // Thử nhiều cách lấy danh sách sản phẩm
  const items = transaction.hoaDonChiTiet ||
    transaction.chiTietList ||
    transaction.hoaDonChiTiets ||
    transaction.items ||
    []

  // Nếu là mảng, tính tổng số lượng
  if (Array.isArray(items) && items.length > 0) {
    const totalQuantity = items.reduce((sum, item) => {
      const quantity = item.soLuong || item.so_luong || item.quantity || 0
      return sum + (typeof quantity === 'number' ? quantity : parseInt(quantity) || 0)
    }, 0)
    // Nếu tổng số lượng > 0 thì trả về, nếu không thì trả về số loại sản phẩm
    return totalQuantity > 0 ? totalQuantity : items.length
  }

  // Nếu có field tổng số lượng trực tiếp
  if (transaction.tongSoLuong !== undefined && transaction.tongSoLuong !== null) {
    return transaction.tongSoLuong
  }

  // Nếu là object, thử lấy length property
  if (items && typeof items === 'object' && items.length !== undefined) {
    return items.length
  }

  // Fallback: Nếu không có dữ liệu, trả về 0
  return 0
}

/**
 * Get status text
 */
const normalizeStatus = (transaction) => {
  if (!transaction) return null

  const rawStatus = transaction.trangThai ?? transaction.trangThaiHoaDon ?? transaction.status

  if (typeof rawStatus === 'string' && rawStatus.trim() !== '') {
    const upperStatus = rawStatus.trim().toUpperCase()
    if (STATUS_LABEL_MAP[upperStatus]) {
      return upperStatus
    }

    const asciiStatus = upperStatus
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
    const underscoredStatus = asciiStatus.replace(/[\s-]+/g, '_')
    if (STATUS_LABEL_MAP[underscoredStatus]) {
      return underscoredStatus
    }

    return rawStatus
  }

  if (rawStatus && typeof rawStatus === 'object') {
    const nestedStatus = rawStatus.name || rawStatus.code || rawStatus.value
    if (typeof nestedStatus === 'string') {
      return normalizeStatus({ trangThai: nestedStatus })
    }
  }

  if (typeof rawStatus === 'number') {
    const numericMap = {
      0: 'CHO_THANH_TOAN',
      1: 'DA_THANH_TOAN',
      2: 'DA_HUY',
      3: 'DANG_GIAO',
      4: 'HOAN_THANH'
    }
    return numericMap[rawStatus] || null
  }

  if (transaction.trangThaiThanhToan === 1) {
    return 'DA_THANH_TOAN'
  }

  return null
}

const getStatusText = (transaction) => {
  const normalizedStatus = transaction.normalizedStatus || normalizeStatus(transaction)

  if (normalizedStatus && STATUS_LABEL_MAP[normalizedStatus]) {
    return STATUS_LABEL_MAP[normalizedStatus]
  }

  if (transaction.trangThaiThanhToan === 1) {
    return 'Đã thanh toán'
  }

  return 'Chưa thanh toán'
}

/**
 * Kiểm tra có phải hóa đơn COD không
 * COD: DANG_GIAO + trangThaiThanhToan = 0 (chưa thanh toán)
 */
const isCOD = (transaction) => {
  const status = normalizeStatus(transaction)
  return status === 'DANG_GIAO' && transaction.trangThaiThanhToan === 0
}

/**
 * Kiểm tra có phải hóa đơn đang giao không
 */
const isDangGiao = (transaction) => {
  if (!transaction) return false
  const status = normalizeStatus(transaction)
  return status === 'DANG_GIAO'
}

/**
 * Kiểm tra có phải đơn online chờ xác nhận không
 */
const isChoXacNhan = (transaction) => {
  if (!transaction) return false
  const status = normalizeStatus(transaction)
  const isOnline = transaction.loaiHoaDon === 1
  return isOnline && (status === 'CHO_THANH_TOAN' || status === 0)
}

/**
 * Kiểm tra step đã hoàn thành chưa
 */
const isStepCompleted = (transaction, stepStatus) => {
  if (!transaction) return false
  const currentStatus = normalizeStatus(transaction)

  const statusOrder = {
    'CHO_THANH_TOAN': 0,
    'DA_THANH_TOAN': 1,
    'DANG_GIAO': 2,
    'HOAN_THANH': 3
  }

  const currentIndex = statusOrder[currentStatus] ?? -1
  const stepIndex = statusOrder[stepStatus] ?? -1

  return stepIndex < currentIndex
}

/**
 * Kiểm tra step đang active không
 */
const isStepActive = (transaction, stepStatus) => {
  if (!transaction) return false
  const currentStatus = normalizeStatus(transaction)
  return currentStatus === stepStatus
}

/**
 * Get status badge class
 */
const getStatusBadgeClass = (transaction) => {
  const normalizedStatus = transaction.normalizedStatus || normalizeStatus(transaction)

  if (normalizedStatus && STATUS_BADGE_MAP[normalizedStatus]) {
    return STATUS_BADGE_MAP[normalizedStatus]
  }

  if (transaction.trangThaiThanhToan === 1) {
    return 'bg-success'
  }

  return 'bg-secondary'
}

/**
 * Lấy mã CTSP từ item
 */
const getCTSPCode = (item) => {
  return item.maCtsp ||
    item.maCTSP ||
    item.maChiTietSanPham ||
    item.chiTietSanPham?.maCTSP ||
    item.chiTietSanPham?.maCtsp ||
    'N/A'
}

/**
 * Lấy thông số CTSP từ item
 */
const getCTSPSpecs = (item) => {
  if (!item) return null

  const ctsp = item.chiTietSanPham || item.ctsp || item
  const specs = {}

  if (ctsp.tenCpu || item.tenCpu) {
    specs.cpu = ctsp.tenCpu || item.tenCpu
  }

  if (ctsp.tenRam || item.tenRam) {
    specs.ram = ctsp.tenRam || item.tenRam
  }

  if (ctsp.dungLuongOCung || item.dungLuongOCung) {
    specs.storage = ctsp.dungLuongOCung || item.dungLuongOCung
  }

  if (ctsp.tenMauSac || item.tenMauSac) {
    specs.color = ctsp.tenMauSac || item.tenMauSac
  }

  return Object.keys(specs).length > 0 ? specs : null
}

/**
 * Lấy serial numbers cho item (nếu có)
 */
const getSerialsForItem = (item) => {
  // Kiểm tra từ backend response
  if (item.serialNumbers && Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
    return item.serialNumbers.map(s => {
      return s.serialNumber || s.serialNo || s.serial_no || s
    })
  }

  // Kiểm tra từ chiTietSanPham
  if (item.chiTietSanPham?.serials && Array.isArray(item.chiTietSanPham.serials)) {
    return item.chiTietSanPham.serials.map(s => s.serialNo || s.serialNumber || s)
  }

  return null
}

/**
 * Load recent transactions
 */
const loadTransactions = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const pageSize = selectedStatusFilter.value === 'all' ? 30 : 10
    const params = {
      page: 0,
      size: pageSize,
      sort: 'ngayTao,desc'
    }

    if (selectedStatusFilter.value !== 'all') {
      const trangThaiValue = STATUS_NUMERIC_MAP[selectedStatusFilter.value]
      if (trangThaiValue !== undefined) {
        params.trangThai = trangThaiValue
      }
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

    const normalizedTransactions = data.map(item => ({
      ...item,
      normalizedStatus: normalizeStatus(item)
    }))

    let filteredTransactions = normalizedTransactions

    // Xử lý filter "Chờ xác nhận" - đơn online (loaiHoaDon = 1) có trangThai = CHO_THANH_TOAN (0)
    if (selectedStatusFilter.value === 'CHO_XAC_NHAN') {
      filteredTransactions = normalizedTransactions.filter(item => {
        const status = normalizeStatus(item)
        const isOnline = item.loaiHoaDon === 1
        const isChoThanhToan = status === 'CHO_THANH_TOAN' || status === 0
        return isOnline && isChoThanhToan
      })
    } else if (selectedStatusFilter.value === 'all') {
      filteredTransactions = normalizedTransactions.filter(item => ALLOWED_STATUSES.includes(item.normalizedStatus))
    } else if (selectedStatusFilter.value !== 'all') {
      filteredTransactions = filteredTransactions.filter(item => item.normalizedStatus === selectedStatusFilter.value)
    }

    transactions.value = filteredTransactions.slice(0, 10)
    console.log('✅ Đã load', transactions.value.length, 'giao dịch gần đây (sau khi lọc)')

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
  if (!transaction?.id) {
    showError('Không tìm thấy thông tin hóa đơn!')
    return
  }

  // Load chi tiết hóa đơn từ API để có đầy đủ thông tin sản phẩm
  try {
    isLoading.value = true
    const response = await getHoaDonDetail(transaction.id)

    // Xử lý response format: có thể là { data: {...} } hoặc trực tiếp {...}
    const detailData = response?.data || response

    if (detailData) {
      // Merge với transaction hiện tại để giữ các thông tin đã có
      selectedTransaction.value = {
        ...transaction,
        ...detailData,
        // Đảm bảo có danh sách sản phẩm
        hoaDonChiTiet: detailData.hoaDonChiTiet ||
          detailData.chiTietList ||
          detailData.hoaDonChiTiets ||
          transaction.hoaDonChiTiet ||
          transaction.chiTietList ||
          [],
        // Đảm bảo có thông tin khách hàng
        khachHang: detailData.khachHang || transaction.khachHang,
        tenKhachHang: detailData.tenKhachHang || transaction.tenKhachHang,
        // Đảm bảo có thông tin nhân viên
        nhanVien: detailData.nhanVien || transaction.nhanVien,
        // Normalize status
        normalizedStatus: normalizeStatus(detailData)
      }
      showDetailModal.value = true
    } else {
      // Fallback: dùng transaction hiện tại nếu không load được chi tiết
      selectedTransaction.value = transaction
      showDetailModal.value = true
    }
  } catch (error) {
    console.error('❌ [RecentTransactions] Lỗi khi load chi tiết hóa đơn:', error)
    // Fallback: vẫn hiển thị modal với thông tin hiện có
    selectedTransaction.value = transaction
    showDetailModal.value = true
    showError('Không thể tải chi tiết hóa đơn. Hiển thị thông tin cơ bản.')
  } finally {
    isLoading.value = false
  }
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

/**
 * Xử lý chuyển trạng thái từ DANG_GIAO sang HOAN_THANH
 */
const handleChuyenTrangThai = async () => {
  if (!selectedTransaction.value || !selectedTransaction.value.id) {
    showError('Không tìm thấy thông tin hóa đơn!')
    return
  }

  const confirmed = confirm(
    `Xác nhận chuyển trạng thái hóa đơn ${selectedTransaction.value.ma || selectedTransaction.value.id} từ "Đang giao" sang "Hoàn thành"?`
  )

  if (!confirmed) {
    return
  }

  isProcessingStatus.value = true
  try {
    const axiosInstance = (await import('@/service/axiosInstance')).default
    const response = await axiosInstance.put(
      `/api/v1/hoa-don/${selectedTransaction.value.id}/status`,
      null,
      {
        params: {
          trangThai: 4 // HOAN_THANH = 4
        }
      }
    )

    if (response && response.data) {
      showSuccess('Chuyển trạng thái thành công!')
      // Cập nhật trạng thái trong selectedTransaction
      selectedTransaction.value.trangThai = 4
      selectedTransaction.value.trangThaiHoaDon = 'HOAN_THANH'
      selectedTransaction.value.normalizedStatus = 'HOAN_THANH'
      // Refresh danh sách
      await refreshTransactions()
    } else {
      showError('Không nhận được phản hồi từ server!')
    }
  } catch (error) {
    console.error('❌ [RecentTransactions] Lỗi khi chuyển trạng thái:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi chuyển trạng thái!'
    showError(errorMessage)
  } finally {
    isProcessingStatus.value = false
  }
}

/**
 * Xử lý xác nhận đơn hàng online
 */
const handleXacNhanDonHang = async () => {
  if (!selectedTransaction.value || !selectedTransaction.value.id) {
    showError('Không tìm thấy thông tin hóa đơn!')
    return
  }

  const confirmed = confirm(
    `Xác nhận đơn hàng ${selectedTransaction.value.ma || selectedTransaction.value.id}? Đơn hàng sẽ được chuyển sang trạng thái "Đang giao".`
  )

  if (!confirmed) {
    return
  }

  isProcessingStatus.value = true
  try {
    // Lấy nhanVienId từ localStorage hoặc auth store nếu có
    const nhanVienId = localStorage.getItem('nhanVienId') || localStorage.getItem('userId') || null

    const response = await xacNhanDonHang(selectedTransaction.value.id, nhanVienId)

    if (response && response.data) {
      showSuccess('Xác nhận đơn hàng thành công!')
      // Refresh chi tiết đơn hàng
      await viewTransactionDetail(selectedTransaction.value)
      // Refresh danh sách
      await refreshTransactions()
    } else {
      showError('Không nhận được phản hồi từ server!')
    }
  } catch (error) {
    console.error('❌ [RecentTransactions] Lỗi khi xác nhận đơn hàng:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xác nhận đơn hàng!'
    showError(errorMessage)
  } finally {
    isProcessingStatus.value = false
  }
}

// Watch status filter changes
watch(selectedStatusFilter, () => {
  loadTransactions()
})

// Expose method để component cha có thể gọi
defineExpose({
  refreshTransactions
})

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

/* Modal styling - không dùng backdrop để không che màn hình */
.modal {
  z-index: 1050;
  background: rgba(0, 0, 0, 0.3);
}

.modal-dialog {
  position: relative;
  z-index: 1051;
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

/* CTSP Code - NỔI BẬT */
.ctsp-badge-small {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.ctsp-code-text {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* CTSP Specs */
.ctsp-specs-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-item-small {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.4rem;
  background: #f0f4ff;
  color: #4a5568;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid #cbd5e0;
  width: fit-content;
}

.spec-item-small i {
  color: #667eea;
  font-size: 0.75rem;
}

/* Status Progress Section */
.status-progress-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
}

.status-progress-bar {
  margin-bottom: 1rem;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 200px;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border: 3px solid #dee2e6;
  color: #6c757d;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.step.completed .step-circle {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.step.active .step-circle {
  background: #ffc107;
  border-color: #ffc107;
  color: white;
  animation: pulse 1.5s infinite;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.step.completed .step-label {
  color: #28a745;
}

.step.active .step-label {
  color: #ffc107;
}

.step-connector {
  flex: 1;
  height: 3px;
  background: #dee2e6;
  margin: 0 0.5rem;
  position: relative;
  top: -25px;
}

.step.completed+.step-connector {
  background: #28a745;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
  }

  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 193, 7, 0);
  }
}

/* Order Timeline Section */
.order-timeline-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #dee2e6;
}

.order-timeline {
  padding: 1rem 0;
}

.timeline-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  position: relative;
}

.step-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border: 2px solid #dee2e6;
  color: #6c757d;
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

.timeline-step.completed .step-marker {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.timeline-step.active .step-marker {
  background: #0dcaf0;
  border-color: #0dcaf0;
  color: white;
  animation: pulse-timeline 2s infinite;
}

.step-info {
  flex: 1;
  padding-top: 0.25rem;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.timeline-step.completed .step-title {
  color: #28a745;
}

.timeline-step.active .step-title {
  color: #0dcaf0;
  font-weight: 700;
}

.step-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.step-pending {
  font-size: 0.8rem;
  color: #adb5bd;
  font-style: italic;
}

.timeline-connector {
  width: 2px;
  height: 20px;
  background: #dee2e6;
  margin-left: 15px;
  transition: all 0.3s ease;
}

.timeline-connector.active {
  background: #28a745;
}

@keyframes pulse-timeline {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(13, 202, 240, 0.7);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(13, 202, 240, 0);
  }
}
</style>
