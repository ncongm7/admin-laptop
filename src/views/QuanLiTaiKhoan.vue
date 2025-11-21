<template>
  <div class="user-management">
    <!-- Nhân viên: Hiển thị giao diện riêng -->
    <MyAccount v-if="!isAdmin" />

    <!-- Admin: Hiển thị giao diện quản lý đầy đủ -->
    <template v-else>
      <!-- Tab phân loại - Modern Design -->
      <TabNavigation
        v-model="activeTab"
        :tabs="accountTabs"
        variant="modern"
        @change="handleTabChange"
      />

      <!-- Nội dung động theo tab -->

      <!-- Tab: Tất cả tài khoản -->
      <div v-if="activeTab === 'all'">
        <!-- Filter/Search -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Tìm theo tên đăng nhập..."
                  @input="handleSearch"
                />
              </div>
              <div class="col-md-2">
                <select v-model="roleFilter" class="form-select" @change="handleFilterChange">
                  <option value="">Tất cả vai trò</option>
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="statusFilter" class="form-select" @change="handleFilterChange">
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
              <div class="col-md-3 text-end">
                <button class="btn btn-primary" @click="openCreateModal">
                  <i class="bi bi-plus-circle"></i> Thêm mới tài khoản
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
                    <th>Thông tin</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>
                        <div>
                          <strong>{{ user.name || user.tenDangNhap || 'N/A' }}</strong>
                          <div class="text-muted small">{{ user.email || 'N/A' }}</div>
                          <div class="text-muted small">{{ user.phone || 'N/A' }}</div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="roleBadgeClass(user.role)">
                        {{ formatRole(user.role) }}
                      </span>
                      <div v-if="user.isStaff" class="small text-muted mt-1">
                        {{ user.position || 'N/A' }}
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
                        <button
                          class="btn btn-sm btn-outline-primary"
                          @click="viewDetail(user)"
                          title="Xem chi tiết"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-warning"
                          @click="editUser(user)"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="confirmToggleStatus(user)"
                          title="Khóa/Mở khóa"
                        >
                          <i class="bi" :class="user.status ? 'bi-lock' : 'bi-unlock'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedUsers.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">
                      <i class="bi bi-inbox"></i> Không có dữ liệu
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
                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'staff'">
        <NhanVien />
      </div>
      <div v-else-if="activeTab === 'customer'">
        <KhachHangManager />
      </div>
      <div v-else-if="activeTab === 'locked'">
        <!-- Filter/Search -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Tìm theo tên đăng nhập..."
                  @input="handleSearch"
                />
              </div>
              <div class="col-md-2">
                <select v-model="roleFilter" class="form-select" @change="handleFilterChange">
                  <option value="">Tất cả vai trò</option>
                  <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <select v-model="statusFilter" class="form-select" @change="handleFilterChange">
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
              <div class="col-md-3 text-end">
                <button class="btn btn-primary" @click="openCreateModal">
                  <i class="bi bi-plus-circle"></i> Thêm mới tài khoản
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
                    <th>Thông tin</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>
                        <div>
                          <strong>{{ user.name || user.tenDangNhap || 'N/A' }}</strong>
                          <div class="text-muted small">{{ user.email || 'N/A' }}</div>
                          <div class="text-muted small">{{ user.phone || 'N/A' }}</div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="roleBadgeClass(user.role)">
                        {{ formatRole(user.role) }}
                      </span>
                      <div v-if="user.isStaff" class="small text-muted mt-1">
                        {{ user.position || 'N/A' }}
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
                        <button
                          class="btn btn-sm btn-outline-primary"
                          @click="viewDetail(user)"
                          title="Xem chi tiết"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-warning"
                          @click="editUser(user)"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="confirmToggleStatus(user)"
                          title="Khóa/Mở khóa"
                        >
                          <i class="bi" :class="user.status ? 'bi-lock' : 'bi-unlock'"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="paginatedUsers.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">
                      <i class="bi bi-inbox"></i> Không có dữ liệu
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
                <li
                  v-for="page in totalPages"
                  :key="page"
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Modal chi tiết người dùng -->
      <UserDetailModal
        v-if="selectedUser"
        :user="selectedUser"
        @close="selectedUser = null"
        @user-updated="handleUserUpdated"
      />

      <!-- Modal tạo/chỉnh sửa tài khoản -->
      <div
        v-if="showEditModal"
        class="modal fade show d-block"
        tabindex="-1"
        role="dialog"
        @click.self="showEditModal = false"
        style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
      >
        <div
          class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          @click.stop
        >
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-person-plus"></i>
                {{ isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm mới tài khoản' }}
              </h5>
              <button type="button" class="btn-close" @click="showEditModal = false"></button>
            </div>
            <div class="modal-body">
              <TaiKhoanForm
                :user="editingUser"
                :is-edit-mode="isEditMode"
                @save="handleSaveUser"
                @cancel="showEditModal = false"
                @save-and-new="handleSaveAndNew"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import UserDetailModal from '@/components/taikhoan/UserDetailModal.vue'
import NhanVien from '@/components/taikhoan/nhanvien/NhanVien.vue'
import KhachHangManager from '@/components/taikhoan/khachhang/KhachHangManager.vue'
import TabNavigation from '@/components/common/TabNavigation.vue'
import MyAccount from '@/components/taikhoan/MyAccount.vue'
import TaiKhoanForm from '@/components/taikhoan/qltaikhoan/TaiKhoanForm.vue'
import { createAccountManagementTabs } from '@/utils/tabUtils'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import taiKhoanService from '@/service/taikhoan/taiKhoanService.js'

// Inject function để update breadcrumb
const updateBreadcrumbTab = inject('updateBreadcrumbTab', null)

const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useToast()

// Check if current user is admin
const isAdmin = computed(() => {
  const admin = authStore.isAdmin
  const role = authStore.getUserRole
  console.log('Current user role:', role, 'isAdmin:', admin)
  return admin
})

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
const hasActiveFilters = ref(false) // Track xem có filter đang active không

// Data
const users = ref([])
const roleOptions = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'NHAN_VIEN', label: 'Nhân viên' },
  { value: 'KHACH_HANG', label: 'Khách hàng' },
]

