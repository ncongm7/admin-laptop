<template>
    <div class="return-management">
        <!-- Header với các action chính -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-arrow-return-left"></i> Quản lý trả hàng</h2>
            <div>
                <button class="btn btn-outline-secondary me-2" @click="exportExcel">
                    <i class="bi bi-file-earmark-excel"></i> Xuất Excel
                </button>
                <button class="btn btn-primary" @click="showReturnAnalytics = true">
                    <i class="bi bi-graph-up"></i> Phân tích
                </button>
            </div>
        </div>

        <!-- Filter/Search -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <input v-model="searchQuery" type="text" class="form-control"
                            placeholder="Tìm theo mã đơn, KH...">
                    </div>
                    <div class="col-md-2">
                        <select v-model="statusFilter" class="form-select">
                            <option value="">Tất cả trạng thái</option>
                            <option value="DANG_CHO_DUYET">Chờ duyệt</option>
                            <option value="DA_DUYET">Đã duyệt</option>
                            <option value="TU_CHOI">Từ chối</option>
                            <option value="HOAN_TAT">Hoàn tất</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="reasonFilter" class="form-select">
                            <option value="">Tất cả lý do</option>
                            <option v-for="reason in returnReasons" :value="reason">{{ reason }}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <DateRangePicker v-model="dateRange" />
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-secondary w-100" @click="resetFilter">
                            <i class="bi bi-arrow-counterclockwise"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Chờ duyệt</h6>
                                <h3 class="card-title mb-0">{{ stats.pending }}</h3>
                            </div>
                            <div class="stat-icon bg-warning">
                                <i class="bi bi-clock"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Đã duyệt</h6>
                                <h3 class="card-title mb-0">{{ stats.approved }}</h3>
                            </div>
                            <div class="stat-icon bg-success">
                                <i class="bi bi-check-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Từ chối</h6>
                                <h3 class="card-title mb-0">{{ stats.rejected }}</h3>
                            </div>
                            <div class="stat-icon bg-danger">
                                <i class="bi bi-x-circle"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle text-muted">Tổng giá trị</h6>
                                <h3 class="card-title mb-0">{{ formatCurrency(stats.totalValue) }}</h3>
                            </div>
                            <div class="stat-icon bg-primary">
                                <i class="bi bi-currency-dollar"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Danh sách yêu cầu trả hàng -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Mã yêu cầu</th>
                                <th>Thông tin đơn hàng</th>
                                <th>Khách hàng</th>
                                <th>Lý do</th>
                                <th>Giá trị</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="returnReq in filteredReturns" :key="returnReq.id">
                                <td>#RT{{ returnReq.id.toString().padStart(6, '0') }}</td>
                                <td>
                                    <div>
                                        <router-link :to="`/orders/${returnReq.hoa_don_id}`">
                                            #HD{{ returnReq.hoa_don_id.toString().padStart(6, '0') }}
                                        </router-link>
                                        <div class="text-muted small">
                                            {{ formatDate(returnReq.ngayTao) }}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img :src="returnReq.customerAvatar || defaultAvatar"
                                            class="rounded-circle me-2" width="32" height="32">
                                        <div>
                                            <div>{{ returnReq.customerName }}</div>
                                            <div class="text-muted small">{{ returnReq.customerPhone }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="text-truncate" style="max-width: 200px;" :title="returnReq.lyDoTraHang">
                                        {{ returnReq.lyDoTraHang }}
                                    </div>
                                </td>
                                <td>{{ formatCurrency(returnReq.totalValue) }}</td>
                                <td>
                                    <span class="badge" :class="statusBadgeClass(returnReq.trangThai)">
                                        {{ returnStatusText(returnReq.trangThai) }}
                                    </span>
                                </td>
                                <td>{{ formatDate(returnReq.ngayTao) }}</td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-primary" @click="viewDetail(returnReq)">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-success"
                                            v-if="returnReq.trangThai === 'DANG_CHO_DUYET'"
                                            @click="openProcessModal(returnReq, 'DA_DUYET')">
                                            <i class="bi bi-check"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger"
                                            v-if="returnReq.trangThai === 'DANG_CHO_DUYET'"
                                            @click="openProcessModal(returnReq, 'TU_CHOI')">
                                            <i class="bi bi-x"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredReturns.length === 0">
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="bi bi-box-seam fs-1"></i>
                                    <h5 class="mt-3">Không tìm thấy yêu cầu trả hàng nào</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <nav class="mt-4" v-if="totalPages > 1">
                    <ul class="pagination justify-content-center">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="prevPage">Trước</a>
                        </li>
                        <li v-for="page in visiblePages" :key="page" class="page-item"
                            :class="{ active: currentPage === page }">
                            <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="#" @click.prevent="nextPage">Sau</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <!-- Return Detail Modal -->
        <ReturnDetail v-if="selectedReturn" :return-request="selectedReturn" @close="selectedReturn = null"
            @status-changed="fetchReturns" />

        <!-- Process Modal -->
        <ReturnProcessModal v-if="processModal.show" :return-request="processModal.data" :action="processModal.action"
            @close="processModal.show = false" @processed="handleProcessed" />

        <!-- Analytics Modal -->
        <div class="modal fade" :class="{ show: showReturnAnalytics }" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Phân tích trả hàng</h5>
                        <button type="button" class="btn-close btn-close-white"
                            @click="showReturnAnalytics = false"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h6>Thống kê theo lý do</h6>
                                    </div>
                                    <div class="card-body">
                                        <ReturnReasonStats :data="analyticsData.reasons" />
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header">
                                        <h6>Xu hướng theo tháng</h6>
                                    </div>
                                    <div class="card-body">
                                        <LineChart :data="analyticsData.trends" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header">
                                        <h6>Sản phẩm bị trả nhiều nhất</h6>
                                    </div>
                                    <div class="card-body">
                                        <ProductReturnTable :products="analyticsData.topProducts" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"
                            @click="showReturnAnalytics = false">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReturnStore } from '@/stores/returnStore'
