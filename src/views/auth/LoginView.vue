<template>
    <div class="login-container">
        <div class="login-card">
            <!-- Logo và Tiêu đề -->
            <div class="login-header">
                <div class="logo">
                    <img :src="logoPlaceholder" alt="VietLapTop Logo" class="logo-image" />
                </div>
                <h1 class="brand-name">VietLapTop</h1>
                <p class="brand-tagline">Hệ thống quản lý bán hàng</p>
            </div>

            <!-- Form đăng nhập -->
            <form @submit.prevent="handleLogin" class="login-form">
                <!-- Thông báo lỗi -->
                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    {{ errorMessage }}
                </div>

                <!-- Input Tên đăng nhập -->
                <div class="form-group">
                    <label for="tenDangNhap" class="form-label">
                        <i class="bi bi-person-circle"></i> Tên đăng nhập
                    </label>
                    <div class="input-wrapper">
                        <i class="bi bi-person input-icon"></i>
                        <input type="text" id="tenDangNhap" class="form-control" placeholder="Nhập tên đăng nhập"
                            v-model="tenDangNhap" :disabled="isLoading" required autofocus />
                    </div>
                </div>

                <!-- Input Mật khẩu -->
                <div class="form-group">
                    <label for="matKhau" class="form-label">
                        <i class="bi bi-shield-lock"></i> Mật khẩu
                    </label>
                    <div class="input-wrapper">
                        <i class="bi bi-lock input-icon"></i>
                        <input :type="showPassword ? 'text' : 'password'" id="matKhau" class="form-control"
                            placeholder="Nhập mật khẩu" v-model="matKhau" :disabled="isLoading" required />
                        <button type="button" class="password-toggle" @click="showPassword = !showPassword"
                            :disabled="isLoading">
                            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                    </div>
                </div>

                <!-- Nút Đăng nhập -->
                <button type="submit" class="btn btn-login" :disabled="isLoading || !tenDangNhap || !matKhau">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <span v-if="isLoading">Đang đăng nhập...</span>
                    <span v-else>
                        <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập
                    </span>
                </button>
            </form>

            <!-- Footer -->
            <div class="login-footer">
                <p class="text-muted small mb-0">
                    © 2024 VietLapTop. Phát triển bởi Team Dev
                </p>
            </div>
        </div>

        <!-- Background decoration -->
        <div class="bg-decoration bg-decoration-1"></div>
        <div class="bg-decoration bg-decoration-2"></div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getPlaceholderImage } from '@/utils/imagePlaceholder'

const router = useRouter()
const authStore = useAuthStore()

// State
const tenDangNhap = ref('')
const matKhau = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Logo placeholder
const logoPlaceholder = getPlaceholderImage(80, 80, 'VLT')

/**
 * Xử lý đăng nhập
 */
const handleLogin = async () => {
    // Xóa thông báo lỗi cũ
    errorMessage.value = ''

    // Validate
    if (!tenDangNhap.value || !matKhau.value) {
        errorMessage.value = 'Vui lòng nhập đầy đủ thông tin'
        return
    }

    isLoading.value = true

    try {
        // Gọi action login từ authStore
        await authStore.login({
            tenDangNhap: tenDangNhap.value.trim(),
            matKhau: matKhau.value
        })

        // Đăng nhập thành công, chuyển về trang chủ
        router.push('/')
    } catch (error) {
        console.error('Lỗi đăng nhập:', error)

        // Hiển thị thông báo lỗi
        errorMessage.value = error.response?.data?.message ||
            error.response?.data?.error ||
            authStore.error ||
            'Tên đăng nhập hoặc mật khẩu không chính xác'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
/* Container */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8f0f3 100%);
    position: relative;
    overflow: hidden;
}

/* Background decorations */
.bg-decoration {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    pointer-events: none;
}

.bg-decoration-1 {
    width: 500px;
    height: 500px;
    background: #2D7458;
    top: -250px;
    right: -250px;
}

.bg-decoration-2 {
    width: 400px;
    height: 400px;
    background: #396E7C;
    bottom: -200px;
    left: -200px;
}

/* Login Card */
.login-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    padding: 3rem;
    width: 100%;
    max-width: 450px;
    position: relative;
    z-index: 1;
    animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.login-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.logo {
    display: inline-block;
    margin-bottom: 1rem;
}

.logo-image {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(45, 116, 88, 0.2);
}

.brand-name {
    font-size: 2rem;
    font-weight: 700;
    color: #2D7458;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
}

.brand-tagline {
    color: #6c757d;
    font-size: 0.95rem;
    margin: 0;
}

/* Form */
.login-form {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.form-label i {
    color: #2D7458;
    margin-right: 0.25rem;
}

/* Input wrapper */
.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 1.1rem;
    pointer-events: none;
    z-index: 1;
}

.form-control {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
}

.form-control:focus {
    outline: none;
    border-color: #2D7458;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(45, 116, 88, 0.1);
}

.form-control:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
}

.form-control::placeholder {
    color: #adb5bd;
}

/* Password toggle */
.password-toggle {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.1rem;
    transition: color 0.2s;
}

.password-toggle:hover:not(:disabled) {
    color: #2D7458;
}

.password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* Button */
.btn-login {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(45, 116, 88, 0.3);
}

.btn-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(45, 116, 88, 0.4);
}

.btn-login:active:not(:disabled) {
    transform: translateY(0);
}

.btn-login:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

/* Alert */
.alert {
    padding: 0.875rem 1rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    animation: shake 0.5s;
}

.alert-danger {
    background-color: #ffe6e6;
    border: 1px solid #ffcccc;
    color: #dc3545;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    10%,
    30%,
    50%,
    70%,
    90% {
        transform: translateX(-5px);
    }

    20%,
    40%,
    60%,
    80% {
        transform: translateX(5px);
    }
}

/* Footer */
.login-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e9ecef;
}

/* Responsive */
@media (max-width: 576px) {
    .login-card {
        padding: 2rem 1.5rem;
    }

    .brand-name {
        font-size: 1.75rem;
    }

    .form-control {
        padding: 0.75rem 1rem 0.75rem 2.75rem;
    }

    .btn-login {
        padding: 0.875rem;
    }
}
</style>