// Tabs configuration
const accountTabs = computed(() => {
  const counts = {
    all: users.value.length,
    staff: users.value.filter((u) => u.role === 'ADMIN' || u.role === 'NHAN_VIEN').length,
    customer: users.value.filter((u) => u.role === 'KHACH_HANG').length,
    locked: users.value.filter((u) => !u.status).length,
  }
  return createAccountManagementTabs(counts)
})

// Computed
const filteredUsers = computed(() => {
  console.log('filteredUsers computed - hasActiveFilters:', hasActiveFilters.value, 'users.length:', users.value.length, 'activeTab:', activeTab.value)
  
  // Nếu đã filter ở backend (có active filters), chỉ filter theo tab
  if (hasActiveFilters.value) {
    const filtered = users.value.filter((user) => {
      let matchesTab = true
      if (activeTab.value === 'all') {
        matchesTab = true
      } else if (activeTab.value === 'staff') {
        matchesTab = user.isStaff
      } else if (activeTab.value === 'customer') {
        matchesTab = !user.isStaff && (user.role === 'KHACH_HANG' || user.role === 'Khách hàng')
      } else if (activeTab.value === 'locked') {
        matchesTab = !user.status
      }
      return matchesTab
    })
    console.log('After tab filter:', filtered.length, 'users')
    return filtered
  }
  
  // Nếu không có filter ở backend, filter ở frontend
  return users.value.filter((user) => {
    // Tìm kiếm theo tên đăng nhập
    const matchesSearch = !searchQuery.value || 
      user.tenDangNhap?.toLowerCase().includes(searchQuery.value.toLowerCase())

    // Filter theo vai trò: so sánh với cả mã và tên đầy đủ
    const matchesRole = !roleFilter.value || 
      user.role === roleFilter.value || 
      user.role === mapRoleToTenVaiTro(roleFilter.value)

    // Filter theo trạng thái
    const matchesStatus = statusFilter.value === '' || user.status.toString() === statusFilter.value

    // Filter theo tab
    let matchesTab = true
    if (activeTab.value === 'all') {
      matchesTab = true
    } else if (activeTab.value === 'staff') {
      matchesTab = user.isStaff
    } else if (activeTab.value === 'customer') {
      matchesTab = !user.isStaff && (user.role === 'KHACH_HANG' || user.role === 'Khách hàng')
    } else if (activeTab.value === 'locked') {
      matchesTab = !user.status
    }

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
const fetchUsers = async (searchParams = null) => {
  // Chỉ admin mới fetch danh sách users
  if (!isAdmin.value) {
    return
  }

  // Gọi API để lấy dữ liệu từ server
  try {
    let response
    const hasFilters = searchParams && (searchParams.tenDangNhap || searchParams.tenVaiTro || searchParams.trangThai !== undefined)
    hasActiveFilters.value = !!hasFilters
    
    if (hasFilters) {
      // Nếu có điều kiện tìm kiếm, gọi API search advanced
      console.log('Calling search API with params:', searchParams)
      response = await taiKhoanService.searchTaiKhoan(searchParams)
    } else {
      // Nếu không có điều kiện, lấy tất cả
      console.log('Calling getAllTaiKhoan API')
      response = await taiKhoanService.getAllTaiKhoan()
    }
    
    console.log('API Response:', response)
    
    // Xử lý response format: { isSuccess, data, message }
    const taiKhoanList = response?.data || []
    console.log('Tai khoan list from API:', taiKhoanList)
    
    users.value = taiKhoanList.map((tk) => {
      // Map từ TaiKhoanDto sang format hiển thị
      const tenVaiTro = tk.tenVaiTro || ''
      // Xác định isStaff dựa trên tên vai trò
      const isStaffRole = tenVaiTro === 'ADMIN' || 
                         tenVaiTro === 'NHAN_VIEN' || 
                         tenVaiTro === 'Quản trị viên' || 
                         tenVaiTro === 'Nhân viên bán hàng' ||
                         tenVaiTro === 'Quản lý' ||
                         tenVaiTro === 'Thu ngân' ||
                         tenVaiTro === 'STAFF' ||
                         tenVaiTro === 'MANAGER' ||
                         tenVaiTro === 'CASHIER'
      
      return {
        id: tk.id,
        tenDangNhap: tk.tenDangNhap,
        matKhau: tk.matKhau,
        email: tk.email,
        name: tk.tenDangNhap, // Fallback name
        role: tenVaiTro, // Giữ nguyên tên vai trò từ backend
        status: tk.trangThai === 1,
        created_at: tk.ngayTao,
        isStaff: isStaffRole,
        phone: null, // Sẽ được bổ sung từ NhanVien/KhachHang nếu cần
        avatar: null,
        position: null,
      }
    })
    
    console.log('Mapped users:', users.value)
    console.log('Total users after mapping:', users.value.length)
    console.log('hasActiveFilters:', hasActiveFilters.value)
    
    // Reset về trang đầu khi search
    currentPage.value = 1
  } catch (error) {
    console.error('Error fetching users:', error)
    showError(
      'Không thể tải danh sách tài khoản: ' + (error.response?.data?.message || error.message),
    )
  }
}

// Debounce search để tránh gọi API quá nhiều
let searchTimeout = null
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    try {
      // Xử lý trangThai: chỉ gửi nếu là số hợp lệ (0 hoặc 1)
      let trangThaiValue = null
      if (statusFilter.value !== '' && statusFilter.value !== null && statusFilter.value !== undefined) {
        const trangThaiNum = parseInt(statusFilter.value)
        if (!isNaN(trangThaiNum) && (trangThaiNum === 0 || trangThaiNum === 1)) {
          trangThaiValue = trangThaiNum
        }
      }
      
      // Map giá trị vai trò từ combobox sang tên vai trò đầy đủ
      let tenVaiTroValue = null
      if (roleFilter.value) {
        tenVaiTroValue = mapRoleToTenVaiTro(roleFilter.value)
      }
      
      const searchParams = {
        tenDangNhap: searchQuery.value || null,
        tenVaiTro: tenVaiTroValue,
        trangThai: trangThaiValue,
      }
      
      console.log('Search params:', searchParams) // Debug log
      fetchUsers(searchParams).catch((error) => {
        console.error('Error in handleSearch fetchUsers:', error)
      })
    } catch (error) {
      console.error('Error in handleSearch:', error)
    }
  }, 500) // Đợi 500ms sau khi người dùng ngừng gõ
}

// Map từ mã vai trò sang từ khóa tìm kiếm (backend dùng LIKE search)
// Với LIKE search, có thể dùng từ khóa ngắn để match nhiều vai trò
const mapRoleToTenVaiTro = (roleValue) => {
  const roleMap = {
    'ADMIN': 'Quản trị viên', // Match chính xác "Quản trị viên"
    'NHAN_VIEN': 'Nhân viên', // Match "Nhân viên bán hàng", "Nhân viên" (nếu có)
    'KHACH_HANG': 'Khách hàng', // Match chính xác "Khách hàng"
  }
  return roleMap[roleValue] || null
}

// Watch cho roleFilter và statusFilter để tự động search khi thay đổi
const handleFilterChange = () => {
  try {
    // Gọi search ngay lập tức khi thay đổi filter (không debounce)
    // Xử lý trangThai: chỉ gửi nếu là số hợp lệ (0 hoặc 1)
    let trangThaiValue = null
    if (statusFilter.value !== '' && statusFilter.value !== null && statusFilter.value !== undefined) {
      const trangThaiNum = parseInt(statusFilter.value)
      if (!isNaN(trangThaiNum) && (trangThaiNum === 0 || trangThaiNum === 1)) {
        trangThaiValue = trangThaiNum
      }
    }
    
    // Map giá trị vai trò từ combobox sang tên vai trò đầy đủ
    let tenVaiTroValue = null
    if (roleFilter.value) {
      tenVaiTroValue = mapRoleToTenVaiTro(roleFilter.value)
      console.log('Role filter value:', roleFilter.value, 'Mapped to:', tenVaiTroValue)
    }
    
    const searchParams = {
      tenDangNhap: searchQuery.value || null,
      tenVaiTro: tenVaiTroValue,
      trangThai: trangThaiValue,
    }
    
    console.log('Filter changed, search params:', searchParams) // Debug log
    fetchUsers(searchParams).catch((error) => {
      console.error('Error in handleFilterChange fetchUsers:', error)
    })
  } catch (error) {
    console.error('Error in handleFilterChange:', error)
  }
}

const resetFilter = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  hasActiveFilters.value = false
  fetchUsers() // Reload tất cả dữ liệu
}