import ReturnDetail from '@/components/trahang/ReturnDetail.vue'
import ReturnProcessModal from '@/components/trahang/ReturnProcessModal.vue'
import ReturnReasonStats from '@/components/trahang/ReturnReasonStats.vue'
import DateRangePicker from '@/components/trahang/DateRangePicker.vue'
import { formatDate, formatCurrency } from '@/utils/formatters'

const returnStore = useReturnStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const reasonFilter = ref('')
const dateRange = ref([null, null])
const currentPage = ref(1)
const itemsPerPage = 10
const selectedReturn = ref(null)
const processModal = ref({
    show: false,
    data: null,
    action: ''
})
const showReturnAnalytics = ref(false)
const analyticsData = ref({
    reasons: [],
    trends: [],
    topProducts: []
})

// Data
const returnRequests = ref([])
const stats = ref({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0
})
const returnReasons = ref([
    'Sản phẩm lỗi',
    'Không đúng mô tả',
    'Giao sai sản phẩm',
    'Đổi ý',
    'Khác'
])

// Computed
const filteredReturns = computed(() => {
    return returnRequests.value.filter(req => {
        const matchesSearch =
            req.id.toString().includes(searchQuery.value) ||
            req.hoa_don_id.toString().includes(searchQuery.value) ||
            req.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            req.customerPhone.includes(searchQuery.value)

        const matchesStatus = !statusFilter.value || req.trangThai === statusFilter.value
        const matchesReason = !reasonFilter.value || req.lyDoTraHang.includes(reasonFilter.value)

        let matchesDate = true;
        if (dateRange.value[0] && dateRange.value[1]) {
            const reqDate = new Date(req.ngayTao);
            const startDate = new Date(dateRange.value[0]);
            const endDate = new Date(dateRange.value[1]);
            matchesDate = reqDate >= startDate && reqDate <= endDate;
        }

        return matchesSearch && matchesStatus && matchesReason && matchesDate;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredReturns.value.length / itemsPerPage)
})

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return pages
})

// Methods
const fetchReturns = async () => {
    try {
        await returnStore.fetchAllReturns()
        returnRequests.value = returnStore.returns.map(req => ({
            ...req,
            customerName: req.khachHang?.ten || 'Khách vãng lai',
            customerPhone: req.khachHang?.soDienThoai || '',
            customerAvatar: req.khachHang?.anh || null,
            totalValue: calculateTotalValue(req)
        }))

        calculateStats()
        fetchAnalytics()
    } catch (error) {
        console.error('Error fetching returns:', error)
    }
}

