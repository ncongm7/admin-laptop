<template>
  <div v-if="isLoading" class="invoice-loading-state p-4 text-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Đang tải...</span>
    </div>
    <p class="mt-3 mb-0">Đang tải thông tin hóa đơn...</p>
  </div>

  <div v-else-if="loadError" class="alert alert-danger m-3">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ loadError }}
  </div>

  <div v-else-if="!invoice" class="alert alert-info m-3">
    <i class="bi bi-info-circle-fill me-2"></i>Không tìm thấy thông tin hóa đơn.
  </div>

  <div v-else class="invoice-detail p-4 bg-white rounded shadow-sm">
    <!-- Breadcrumb -->
    <div class="d-flex align-items-center breadcrumb-title">
      <i class="bi bi-arrow-left me-2" style="cursor: pointer" @click="goBack"></i>
      <span class="main-title">Quản lý đơn hàng</span>
      <span class="divider">/</span>
      <span class="sub-title">Chi tiết hóa đơn {{ invoice.code || codeParam }}</span>
    </div>

    <!-- Status Steps & Actions -->
    <div class="steps-horizontal mb-4">
      <div class="stepper-scroll">
        <div class="d-flex align-items-center flex-nowrap pb-2 justify-content-center stepper-flex">
          <template v-for="(step, index) in steps" :key="index">
            <div class="d-flex align-items-center stepper-step-group">
              <button class="step-btn step-btn-modern" :class="{
                'step-done': index < currentStep,
                'step-active': index === currentStep,
                'step-inactive': index > currentStep,
              }" disabled>
                {{ step.label }}
              </button>
              <div v-if="index < steps.length - 1" class="step-line-modern" :class="{ active: index < currentStep }" />
            </div>
          </template>
        </div>
      </div>
      <div class="d-flex justify-content-center gap-2 mt-3 flex-wrap">
        <button class="btn btn-outline-success btn-sm" :disabled="currentStep === 0" @click="prevStep">
          <i class="bi bi-arrow-left"></i> HOÀN TÁC
        </button>
        <button class="btn btn-outline-primary btn-sm" :disabled="currentStep >= steps.length - 1" @click="nextStep">
          XÁC NHẬN <i class="bi bi-arrow-right"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="cancelInvoice">
          <i class="bi bi-trash"></i> HỦY HÓA ĐƠN
        </button>
        <button class="btn btn-outline-purple btn-sm" @click="viewHistory">
          <i class="bi bi-clock-history"></i> LỊCH SỬ HÓA ĐƠN
        </button>
      </div>
    </div>

    <!-- Invoice Info -->
    <div class="info-row">
      <div class="info-box">
        <div class="info-title"><i class="bi bi-file-earmark-text me-2"></i>Thông Tin Đơn Hàng</div>
        <div class="info-item">
          <span>Mã đơn hàng:</span>
          <span class="info-value fw-semibold">{{ invoice.code }}</span>
        </div>
        <div class="info-item">
          <span>Loại đơn:</span>
          <span class="info-value"><span class="badge">{{ invoice.type }}</span></span>
        </div>
        <div class="info-item">
          <span>Trạng thái:</span>
          <span class="info-value"><span class="badge">{{ getStatusLabel(invoice.backendStatus || invoice.status)
              }}</span></span>
        </div>
        <div class="info-item">
          <span>Ngày đặt:</span>
          <span class="info-value">{{ formatDateTime(invoice.createdAt) }}</span>
        </div>
      </div>
      <div class="info-box">
        <div class="info-title"><i class="bi bi-person-circle me-2"></i>Thông Tin Khách Hàng</div>
        <div class="info-item">
          <span>Tên khách hàng:</span><span class="info-value">{{ customerName }}</span>
        </div>
        <div class="info-item">
          <span>Số điện thoại:</span><span class="info-value">{{ customerPhone }}</span>
        </div>
        <div class="info-item">
          <span>Địa chỉ:</span><span class="info-value">{{ invoice.customer?.address || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span>Ghi chú:</span><span class="info-value">{{ invoice.note || 'Không có' }}</span>
        </div>
      </div>
    </div>

    <!-- Invoice Details (Product List) -->
    <div class="mb-4">
      <h6 class="fw-bold text-center mb-3">CHI TIẾT SẢN PHẨM</h6>
      <table class="table table-bordered text-center">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Ảnh</th>
            <th>Mã SP</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!invoice.details || invoice.details.length === 0">
            <td colspan="7" class="text-muted">Không có sản phẩm</td>
          </tr>
          <tr v-for="(item, idx) in invoice.details" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>
              <img :src="item.image" :alt="item.name"
                style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px" />
            </td>
            <td>{{ item.sku }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.price) }}</td>
            <td>{{ formatCurrency(item.total) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment and Summary Section -->
    <div class="payment-summary-section">
      <!-- Left Column: History -->
      <div class="history-column">
        <!-- Payment History Box -->
        <div class="history-box">
          <div class="history-title"><i class="bi bi-wallet2 me-2"></i> Lịch Sử Thanh Toán</div>
          <div class="history-items">
            <div v-if="!invoice.payments || invoice.payments.length === 0" class="history-item-placeholder">
              Chưa có thanh toán
            </div>
            <div v-for="payment in invoice.payments" :key="payment.time" class="history-item">
              <span class="history-dot"></span>
              <div class="history-content">
                <div class="fw-bold">
                  {{ payment.method }} - {{ formatCurrency(payment.amount) }}
                </div>
                <div class="text-muted small">
                  NV: {{ payment.staff }} - {{ formatDateTime(payment.time) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice History Box -->
        <div class="history-box mt-3">
          <div class="history-title"><i class="bi bi-clock-history me-2"></i> Lịch Sử Hóa Đơn</div>
          <div class="history-items">
            <div class="history-item">
              <span class="history-dot"></span>
              <div class="history-content">
                <div class="fw-bold">Tạo hóa đơn</div>
                <div class="text-muted small">
                  NV: {{ invoice.createdBy }} - {{ formatDateTime(invoice.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Summary -->
      <div class="summary-column">
        <div class="summary-box">
          <div class="summary-title"><i class="bi bi-receipt me-2"></i> Tổng Kết Đơn Hàng</div>
          <div class="summary-body">
            <div class="summary-item">
              <i class="bi bi-cart3 text-muted"></i>
              <span class="summary-label">Tổng tiền hàng</span>
              <span class="summary-value">{{ formatCurrency(subTotal) }}</span>
            </div>
            <div class="summary-item">
              <i class="bi bi-tag text-muted"></i>
              <span class="summary-label">Giảm giá</span>
              <span class="summary-value text-danger">-{{ formatCurrency(invoice.discount || 0) }}</span>
            </div>
            <div class="summary-item">
              <i class="bi bi-truck text-muted"></i>
              <span class="summary-label">Phí vận chuyển</span>
              <span class="summary-value">{{ formatCurrency(invoice.shippingFee || 0) }}</span>
            </div>
            <hr class="summary-divider" />
            <div class="summary-item total">
              <i class="bi bi-credit-card text-muted"></i>
              <span class="summary-label">Thành tiền</span>
              <span class="summary-value main-total">{{ formatCurrency(finalTotal) }}</span>
            </div>
            <div class="summary-item">
              <i class="bi bi-check-circle text-success"></i>
              <span class="summary-label">Đã thanh toán</span>
              <span class="summary-value text-success">{{ formatCurrency(paidAmount) }}</span>
            </div>
            <div class="summary-item" v-if="remainingAmount > 0">
              <i class="bi bi-exclamation-circle text-danger"></i>
              <span class="summary-label">Còn lại phải trả</span>
              <span class="summary-value text-danger">{{ formatCurrency(remainingAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons Footer -->
    <div class="action-buttons-footer">
      <button class="btn btn-secondary" @click="goBack">Quay lại</button>
      <button class="btn btn-success" @click="updateInvoice">Cập nhật</button>
      <button class="btn btn-success" @click="printInvoice">In hóa đơn</button>
    </div>
  </div>

  <!-- Update Invoice Modal -->
  <UpdateInvoiceModal v-if="showUpdateModal && invoice" :invoice="invoice" @close="closeUpdateModal"
    @updated="handleInvoiceUpdated" />

  <!-- History Modal -->
  <div v-if="showHistoryModal && invoice" class="modal-backdrop fade show" @click="closeHistoryModal"></div>
  <div v-if="showHistoryModal && invoice" class="modal fade show d-block" tabindex="-1" style="z-index: 9999;"
    @click.self="closeHistoryModal">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-clock-history"></i> Lịch sử hóa đơn {{ invoice?.code || codeParam }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="closeHistoryModal"></button>
        </div>
        <div class="modal-body">
          <InvoiceHistoryTimeline :invoice-id="invoice.id" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeHistoryModal">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getHoaDonDetail, getHoaDonDetailByCode, capNhatTrangThai } from '@/service/hoaDonService'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useErrorHandler } from '@/composables/useErrorHandler'
import UpdateInvoiceModal from './UpdateInvoiceModal.vue'
import InvoiceHistoryTimeline from './InvoiceHistoryTimeline.vue'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()

const invoice = ref(null)
const isLoading = ref(true)
const loadError = ref('')

const codeParam = computed(() => route.params.code)
const idParam = computed(() => route.query.id)

const steps = [
  { status: 'CHO_THANH_TOAN', label: 'Chờ thanh toán', backendStatus: 'CHO_THANH_TOAN' },
  { status: 'DA_THANH_TOAN', label: 'Đã thanh toán', backendStatus: 'DA_THANH_TOAN' },
  { status: 'DANG_GIAO', label: 'Đang giao hàng', backendStatus: 'DANG_GIAO' },
  { status: 'HOAN_THANH', label: 'Hoàn tất', backendStatus: 'HOAN_THANH' },
]

const currentStep = computed(() => {
  if (!invoice.value?.backendStatus) return 0
  const idx = steps.findIndex((s) => s.backendStatus === invoice.value.backendStatus)
  return idx >= 0 ? idx : 0
})

const statusLabelMap = {
  CHO_THANH_TOAN: 'Chờ thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán',
  DANG_GIAO: 'Đang giao hàng',
  HOAN_THANH: 'Hoàn tất',
  DA_HUY: 'Đã hủy',
  pending: 'Chờ thanh toán',
  confirmed: 'Đã thanh toán',
  shipping: 'Đang giao hàng',
  done: 'Hoàn tất',
}

const customerName = computed(() => invoice.value?.customer?.name || 'Khách lẻ')
const customerPhone = computed(() => invoice.value?.customer?.phone || '')

const subTotal = computed(() =>
  (invoice.value?.details || []).reduce((sum, item) => sum + (item.total || 0), 0),
)
const finalTotal = computed(
  () => subTotal.value - (invoice.value?.discount || 0) + (invoice.value?.shippingFee || 0),
)
const paidAmount = computed(() =>
  (invoice.value?.payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0),
)
const remainingAmount = computed(() => finalTotal.value - paidAmount.value)

const getStatusLabel = (status) => statusLabelMap[status] || 'Không xác định'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)

const goBack = () => {
  router.push('/quan-li-hoa-don')
}

const { success: showSuccess, error: showError } = useToast()
const { showConfirm } = useConfirm()
const { handleError: handleErrorWithRetry } = useErrorHandler()

const syncInvoiceFromResponse = (responsePayload) => {
  if (!responsePayload) return invoice.value
  const wrapper = responsePayload.data || responsePayload
  const rawInvoice = wrapper?.data || wrapper
  return invoiceStore.upsertInvoice(rawInvoice) || invoice.value
}

const fetchInvoice = async () => {
  if (!codeParam.value && !idParam.value) {
    loadError.value = 'Không tìm thấy mã hóa đơn.'
    invoice.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    let cachedInvoice = null
    if (codeParam.value) {
      cachedInvoice = invoiceStore.getInvoiceByCode(codeParam.value)
    } else if (idParam.value) {
      cachedInvoice = invoiceStore.getInvoiceById(idParam.value)
    }

    if (cachedInvoice) {
      invoice.value = cachedInvoice
    }

    let response
    if (codeParam.value) {
      response = await getHoaDonDetailByCode(codeParam.value)
    } else {
      response = await getHoaDonDetail(idParam.value)
    }

    const normalized = syncInvoiceFromResponse(response)
    if (normalized) {
      invoice.value = normalized
    } else if (!invoice.value) {
      loadError.value = 'Không tìm thấy dữ liệu hóa đơn.'
    }
  } catch (error) {
    console.error('❌ [ChiTietHoaDon] Lỗi khi tải hóa đơn:', error)
    loadError.value = error.response?.data?.message || 'Không thể tải chi tiết hóa đơn.'
  } finally {
    isLoading.value = false
  }
}

const prevStep = async () => {
  if (currentStep.value <= 0 || !invoice.value) return

  const confirmed = await showConfirm({
    title: 'Hoàn tác trạng thái',
    message: 'Bạn có chắc muốn hoàn tác trạng thái hóa đơn này?',
    confirmText: 'Hoàn tác',
    cancelText: 'Hủy',
    type: 'warning',
  })

  if (!confirmed) return

  try {
    const targetStatus = steps[currentStep.value - 1].backendStatus
    const response = await capNhatTrangThai(invoice.value.id, targetStatus)
    invoice.value = syncInvoiceFromResponse(response)
    showSuccess('Đã hoàn tác trạng thái thành công!')
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => prevStep(),
      'Không thể hoàn tác trạng thái. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

const nextStep = async () => {
  if (currentStep.value >= steps.length - 1 || !invoice.value) return

  const confirmed = await showConfirm({
    title: 'Xác nhận chuyển trạng thái',
    message: 'Bạn có chắc muốn chuyển sang trạng thái tiếp theo?',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'info',
  })

  if (!confirmed) return

  try {
    const targetStatus = steps[currentStep.value + 1].backendStatus
    const response = await capNhatTrangThai(invoice.value.id, targetStatus)
    invoice.value = syncInvoiceFromResponse(response)
    showSuccess('Đã chuyển trạng thái thành công!')
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => nextStep(),
      'Không thể chuyển trạng thái. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

const cancelInvoice = async () => {
  if (!invoice.value) return

  const confirmed = await showConfirm({
    title: 'Hủy hóa đơn',
    message: 'Bạn có chắc muốn hủy hóa đơn này?',
    confirmText: 'Hủy đơn',
    cancelText: 'Không',
    type: 'danger',
  })

  if (!confirmed) return

  try {
    const response = await capNhatTrangThai(invoice.value.id, 'DA_HUY')
    invoice.value = syncInvoiceFromResponse(response)
    showSuccess('Đã hủy hóa đơn thành công!')
  } catch (error) {
    await handleErrorWithRetry(
      error,
      () => cancelInvoice(),
      'Không thể hủy hóa đơn. Vui lòng thử lại!',
      { showRetry: true, maxRetries: 2 },
    )
  }
}

const showUpdateModal = ref(false)

const updateInvoice = () => {
  if (!invoice.value) {
    showError('Không có thông tin hóa đơn!')
    return
  }
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const handleInvoiceUpdated = (updatedInvoice) => {
  invoice.value = invoiceStore.upsertInvoice(updatedInvoice)
  showUpdateModal.value = false
}

const printInvoice = async () => {
  try {
    const { inHoaDon } = await import('@/service/banhang/hoaDonService')
    const invoiceId = invoice.value?.id || codeParam.value || idParam.value

    if (!invoiceId) {
      showError('Không có thông tin hóa đơn để in!')
      return
    }

    const blob = await inHoaDon(invoiceId)
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
      showError('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker!')
    }
  } catch (error) {
    console.error('❌ Lỗi khi in hóa đơn:', error)
    showError('Không thể in hóa đơn. Vui lòng thử lại!')
  }
}

const showHistoryModal = ref(false)

const viewHistory = () => {
  if (!invoice.value) {
    showError('Không có thông tin hóa đơn!')
    return
  }
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(fetchInvoice)

watch(
  () => [codeParam.value, idParam.value],
  () => {
    fetchInvoice()
  },
)
</script>

<style scoped>
/* --- TỔNG QUAN --- */
.invoice-detail {
  font-size: 0.95rem;
  color: #212529;
  max-width: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  padding: 24px;
}

/* --- TIÊU ĐỀ & BREADCRUMB --- */
.breadcrumb-title {
  font-size: 1.8rem;
  font-weight: 700;
  gap: 8px;
  color: #212529;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.breadcrumb-title .main-title,
.breadcrumb-title .divider {
  color: #212529;
}

.breadcrumb-title .sub-title {
  color: #212529;
  /* Đổi sang màu đen */
}

/* --- STEPPER TRẠNG THÁI --- */
.steps-horizontal {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.stepper-scroll {
  overflow-x: auto;
}

.stepper-flex {
  gap: 12px;
  min-width: max-content;
}

.stepper-step-group {
  display: flex;
  align-items: center;
}

.step-btn.step-btn-modern {
  border-radius: 999px;
  font-weight: 600;
  padding: 0.35rem 1.2rem;
  font-size: 0.9rem;
  border: none;
  background: #e9ecef;
  color: #6c757d;
  white-space: nowrap;
}

.step-btn.step-btn-modern.step-done {
  background: #16a34a;
  color: #fff;
}

.step-btn.step-btn-modern.step-active {
  background: #0d6efd;
  color: #fff;
}

.stepper-step-group .step-line-modern {
  width: 36px;
  height: 3px;
  background: #e0e0e0;
  margin: 0 8px;
  border-radius: 2px;
}

.stepper-step-group .step-line-modern.active {
  background: #16a34a;
}

.steps-horizontal .btn {
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 999px;
}

/* --- BẢNG SẢN PHẨM --- */
h6 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.table {
  font-size: 0.9rem;
  box-shadow: none;
}

.table-bordered {
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  padding: 10px 8px;
}

/* --- PAYMENT & SUMMARY SECTION --- */
.payment-summary-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-top: 2.5rem;
}

.history-column {
  flex: 6;
}

.summary-column {
  flex: 4;
}

/* --- BOX STYLES --- */
.history-box,
.summary-box {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
}

/* --- HISTORY BOX --- */
.history-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  color: #495057;
}

.history-items {
  padding: 16px;
}

.history-item {
  display: flex;
  position: relative;
  padding-left: 20px;
  padding-bottom: 16px;
}

.history-item:last-child {
  padding-bottom: 0;
}

.history-item:last-child .history-dot::after {
  display: none;
}

.history-dot {
  position: absolute;
  left: 0;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #16a34a;
}

.history-dot::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 4px;
  width: 2px;
  height: 100%;
  background-color: #e9ecef;
}

.history-item-placeholder {
  color: #6c757d;
}

/* --- SUMMARY BOX --- */
.summary-title {
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.summary-body {
  padding: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  font-size: 0.95rem;
}

.summary-item i {
  margin-right: 12px;
  font-size: 1.2rem;
  width: 20px;
  text-align: center;
}

.summary-label {
  flex-grow: 1;
  color: #495057;
}

.summary-value {
  font-weight: 600;
}

.summary-divider {
  margin: 8px 0;
  border-color: #f1f3f5;
}

.summary-item.total .summary-label {
  font-weight: 700;
  color: #212529;
}

.summary-item.total .summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #16a34a;
}

/* --- BOX THÔNG TIN KH/ĐH --- */
.info-row {
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: stretch;
  margin-bottom: 2.5rem;
}

.info-box {
  flex: 1;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  color: #495057;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 0.9rem;
  border-bottom: 1px solid #f8f9fa;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item span:first-child {
  color: #6c757d;
}

.info-value {
  font-weight: 600;
  text-align: right;
}

.info-value .badge {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: #e9ecef;
  color: #212529;
}

/* --- RESPONSIVE --- */
@media (max-width: 992px) {

  .payment-summary-section,
  .info-row {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .invoice-detail {
    padding: 16px;
  }

  .breadcrumb-title {
    font-size: 1.2rem;
  }
}

/* --- ACTION BUTTONS FOOTER --- */
.action-buttons-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.action-buttons-footer .btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 20px;
  font-size: 0.95rem;
}

.action-buttons-footer .btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.action-buttons-footer .btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}

.action-buttons-footer .btn-success {
  background-color: #16a34a;
  border-color: #16a34a;
  color: #fff;
}

.action-buttons-footer .btn-success:hover {
  background-color: #148a3d;
  border-color: #127a36;
}

/* --- BUTTONS --- */
.btn-outline-purple {
  color: purple;
  border: 1px solid purple;
}

.btn-outline-purple:hover {
  background-color: purple;
  color: white;
}

/* --- CUSTOM OUTLINE BUTTONS --- */
.btn-outline-success {
  color: #16a34a;
  border: 1px solid #16a34a;
  background-color: transparent;
}

.btn-outline-success:hover:not(:disabled) {
  background-color: #16a34a;
  color: white;
  border-color: #16a34a;
}

.btn-outline-success:disabled {
  color: #6c757d;
  border-color: #6c757d;
  background-color: transparent;
}

.btn-outline-primary {
  color: #0d6efd;
  border: 1px solid #0d6efd;
  background-color: transparent;
}

.btn-outline-primary:hover:not(:disabled) {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.btn-outline-primary:disabled {
  color: #6c757d;
  border-color: #6c757d;
  background-color: transparent;
}
</style>