const viewDetail = async (user) => {
  // Fetch thông tin chi tiết user từ API để có đầy đủ thông tin đăng nhập
  try {
    const response = await taiKhoanService.getTaiKhoanById(user.id)

    // Xử lý response format: { isSuccess, data, message }
    let userData = response?.data || null

    if (userData) {
      selectedUser.value = {
        ...user,
        ...userData,
        // Đảm bảo có thông tin đăng nhập
        tenDangNhap: userData.tenDangNhap || user.tenDangNhap || 'N/A',
        matKhau: userData.matKhau || user.matKhau || '123456',
        email: userData.email || user.email || 'N/A',
        role: userData.maVaiTro?.tenVaiTro || user.role || 'KHACH_HANG',
        status: userData.trangThai === 1,
        created_at: userData.ngayTao || user.created_at,
      }
    } else {
      // Fallback: dùng dữ liệu hiện có
      selectedUser.value = {
        ...user,
        tenDangNhap: user.tenDangNhap || 'N/A',
        matKhau: user.matKhau || '123456',
      }
    }
  } catch (error) {
    console.error('❌ Error fetching user details:', error)
    showError(
      'Không thể tải thông tin chi tiết: ' + (error.response?.data?.message || error.message),
    )
    // Fallback: dùng dữ liệu hiện có
    selectedUser.value = {
      ...user,
      tenDangNhap: user.tenDangNhap || 'N/A',
      matKhau: user.matKhau || '123456',
    }
  }
}

