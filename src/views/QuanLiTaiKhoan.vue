<template>
    <div class="user-management">
        <!-- Header với tab phân loại -->
        <!-- <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-people-fill"></i> Quản lý người dùng</h2>
            <div>
                <button class="btn btn-primary me-2" @click="openCreateModal">
                    <i class="bi bi-plus-circle"></i> Thêm mới
                </button>
                <button class="btn btn-outline-secondary" @click="exportExcel">
                    <i class="bi bi-file-earmark-excel"></i> Xuất Excel
                </button>
            </div>
        </div> -->

        <!-- Tab phân loại -->
        <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
                    Tất cả
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'staff' }" @click="activeTab = 'staff'">
                    Nhân viên
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'customer' }" @click="activeTab = 'customer'">
                    Khách hàng
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'locked' }" @click="activeTab = 'locked'">
                    Tài khoản bị khóa
                </a>
            </li>
        </ul>

        <!-- Nội dung động theo tab -->
        <div v-if="activeTab === 'staff'">
            <NhanVien />
        </div>
        <div v-else-if="activeTab === 'customer'">
            <KhachHangManager />
        </div>
        <div v-else>
            <!-- Filter/Search -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <input v-model="searchQuery" type="text" class="form-control"
                                placeholder="Tìm theo tên, email, SĐT...">
                        </div>
                        <div class="col-md-3">
                            <select v-model="roleFilter" class="form-select">
                                <option value="">Tất cả vai trò</option>
                                <option v-for="role in roleOptions" :value="role.value">{{ role.label }}</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select v-model="statusFilter" class="form-select">
                                <option value="">Tất cả trạng thái</option>
                                <option value="1">Hoạt động</option>
                                <option value="0">Bị khóa</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-outline-secondary w-100" @click="resetFilter">
                                <i class="bi bi-arrow-counterclockwise"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bảng danh sách -->
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Thông tin</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in filteredUsers" :key="user.id">
                                    <td>{{ user.id }}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img :src="user.avatar || '/images/default-avatar.jpg'"
                                                class="rounded-circle me-3" width="40" height="40">
                                            <div>
                                                <strong>{{ user.name }}</strong>
                                                <div class="text-muted small">{{ user.email }}</div>
                                                <div class="text-muted small">{{ user.phone }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge" :class="roleBadgeClass(user.role)">
                                            {{ formatRole(user.role) }}
                                        </span>
                                        <div v-if="user.isStaff" class="small text-muted mt-1">
                                            {{ user.position }}
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge" :class="user.status ? 'bg-success' : 'bg-danger'">
                                            {{ user.status ? 'Hoạt động' : 'Bị khóa' }}
                                        </span>
                                    </td>
                                    <td>{{ formatDate(user.created_at) }}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-sm btn-outline-primary" @click="viewDetail(user)">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-warning" @click="editUser(user)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger"
                                                @click="confirmToggleStatus(user)">
                                                <i class="bi" :class="user.status ? 'bi-lock' : 'bi-unlock'"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <nav class="mt-4">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="prevPage">Previous</a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <!-- Modal chi tiết người dùng -->
            <UserDetailModal v-if="selectedUser" :user="selectedUser" @close="selectedUser = null"
                @user-updated="handleUserUpdated" />

            <!-- Modal tạo/chỉnh sửa người dùng -->
            <UserEditModal v-if="showEditModal" :user="editingUser" :is-edit-mode="isEditMode" @save="handleSaveUser"
                @close="showEditModal = false" />
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import UserDetailModal from '@/components/taikhoan/UserDetailModal.vue'
import NhanVien from '@/components/taikhoan/nhanvien/NhanVien.vue'
import KhachHangManager from '@/components/taikhoan/khachhang/KhachHangManager.vue'
// import UserEditModal from './UserEditModal.vue'
// import { formatDate } from '@/utils/dateFormatter'
import { useUserStore } from '@/stores/pinastorge.js'

const userStore = useUserStore()

// State
const activeTab = ref('all')
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedUser = ref(null)
const editingUser = ref(null)
const showEditModal = ref(false)
const isEditMode = ref(false)

// Data
const users = ref([])
const roleOptions = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'NHAN_VIEN', label: 'Nhân viên' },
    { value: 'KHACH_HANG', label: 'Khách hàng' }
]

