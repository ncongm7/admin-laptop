```vue
<template>
  <div class="invoice-detail p-4 bg-white rounded shadow-sm">
    <!-- Breadcrumb -->
    <div class="d-flex align-items-center mb-3 breadcrumb-title">
      <i class="bi bi-arrow-left me-2" style="cursor: pointer" @click="goBack"></i>
      <span class="main-title">Quản lý đơn hàng</span>
      <span class="divider">/</span>
      <span class="sub-title">Chi tiết hóa đơn {{ code }}</span>
    </div>

    <!-- Status Steps & Actions (Horizontal Stepper) -->
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
      <!-- Action Buttons -->
      <div class="d-flex justify-content-center gap-2 mt-3 flex-wrap">
        <button class="btn btn-success btn-sm" :disabled="currentStep === 0" @click="prevStep">
          ← HOÀN TÁC
        </button>
        <button
          class="btn btn-primary btn-sm"
          :disabled="currentStep >= steps.length - 1"
          @click="nextStep"
        >
          XÁC NHẬN →
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
    <div class="info-row mb-4">
      <div class="info-box">
        <div class="info-title"><i class="bi bi-file-earmark-text me-2"></i>Thông Tin Đơn Hàng</div>
        <div class="info-item">
          <span>Mã đơn hàng:</span>
          <span class="info-value text-primary fw-semibold">{{ invoice.code }}</span>
        </div>
        <div class="info-item">
          <span>Loại đơn:</span>
          <span class="info-value"
            ><span class="badge bg-secondary">{{ invoice.type }}</span></span
          >
        </div>
        <div class="info-item">
          <span>Trạng thái:</span>
          <span class="info-value"
            ><span class="badge status-badge" :class="getStatusBadgeClass(invoice.status)">{{
              getStatusLabel(invoice.status)
            }}</span></span
          >
        </div>
        <div class="info-item">
          <span>Phiếu giảm giá:</span>
          <span class="info-value">{{ invoice.voucherCode || 'Không có' }}</span>
        </div>
        <div class="info-item">
          <span>Ngày đặt:</span>
          <span class="info-value">{{ formatDateTime(invoice.createdAt) }}</span>
        </div>
      </div>
      <div class="info-box">
        <div class="info-title"><i class="bi bi-person-circle me-2"></i>Thông Tin Khách Hàng</div>
        <div class="info-item">
          <span>Tên khách hàng:</span><span class="info-value">{{ invoice.customer.name }}</span>
        </div>
        <div class="info-item">
          <span>Số điện thoại:</span><span class="info-value">{{ invoice.customer.phone }}</span>
        </div>
        <div class="info-item">
          <span>Địa chỉ:</span
          ><span class="info-value">{{ invoice.customer.address || ', , ,' }}</span>
        </div>
        <div class="info-item">
          <span>Email:</span><span class="info-value">{{ invoice.customer.email || 'N/A' }}</span>
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
        <tfoot v-if="invoice.details && invoice.details.length">
          <tr>
            <td colspan="6" class="text-end fw-bold">Tổng tiền hàng</td>
            <td class="fw-bold">
              {{ formatCurrency(invoice.details.reduce((sum, i) => sum + i.total, 0)) }}
            </td>
          </tr>
          <tr>
            <td colspan="6" class="text-end">Giảm giá</td>
            <td>-{{ formatCurrency(invoice.discount || 0) }}</td>
          </tr>
          <tr>
            <td colspan="6" class="text-end">Phí vận chuyển</td>
            <td>{{ formatCurrency(invoice.shippingFee || 0) }}</td>
          </tr>
          <tr>
            <td colspan="6" class="text-end text-primary fw-bold">Tổng thanh toán</td>
            <td class="text-primary fw-bold">
              {{
                formatCurrency(
                  invoice.details.reduce((sum, i) => sum + i.total, 0) -
                    (invoice.discount || 0) +
                    (invoice.shippingFee || 0),
                )
              }}
            </td>
          </tr>
          <tr>
            <td colspan="6" class="text-end">Đã thanh toán</td>
            <td class="text-success fw-bold">
              {{ formatCurrency((invoice.payments || []).reduce((sum, p) => sum + p.amount, 0)) }}
            </td>
          </tr>
          <tr>
            <td colspan="6" class="text-end">Còn lại phải trả</td>
            <td class="text-danger fw-bold">
              {{
                formatCurrency(
                  invoice.details.reduce((sum, i) => sum + i.total, 0) -
                    (invoice.discount || 0) +
                    (invoice.shippingFee || 0) -
                    (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0),
                )
              }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Lịch sử trạng thái ngang (sau chi tiết sản phẩm) -->
    <div class="status-history-horizontal">
      <h4 class="text-center mb-4">LỊCH SỬ TRẠNG THÁI</h4>
      <div class="status-history-row">
        <template v-for="(step, idx) in steps" :key="step.status">
          <div class="status-history-item">
            <span class="status-dot" :class="{ active: idx <= currentStep }"></span>
            <span class="status-label" :class="{ active: idx <= currentStep }">{{
              step.label
            }}</span>
          </div>
          <div
            v-if="idx < steps.length - 1"
            class="status-history-line"
            :class="{ active: idx < currentStep }"
          ></div>
        </template>
      </div>
    </div>

    <!-- Lịch sử thanh toán -->
    <div>
      <h6 class="fw-bold text-center mb-3">LỊCH SỬ THANH TOÁN</h6>
      <table class="table table-bordered text-center">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Phương Thức</th>
            <th>Số Tiền</th>
            <th>Thời Gian</th>
            <th>Nhân Viên Xác Nhận</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pay, index) in invoice.payments" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ pay.method }}</td>
            <td>{{ formatCurrency(pay.amount) }}</td>
            <td>{{ pay.time }}</td>
            <td>{{ pay.staff }}</td>
          </tr>
        </tbody>
      </table>
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

const invoice = computed(() => invoiceStore.getInvoiceByCode(code))
const currentStep = computed(() => steps.findIndex((s) => s.status === invoice.value?.status))

const getStatusLabel = (status) => {
  const step = steps.find((s) => s.status === status)
  return step ? step.label : 'Không xác định'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
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

const viewHistory = () => {
  alert('Chuyển sang trang lịch sử hóa đơn')
}

// Thêm hàm trả về class màu nhạt cho badge trạng thái
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-pending' // xanh lá nhạt
    case 'processing':
      return 'badge-processing' // vàng nhạt
    case 'confirmed':
      return 'badge-confirmed' // xanh cyan nhạt
    case 'delivering':
      return 'badge-delivering' // xanh dương nhạt
    case 'shipping':
      return 'badge-shipping' // xanh dương nhạt
    case 'delivered':
      return 'badge-delivered' // xanh lá nhạt
    case 'done':
      return 'badge-done' // xám nhạt
    default:
      return 'badge-secondary'
  }
}

// Định dạng ngày giờ cho box mới
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return (
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    ' ' +
    d.toLocaleDateString('vi-VN')
  )
}
</script>

<style scoped>
.invoice-detail {
  max-width: 100%;
  margin: 0 auto 0 auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  padding: 16px 8px 16px 8px;
}

/* Chỉnh sửa phần breadcrumb-title */
.invoice-detail .breadcrumb-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 32px;
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 0;
  color: #1976d2 !important;
  font-style: normal;
}
.invoice-detail .breadcrumb-title .main-title,
.invoice-detail .breadcrumb-title .sub-title,
.invoice-detail .breadcrumb-title .divider {
  color: #1976d2 !important;
  font-weight: 800;
  font-size: 2.2rem;
  line-height: 1.1;
  font-style: normal;
}
.steps-wrapper {
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 0.5rem;
}
.step-line {
  width: 30px;
  height: 3px;
  background-color: #0d6efd;
  margin: 0 10px;
  border-radius: 2px;
}
.btn-outline-purple {
  color: purple;
  border: 1px solid purple;
}
.btn-outline-purple:hover {
  background-color: purple;
  color: white;
}
.btn {
  border-radius: 999px !important;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}
.btn-success:hover {
  background: #198754;
  color: #fff;
}
.btn-primary:hover {
  background: #0d6efd;
  color: #fff;
}
.table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
}
.table th,
.table td {
  vertical-align: middle;
}
.table-bordered {
  border-radius: 12px;
  overflow: hidden;
}
.timeline-status {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 400px;
}
.timeline-status li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  position: relative;
}
.timeline-status .dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #dee2e6;
  margin-right: 12px;
  border: 2px solid #bdbdbd;
  transition:
    background 0.2s,
    border 0.2s;
}
.timeline-status li.active .dot {
  background: #0d6efd;
  border-color: #0d6efd;
}
.timeline-status .label {
  font-weight: 500;
  color: #333;
}
.timeline-status li.active .label {
  color: #0d6efd;
}
.steps-horizontal {
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}
.stepper-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-left: 8px;
  padding-right: 8px;
}
.stepper-flex {
  gap: 12px;
  min-width: max-content;
  padding-bottom: 8px;
}
.stepper-step-group {
  display: flex;
  align-items: center;
}
.step-btn.step-btn-modern {
  border-radius: 999px !important;
  font-weight: 700;
  padding: 0.35rem 1.3rem;
  font-size: 0.97rem;
  pointer-events: none;
  min-width: 80px;
  text-align: center;
  box-shadow: none;
  border: none;
  background: #e9ecef;
  color: #bdbdbd;
  transition:
    background 0.2s,
    color 0.2s;
  white-space: pre-line;
}
.step-btn.step-btn-modern.step-done {
  background: #19965a;
  color: #fff;
}
.step-btn.step-btn-modern.step-active {
  background: #1680fa;
  color: #fff;
}
.step-btn.step-btn-modern.step-inactive {
  background: #f5f5f5;
  color: #bdbdbd;
}
.stepper-step-group .step-line-modern {
  width: 36px;
  height: 4px;
  background: #e0e0e0;
  margin: 0 8px;
  border-radius: 2px;
  transition: background 0.2s;
  display: inline-block;
}
.stepper-step-group .step-line-modern.active {
  background: #19965a;
}
.step-line-large {
  width: 80px;
  height: 5px;
}
.status-history-horizontal {
  margin: 32px 0 16px 0;
}
.status-history-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 0;
}
.status-history-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}
.status-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ccc;
  margin-bottom: 6px;
  transition: background 0.2s;
  display: inline-block;
}
.status-dot.active {
  background: #0d6efd;
}
.status-label {
  color: #222;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  transition: color 0.2s;
  margin-top: 0;
  line-height: 1.2;
}
.status-label.active {
  color: #0d6efd;
}
.status-history-line {
  width: 60px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
  margin: 9px 4px 0 4px;
  transition: background 0.2s;
  align-self: flex-start;
}
.status-history-line.active {
  background: #0d6efd;
}
.status-badge {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.5em 1.4em;
  border-radius: 999px;
  border: none;
}
.badge-pending {
  background: #e6f4ea;
  color: #19965a;
}
.badge-processing {
  background: #fff7d6;
  color: #f7b500;
}
.badge-confirmed {
  background: #d6f6ff;
  color: #00bcd4;
}
.badge-delivering {
  background: #e3f0ff;
  color: #1680fa;
}
.badge-shipping {
  background: #e3f0ff;
  color: #1680fa;
}
.badge-delivered {
  background: #e6f4ea;
  color: #19965a;
}
.badge-done {
  background: #f2f2f2;
  color: #bdbdbd;
}
.info-row {
  display: flex;
  gap: 32px;
  width: 100%;
  align-items: stretch;
}
.info-box {
  flex: 1 1 0;
  min-width: 0;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0 0 18px 0;
  font-size: 0.97rem;
  display: flex;
  flex-direction: column;
  border: 1.5px solid #f0f0f0;
}
.info-title {
  font-weight: 700;
  font-size: 1.08rem;
  background: #f4f6fa;
  border-radius: 18px 18px 0 0;
  padding: 16px 24px 12px 24px;
  color: #222;
  letter-spacing: 0.2px;
  display: flex;
  align-items: center;
  border-bottom: 1.5px solid #e0e0e0;
  margin-bottom: 8px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  font-size: 0.97rem;
  border-bottom: 1px solid #f3f3f3;
}
.info-item:last-child {
  border-bottom: none;
}
.info-item span:first-child {
  color: #555;
  min-width: 120px;
  font-weight: 500;
  text-align: left;
}
.info-value {
  color: #222;
  font-weight: 600;
  text-align: right;
  min-width: 120px;
  word-break: break-all;
}
.info-value .badge {
  font-size: 0.92rem;
  padding: 4px 14px;
  border-radius: 999px;
  font-weight: 600;
}
.info-value .text-primary {
  color: #00bfae !important;
  font-weight: 700;
  letter-spacing: 1px;
}
.steps-horizontal .btn,
.steps-horizontal .btn-sm {
  font-size: 0.93rem;
  padding: 0.22rem 0.9rem;
}
@media (max-width: 900px) {
  .info-box {
    flex-direction: column;
    border-radius: 18px;
  }
  .info-half {
    border-right: none;
    border-bottom: 1.5px solid #f0f0f0;
    border-radius: 0;
    padding-bottom: 0;
  }
  .info-half:last-child {
    border-bottom: none;
  }
}
@media (max-width: 600px) {
  .info-title {
    font-size: 1rem;
    padding: 12px 10px 8px 10px;
  }
  .info-item {
    padding: 8px 10px;
  }
  .invoice-detail .breadcrumb-title {
    font-size: 1.2rem;
    gap: 4px;
  }
  .invoice-detail .breadcrumb-title .main-title,
  .invoice-detail .breadcrumb-title .sub-title,
  .invoice-detail .breadcrumb-title .divider {
    font-size: 1.2rem;
  }
}
.status-history-horizontal h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 0;
}
</style>