const openCreateModal = () => {
  editingUser.value = {
    id: null,
    maVaiTro: null,
    tenDangNhap: '',
    matKhau: '',
    email: '',
    trangThai: 1,
    ngayTao: null,
  }
  isEditMode.value = false
  showEditModal.value = true
}

const editUser = async (user) => {
  try {
    // Fetch thông tin chi tiết user từ API
    const response = await taiKhoanService.getTaiKhoanById(user.id)
    const userData = response?.data || null

    if (userData) {
    editingUser.value = {
        id: userData.id || user.id,
        maVaiTro: userData.maVaiTro?.id || null,
        tenDangNhap: userData.tenDangNhap || user.tenDangNhap || '',
        matKhau: userData.matKhau || '',
        email: userData.email || user.email || '',
        trangThai: userData.trangThai !== undefined ? userData.trangThai : user.status ? 1 : 0,
        ngayTao: userData.ngayTao || user.created_at || null,
      }
    } else {
      // Fallback: dùng dữ liệu hiện có
      editingUser.value = {
        id: user.id,
        maVaiTro: null,
        tenDangNhap: user.tenDangNhap || '',
        matKhau: '',
        email: user.email || '',
        trangThai: user.status ? 1 : 0,
        ngayTao: user.created_at || null,
      }
    }
    isEditMode.value = true
    showEditModal.value = true
  } catch (error) {
    console.error('Error fetching user details for edit:', error)
    showError(
      'Không thể tải thông tin tài khoản: ' + (error.response?.data?.message || error.message),
    )
    // Fallback: dùng dữ liệu hiện có
    editingUser.value = {
      id: user.id,
      maVaiTro: null,
      tenDangNhap: user.tenDangNhap || '',
      matKhau: '',
      email: user.email || '',
      trangThai: user.status ? 1 : 0,
      ngayTao: user.created_at || null,
    }
    isEditMode.value = true
    showEditModal.value = true
  }
}

