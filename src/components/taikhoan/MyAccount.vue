<template>
  <div class="my-account-wrapper">
    <div class="account-header">
      <h2 class="page-title">
        <i class="bi bi-person-circle"></i>
        Thông tin tài khoản của tôi
      </h2>
      <!-- <p class="page-subtitle">Xem và quản lý thông tin tài khoản của bạn</p> -->
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else-if="accountInfo" class="account-content">
      <!-- Avatar Section -->
      <div class="card mb-4">
        <div class="card-body text-center">
          <div class="avatar-section mb-3">
            <img :src="getAvatarUrl(accountInfo.avatar)" class="avatar-large" alt="Avatar" @error="handleImageError">
          </div>
          <h3 class="mb-1">{{ accountInfo.name || 'N/A' }}</h3>
          <p class="text-muted mb-0">{{ accountInfo.position || 'Nhân viên' }}</p>
        </div>
      </div>

      <!-- Thông tin cơ bản -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-info-circle"></i>
            Thông tin cơ bản
          </h5>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">Email</label>
              <p class="info-value">{{ accountInfo.email || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <label class="info-label">Số điện thoại</label>
              <p class="info-value">{{ accountInfo.phone || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <label class="info-label">Chức vụ</label>
              <p class="info-value">{{ accountInfo.position || 'N/A' }}</p>
            </div>
            <div class="info-item">
              <label class="info-label">Địa chỉ</label>
              <p class="info-value">{{ accountInfo.address || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin đăng nhập (Quan trọng) -->
      <div class="card mb-4 border-primary">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">
            <i class="bi bi-key"></i>
            Thông tin đăng nhập hệ thống
          </h5>
        </div>
        <div class="card-body">
          <div class="alert alert-info" role="alert">
            <i class="bi bi-info-circle"></i>
            Sử dụng thông tin này để đăng nhập vào hệ thống. Bạn có thể copy để sử dụng.
          </div>

          <div class="login-info-grid">
            <div class="login-info-item">
              <label class="login-label">
                <i class="bi bi-person-badge"></i>
                Tên đăng nhập
              </label>
              <div class="input-group">
                <input type="text" class="form-control" :value="accountInfo.tenDangNhap || 'N/A'" readonly
                  :id="'username-input'">
                <button class="btn btn-outline-secondary" type="button"
                  @click="copyToClipboard(accountInfo.tenDangNhap, 'username-input')" title="Copy tên đăng nhập">
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
                <input :type="showPassword ? 'text' : 'password'" class="form-control"
                  :value="accountInfo.matKhau || 'N/A'" readonly :id="'password-input'">
                <button class="btn btn-outline-secondary" type="button" @click="togglePassword"
                  :title="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
                <button class="btn btn-outline-primary" type="button"
                  @click="copyToClipboard(accountInfo.matKhau, 'password-input')" title="Copy mật khẩu">
                  <i class="bi bi-clipboard"></i>
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import axiosInstance from '@/service/axiosInstance'

const authStore = useAuthStore()
const accountInfo = ref(null)
const loading = ref(true)
const error = ref(null)
const showPassword = ref(false)

onMounted(async () => {
  await fetchMyAccount()
})

async function fetchMyAccount() {
  loading.value = true
  error.value = null

  try {
    const response = await axiosInstance.get('/api/users/me')
    if (response.data && response.data.data) {
      accountInfo.value = response.data.data
    } else {
      accountInfo.value = response.data
    }
  } catch (err) {
    console.error('Lỗi tải thông tin tài khoản:', err)
    error.value = err.response?.data?.message || 'Không thể tải thông tin tài khoản. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

function getAvatarUrl(avatar) {
  if (!avatar) return '/images/default-avatar.jpg'
  if (avatar.startsWith('/uploads/')) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    return `${baseURL}${avatar}`
  }
  return avatar
}

function handleImageError(event) {
  event.target.src = '/images/default-avatar.jpg'
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
    // Copy to clipboard
    await navigator.clipboard.writeText(text)

    // Visual feedback
    const input = document.getElementById(inputId)
    if (input) {
      input.select()
      input.setSelectionRange(0, 99999) // For mobile devices
    }

    // Show success message
    alert('Đã copy vào clipboard!')
  } catch (err) {
    console.error('Lỗi copy:', err)
    // Fallback: Select text
    const input = document.getElementById(inputId)
    if (input) {
      input.select()
      input.setSelectionRange(0, 99999)
      alert('Vui lòng copy thủ công (Ctrl+C)')
    }
  }
}
</script>

<style scoped>
.my-account-wrapper {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.account-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D7458;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  font-size: 2rem;
  color: #396E7C;
}

.page-subtitle {
  color: #6b7280;
  margin-bottom: 0;
}

.account-content {
  max-width: 900px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  justify-content: center;
}

.avatar-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card {
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  padding: 16px 20px;
  font-weight: 600;
}

.card-header h5 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2D7458;
}

.card-header.bg-primary h5 {
  color: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  color: #2D7458;
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
  padding: 12px 16px;
  font-size: 1rem;
  background: #f9fafb;
}

.input-group .btn {
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  white-space: nowrap;
}

.alert {
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.alert-info {
  background: #e0f2fe;
  border-color: #0ea5e9;
  color: #0c4a6e;
}

@media (max-width: 768px) {
  .my-account-wrapper {
    padding: 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .input-group {
    flex-direction: column;
  }

  .input-group .btn {
    width: 100%;
  }
}
</style>
