<template>
  <div class="invoice-detail p-4 bg-white rounded shadow-sm">
    <!-- Breadcrumb -->
    <div class="d-flex align-items-center breadcrumb-title">
      <i class="bi bi-arrow-left me-2" style="cursor: pointer" @click="goBack"></i>
      <span class="main-title">Quản lý đơn hàng</span>
      <span class="divider">/</span>
      <span class="sub-title">Chi tiết hóa đơn {{ code }}</span>
    </div>

    <!-- Status Steps & Actions -->
    <div class="steps-horizontal mb-4">
      <div class="stepper-scroll">
        <div class="d-flex align-items-center flex-nowrap pb-2 justify-content-center stepper-flex">
          <template v-for="(step, index) in steps" :key="index">
            <div class="d-flex align-items-center stepper-step-group">
              <button
                class="step-btn step-btn-modern"
                :class="{
                  'step-done': index < currentStep,
                  'step-active': index === currentStep,
                  'step-inactive': index > currentStep,
                }"
                disabled
              >
                {{ step.label }}
              </button>
              <div
                v-if="index < steps.length - 1"
                class="step-line-modern"
                :class="{ active: index < currentStep }"
              />
            </div>
          </template>
        </div>
      </div>
      <div class="d-flex justify-content-center gap-2 mt-3 flex-wrap">
        <button
          class="btn btn-outline-success btn-sm"
          :disabled="currentStep === 0"
          @click="prevStep"
        >
          <i class="bi bi-arrow-left"></i> HOÀN TÁC
        </button>
        <button
          class="btn btn-outline-primary btn-sm"
          :disabled="currentStep >= steps.length - 1"
          @click="nextStep"
        >
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
          <span class="info-value"
            ><span class="badge">{{ invoice.type }}</span></span
          >
        </div>
        <div class="info-item">
          <span>Trạng thái:</span>
          <span class="info-value"
            ><span class="badge">{{ getStatusLabel(invoice.status) }}</span></span
          >
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
          <span>Địa chỉ:</span
          ><span class="info-value">{{ invoice.customer?.address || 'N/A' }}</span>
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
              <img
                :src="item.image"
                :alt="item.name"
                style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px"
              />
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
            <div
              v-if="!invoice.payments || invoice.payments.length === 0"
              class="history-item-placeholder"
            >
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
              <span class="summary-value text-danger"
                >-{{ formatCurrency(invoice.discount || 0) }}</span
              >
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoiceStore'

const route = useRoute()
const router = useRouter()
const code = route.params.code
const invoiceStore = useInvoiceStore()

const steps = [
  { status: 'pending', label: 'Chờ thêm sản phẩm' },
  { status: 'processing', label: 'Chờ xác nhận' },
  { status: 'confirmed', label: 'Đã xác nhận' },
  { status: 'delivering', label: 'Chờ giao hàng' },
  { status: 'shipping', label: 'Đang vận chuyển' },
  { status: 'delivered', label: 'Hoàn thành' },
  { status: 'done', label: 'Hoàn tất' },
]

const invoice = computed(
  () => invoiceStore.getInvoiceByCode(code) || { customer: {}, details: [], payments: [] },
)
const currentStep = computed(() => steps.findIndex((s) => s.status === invoice.value?.status))

const customerName = computed(() => {
  const nameString = invoice.value.customer?.name || ''
  if (nameString.includes(' - ')) {
    return nameString.split(' - ')[0].trim()
  }
  return nameString
})

const customerPhone = computed(() => {
  const nameString = invoice.value.customer?.name || ''
  if (nameString.includes(' - ')) {
    return nameString.split(' - ')[1].trim()
  }
  // Fallback to phone field if it exists and name doesn't contain phone
  return invoice.value.customer?.phone || ''
})

const subTotal = computed(() => (invoice.value.details || []).reduce((sum, i) => sum + i.total, 0))
const finalTotal = computed(
  () => subTotal.value - (invoice.value.discount || 0) + (invoice.value.shippingFee || 0),
)
const paidAmount = computed(() =>
  (invoice.value.payments || []).reduce((sum, p) => sum + p.amount, 0),
)
const remainingAmount = computed(() => finalTotal.value - paidAmount.value)

const getStatusLabel = (status) => {
  const step = steps.find((s) => s.status === status)
  return step ? step.label : 'Không xác định'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
}

const goBack = () => {
  router.push('/quan-li-hoa-don')
}

const prevStep = () => {
  if (currentStep.value > 0) {
    if (confirm('Bạn có chắc muốn hoàn tác trạng thái hóa đơn này?')) {
      invoiceStore.updateInvoiceStatus(code, steps[currentStep.value - 1].status)
    }
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    if (confirm('Bạn có chắc muốn chuyển sang trạng thái tiếp theo?')) {
      invoiceStore.updateInvoiceStatus(code, steps[currentStep.value + 1].status)
    }
  }
}

const cancelInvoice = () => {
  if (confirm('Bạn có chắc muốn hủy hóa đơn này?')) {
    invoiceStore.updateInvoiceStatus(code, 'cancelled')
  }
}

const updateInvoice = () => {
  alert('Chức năng Cập nhật đang được phát triển!')
}

const printInvoice = () => {
  alert('Chức năng In hóa đơn đang được phát triển!')
}

const viewHistory = () => {
  alert('Chuyển sang trang lịch sử hóa đơn')
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
  color: #212529; /* Đổi sang màu đen */
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