const confirmToggleStatus = (user) => {
  if (confirm(`Bạn chắc chắn muốn ${user.status ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
    toggleUserStatus(user)
  }
}

const toggleUserStatus = async (user) => {
  try {
    await taiKhoanService.toggleStatus(user.id)
    showSuccess('Thay đổi trạng thái tài khoản thành công!')
    fetchUsers() // Refresh data
  } catch (error) {
    console.error('Error toggling user status:', error)
    showError('Không thể thay đổi trạng thái: ' + (error.response?.data?.message || error.message))
  }
}

const handleSaveUser = async (userData) => {
  try {
    if (isEditMode.value) {
      await taiKhoanService.updateTaiKhoan(userData.id, userData)
      showSuccess('Cập nhật tài khoản thành công!')
    } else {
      await taiKhoanService.createTaiKhoan(userData)
      showSuccess('Tạo tài khoản thành công!')
    }
    await fetchUsers() // Refresh data
    showEditModal.value = false
  } catch (error) {
    console.error('Error saving user:', error)
    const errorMessage =
      error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu tài khoản'
    showError(errorMessage)
  }
}

const handleSaveAndNew = async () => {
  // Sau khi lưu thành công, form sẽ tự reset trong TaiKhoanForm
  // Chỉ cần refresh danh sách
  try {
  await fetchUsers()
  } catch (error) {
    console.error('Error refreshing users:', error)
  }
}

const handleUserUpdated = () => {
  // Wrap trong try-catch để tránh unhandled promise rejection
  fetchUsers().catch((error) => {
    console.error('Error refreshing users after update:', error)
  })
}

const formatRole = (role) => {
  const roleMap = {
    ADMIN: 'Quản trị viên',
    NHAN_VIEN: 'Nhân viên',
    KHACH_HANG: 'Khách hàng',
  }
  return roleMap[role] || role
}

const roleBadgeClass = (role) => {
  const classMap = {
    ADMIN: 'bg-danger',
    NHAN_VIEN: 'bg-primary',
    KHACH_HANG: 'bg-secondary',
  }
  return classMap[role] || 'bg-light text-dark'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return date
  }
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

const handleTabChange = (tabValue) => {
  activeTab.value = tabValue
  currentPage.value = 1 // Reset về trang đầu khi đổi tab

  // Update breadcrumb trong header
  if (updateBreadcrumbTab) {
    updateBreadcrumbTab(tabValue)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchUsers()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
  // Set breadcrumb tab ban đầu
  if (updateBreadcrumbTab) {
    updateBreadcrumbTab(activeTab.value)
  }
})

// Cleanup khi component unmount
onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
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

/* Tab navigation - Đã được xử lý bởi TabNavigation component */

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

.bs-tooltip-auto[data-popper-placement^='top'] .tooltip-arrow::before,
.bs-tooltip-top .tooltip-arrow::before {
  border-top-color: #2c3e50;
}

/* Custom checkbox for bulk actions */
.custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {
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