const calculateTotalValue = (returnReq) => {
    return returnReq.chiTietTraHang.reduce((sum, item) => {
        return sum + (item.soLuong * item.donGia)
    }, 0)
}

const calculateStats = () => {
    stats.value = {
        pending: returnRequests.value.filter(r => r.trangThai === 'DANG_CHO_DUYET').length,
        approved: returnRequests.value.filter(r => r.trangThai === 'DA_DUYET').length,
        rejected: returnRequests.value.filter(r => r.trangThai === 'TU_CHOI').length,
        totalValue: returnRequests.value.reduce((sum, r) => sum + calculateTotalValue(r), 0)
    }
}

const fetchAnalytics = async () => {
    // Giả lập dữ liệu phân tích - trong thực tế sẽ gọi API
    analyticsData.value = {
        reasons: [
            { reason: 'Sản phẩm lỗi', count: 45, percentage: 45 },
            { reason: 'Không đúng mô tả', count: 25, percentage: 25 },
            { reason: 'Giao sai sản phẩm', count: 15, percentage: 15 },
            { reason: 'Đổi ý', count: 10, percentage: 10 },
            { reason: 'Khác', count: 5, percentage: 5 }
        ],
        trends: [
            { month: 'Tháng 1', returns: 12 },
            { month: 'Tháng 2', returns: 19 },
            { month: 'Tháng 3', returns: 15 },
            { month: 'Tháng 4', returns: 8 },
            { month: 'Tháng 5', returns: 11 }
        ],
        topProducts: [
            { id: 1, name: 'Laptop Dell XPS 13', sku: 'DLXPS13', returns: 8, rate: '5.2%' },
            { id: 2, name: 'MacBook Pro M1', sku: 'MBPM1', returns: 6, rate: '4.1%' },
            { id: 3, name: 'Asus ROG Zephyrus', sku: 'ASRGZ', returns: 5, rate: '3.8%' }
        ]
    }
}

const viewDetail = (returnReq) => {
    selectedReturn.value = returnReq
}

const openProcessModal = (returnReq, action) => {
    processModal.value = {
        show: true,
        data: returnReq,
        action: action
    }
}

const handleProcessed = () => {
    fetchReturns()
    processModal.value.show = false
}

const returnStatusText = (status) => {
    const statusMap = {
        'DANG_CHO_DUYET': 'Chờ duyệt',
        'DA_DUYET': 'Đã duyệt',
        'TU_CHOI': 'Từ chối',
        'HOAN_TAT': 'Hoàn tất'
    }
    return statusMap[status] || status
}

const statusBadgeClass = (status) => {
    return {
        'bg-warning': status === 'DANG_CHO_DUYET',
        'bg-success': status === 'DA_DUYET',
        'bg-danger': status === 'TU_CHOI',
        'bg-secondary': status === 'HOAN_TAT'
    }
}

const resetFilter = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    reasonFilter.value = ''
    dateRange.value = [null, null]
    currentPage.value = 1
}

const exportExcel = () => {
    // Logic xuất Excel
    console.log('Exporting to Excel...')
}

// Pagination
const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
    currentPage.value = page
}

// Lifecycle
onMounted(() => {
    fetchReturns()
})
</script>

<style scoped>
.return-management {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 70px);
}

.stat-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
}

.table-responsive {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table thead th {
    background-color: #f1f5fd;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.badge {
    font-weight: 500;
    padding: 6px 10px;
    font-size: 0.8rem;
}

.modal {
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    border: none;
    border-radius: 10px;
}

@media (max-width: 768px) {
    .return-management {
        padding: 15px;
    }

    .table thead {
        display: none;
    }

    .table tbody tr {
        display: block;
        margin-bottom: 15px;
        border: 1px solid #dee2e6;
        border-radius: 8px;
    }

    .table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #e9ecef;
    }

    .table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #495057;
        margin-right: 15px;
    }

    .table tbody td:last-child {
        border-bottom: none;
    }
}
</style>