// Computed
const filteredUsers = computed(() => {
    return users.value.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            user.phone?.includes(searchQuery.value)

        const matchesRole = !roleFilter.value || user.role === roleFilter.value
        const matchesStatus = statusFilter.value === '' || user.status.toString() === statusFilter.value

        let matchesTab = true
        if (activeTab.value === 'staff') matchesTab = user.isStaff
        else if (activeTab.value === 'customer') matchesTab = !user.isStaff
        else if (activeTab.value === 'locked') matchesTab = !user.status

        return matchesSearch && matchesRole && matchesStatus && matchesTab
    })
})

const totalPages = computed(() => {
    return Math.ceil(filteredUsers.value.length / itemsPerPage)
})

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.value.slice(start, end)
})

// Methods
const fetchUsers = async () => {
    // Gọi API để lấy dữ liệu từ server
    try {
        const response = await userStore.fetchAllUsers()
        users.value = response.data.map(user => ({
            ...user,
            isStaff: user.role === 'ADMIN' || user.role === 'NHAN_VIEN'
        }))
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

const resetFilter = () => {
    searchQuery.value = ''
    roleFilter.value = ''
    statusFilter.value = ''
}

const viewDetail = (user) => {
    selectedUser.value = user
}

const openCreateModal = () => {
    editingUser.value = {
        name: '',
        email: '',
        phone: '',
        role: 'KHACH_HANG',
        status: true,
        isStaff: false,
        position: '',
        avatar: null
    }
    isEditMode.value = false
    showEditModal.value = true
}

const editUser = (user) => {
    editingUser.value = { ...user }
    isEditMode.value = true
    showEditModal.value = true
}

const confirmToggleStatus = (user) => {
    if (confirm(`Bạn chắc chắn muốn ${user.status ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
        toggleUserStatus(user)
    }
}

const toggleUserStatus = async (user) => {
    try {
        await userStore.toggleUserStatus(user.id)
        fetchUsers() // Refresh data
    } catch (error) {
        console.error('Error toggling user status:', error)
    }
}

const handleSaveUser = async (userData) => {
    try {
        if (isEditMode.value) {
            await userStore.updateUser(userData)
        } else {
            await userStore.createUser(userData)
        }
        fetchUsers() // Refresh data
        showEditModal.value = false
    } catch (error) {
        console.error('Error saving user:', error)
    }
}

const handleUserUpdated = () => {
    fetchUsers() // Refresh data
}

const formatRole = (role) => {
    const roleMap = {
        'ADMIN': 'Quản trị viên',
        'NHAN_VIEN': 'Nhân viên',
        'KHACH_HANG': 'Khách hàng'
    }
    return roleMap[role] || role
}

const roleBadgeClass = (role) => {
    const classMap = {
        'ADMIN': 'bg-danger',
        'NHAN_VIEN': 'bg-primary',
        'KHACH_HANG': 'bg-secondary'
    }
    return classMap[role] || 'bg-light text-dark'
}

// Pagination methods
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
    fetchUsers()
})
</script>

<style scoped>
/* Main container styling */
.user-management {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 70px);
}

/* Header section */
.user-management h2 {
    color: #2c3e50;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-management h2 i {
    font-size: 1.5rem;
}

/* Tab navigation */
.nav-tabs {
    border-bottom: 2px solid #dee2e6;
}

.nav-tabs .nav-link {
    color: #495057;
    font-weight: 500;
    border: none;
    padding: 12px 20px;
    transition: all 0.3s ease;
}

.nav-tabs .nav-link:hover {
    color: #0d6efd;
    border-color: transparent;
}

.nav-tabs .nav-link.active {
    color: #0d6efd;
    border-bottom: 3px solid #0d6efd;
    background-color: transparent;
    font-weight: 600;
}

/* Filter card */
.filter-card {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.filter-card .card-body {
    padding: 15px;
}

/* Table styling */
.table-responsive {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table {
    margin-bottom: 0;
}

.table thead th {
    background-color: #f1f5fd;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
    padding: 12px 15px;
}

.table tbody tr {
    transition: all 0.2s ease;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.table tbody td {
    padding: 12px 15px;
    vertical-align: middle;
}

/* User avatar in table */
.user-avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border: 2px solid #e9ecef;
}

/* Badge styling */
.badge {
    font-weight: 500;
    padding: 6px 10px;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
}

.badge.bg-primary {
    background-color: #0d6efd !important;
}

.badge.bg-secondary {
    background-color: #6c757d !important;
}

.badge.bg-success {
    background-color: #198754 !important;
}

.badge.bg-danger {
    background-color: #dc3545 !important;
}

.badge.bg-warning {
    background-color: #ffc107 !important;
    color: #212529;
}

/* Action buttons */
.btn-action {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 50%;
}

.btn-sm i {
    font-size: 0.9rem;
}

/* Pagination */
.pagination {
    margin-top: 20px;
}

.page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.page-link {
    color: #0d6efd;
    padding: 8px 15px;
}

.page-link:hover {
    color: #0a58ca;
}

/* Modal styling chỉ áp dụng cho modal con của QuanLiTaiKhoan.vue */
::v-deep .modal-content {
    border: none;
    border-radius: 10px;
    overflow: hidden;
}

::v-deep .modal-header {
    padding: 15px 20px;
}

::v-deep .modal-title {
    font-weight: 600;
}

::v-deep .modal-body {
    padding: 20px;
}

::v-deep .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
}

::v-deep .tab-content {
    padding: 15px 0;
}

/* User info card in modal */
::v-deep .user-info-card {
    text-align: center;
    padding: 20px 0;
}

::v-deep .user-info-card img {
    border: 3px solid #e9ecef;
    margin-bottom: 15px;
}

::v-deep .user-info-card h4 {
    margin-bottom: 5px;
    color: #2c3e50;
}

::v-deep .user-info-card p {
    color: #6c757d;
    margin-bottom: 20px;
}

/* Stats cards in modal */
::v-deep .stats-card {
    border-radius: 8px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    height: 100%;
}

::v-deep .stats-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

::v-deep .stats-card .card-body {
    padding: 15px;
}

::v-deep .stats-card h5 {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 10px;
}

::v-deep .stats-card h2 {
    color: #2c3e50;
    margin-bottom: 5px;
}

::v-deep .stats-card i {
    opacity: 0.7;
}

/* Review list in modal */
::v-deep .review-item {
    border-left: 3px solid #0d6efd;
    margin-bottom: 10px;
}

::v-deep .review-item h6 {
    color: #2c3e50;
    font-weight: 600;
}

::v-deep .review-rating {
    color: #ffc107;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .user-management {
        padding: 15px;
    }

    .nav-tabs .nav-link {
        padding: 10px 15px;
        font-size: 0.9rem;
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

    .modal-dialog {
        margin: 10px;
    }
}

/* Animation for loading */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.table tbody tr {
    animation: fadeIn 0.3s ease forwards;
}

.table tbody tr:nth-child(odd) {
    animation-delay: 0.05s;
}

.table tbody tr:nth-child(even) {
    animation-delay: 0.1s;
}

/* Custom scrollbar for table */
.table-responsive::-webkit-scrollbar {
    height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Status indicator */
.status-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;
}

.status-active {
    background-color: #28a745;
}

.status-inactive {
    background-color: #dc3545;
}

/* Tooltip styling */
.tooltip-inner {
    background-color: #2c3e50;
    font-size: 0.8rem;
    padding: 5px 10px;
}

.bs-tooltip-auto[data-popper-placement^=top] .tooltip-arrow::before,
.bs-tooltip-top .tooltip-arrow::before {
    border-top-color: #2c3e50;
}

/* Custom checkbox for bulk actions */
.custom-checkbox .custom-control-input:checked~.custom-control-label::before {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

/* Empty state styling */
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
}

.empty-state i {
    font-size: 3rem;
    opacity: 0.5;
    margin-bottom: 15px;
}

.empty-state h4 {
    color: #495057;
    margin-bottom: 10px;
}
</style>