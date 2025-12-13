<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    @click.self="$emit('close')"
    @mousedown.self="$emit('close')"
    style="overflow: hidden"
  >
    <div
      class="modal-dialog modal-lg modal-dialog-centered"
      role="document"
      @click.stop
      style="max-height: 90vh; display: flex; flex-direction: column"
    >
      <div
        class="modal-content"
        @click.stop
        style="max-height: 90vh; display: flex; flex-direction: column"
      >
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-person-circle"></i>
            Chi tiết {{ user.isStaff ? 'nhân viên' : 'người dùng' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <!-- Avatar & Actions -->
            <div class="col-md-4 text-center">
              <div class="avatar-container mb-3">
                <img
                  :src="getAvatarUrl(user.avatar)"
                  class="avatar-image"
                  alt="Avatar"
                  @error="handleImageError"
                />
              </div>
              <h4 class="user-name">{{ user.name || 'N/A' }}</h4>
              <p class="user-role">
                <span class="badge" :class="getRoleBadgeClass(user.role)">
                  {{ formatRole(user.role) }}
                </span>
              </p>

              <div class="d-grid gap-2 mt-3">
                <button
                  class="btn btn-outline-primary"
                  @click="$emit('edit-user', user)"
                  v-if="user.isStaff"
                >
                  <i class="bi bi-pencil"></i> Chỉnh sửa
                </button>
                <button class="btn btn-outline-warning" @click="openResetPasswordModal">
                  <i class="bi bi-key"></i> Reset mật khẩu
                </button>
                <button class="btn btn-outline-info" @click="loadLoginHistory">
                  <i class="bi bi-clock-history"></i> Lịch sử đăng nhập
                </button>
                <button class="btn btn-outline-danger" @click="confirmToggleStatus">
                  <i class="bi" :class="user.status ? 'bi-lock' : 'bi-unlock'"></i>
                  {{ user.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }}
                </button>
              </div>
            </div>

            <!-- Thông tin chi tiết -->
            <div class="col-md-8">
              <div class="info-section">
                <h6 class="section-title">
                  <i class="bi bi-info-circle"></i>
                  Thông tin cơ bản
                </h6>

                <div class="info-grid">
                  <div class="info-item">
                    <label class="info-label">Email</label>
                    <p class="info-value">{{ user.email || 'N/A' }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Số điện thoại</label>
                    <p class="info-value">{{ user.phone || 'N/A' }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Trạng thái</label>
                    <p class="info-value">
                      <span class="badge" :class="user.status ? 'bg-success' : 'bg-danger'">
                        {{ user.status ? 'Hoạt động' : 'Bị khóa' }}
                      </span>
                    </p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Ngày tạo</label>
                    <p class="info-value">{{ formatDate(user.created_at) }}</p>
                  </div>
                </div>

                <!-- Thông tin đăng nhập (chỉ admin) -->
                <!-- Tạm thời hiển thị để test - sẽ bật lại v-if="isAdmin" sau -->
                <div
                  class="mt-4"
                  style="
                    border-top: 2px solid #e9ecef;
                    padding-top: 20px;
                    background: #f9fafb;
                    border-radius: 8px;
                    padding: 20px;
                  "
                >
                  <div v-if="!isAdmin" class="alert alert-warning mb-3">
                    <i class="bi bi-exclamation-triangle"></i>
                    <strong>Debug:</strong> isAdmin = {{ isAdmin }}, role =
                    {{ authStore.getUserRole }}
                  </div>
                  <h6 class="section-title">
                    <i class="bi bi-key"></i>
                    Thông tin đăng nhập
                  </h6>
                  <div class="login-info-grid">
                    <div class="login-info-item">
                      <label class="login-label">
                        <i class="bi bi-person-badge"></i>
                        Tên đăng nhập
                      </label>
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          :value="displayUsername"
                          readonly
                          :id="'modal-username-' + user.id"
                        />
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          type="button"
                          @click="copyToClipboard(displayUsername, 'modal-username-' + user.id)"
                          title="Copy tên đăng nhập"
                        >
                          <i class="bi bi-clipboard"></i>
                          Copy
                        </button>
                      </div>
                    </div>

                    <div class="login-info-item">
                      <label class="login-label">
                        <i class="bi bi-lock"></i>
                        Mật khẩu
                      </label>
                      <div class="input-group">
                        <input
                          :type="showPassword ? 'text' : 'password'"
                          class="form-control"
                          :value="displayPassword"
                          readonly
                          :id="'modal-password-' + user.id"
                        />
                        <button
                          class="btn btn-outline-secondary btn-sm"
                          type="button"
                          @click="togglePassword"
                          :title="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                        >
                          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                        <button
                          class="btn btn-outline-primary btn-sm"
                          type="button"
                          @click="copyToClipboard(displayPassword, 'modal-password-' + user.id)"
                          title="Copy mật khẩu"
                        >
                          <i class="bi bi-clipboard"></i>
                          Copy
                        </button>
                      </div>
                      <small class="text-muted mt-1 d-block">
                        <i class="bi bi-info-circle"></i>
                        Mật khẩu mặc định: <strong>123456</strong> (nếu chưa đổi)
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Lịch sử đăng nhập -->
                <div v-if="loginHistory" class="mt-4">
                  <h6 class="section-title">
                    <i class="bi bi-clock-history"></i>
                    Lịch sử đăng nhập
                  </h6>
                  <div class="info-item">
                    <label class="info-label">Lần đăng nhập cuối</label>
                    <p class="info-value">
                      {{ formatLoginHistoryDate(loginHistory.lanDangNhapCuoi) }}
                    </p>
                  </div>
                </div>

                <!-- Thông tin nhân viên (nếu có) -->
                <div v-if="user.isStaff" class="mt-4">
                  <h6 class="section-title">
                    <i class="bi bi-briefcase"></i>
                    Thông tin nhân viên
                  </h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <label class="info-label">Chức vụ</label>
                      <p class="info-value">{{ user.position || 'N/A' }}</p>
                    </div>
                    <div class="info-item">
                      <label class="info-label">Địa chỉ</label>
                      <p class="info-value">{{ user.address || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Reset Password -->
        <div
          v-if="showResetPasswordModal"
          class="modal fade show d-block"
          style="
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1060;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          "
          @click.self="showResetPasswordModal = false"
        >
          <div class="modal-dialog modal-dialog-centered" @click.stop>
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-key"></i> Reset mật khẩu</h5>
                <button
                  type="button"
                  class="btn-close"
                  @click="showResetPasswordModal = false"
                ></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Mật khẩu mới <span class="text-danger">*</span></label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                  <small class="text-muted">Mật khẩu mặc định sẽ là: 123456 (nếu để trống)</small>
                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="showResetPasswordModal = false"
                >
                  Hủy
                </button>
                <button type="button" class="btn btn-primary" @click="handleResetPassword">
                  <i class="bi bi-check-circle"></i> Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            <i class="bi bi-x-circle"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/taikhoan/authStore'
import taiKhoanService from '@/service/taikhoan/taiKhoanService.js'
import { useToast } from '@/composables/common/useToast'

const props = defineProps({
  user: {
    type: Object,
    required: true,
    default: () => ({
      avatar: '',
      name: '',
      role: '',
      status: true,
      email: '',
      phone: '',
      created_at: '',
      isStaff: false,
      position: '',
      address: '',
      tenDangNhap: '',
      matKhau: '',
    }),
  },
})

const emit = defineEmits(['close', 'edit-user', 'toggle-status'])

const authStore = useAuthStore()
const { success: showSuccess, error: showError } = useToast()
const showPassword = ref(false)
const showResetPasswordModal = ref(false)
const newPassword = ref('')
const loginHistory = ref(null)
const loadingHistory = ref(false)

const isAdmin = computed(() => {
  const admin = authStore.isAdmin
  const role = authStore.getUserRole
  console.log('🔍 UserDetailModal - isAdmin:', admin, 'role:', role, 'user:', props.user)
  return admin
})

// Computed properties để hiển thị thông tin đăng nhập
const displayUsername = computed(() => {
  // Ưu tiên: tenDangNhap > phone > 'N/A'
  const username = props.user.tenDangNhap || props.user.phone || 'N/A'
  console.log('🔍 displayUsername:', username, 'user object:', props.user)
  return username
})

const displayPassword = computed(() => {
  // Ưu tiên: matKhau > mật khẩu mặc định '123456'
  const password = props.user.matKhau || '123456'
  console.log('🔍 displayPassword:', password ? '***' : 'null', 'user object:', props.user)
  return password
})

function formatRole(role) {
  if (!role) return 'N/A'
  const roleMap = {
    ADMIN: 'Quản trị viên',
    NHAN_VIEN: 'Nhân viên',
    MANAGER: 'Quản lý',
    STAFF: 'Nhân viên',
    CASHIER: 'Thu ngân',
    CUSTOMER: 'Khách hàng',
    KHACH_HANG: 'Khách hàng',
  }
  return roleMap[role] || role
}

function formatDate(date) {
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

function getRoleBadgeClass(role) {
  if (!role) return 'bg-secondary'
  const roleClassMap = {
    ADMIN: 'bg-danger',
    NHAN_VIEN: 'bg-primary',
    MANAGER: 'bg-info',
    STAFF: 'bg-primary',
    CASHIER: 'bg-warning',
    CUSTOMER: 'bg-success',
    KHACH_HANG: 'bg-success',
  }
  return roleClassMap[role] || 'bg-secondary'
}

function getAvatarUrl(avatar) {
  if (!avatar) return '/images/default-avatar.jpg'
  // Nếu là relative URL, thêm base URL
  if (avatar.startsWith('/uploads/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    return `${baseURL}${avatar}`
  }
  return avatar
}

function handleImageError(event) {
  // Tránh vòng lặp vô hạn: nếu đã là default-avatar.jpg thì dùng placeholder
  if (event.target.src && event.target.src.includes('default-avatar.jpg')) {
    // Dùng data URI placeholder để tránh vòng lặp
    event.target.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
    return
  }
  // Nếu chưa phải default-avatar, thử dùng default-avatar
  event.target.src = '/images/default-avatar.jpg'
}

function confirmToggleStatus() {
  if (confirm(`Bạn có chắc muốn ${props.user.status ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
    emit('toggle-status', props.user)
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function copyToClipboard(text, inputId) {
  if (!text || text === 'N/A') {
    alert('Không có dữ liệu để copy')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    const input = document.getElementById(inputId)
    if (input) {
      input.select()
      input.setSelectionRange(0, 99999)
    }
    alert('Đã copy vào clipboard!')
  } catch (err) {
    console.error('Lỗi copy:', err)
    const input = document.getElementById(inputId)
    if (input) {
      input.select()
      input.setSelectionRange(0, 99999)
      alert('Vui lòng copy thủ công (Ctrl+C)')
    }
  }
}

function openResetPasswordModal() {
  newPassword.value = ''
  showResetPasswordModal.value = true
}

async function handleResetPassword() {
  if (!newPassword.value || newPassword.value.trim() === '') {
    newPassword.value = '123456' // Mật khẩu mặc định
  }

  try {
    await taiKhoanService.resetPassword(props.user.id, newPassword.value)
    showSuccess('Reset mật khẩu thành công!')
    showResetPasswordModal.value = false
    // Cập nhật lại mật khẩu trong user object
    props.user.matKhau = newPassword.value
    newPassword.value = ''
  } catch (error) {
    console.error('Error resetting password:', error)
    showError('Không thể reset mật khẩu: ' + (error.response?.data?.message || error.message))
  }
}

async function loadLoginHistory() {
  if (loadingHistory.value) return

  try {
    loadingHistory.value = true
    const response = await taiKhoanService.getLoginHistory(props.user.id)
    loginHistory.value = response?.data || null
    if (!loginHistory.value) {
      showError('Không có lịch sử đăng nhập')
    }
  } catch (error) {
    console.error('Error loading login history:', error)
    showError(
      'Không thể tải lịch sử đăng nhập: ' + (error.response?.data?.message || error.message),
    )
  } finally {
    loadingHistory.value = false
  }
}

function formatLoginHistoryDate(dateString) {
  if (!dateString || dateString === 'Chưa có lịch sử đăng nhập') {
    return 'Chưa có lịch sử đăng nhập'
  }
  try {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-dialog {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: 1.75rem auto;
}

.modal-header {
  background: linear-gradient(135deg, #2d7458 0%, #396e7c 100%);
  color: #fff;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
  border-bottom: none;
}

.modal-title {
  font-weight: 700;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title i {
  font-size: 1.5rem;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar cho modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #2d7458;
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #25634d;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.user-role {
  margin-bottom: 0;
}

.section-title {
  font-weight: 700;
  color: #2d7458;
  font-size: 1.1rem;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  font-size: 1.2rem;
  color: #396e7c;
}

.info-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1rem;
  color: #111827;
  margin: 0;
  font-weight: 500;
}

.login-info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d7458;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-label i {
  font-size: 1.1rem;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group .form-control {
  flex: 1;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  padding: 10px 14px;
  font-size: 0.95rem;
  background: #f9fafb;
}

.input-group .btn {
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.875rem;
}

.input-group .btn-sm {
  padding: 8px 12px;
  font-size: 0.8rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 16px 24px;
  flex-shrink: 0;
}

.modal-header {
  flex-shrink: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6b7280;
  color: #fff;
  border: none;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-outline-primary {
  border: 2px solid #2d7458;
  color: #2d7458;
}

.btn-outline-primary:hover {
  background: #2d7458;
  color: #fff;
}

.btn-outline-danger {
  border: 2px solid #dc2626;
  color: #dc2626;
}

.btn-outline-danger:hover {
  background: #dc2626;
  color: #fff;
}

.badge {
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .avatar-image {
    width: 120px;
    height: 120px;
  }
}
</style>
