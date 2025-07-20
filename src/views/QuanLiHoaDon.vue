<template>
  <div class="invoice-management">
    <!-- Header -->
    <div class="header d-flex justify-content-between align-items-center mb-3">
      <h2 class="fw-bold text-primary">Quản lý đơn hàng</h2>
    </div>

    <!-- Filter -->
    <div class="filter-section mb-3 p-3 bg-light rounded">
      <div class="row g-2 align-items-center">
        <div class="col-12 position-relative">
          <i
            class="bi bi-search position-absolute"
            style="top: 50%; left: 16px; transform: translateY(-50%); color: #888"
          ></i>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control rounded-pill ps-5"
            placeholder="Nhập mã hóa đơn hoặc tên, SĐT người nhận"
          />
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
            <button class="btn btn-primary btn-sm rounded-pill" @click="createInvoice">
              <i class="bi bi-plus-lg me-1"></i> Tạo hóa đơn
            </button>
            <button class="btn btn-success btn-sm rounded-pill" @click="exportExcel">
              <i class="bi bi-file-earmark-excel me-1"></i> Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="status-counts mb-3">
      <span
        class="status-tab"
        :class="{ 'bg-primary text-white': activeStatusTab === '' }"
        @click="activeStatusTab = ''"
        v-if="statusCounts.total"
      >
        TẤT CẢ
        <span class="badge-count text-danger">{{ statusCounts.total }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-warning text-dark': activeStatusTab === 'processing' }"
        @click="activeStatusTab = 'processing'"
        v-if="statusCounts.processing"
      >
        CHỜ XÁC NHẬN
        <span class="badge-count text-danger">{{ statusCounts.processing }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-info text-white': activeStatusTab === 'confirmed' }"
        @click="activeStatusTab = 'confirmed'"
        v-if="statusCounts.confirmed"
      >
        ĐÃ XÁC NHẬN
        <span class="badge-count text-danger">{{ statusCounts.confirmed }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-primary text-white': activeStatusTab === 'delivering' }"
        @click="activeStatusTab = 'delivering'"
        v-if="statusCounts.delivering"
      >
        CHỜ GIAO HÀNG
        <span class="badge-count text-danger">{{ statusCounts.delivering }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-primary text-white': activeStatusTab === 'shipping' }"
        @click="activeStatusTab = 'shipping'"
        v-if="statusCounts.shipping"
      >
        ĐANG VẬN CHUYỂN
        <span class="badge-count text-danger">{{ statusCounts.shipping }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-success text-white': activeStatusTab === 'delivered' }"
        @click="activeStatusTab = 'delivered'"
        v-if="statusCounts.delivered"
      >
        HOÀN THÀNH
        <span class="badge-count text-danger">{{ statusCounts.delivered }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ 'bg-dark text-white': activeStatusTab === 'done' }"
        @click="activeStatusTab = 'done'"
        v-if="statusCounts.done"
      >
        HOÀN TẤT
        <span class="badge-count text-danger">{{ statusCounts.done }}</span>
      </span>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr class="table-header">
            <th>#</th>
            <th>Mã</th>
            <th>Khách hàng</th>
            <th>Loại hóa đơn</th>
            <th>Người tạo</th>
            <th>Mã nhân viên</th>
            <!-- Thêm cột mới -->
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Số tiền thanh toán</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in filteredInvoices" :key="invoice.id">
            <td>{{ index + 1 }}</td>
            <td>{{ invoice.code }}</td>
            <td class="customer-col">
              <div class="customer-name" style="font-weight: normal">
                {{ invoice.customer.name.split(' - ')[0] }}
              </div>
              <div class="customer-phone">
                {{
                  invoice.customer.name.includes(' - ')
                    ? invoice.customer.name.split(' - ')[1]
                    : invoice.customer.phone
                }}
              </div>
            </td>
            <td>
              <span class="badge" :class="getTypeClass(invoice.type)">{{ invoice.type }}</span>
            </td>
            <td class="createdby-col">{{ invoice.createdBy }}</td>
            <td class="staffcode-col">{{ invoice.staffCode || `NV00${index + 1}` }}</td>
            <!-- Hiển thị mã nhân viên, nếu chưa có thì tạm mã giả -->
            <!-- Hiển thị mã nhân viên -->
            <td class="createdat-col">{{ formatDate(invoice.createdAt) }}</td>
            <td>
              <span :class="`badge ${getStatusClass(invoice.status)}`">{{
                getStatusLabel(invoice.status)
              }}</span>
            </td>
            <td>{{ formatCurrency(invoice.total) }}</td>
            <td class="action-col">
              <button
                class="btn btn-outline-primary btn-sm rounded-circle me-1"
                @click="openDetail(invoice)"
              >
                <i class="bi bi-eye"></i>
              </button>
              <button
                class="btn btn-outline-success btn-sm rounded-circle"
                @click="printInvoice(invoice)"
              >
                <i class="bi bi-printer"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoiceStore'

const router = useRouter()
const invoiceStore = useInvoiceStore()

const searchQuery = ref('')
const typeFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeStatusTab = ref('')

// Xóa các biến, computed, watch liên quan đến priceRange, minInvoicePrice, maxInvoicePrice, resetFilter

const statusCounts = computed(() => {
  return invoiceStore.invoices.reduce((acc, invoice) => {
    acc.total = (acc.total || 0) + 1
    acc[invoice.status] = (acc[invoice.status] || 0) + 1
    return acc
  }, {})
})

const filteredInvoices = computed(() => {
  return invoiceStore.invoices.filter((invoice) => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch =
      !query ||
      invoice.code.toLowerCase().includes(query) ||
      invoice.customer.name.toLowerCase().includes(query)
    const matchesType = !typeFilter.value || invoice.type === typeFilter.value
    const matchesDateFrom =
      !dateFrom.value ||
      new Date(invoice.createdAt).setHours(0, 0, 0, 0) >=
        new Date(dateFrom.value).setHours(0, 0, 0, 0)
    const matchesDateTo =
      !dateTo.value ||
      new Date(invoice.createdAt).setHours(0, 0, 0, 0) <=
        new Date(dateTo.value).setHours(0, 0, 0, 0)
    const matchesTab = !activeStatusTab.value || invoice.status === activeStatusTab.value
    // Xóa các điều kiện liên quan đến priceRange
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo && matchesTab
  })
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
const getStatusClass = (status) =>
  status === 'pending'
    ? 'bg-danger text-white'
    : status === 'processing'
      ? 'bg-warning text-dark'
      : status === 'confirmed'
        ? 'bg-info text-white'
        : status === 'delivering'
          ? 'bg-primary text-white'
          : status === 'shipping'
            ? 'bg-primary text-white'
            : status === 'delivered'
              ? 'bg-success text-white'
              : status === 'done'
                ? 'bg-dark text-white'
                : 'bg-secondary text-white'
const getStatusLabel = (status) =>
  status === 'pending'
    ? 'Chờ thêm sản phẩm'
    : status === 'processing'
      ? 'Chờ xác nhận'
      : status === 'confirmed'
        ? 'Đã xác nhận'
        : status === 'delivering'
          ? 'Chờ giao hàng'
          : status === 'shipping'
            ? 'Đang vận chuyển'
            : status === 'delivered'
              ? 'Hoàn thành'
              : status === 'done'
                ? 'Hoàn tất'
                : 'Không rõ'
const getTypeClass = (type) =>
  type === 'Online'
    ? 'bg-info text-white'
    : type === 'Tại quầy'
      ? 'bg-warning text-dark'
      : 'bg-secondary'

const openDetail = (invoice) => {
  router.push(`/quan-li-hoa-don/chi-tiet/${invoice.code}`)
}

const printInvoice = (invoice) => alert(`In hóa đơn: ${invoice.code}`)

// Xóa hàm resetFilter
</script>

<style scoped>
.invoice-management {
  background: #fff;
  border-radius: 18px;
  padding: 24px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.header h2 {
  font-size: 2.2rem;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 0;
}
.filter-section {
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}
.filter-section .form-control,
.filter-section .form-select {
  border-radius: 999px !important;
  padding-left: 1.5rem;
  font-size: 1rem;
}
.filter-section label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1976d2;
}
.status-counts {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.status-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 22px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1rem;
  background: #f1f5f9;
  color: #1976d2;
  cursor: pointer;
  transition: all 0.18s;
  border: 2px solid transparent;
  position: relative;
  min-width: 120px;
  max-width: 200px;
  white-space: nowrap;
}
.status-tab.bg-primary {
  background: #1976d2 !important;
  color: #fff !important;
}
.status-tab.bg-warning {
  background: #ffe082 !important;
  color: #333 !important;
}
.status-tab.bg-info {
  background: #4fc3f7 !important;
  color: #fff !important;
}
.status-tab.bg-success {
  background: #43a047 !important;
  color: #fff !important;
}
.status-tab.bg-dark {
  background: #333 !important;
  color: #fff !important;
}
.status-tab .badge-count {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #1976d2;
  color: #fff !important;
  font-size: 0.85rem;
  border-radius: 50%;
  padding: 2px 7px;
  font-weight: 700;
  min-width: 22px;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(25, 118, 210, 0.12);
  z-index: 2;
}
.table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
  border-collapse: separate;
  border-spacing: 0;
  min-width: unset;
  width: 100%;
  table-layout: auto;
}
.table th,
.table td {
  vertical-align: middle !important;
  text-align: center;
  font-size: 0.97rem;
  padding: 10px 6px;
  border-bottom: 1.5px solid #f0f0f0;
  white-space: nowrap;
}
.table th {
  background: #f1f5f9;
  color: #1976d2;
  font-weight: 700;
  font-size: 1.04rem;
  border-top: none;
  padding-top: 14px;
  padding-bottom: 14px;
}
.table td.customer-col,
.table td.createdby-col,
.table td.createdat-col {
  font-size: 0.97rem;
  white-space: nowrap;
}
/* Căn giữa và cho số điện thoại xuống dòng ở cột khách hàng */
.table td.customer-col {
  text-align: center;
  white-space: normal;
  line-height: 1.3;
  font-size: 0.97rem;
  padding: 10px 4px;
}
.customer-name {
  font-weight: normal;
  display: block;
}
.customer-phone {
  color: #1976d2;
  font-size: 0.93rem;
  display: block;
  margin-top: 2px;
}
/* Table responsive vừa màn hình, không cần thanh cuộn ngang */
.table-responsive {
  overflow-x: auto;
  width: 100%;
  max-width: 100vw;
}
.badge {
  border-radius: 999px;
  font-size: 0.93rem;
  font-weight: 600;
  padding: 5px 10px;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}
.badge-success {
  background: #43a047 !important;
  color: #fff !important;
}
.badge-warning {
  background: #ffe082 !important;
  color: #333 !important;
}
.badge-info {
  background: #4fc3f7 !important;
  color: #fff !important;
}
.badge-primary {
  background: #1976d2 !important;
  color: #fff !important;
}
.badge-dark {
  background: #333 !important;
  color: #fff !important;
}
.badge-blue {
  background: #1976d2 !important;
  color: #fff !important;
}
.badge-lightblue {
  background: #2196f3 !important;
  color: #fff !important;
}
.action-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.action-col button {
  border-radius: 50% !important;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-right: 0;
  padding: 0;
}
.btn-primary,
.btn-success {
  border-radius: 999px !important;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 7px 18px;
}
.btn-primary {
  background: #1976d2;
  border: none;
}
.btn-success {
  background: #43a047;
  border: none;
}
@media (max-width: 900px) {
  .filter-section .row > div {
    width: 100% !important;
  }
  .status-counts {
    flex-wrap: wrap;
  }
  .table th,
  .table td {
    font-size: 0.91rem;
    padding: 7px 1px;
  }
  .badge {
    font-size: 0.87rem;
    min-width: 44px;
  }
}
</style>
