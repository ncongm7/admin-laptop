<template>
    <div class="warranty-management">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-shield-check"></i> Quản lý bảo hành</h2>
            <div>
                <button class="btn btn-outline-secondary me-2" @click="exportExcel">
                    <i class="bi bi-file-earmark-excel"></i> Xuất báo cáo
                </button>
                <button class="btn btn-primary" @click="openCreateModal">
                    <i class="bi bi-plus-circle"></i> Tạo mới
                </button>
            </div>
        </div>

        <!-- Filter/Search -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <input v-model="searchQuery" type="text" class="form-control"
                            placeholder="Tìm theo IMEI, tên KH...">
                    </div>
                    <div class="col-md-2">
                        <select v-model="statusFilter" class="form-select">
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Đang bảo hành</option>
                            <option value="EXPIRED">Hết hạn</option>
                            <option value="CANCELLED">Hủy bỏ</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="productFilter" class="form-select">
                            <option value="">Tất cả sản phẩm</option>
                            <option v-for="product in productOptions" :value="product.id">{{ product.name }}</option>
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
        <WarrantyStats :stats="stats" />

        <!-- Warranty List -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Mã BH</th>
                                <th>Sản phẩm</th>
                                <th>IMEI</th>
                                <th>Khách hàng</th>
                                <th>Thời hạn</th>
                                <th>Trạng thái</th>
                                <th>Số lần SC</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="warranty in filteredWarranties" :key="warranty.id">
                                <td>#WB{{ warranty.id.toString().padStart(6, '0') }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img :src="warranty.productImage || defaultProductImage" class="rounded me-2"
                                            width="40" height="40">
                                        <div>
                                            <strong>{{ warranty.productName }}</strong>
                                            <div class="text-muted small">{{ warranty.productSpecs }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-secondary">{{ warranty.imei }}</span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img :src="warranty.customerAvatar || defaultAvatar" class="rounded-circle me-2"
                                            width="32" height="32">
                                        <div>
                                            <div>{{ warranty.customerName }}</div>
                                            <div class="text-muted small">{{ warranty.customerPhone }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>{{ formatDate(warranty.ngayBatDau) }}</div>
                                    <div class="text-muted small">đến</div>
                                    <div>{{ formatDate(warranty.ngayKetThuc) }}</div>
                                    <div class="small" :class="getRemainingDaysClass(warranty.remainingDays)">
                                        {{ getRemainingDaysText(warranty.remainingDays) }}
                                    </div>
                                </td>
                                <td>
                                    <span class="badge" :class="statusBadgeClass(warranty.status)">
                                        {{ warrantyStatusText(warranty.status) }}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge rounded-pill"
                                        :class="warranty.repairCount > 0 ? 'bg-danger' : 'bg-success'">
                                        {{ warranty.repairCount }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-outline-primary" @click="viewDetail(warranty)">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-warning" @click="editWarranty(warranty)"
                                            v-if="warranty.status !== 'CANCELLED' && warranty.status !== 'EXPIRED'">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="confirmCancel(warranty)"
                                            v-if="warranty.status === 'ACTIVE'">
                                            <i class="bi bi-x-circle"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="filteredWarranties.length === 0">
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="bi bi-shield-slash fs-1"></i>
                                    <h5 class="mt-3">Không tìm thấy bảo hành nào</h5>
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

        <!-- Create/Edit Modal -->
        <WarrantyForm v-if="showFormModal" :warranty="editingWarranty" :is-edit-mode="isEditMode"
            @save="handleSaveWarranty" @close="showFormModal = false" />

        <!-- Detail Modal -->
        <WarrantyDetail v-if="selectedWarranty" :warranty="selectedWarranty" @close="selectedWarranty = null"
            @status-changed="fetchWarranties" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWarrantyStore } from '@/stores/warrantyStore'
import { useProductStore } from '@/stores/productStore'
import WarrantyForm from '@/components/baohanh/WarrantyForm.vue'
import WarrantyDetail from '@/components/baohanh/WarrantyDetail.vue'
import WarrantyStats from '@/components/baohanh/WarrantyStats.vue'
import DateRangePicker from '@/components/trahang/DateRangePicker.vue'
import { formatDate, calculateRemainingDays } from '@/utils/dateUtils'

const warrantyStore = useWarrantyStore()
const productStore = useProductStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const productFilter = ref('')
const dateRange = ref([null, null])
const currentPage = ref(1)
const itemsPerPage = 10
const showFormModal = ref(false)
const isEditMode = ref(false)
const editingWarranty = ref(null)
const selectedWarranty = ref(null)

// Data
const warranties = ref([])
const productOptions = ref([])
const stats = ref({
    active: 0,
    expired: 0,
    cancelled: 0,
    total: 0,
    repairCount: 0
})

// Computed
const filteredWarranties = computed(() => {
    return warranties.value.filter(warranty => {
        const matchesSearch =
            warranty.id.toString().includes(searchQuery.value) ||
            warranty.imei.includes(searchQuery.value) ||
            warranty.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            warranty.customerPhone.includes(searchQuery.value);

        const matchesStatus = !statusFilter.value || warranty.status === statusFilter.value;
        const matchesProduct = !productFilter.value || warranty.productId == productFilter.value;

        let matchesDate = true;
        if (dateRange.value[0] && dateRange.value[1]) {
            const startDate = new Date(dateRange.value[0]);
            const endDate = new Date(dateRange.value[1]);
            const warrantyDate = new Date(warranty.ngayBatDau);
            matchesDate = warrantyDate >= startDate && warrantyDate <= endDate;
        }

        return matchesSearch && matchesStatus && matchesProduct && matchesDate;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredWarranties.value.length / itemsPerPage)
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
const fetchWarranties = async () => {
    try {
        await Promise.all([
            warrantyStore.fetchAllWarranties(),
            productStore.fetchAllProducts()
        ])

        warranties.value = warrantyStore.warranties.map(w => ({
            ...w,
            remainingDays: calculateRemainingDays(w.ngayKetThuc),
            status: getWarrantyStatus(w),
            productName: w.sanPham?.ten || 'N/A',
            productSpecs: `${w.sanPham?.ram || ''} | ${w.sanPham?.o_cung || ''}`,
            productImage: w.sanPham?.anh || null,
            customerName: w.khachHang?.ten || 'N/A',
            customerPhone: w.khachHang?.soDienThoai || 'N/A',
            customerAvatar: w.khachHang?.anh || null,
            repairCount: w.lichSuSuaChua?.length || 0
        }))

        productOptions.value = productStore.products.map(p => ({
            id: p.id,
            name: p.ten
        }))

        calculateStats()
    } catch (error) {
        console.error('Error fetching data:', error)
    }
}

const getWarrantyStatus = (warranty) => {
    const now = new Date()
    const endDate = new Date(warranty.ngayKetThuc)

    if (warranty.trangThai === 'CANCELLED') return 'CANCELLED'
    if (now > endDate) return 'EXPIRED'
    return 'ACTIVE'
}

const calculateStats = () => {
    stats.value = {
        active: warranties.value.filter(w => w.status === 'ACTIVE').length,
        expired: warranties.value.filter(w => w.status === 'EXPIRED').length,
        cancelled: warranties.value.filter(w => w.status === 'CANCELLED').length,
        total: warranties.value.length,
        repairCount: warranties.value.reduce((sum, w) => sum + (w.lichSuSuaChua?.length || 0), 0)
    }
}

const openCreateModal = () => {
    editingWarranty.value = {
        imei_id: '',
        ngayBatDau: new Date(),
        ngayKetThuc: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm sau
        moTa: '',
        trangThai: 'ACTIVE'
    }
    isEditMode.value = false
    showFormModal.value = true
}

const editWarranty = (warranty) => {
    editingWarranty.value = { ...warranty }
    isEditMode.value = true
    showFormModal.value = true
}

const viewDetail = (warranty) => {
    selectedWarranty.value = warranty
}

const confirmCancel = (warranty) => {
    if (confirm(`Bạn chắc chắn muốn hủy bảo hành cho IMEI ${warranty.imei}?`)) {
        cancelWarranty(warranty)
    }
}

const cancelWarranty = async (warranty) => {
    try {
        await warrantyStore.updateWarranty(warranty.id, {
            ...warranty,
            trangThai: 'CANCELLED'
        })
        await fetchWarranties()
    } catch (error) {
        console.error('Error cancelling warranty:', error)
    }
}

const handleSaveWarranty = async () => {
    await fetchWarranties()
    showFormModal.value = false
}

const warrantyStatusText = (status) => {
    const statusMap = {
        'ACTIVE': 'Đang BH',
        'EXPIRED': 'Hết hạn',
        'CANCELLED': 'Đã hủy'
    }
    return statusMap[status] || status
}

const statusBadgeClass = (status) => {
    return {
        'bg-success': status === 'ACTIVE',
        'bg-secondary': status === 'EXPIRED',
        'bg-danger': status === 'CANCELLED'
    }
}

const getRemainingDaysText = (days) => {
    if (days === 0) return 'Hết hạn hôm nay'
    if (days > 0) return `Còn ${days} ngày`
    return `Quá hạn ${Math.abs(days)} ngày`
}

const getRemainingDaysClass = (days) => {
    if (days === 0) return 'text-warning fw-bold'
    if (days > 0) {
        if (days <= 30) return 'text-warning'
        return 'text-success'
    }
    return 'text-danger'
}

const resetFilter = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    productFilter.value = ''
    dateRange.value = [null, null]
    currentPage.value = 1
}

const exportExcel = () => {
    // Logic xuất Excel
    console.log('Exporting warranty data to Excel...')
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
    fetchWarranties()
})
</script>

<style scoped>
.warranty-management {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 70px);
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

.badge.rounded-pill {
    padding-left: 0.6em;
    padding-right: 0.6em;
}

@media (max-width: 768px) {
    .warranty-management {
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