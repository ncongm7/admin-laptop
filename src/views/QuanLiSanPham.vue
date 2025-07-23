<template>
    <div class="sales-management">
        <!-- Header Section -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">
                        <i class="bi bi-graph-up-arrow"></i>
                        Quản lý bán hàng
                    </h1>
                    <p class="page-subtitle">Hệ thống quản lý bán hàng laptop toàn diện</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-light me-2" @click="refreshData">
                        <i class="bi bi-arrow-clockwise"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" @click="createNewOrder">
                        <i class="bi bi-plus-lg"></i>
                        Tạo đơn hàng
                    </button>
                </div>
            </div>
        </div>

        <!-- Quick Stats Dashboard -->
        <div class="stats-section">
            <div class="row g-4">
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card stats-primary">
                        <div class="stats-icon">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ formatCurrency(todayRevenue) }}</h3>
                            <p class="stats-label">Doanh thu hôm nay</p>
                            <div class="stats-trend positive">
                                <i class="bi bi-arrow-up"></i>
                                <span>+12.5%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card stats-success">
                        <div class="stats-icon">
                            <i class="bi bi-receipt"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ todayOrders }}</h3>
                            <p class="stats-label">Đơn hàng hôm nay</p>
                            <div class="stats-trend positive">
                                <i class="bi bi-arrow-up"></i>
                                <span>+8.2%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card stats-warning">
                        <div class="stats-icon">
                            <i class="bi bi-hourglass-split"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ pendingOrders }}</h3>
                            <p class="stats-label">Đơn chờ xử lý</p>
                            <div class="stats-trend neutral">
                                <i class="bi bi-dash"></i>
                                <span>0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="stats-card stats-info">
                        <div class="stats-icon">
                            <i class="bi bi-box-seam"></i>
                        </div>
                        <div class="stats-content">
                            <h3 class="stats-number">{{ totalProducts }}</h3>
                            <p class="stats-label">Sản phẩm trong kho</p>
                            <div class="stats-trend negative">
                                <i class="bi bi-arrow-down"></i>
                                <span>-3.1%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-section">
            <div class="nav-tabs-container">
                <ul class="nav nav-tabs custom-tabs">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'dashboard' }" @click="setActiveTab('dashboard')">
                            <i class="bi bi-speedometer2"></i>
                            Dashboard
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'orders' }" @click="setActiveTab('orders')">
                            <i class="bi bi-receipt-cutoff"></i>
                            Đơn hàng
                            <span class="badge bg-danger ms-1" v-if="pendingOrders > 0">{{ pendingOrders }}</span>
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'products' }" @click="setActiveTab('products')">
                            <i class="bi bi-box-seam"></i>
                            Sản phẩm
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'customers' }" @click="setActiveTab('customers')">
                            <i class="bi bi-people"></i>
                            Khách hàng
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'promotions' }" @click="setActiveTab('promotions')">
                            <i class="bi bi-percent"></i>
                            Khuyến mãi
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'reports' }" @click="setActiveTab('reports')">
                            <i class="bi bi-graph-up"></i>
                            Báo cáo
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
            <!-- Dashboard Tab -->
            <div v-if="activeTab === 'dashboard'" class="tab-content-wrapper">
                <div class="row g-4">
                    <!-- Sales Chart -->
                    <div class="col-xl-8">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="card-title">
                                    <i class="bi bi-graph-up me-2"></i>
                                    Biểu đồ doanh thu 7 ngày qua
                                </h5>
                                <div class="card-actions">
                                    <select class="form-select form-select-sm" v-model="chartPeriod">
                                        <option value="7days">7 ngày qua</option>
                                        <option value="30days">30 ngày qua</option>
                                        <option value="3months">3 tháng qua</option>
                                    </select>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="salesChart" width="400" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Products -->
                    <div class="col-xl-4">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="card-title">
                                    <i class="bi bi-trophy me-2"></i>
                                    Sản phẩm bán chạy
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="top-products-list">
                                    <div v-for="(product, index) in topProducts" :key="product.id" class="product-item">
                                        <div class="product-rank">
                                            <span class="rank-number" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                                        </div>
                                        <div class="product-info">
                                            <h6 class="product-name">{{ product.name }}</h6>
                                            <p class="product-sales">{{ product.sold }} đã bán</p>
                                        </div>
                                        <div class="product-revenue">
                                            <span class="revenue-amount">{{ formatCurrency(product.revenue) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Orders -->
                    <div class="col-12">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="card-title">
                                    <i class="bi bi-clock-history me-2"></i>
                                    Đơn hàng gần đây
                                </h5>
                                <div class="card-actions">
                                    <button class="btn btn-sm btn-outline-primary" @click="viewAllOrders">
                                        Xem tất cả
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Sản phẩm</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="order in recentOrders" :key="order.id">
                                                <td>
                                                    <span class="order-code">{{ order.code }}</span>
                                                </td>
                                                <td>
                                                    <div class="customer-info">
                                                        <span class="customer-name">{{ order.customerName }}</span>
                                                        <small class="customer-phone">{{ order.customerPhone }}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span class="product-count">{{ order.itemCount }} sản phẩm</span>
                                                </td>
                                                <td>
                                                    <span class="order-total">{{ formatCurrency(order.total) }}</span>
                                                </td>
                                                <td>
                                                    <span class="badge" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</span>
                                                </td>
                                                <td>
                                                    <span class="order-time">{{ formatTime(order.createdAt) }}</span>
                                                </td>
                                                <td>
                                                    <div class="action-buttons">
                                                        <button class="btn btn-sm btn-outline-primary" @click="viewOrder(order.id)">
                                                            <i class="bi bi-eye"></i>
                                                        </button>
                                                        <button class="btn btn-sm btn-outline-success" @click="editOrder(order.id)">
                                                            <i class="bi bi-pencil"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Orders Tab -->
            <div v-if="activeTab === 'orders'" class="tab-content-wrapper">
                <div class="content-card">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="bi bi-receipt-cutoff me-2"></i>
                            Quản lý đơn hàng
                        </h5>
                        <div class="card-actions">
                            <div class="search-box">
                                <input type="text" class="form-control" placeholder="Tìm kiếm đơn hàng..." v-model="orderSearch">
                            </div>
                            <select class="form-select" v-model="orderStatusFilter">
                                <option value="">Tất cả trạng thái</option>
                                <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
                                <option value="DANG_GIAO">Đang giao</option>
                                <option value="HOAN_THANH">Hoàn thành</option>
                                <option value="HUY">Đã hủy</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="orders-management">
                            <!-- Order filters and list will go here -->
                            <p class="text-muted">Danh sách đơn hàng sẽ được hiển thị ở đây</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Tab -->
            <div v-if="activeTab === 'products'" class="tab-content-wrapper">
                <ProductsView @close-create-modal="showCreateModal = false" />
            </div>

            <!-- Customers Tab -->
            <div v-if="activeTab === 'customers'" class="tab-content-wrapper">
                <div class="content-card">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="bi bi-people me-2"></i>
                            Quản lý khách hàng
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Danh sách khách hàng sẽ được hiển thị ở đây</p>
                    </div>
                </div>
            </div>

            <!-- Promotions Tab -->
            <div v-if="activeTab === 'promotions'" class="tab-content-wrapper">
                <div class="content-card">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="bi bi-percent me-2"></i>
                            Quản lý khuyến mãi
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Danh sách khuyến mãi sẽ được hiển thị ở đây</p>
                    </div>
                </div>
            </div>

            <!-- Reports Tab -->
            <div v-if="activeTab === 'reports'" class="tab-content-wrapper">
                <div class="content-card">
                    <div class="card-header">
                        <h5 class="card-title">
                            <i class="bi bi-graph-up me-2"></i>
                            Báo cáo bán hàng
                        </h5>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Báo cáo chi tiết sẽ được hiển thị ở đây</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductsView from './sanpham/viewsanpham/ProductsView.vue'

const router = useRouter()

// Tab management
const activeTab = ref('dashboard')

// Dashboard data
const todayRevenue = ref(125000000) // 125 triệu VND
const todayOrders = ref(24)
const pendingOrders = ref(8)
const totalProducts = ref(156)
const chartPeriod = ref('7days')

// Search and filters
const orderSearch = ref('')
const orderStatusFilter = ref('')
const showCreateModal = ref(false)

// Sample data for demonstration
const topProducts = ref([
    { id: 1, name: 'MacBook Pro M3 14"', sold: 15, revenue: 75000000 },
    { id: 2, name: 'Dell XPS 13', sold: 12, revenue: 48000000 },
    { id: 3, name: 'HP Pavilion 15', sold: 10, revenue: 30000000 },
    { id: 4, name: 'Asus ROG Strix', sold: 8, revenue: 64000000 },
    { id: 5, name: 'Lenovo ThinkPad X1', sold: 6, revenue: 42000000 }
])

const recentOrders = ref([
    {
        id: 1,
        code: 'HD001',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0901234567',
        itemCount: 2,
        total: 45000000,
        status: 'CHO_XAC_NHAN',
        createdAt: new Date()
    },
    {
        id: 2,
        code: 'HD002',
        customerName: 'Trần Thị B',
        customerPhone: '0987654321',
        itemCount: 1,
        total: 25000000,
        status: 'DANG_GIAO',
        createdAt: new Date(Date.now() - 3600000)
    },
    {
        id: 3,
        code: 'HD003',
        customerName: 'Lê Văn C',
        customerPhone: '0912345678',
        itemCount: 3,
        total: 75000000,
        status: 'HOAN_THANH',
        createdAt: new Date(Date.now() - 7200000)
    }
])

// Methods
const setActiveTab = (tab) => {
    activeTab.value = tab
}

const refreshData = () => {
    // Implement data refresh logic
    console.log('Refreshing data...')
}

const createNewOrder = () => {
    router.push('/orders/create')
}

const viewAllOrders = () => {
    setActiveTab('orders')
}

const viewOrder = (orderId) => {
    router.push(`/orders/${orderId}`)
}

const editOrder = (orderId) => {
    router.push(`/orders/${orderId}/edit`)
}

// Utility functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

const formatTime = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    }).format(date)
}

