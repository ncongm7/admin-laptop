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
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === '' }"
        @click="activeStatusTab = ''"
        v-if="statusCounts.total"
      >
        TẤT CẢ
        <span class="badge-count">{{ statusCounts.total }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'processing' }"
        @click="activeStatusTab = 'processing'"
        v-if="statusCounts.processing"
      >
        CHỜ XÁC NHẬN
        <span class="badge-count">{{ statusCounts.processing }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'confirmed' }"
        @click="activeStatusTab = 'confirmed'"
        v-if="statusCounts.confirmed"
      >
        ĐÃ XÁC NHẬN
        <span class="badge-count">{{ statusCounts.confirmed }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'delivering' }"
        @click="activeStatusTab = 'delivering'"
        v-if="statusCounts.delivering"
      >
        CHỜ GIAO HÀNG
        <span class="badge-count">{{ statusCounts.delivering }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'shipping' }"
        @click="activeStatusTab = 'shipping'"
        v-if="statusCounts.shipping"
      >
        ĐANG VẬN CHUYỂN
        <span class="badge-count">{{ statusCounts.shipping }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'delivered' }"
        @click="activeStatusTab = 'delivered'"
        v-if="statusCounts.delivered"
      >
        HOÀN THÀNH
        <span class="badge-count">{{ statusCounts.delivered }}</span>
      </span>
      <span
        class="status-tab"
        :class="{ active: activeStatusTab === 'done' }"
        @click="activeStatusTab = 'done'"
        v-if="statusCounts.done"
      >
        HOÀN TẤT
        <span class="badge-count">{{ statusCounts.done }}</span>
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
              <span class="badge">{{ invoice.type }}</span>
            </td>
            <td class="createdby-col">{{ invoice.createdBy }}</td>
            <td class="staffcode-col">{{ invoice.staffCode || `NV00${index + 1}` }}</td>
            <td class="createdat-col">{{ formatDate(invoice.createdAt) }}</td>
            <td>
              <span class="badge">{{ getStatusLabel(invoice.status) }}</span>
            </td>
            <td>{{ formatCurrency(invoice.total) }}</td>
            <td class="action-col">
              <button
                class="btn btn-outline-success btn-sm rounded-circle me-1"
                @click="openDetail(invoice)"
              >
                <i class="bi bi-eye"></i>
              </button>
              <button
                class="btn btn-outline-dark btn-sm rounded-circle"
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
    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo && matchesTab
  })
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const getStatusLabel = (status) =>
  ({
    pending: 'Chờ thêm sản phẩm',
    processing: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    delivering: 'Chờ giao hàng',
    shipping: 'Đang vận chuyển',
    delivered: 'Hoàn thành',
    done: 'Hoàn tất',
  })[status] || 'Không rõ'

const openDetail = (invoice) => {
  router.push(`/quan-li-hoa-don/chi-tiet/${invoice.code}`)
}

const printInvoice = (invoice) => alert(`In hóa đơn: ${invoice.code}`)

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
  background: #fff; /* Nền trắng */
  color: #16a34a; /* Chữ xanh lá */
  border: 1px solid #16a34a; /* Viền xanh lá */
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.status-tab.active {
  background: #16a34a; /* Nền xanh lá */
  color: #fff;
  border-color: #16a34a;
}
.status-tab:hover:not(.active) {
  background: #f0fdf4; /* Nền xanh lá cây rất nhạt */
}
.status-tab .badge-count {
  background: #16a34a; /* Nền xanh lá */
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
  background: #f0fdf4; /* Nền xanh lá nhạt */
  color: #16a34a; /* Chữ xanh lá */
  border-color: #a7f3d0;
  font-weight: 600;
}
.btn-dark:hover {
  background: #d1fae5;
  border-color: #6ee7b7;
}
</style>
