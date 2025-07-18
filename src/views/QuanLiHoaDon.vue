<template>
    <div class="invoice-management">
        <!-- Header with improved design -->
        <div class="header d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
            <div>
                <h2 class="fw-bold text-primary mb-0">
                    <i class="bi bi-receipt me-2"></i>Quản lý Hóa đơn
                </h2>
                <p class="text-muted small mb-0">Quản lý và theo dõi tất cả hóa đơn của cửa hàng</p>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-primary rounded-pill px-3" @click="createInvoice">
                    <i class="bi bi-plus-lg me-2"></i>Tạo hóa đơn
                </button>
                <div class="dropdown">
                    <button class="btn btn-outline-secondary rounded-pill px-3 dropdown-toggle" type="button"
                        id="exportDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-download me-2"></i>Xuất file
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="exportDropdown">
                        <li><a class="dropdown-item" href="#" @click="exportExcel"><i
                                    class="bi bi-file-earmark-excel me-2"></i>Excel</a></li>
                        <li><a class="dropdown-item" href="#" @click="exportPDF"><i
                                    class="bi bi-file-earmark-pdf me-2"></i>PDF</a></li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li><a class="dropdown-item" href="#" @click="printAll"><i class="bi bi-printer me-2"></i>In tất
                                cả</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Enhanced Filter Section -->
        <div class="filter-section mb-4 p-3 bg-white rounded shadow-sm">
            <div class="row g-3 align-items-end">
                <!-- Search with autocomplete -->
                <div class="col-md-5 position-relative">
                    <label class="form-label small text-muted mb-1">Tìm kiếm hóa đơn</label>
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i class="bi bi-search"></i>
                        </span>
                        <input v-model="searchQuery" type="text" class="form-control border-start-0 rounded-end-pill"
                            placeholder="Mã hóa đơn, tên KH, SĐT..." @input="handleSearchInput">
                        <button v-if="searchQuery"
                            class="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y me-2"
                            @click="searchQuery = ''" style="z-index: 5">
                            <i class="bi bi-x-lg text-muted"></i>
                        </button>
                    </div>
                    <div v-if="searchSuggestions.length > 0" class="autocomplete-suggestions shadow-sm">
                        <div v-for="suggestion in searchSuggestions" :key="suggestion.id" class="suggestion-item"
                            @click="selectSuggestion(suggestion)">
                            <div class="fw-bold">{{ suggestion.code }}</div>
                            <div class="small text-muted">{{ suggestion.customer.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- Date Range Picker -->
                <div class="col-md-4">
                    <label class="form-label small text-muted mb-1">Khoảng thời gian</label>
                    <div class="input-daterange input-group" id="datepicker">
                        <input v-model="dateFrom" type="date" class="form-control rounded-start-pill"
                            placeholder="Từ ngày">
                        <span class="input-group-text bg-transparent">đến</span>
                        <input v-model="dateTo" type="date" class="form-control rounded-end-pill"
                            placeholder="Đến ngày">
                    </div>
                </div>

                <!-- Status Filter -->
                <div class="col-md-3">
                    <label class="form-label small text-muted mb-1">Trạng thái</label>
                    <select v-model="statusFilter" class="form-select rounded-pill">
                        <option value="">Tất cả trạng thái</option>
                        <option v-for="status in statusOptions" :value="status.value">
                            {{ status.label }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Status Tabs with better visualization -->
        <div class="status-tabs mb-4">
            <div class="d-flex flex-wrap gap-2">
                <button class="status-tab" :class="{ 'active': activeStatusTab === 'all' }"
                    @click="setStatusTab('all')">
                    <span class="tab-label">Tất cả</span>
                    <span class="badge bg-primary-subtle text-primary ms-2">{{ statusCounts.total || 0 }}</span>
                </button>

                <button v-for="status in statusOptions" :key="status.value" class="status-tab"
                    :class="[`status-${status.value}`, { 'active': activeStatusTab === status.value }]"
                    @click="setStatusTab(status.value)">
                    <span class="tab-label">{{ status.label }}</span>
                    <span class="badge bg-white text-dark ms-2">{{ statusCounts[status.value] || 0 }}</span>
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card summary-card border-start border-primary border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-2">Tổng hóa đơn</h6>
                                <h4 class="mb-0">{{ statusCounts.total || 0 }}</h4>
                            </div>
                            <div class="bg-primary bg-opacity-10 p-3 rounded">
                                <i class="bi bi-receipt text-primary fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card summary-card border-start border-success border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-2">Tổng doanh thu</h6>
                                <h4 class="mb-0">{{ formatCurrency(totalRevenue) }}</h4>
                            </div>
                            <div class="bg-success bg-opacity-10 p-3 rounded">
                                <i class="bi bi-currency-dollar text-success fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card summary-card border-start border-warning border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-2">Chờ xử lý</h6>
                                <h4 class="mb-0">{{ (statusCounts.pending || 0) + (statusCounts.processing || 0) }}</h4>
                            </div>
                            <div class="bg-warning bg-opacity-10 p-3 rounded">
                                <i class="bi bi-clock text-warning fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card summary-card border-start border-danger border-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-muted mb-2">Đã hủy</h6>
                                <h4 class="mb-0">{{ statusCounts.cancelled || 0 }}</h4>
                            </div>
                            <div class="bg-danger bg-opacity-10 p-3 rounded">
                                <i class="bi bi-x-circle text-danger fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Table with more features -->
        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th width="50" class="text-center">
                                    <input type="checkbox" class="form-check-input" v-model="selectAll"
                                        @change="toggleSelectAll">
                                </th>
                                <th width="80">Mã HD</th>
                                <th>Khách hàng</th>
                                <th width="120">Loại HD</th>
                                <th width="150">Ngày tạo</th>
                                <th width="150">Trạng thái</th>
                                <th width="150" class="text-end">Tổng tiền</th>
                                <th width="120" class="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(invoice, index) in paginatedInvoices" :key="invoice.id"
                                :class="{ 'table-active': selectedInvoices.includes(invoice.id) }">
                                <td class="text-center">
                                    <input type="checkbox" class="form-check-input" v-model="selectedInvoices"
                                        :value="invoice.id">
                                </td>
                                <td>
                                    <span class="badge bg-primary bg-opacity-10 text-primary">{{ invoice.code }}</span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar avatar-sm me-3">
                                            <span class="avatar-text bg-info text-white">
                                                {{ getInitials(invoice.customer.name) }}
                                            </span>
                                        </div>
                                        <div>
                                            <div class="fw-bold">{{ getCustomerName(invoice.customer.name) }}</div>
                                            <div class="small text-muted">{{ getCustomerPhone(invoice.customer.name) }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="getTypeClass(invoice.type)">
                                        {{ invoice.type }}
                                    </span>
                                </td>
                                <td>
                                    <div>{{ formatDate(invoice.createdAt) }}</div>
                                    <div class="small text-muted">{{ formatTimeAgo(invoice.createdAt) }}</div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <span class="status-badge me-2" :class="getStatusClass(invoice.status)"></span>
                                        <span>{{ getStatusLabel(invoice.status) }}</span>
                                    </div>
                                </td>
                                <td class="text-end">
                                    <div class="fw-bold">{{ formatCurrency(invoice.total) }}</div>
                                    <div v-if="invoice.paymentMethod" class="small text-muted">
                                        <i class="bi" :class="getPaymentMethodIcon(invoice.paymentMethod)"></i>
                                        {{ invoice.paymentMethod }}
                                    </div>
                                </td>
                                <td class="text-center">
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu dropdown-menu-end">
                                            <li>
                                                <a class="dropdown-item" href="#" @click="openDetail(invoice)">
                                                    <i class="bi bi-eye me-2"></i>Xem chi tiết
                                                </a>
                                            </li>
                                            <li>
                                                <a class="dropdown-item" href="#" @click="printInvoice(invoice)">
                                                    <i class="bi bi-printer me-2"></i>In hóa đơn
                                                </a>
                                            </li>
                                            <li v-if="invoice.status === 'pending' || invoice.status === 'processing'">
                                                <a class="dropdown-item" href="#" @click="confirmInvoice(invoice)">
                                                    <i class="bi bi-check-circle me-2"></i>Xác nhận
                                                </a>
                                            </li>
                                            <li v-if="invoice.status !== 'cancelled' && invoice.status !== 'delivered'">
                                                <a class="dropdown-item text-danger" href="#"
                                                    @click="cancelInvoice(invoice)">
                                                    <i class="bi bi-x-circle me-2"></i>Hủy đơn
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredInvoices.length === 0">
                                <td colspan="8" class="text-center py-4">
                                    <div class="empty-state">
                                        <i class="bi bi-receipt text-muted fs-1"></i>
                                        <h5 class="mt-3">Không tìm thấy hóa đơn nào</h5>
                                        <p class="text-muted">Thử thay đổi điều kiện tìm kiếm hoặc tạo hóa đơn mới</p>
                                        <button class="btn btn-primary mt-2" @click="createInvoice">
                                            <i class="bi bi-plus-lg me-2"></i>Tạo hóa đơn
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Table Footer with Pagination -->
            <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                <div class="text-muted small">
                    Hiển thị <span class="fw-bold">{{ pagination.startIndex + 1 }}-{{ pagination.endIndex }}</span>
                    trong tổng số <span class="fw-bold">{{ filteredInvoices.length }}</span> hóa đơn
                </div>

                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <select v-model="pagination.itemsPerPage" class="form-select form-select-sm"
                            @change="pagination.currentPage = 1">
                            <option value="5">5 / trang</option>
                            <option value="10">10 / trang</option>
                            <option value="20">20 / trang</option>
                            <option value="50">50 / trang</option>
                        </select>
                    </div>

                    <nav aria-label="Page navigation">
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ 'disabled': pagination.currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="pagination.currentPage--">
                                    <i class="bi bi-chevron-left"></i>
                                </a>
                            </li>

                            <li v-for="page in pagination.totalPages" class="page-item"
                                :class="{ 'active': page === pagination.currentPage }">
                                <a class="page-link" href="#" @click.prevent="pagination.currentPage = page">
                                    {{ page }}
                                </a>
                            </li>

                            <li class="page-item"
                                :class="{ 'disabled': pagination.currentPage === pagination.totalPages }">
                                <a class="page-link" href="#" @click.prevent="pagination.currentPage++">
                                    <i class="bi bi-chevron-right"></i>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div v-if="selectedInvoices.length > 0" class="quick-actions fixed-bottom bg-white shadow-lg p-3">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold">
                        Đã chọn <span class="text-primary">{{ selectedInvoices.length }}</span> hóa đơn
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary btn-sm" @click="printSelected">
                            <i class="bi bi-printer me-2"></i>In hàng loạt
                        </button>
                        <button class="btn btn-outline-success btn-sm" @click="exportSelected">
                            <i class="bi bi-file-earmark-excel me-2"></i>Xuất Excel
                        </button>
                        <button class="btn btn-danger btn-sm" @click="cancelSelected">
                            <i class="bi bi-x-circle me-2"></i>Hủy đơn hàng loạt
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Invoice Detail Modal -->
        <div class="modal fade" id="invoiceDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Chi tiết hóa đơn #{{ selectedInvoice?.code }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="selectedInvoice" class="invoice-detail">
                            <!-- Invoice detail content here -->
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <h6 class="text-muted">Thông tin khách hàng</h6>
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="avatar avatar-lg me-3">
                                            <span class="avatar-text bg-info text-white">
                                                {{ getInitials(selectedInvoice.customer.name) }}
                                            </span>
                                        </div>
                                        <div>
                                            <h5 class="mb-0">{{ getCustomerName(selectedInvoice.customer.name) }}</h5>
                                            <div class="text-muted">{{ getCustomerPhone(selectedInvoice.customer.name)
                                            }}</div>
                                        </div>
                                    </div>
                                    <div class="ps-5">
                                        <div><i class="bi bi-geo-alt me-2"></i> Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
                                        </div>
                                        <div><i class="bi bi-envelope me-2"></i> Email: customer@example.com</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-muted">Thông tin hóa đơn</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td class="text-muted">Mã hóa đơn:</td>
                                                    <td class="fw-bold">{{ selectedInvoice.code }}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted">Ngày tạo:</td>
                                                    <td>{{ formatDate(selectedInvoice.createdAt) }}</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted">Trạng thái:</td>
                                                    <td>
                                                        <span class="badge"
                                                            :class="getStatusClass(selectedInvoice.status)">
                                                            {{ getStatusLabel(selectedInvoice.status) }}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted">Loại hóa đơn:</td>
                                                    <td>
                                                        <span class="badge" :class="getTypeClass(selectedInvoice.type)">
                                                            {{ selectedInvoice.type }}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="text-muted">Phương thức TT:</td>
                                                    <td>
                                                        <i class="bi me-2"
                                                            :class="getPaymentMethodIcon(selectedInvoice.paymentMethod || 'Tiền mặt')"></i>
                                                        {{ selectedInvoice.paymentMethod || 'Tiền mặt' }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <h6 class="text-muted mb-3">Sản phẩm đã mua</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Sản phẩm</th>
                                                <th class="text-end">Đơn giá</th>
                                                <th class="text-center">SL</th>
                                                <th class="text-end">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, index) in selectedInvoice.items || sampleItems"
                                                :key="index">
                                                <td>{{ index + 1 }}</td>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <img :src="item.image || 'https://via.placeholder.com/40'"
                                                            class="rounded me-2" width="40" height="40">
                                                        <div>
                                                            <div class="fw-bold">{{ item.name }}</div>
                                                            <div class="small text-muted">SKU: {{ item.sku || 'N/A' }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="text-end">{{ formatCurrency(item.price) }}</td>
                                                <td class="text-center">{{ item.quantity }}</td>
                                                <td class="text-end fw-bold">{{ formatCurrency(item.price *
                                                    item.quantity) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h6 class="text-muted mb-3">Ghi chú</h6>
                                            <p>{{ selectedInvoice.note || 'Không có ghi chú' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Tạm tính:</span>
                                                <span>{{ formatCurrency(selectedInvoice.subtotal ||
                                                    selectedInvoice.total) }}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Giảm giá:</span>
                                                <span class="text-danger">-{{ formatCurrency(selectedInvoice.discount ||
                                                    0) }}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Phí vận chuyển:</span>
                                                <span>+{{ formatCurrency(selectedInvoice.shippingFee || 0) }}</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Thuế (VAT 10%):</span>
                                                <span>+{{ formatCurrency(selectedInvoice.tax || 0) }}</span>
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-between fw-bold fs-5">
                                                <span>Tổng cộng:</span>
                                                <span class="text-primary">{{ formatCurrency(selectedInvoice.total)
                                                }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-primary" @click="printInvoice(selectedInvoice)">
                            <i class="bi bi-printer me-2"></i>In hóa đơn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'

// Sample data with more fields
const invoices = ref([
    {
        id: 1,
        code: 'HD0582',
        customer: { name: 'Lý Tiến Duy - 0961866385' },
        type: 'Tại quầy',
        createdAt: '2025-07-12T15:35:00',
        updatedAt: '2025-07-12T15:35:00',
        subtotal: 550000,
        discount: 0,
        shippingFee: 0,
        tax: 55000,
        total: 605000,
        status: 'delivered',
        paymentMethod: 'Chuyển khoản',
        note: 'Giao hàng trước 17h',
        items: [
            { id: 1, sku: 'SP001', name: 'iPhone 13 Pro Max', price: 25000000, quantity: 1, image: 'https://via.placeholder.com/40' },
            { id: 2, sku: 'SP002', name: 'AirPods Pro', price: 5000000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    },
    {
        id: 2,
        code: 'HD1760',
        customer: { name: 'Khách vãng lai' },
        type: 'Tại quầy',
        createdAt: '2025-07-15T10:36:00',
        updatedAt: '2025-07-15T10:36:00',
        subtotal: 454545,
        discount: 0,
        shippingFee: 0,
        tax: 45454.5,
        total: 499999.5,
        status: 'pending',
        paymentMethod: 'Tiền mặt',
        items: [
            { id: 3, sku: 'SP003', name: 'MacBook Air M1', price: 22000000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    },
    {
        id: 3,
        code: 'HD1579',
        customer: { name: 'Lý Tiến Duy - 0961866385' },
        type: 'Online',
        createdAt: '2025-07-12T10:41:00',
        updatedAt: '2025-07-12T10:41:00',
        subtotal: 467273,
        discount: 10000,
        shippingFee: 20000,
        tax: 46727.3,
        total: 514000,
        status: 'delivering',
        paymentMethod: 'Momo',
        note: 'Đóng gói cẩn thận',
        items: [
            { id: 4, sku: 'SP004', name: 'iPad Pro 11"', price: 18000000, quantity: 1, image: 'https://via.placeholder.com/40' },
            { id: 5, sku: 'SP005', name: 'Apple Pencil 2', price: 2500000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    },
    {
        id: 4,
        code: 'HD6306',
        customer: { name: 'Lý Tiến Duy - 0961866385' },
        type: 'Online',
        createdAt: '2025-07-12T10:46:00',
        updatedAt: '2025-07-12T11:30:00',
        subtotal: 3000000,
        discount: 0,
        shippingFee: 0,
        tax: 300000,
        total: 3300000,
        status: 'cancelled',
        paymentMethod: 'Thẻ tín dụng',
        note: 'Khách hủy sau khi đặt',
        items: [
            { id: 6, sku: 'SP006', name: 'Apple Watch Series 7', price: 10000000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    },
    {
        id: 5,
        code: 'HD8921',
        customer: { name: 'Nguyễn Thị Hồng - 0987654321' },
        type: 'Tại quầy',
        createdAt: '2025-07-14T14:20:00',
        updatedAt: '2025-07-14T14:20:00',
        subtotal: 8181818,
        discount: 500000,
        shippingFee: 30000,
        tax: 818181.8,
        total: 8000000,
        status: 'confirmed',
        paymentMethod: 'Tiền mặt',
        items: [
            { id: 7, sku: 'SP007', name: 'iMac 24"', price: 30000000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    },
    {
        id: 6,
        code: 'HD3452',
        customer: { name: 'Trần Văn Nam - 0912345678' },
        type: 'Online',
        createdAt: '2025-07-15T09:15:00',
        updatedAt: '2025-07-15T09:15:00',
        subtotal: 18181818,
        discount: 0,
        shippingFee: 0,
        tax: 1818181.8,
        total: 20000000,
        status: 'processing',
        paymentMethod: 'Chuyển khoản',
        note: 'Liên hệ trước khi giao',
        items: [
            { id: 8, sku: 'SP008', name: 'MacBook Pro 16"', price: 50000000, quantity: 1, image: 'https://via.placeholder.com/40' }
        ]
    }
])

const sampleItems = [
    { id: 1, sku: 'SP001', name: 'Sản phẩm mẫu 1', price: 1000000, quantity: 2 },
    { id: 2, sku: 'SP002', name: 'Sản phẩm mẫu 2', price: 1500000, quantity: 1 }
]

// Refs
const selectedInvoice = ref(null)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const activeStatusTab = ref('all')
const selectedInvoices = ref([])
const selectAll = ref(false)
const searchSuggestions = ref([])
const invoiceDetailModal = ref(null)

// Pagination
const pagination = ref({
    currentPage: 1,
    itemsPerPage: 10,
    get totalPages() {
        return Math.ceil(filteredInvoices.value.length / this.itemsPerPage)
    },
    get startIndex() {
        return (this.currentPage - 1) * this.itemsPerPage
    },
    get endIndex() {
        return Math.min(this.startIndex + this.itemsPerPage, filteredInvoices.value.length)
    }
})

// Status options
const statusOptions = [
    { value: 'pending', label: 'Chờ thêm SP' },
    { value: 'processing', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'delivering', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' }
]

// Computed properties
const statusCounts = computed(() => {
    return invoices.value.reduce((acc, invoice) => {
        acc.total = (acc.total || 0) + 1
        acc[invoice.status] = (acc[invoice.status] || 0) + 1
        return acc
    }, {})
})

const totalRevenue = computed(() => {
    return invoices.value
        .filter(inv => inv.status === 'delivered')
        .reduce((sum, inv) => sum + inv.total, 0)
})

const filteredInvoices = computed(() => {
    let result = invoices.value

    // Apply status filter from tab
    if (activeStatusTab.value !== 'all') {
        result = result.filter(invoice => invoice.status === activeStatusTab.value)
    }

    // Apply search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(invoice =>
            invoice.code.toLowerCase().includes(query) ||
            invoice.customer.name.toLowerCase().includes(query)
        )
    }

    // Apply date range filter
    if (dateFrom.value) {
        result = result.filter(invoice => new Date(invoice.createdAt) >= new Date(dateFrom.value))
    }
    if (dateTo.value) {
        // Include whole day
        const endDate = new Date(dateTo.value)
        endDate.setHours(23, 59, 59, 999)
        result = result.filter(invoice => new Date(invoice.createdAt) <= endDate)
    }

    // Apply status filter from dropdown (overrides tab filter)
    if (statusFilter.value) {
        result = result.filter(invoice => invoice.status === statusFilter.value)
    }

    return result
})

const paginatedInvoices = computed(() => {
    return filteredInvoices.value.slice(
        pagination.value.startIndex,
        pagination.value.endIndex
    )
})

// Methods
const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(value)
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`
}

const getStatusClass = (status) => {
    const classes = {
        pending: 'bg-danger-subtle text-danger',
        processing: 'bg-warning-subtle text-warning',
        confirmed: 'bg-info-subtle text-info',
        delivering: 'bg-primary-subtle text-primary',
        delivered: 'bg-success-subtle text-success',
        cancelled: 'bg-dark-subtle text-dark'
    }
    return classes[status] || 'bg-secondary-subtle text-secondary'
}

const getTypeClass = (type) => {
    return type === 'Online'
        ? 'bg-purple-subtle text-purple'
        : 'bg-secondary-subtle text-secondary'
}

const getStatusLabel = (status) => {
    const statusMap = {
        pending: 'Chờ thêm SP',
        processing: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        delivering: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy'
    }
    return statusMap[status] || 'Không rõ'
}

const getPaymentMethodIcon = (method) => {
    const icons = {
        'Tiền mặt': 'bi-cash-coin',
        'Chuyển khoản': 'bi-bank',
        'Thẻ tín dụng': 'bi-credit-card',
        'Momo': 'bi-phone'
    }
    return icons[method] || 'bi-wallet'
}

const getInitials = (name) => {
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

const getCustomerName = (customerStr) => {
    return customerStr.split(' - ')[0] || 'Khách vãng lai'
}

const getCustomerPhone = (customerStr) => {
    const parts = customerStr.split(' - ')
    return parts.length > 1 ? parts[1] : 'Không có SĐT'
}

const handleSearchInput = () => {
    if (searchQuery.value.length > 2) {
        searchSuggestions.value = invoices.value.filter(invoice =>
            invoice.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            invoice.customer.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        ).slice(0, 5)
    } else {
        searchSuggestions.value = []
    }
}

const selectSuggestion = (invoice) => {
    searchQuery.value = invoice.code
    searchSuggestions.value = []
    openDetail(invoice)
}

const setStatusTab = (status) => {
    activeStatusTab.value = status
    statusFilter.value = status === 'all' ? '' : status
    pagination.value.currentPage = 1
}

const toggleSelectAll = () => {
    if (selectAll.value) {
        selectedInvoices.value = paginatedInvoices.value.map(invoice => invoice.id)
    } else {
        selectedInvoices.value = []
    }
}

const openDetail = (invoice) => {
    selectedInvoice.value = invoice
    invoiceDetailModal.value.show()
}

const printInvoice = (invoice) => {
    alert(`In hóa đơn: ${invoice.code}`)
}

const printSelected = () => {
    alert(`In ${selectedInvoices.value.length} hóa đơn đã chọn`)
    selectedInvoices.value = []
    selectAll.value = false
}

const exportExcel = () => {
    alert('Xuất Excel tất cả hóa đơn!')
}

const exportPDF = () => {
    alert('Xuất PDF tất cả hóa đơn!')
}

const exportSelected = () => {
    alert(`Xuất Excel ${selectedInvoices.value.length} hóa đơn đã chọn`)
    selectedInvoices.value = []
    selectAll.value = false
}

const printAll = () => {
    alert('In tất cả hóa đơn hiển thị!')
}

const createInvoice = () => {
    alert('Tạo hóa đơn mới!')
}

const confirmInvoice = (invoice) => {
    invoice.status = 'confirmed'
    alert(`Đã xác nhận hóa đơn ${invoice.code}`)
}

const cancelInvoice = (invoice) => {
    if (confirm(`Bạn có chắc muốn hủy hóa đơn ${invoice.code}?`)) {
        invoice.status = 'cancelled'
        alert(`Đã hủy hóa đơn ${invoice.code}`)
    }
}

const cancelSelected = () => {
    if (confirm(`Bạn có chắc muốn hủy ${selectedInvoices.value.length} hóa đơn đã chọn?`)) {
        invoices.value.forEach(invoice => {
            if (selectedInvoices.value.includes(invoice.id)) {
                invoice.status = 'cancelled'
            }
        })
        alert(`Đã hủy ${selectedInvoices.value.length} hóa đơn`)
        selectedInvoices.value = []
        selectAll.value = false
    }
}

// Watch for changes in filtered invoices to reset pagination
watch(filteredInvoices, () => {
    if (pagination.value.currentPage > pagination.value.totalPages) {
        pagination.value.currentPage = pagination.value.totalPages || 1
    }
})

// Initialize modal on mount
onMounted(() => {
    invoiceDetailModal.value = new Modal(document.getElementById('invoiceDetailModal'))
})
</script>

<style scoped>
.invoice-management {
    padding-bottom: 80px;
    /* Space for quick actions */
}

/* Header styles */
.header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

/* Filter section */
.filter-section {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
}

.autocomplete-suggestions {
    position: absolute;
    z-index: 1000;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    margin-top: 2px;
}

.suggestion-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #f1f1f1;
}

.suggestion-item:hover {
    background-color: #f8f9fa;
}

/* Status tabs */
.status-tabs .status-tab {
    padding: 0.5rem 1rem;
    border-radius: 50px;
    border: 1px solid #dee2e6;
    background-color: white;
    font-size: 0.875rem;
    font-weight: 500;
    color: #495057;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 0.5rem;
}

.status-tabs .status-tab:hover {
    background-color: #f8f9fa;
}

.status-tabs .status-tab.active {
    border-color: transparent;
    color: white;
}

.status-tabs .status-pending.active {
    background-color: #dc3545;
}

.status-tabs .status-processing.active {
    background-color: #ffc107;
    color: #212529;
}

.status-tabs .status-confirmed.active {
    background-color: #0dcaf0;
}

.status-tabs .status-delivering.active {
    background-color: #0d6efd;
}

.status-tabs .status-delivered.active {
    background-color: #198754;
}

.status-tabs .status-cancelled.active {
    background-color: #212529;
}

/* Summary cards */
.summary-card {
    transition: transform 0.2s;
}

.summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

/* Table styles */
.table th {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    color: #6c757d;
    border-top: 0;
}

.table td {
    vertical-align: middle;
}

.avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.avatar-text {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
}

.avatar-lg {
    width: 48px;
    height: 48px;
    font-size: 1rem;
}

.status-badge {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

/* Quick actions */
.quick-actions {
    border-top: 1px solid #e9ecef;
    z-index: 1000;
}

/* Empty state */
.empty-state {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .filter-section .col-md-4,
    .filter-section .col-md-5 {
        margin-bottom: 1rem;
    }

    .status-tabs {
        overflow-x: auto;
        white-space: nowrap;
        display: block;
        padding-bottom: 0.5rem;
    }

    .status-tab {
        display: inline-block;
        margin-right: 0.5rem;
    }
}

/* Custom colors */
.bg-purple-subtle {
    background-color: #e2d4f0;
}

.text-purple {
    color: #6f42c1;
}
</style>