const getStatusClass = (status) => {
    const statusClasses = {
        'CHO_XAC_NHAN': 'bg-warning text-dark',
        'DANG_GIAO': 'bg-info',
        'HOAN_THANH': 'bg-success',
        'HUY': 'bg-danger'
    }
    return statusClasses[status] || 'bg-secondary'
}

const getStatusText = (status) => {
    const statusTexts = {
        'CHO_XAC_NHAN': 'Chờ xác nhận',
        'DANG_GIAO': 'Đang giao',
        'HOAN_THANH': 'Hoàn thành',
        'HUY': 'Đã hủy'
    }
    return statusTexts[status] || status
}

// Initialize chart on mount
onMounted(() => {
    // Initialize Chart.js or other charting library here
    console.log('Initializing sales chart...')
})
</script>

<style scoped>
.sales-management {
    background-color: #f8fafc;
    min-height: 100vh;
}

/* Header Section */
.page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 2rem 3rem;
    margin-bottom: -1rem;
    position: relative;
}

.page-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2rem;
    background: #f8fafc;
    border-radius: 2rem 2rem 0 0;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.page-subtitle {
    margin: 0.5rem 0 0;
    opacity: 0.9;
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.header-actions .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Stats Section */
.stats-section {
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.stats-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.stats-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.stats-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
}

.stats-card.stats-primary::before {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.stats-card.stats-success::before {
    background: linear-gradient(90deg, #10b981, #059669);
}

.stats-card.stats-warning::before {
    background: linear-gradient(90deg, #f59e0b, #d97706);
}

.stats-card.stats-info::before {
    background: linear-gradient(90deg, #06b6d4, #0891b2);
}

.stats-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.stats-primary .stats-icon {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stats-success .stats-icon {
    background: linear-gradient(135deg, #10b981, #059669);
}

.stats-warning .stats-icon {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stats-info .stats-icon {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.stats-content {
    flex: 1;
}

.stats-number {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
}

.stats-label {
    margin: 0.25rem 0 0.5rem;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
}

.stats-trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
}

.stats-trend.positive {
    color: #059669;
}

.stats-trend.negative {
    color: #dc2626;
}

.stats-trend.neutral {
    color: #64748b;
}

/* Navigation Section */
.nav-section {
    padding: 0 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.nav-tabs-container {
    background: white;
    border-radius: 1rem 1rem 0 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    padding: 0.5rem;
}

.custom-tabs {
    border: none;
    gap: 0.25rem;
}

.custom-tabs .nav-item {
    margin: 0;
}

.custom-tabs .nav-link {
    border: none;
    border-radius: 0.75rem;
    padding: 0.75rem 1.25rem;
    color: #64748b;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    background: transparent;
}

.custom-tabs .nav-link:hover {
    background: #f1f5f9;
    color: #334155;
}

.custom-tabs .nav-link.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.custom-tabs .badge {
    font-size: 0.625rem;
    padding: 0.25rem 0.5rem;
}

/* Content Section */
.content-section {
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.tab-content-wrapper {
    background: white;
    border-radius: 0 0 1rem 1rem;
    min-height: 500px;
}

.content-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.content-card .card-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 1rem 1rem 0 0;
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
}

.card-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-box {
    min-width: 250px;
}

.content-card .card-body {
    padding: 1.5rem;
}

/* Chart Container */
.chart-container {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 2px dashed #cbd5e1;
    color: #64748b;
}

/* Top Products */
.top-products-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    transition: all 0.2s ease;
}

.product-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
}

.product-rank {
    flex-shrink: 0;
}

.rank-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    color: white;
}

.rank-number.rank-1 {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.rank-number.rank-2 {
    background: linear-gradient(135deg, #9ca3af, #6b7280);
}

.rank-number.rank-3 {
    background: linear-gradient(135deg, #d97706, #92400e);
}

.rank-number:not(.rank-1):not(.rank-2):not(.rank-3) {
    background: linear-gradient(135deg, #64748b, #475569);
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
    color: #1e293b;
}

.product-sales {
    font-size: 0.75rem;
    color: #64748b;
    margin: 0.25rem 0 0;
}

.revenue-amount {
    font-size: 0.875rem;
    font-weight: 600;
    color: #059669;
}

/* Table Styles */
.table {
    margin: 0;
}

.table th {
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0;
    padding: 1rem 0.75rem;
}

.table td {
    padding: 1rem 0.75rem;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
}

.order-code {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #3b82f6;
}

.customer-info {
    display: flex;
    flex-direction: column;
}

.customer-name {
    font-weight: 500;
    color: #1e293b;
}

.customer-phone {
    color: #64748b;
    font-size: 0.75rem;
}

.order-total {
    font-weight: 600;
    color: #059669;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }
    
    .header-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .header-actions .btn {
        justify-content: center;
    }
    
    .page-header {
        padding: 1.5rem 1rem 2.5rem;
    }
    
    .stats-section,
    .nav-section,
    .content-section {
        padding: 0 1rem 1rem;
    }
    
    .stats-card {
        padding: 1rem;
    }
    
    .stats-icon {
        width: 3rem;
        height: 3rem;
        font-size: 1.25rem;
    }
    
    .stats-number {
        font-size: 1.5rem;
    }
    
    .custom-tabs .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }
    
    .content-card .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .card-actions {
        justify-content: space-between;
    }
    
    .search-box {
        min-width: auto;
        flex: 1;
    }
}

/* Animation */
.stats-card,
.content-card {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Background patterns */
.page-header {
    background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
