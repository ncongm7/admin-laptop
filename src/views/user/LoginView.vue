<template>
    <div class="login-page">
        <!-- Animated Gradient Background -->
        <div class="animated-bg"></div>
        <!-- Form đăng nhập -->
        <div class="login-container">
            <form @submit.prevent="onLogin" class="login-form glass">
                <div class="brand-logo">
                    <img src="https://cdn-icons-png.flaticon.com/512/6133/6133745.png" alt="Laptop Store" />
                    <h1>
                        <span class="brand-main">Laptop</span><span class="brand-accent">Pro</span>
                    </h1>
                </div>
                <h2 class="form-title">Đăng nhập hệ thống</h2>
                <p class="form-subtitle">Quản lý cửa hàng laptop chuyên nghiệp</p>
                <div v-if="error" class="alert alert-danger">{{ error }}</div>
                <div class="form-floating mb-3 input-group-animate">
                    <input v-model="username" id="username" type="text" class="form-control" placeholder="Tên đăng nhập"
                        required autocomplete="username" />
                    <label for="username">Tên đăng nhập</label>
                    <div class="input-icon">
                        <i class="bi bi-person-fill"></i>
                    </div>
                </div>
                <div class="form-floating mb-4 input-group-animate">
                    <input v-model="password" id="password" type="password" class="form-control" placeholder="Mật khẩu"
                        required autocomplete="current-password" />
                    <label for="password">Mật khẩu</label>
                    <div class="input-icon">
                        <i class="bi bi-lock-fill"></i>
                    </div>
                </div>
                <button :disabled="loading" type="submit" class="btn btn-login w-100 py-3">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                        aria-hidden="true"></span>
                    <span v-else><i class="bi bi-box-arrow-in-right me-2"></i></span>
                    {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
                <div class="login-footer mt-4">
                    <p class="text-muted mb-2">Chưa có tài khoản? <a href="#" class="text-decoration-none">Liên hệ quản
                            trị</a></p>
                    <a href="#" class="text-decoration-none small">Quên mật khẩu?</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const username = ref('')
const password = ref('')
const userStore = useUserStore()
const router = useRouter()
const error = computed(() => userStore.error)
const loading = computed(() => userStore.loading)

const onLogin = async () => {
    const ok = await userStore.login({
        username: username.value,
        password: password.value
    })
    if (ok) {
        router.push('/')
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.login-page {
    min-height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    background: transparent;
}

.animated-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: linear-gradient(120deg, #a4508b 0%, #f7666f 60%, #f9d423 100%);
    background-size: 200% 200%;
    animation: gradientMove 8s ease-in-out infinite;
    filter: blur(2px) brightness(0.95);
}

@keyframes gradientMove {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.login-container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
}

.glass {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 24px;
    box-shadow: 0 8px 40px 0 rgba(164, 80, 139, 0.18), 0 1.5px 8px 0 rgba(249, 212, 35, 0.08);
    backdrop-filter: blur(16px) saturate(1.2);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    padding: 2.5rem 2.25rem 2rem 2.25rem;
    width: 100%;
    max-width: 400px;
    transition: box-shadow 0.3s;
}

.glass:hover {
    box-shadow: 0 12px 48px 0 rgba(164, 80, 139, 0.22), 0 2px 12px 0 rgba(249, 212, 35, 0.13);
}

.brand-logo {
    text-align: center;
    margin-bottom: 2rem;
}

.brand-logo img {
    width: 70px;
    height: 70px;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 2px 8px #f9d42333);
    border-radius: 16px;
    background: #fff;
    padding: 6px;
}

.brand-logo h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #a4508b 0%, #f7666f 60%, #f9d423 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}

.brand-main {
    font-weight: 800;
}

.brand-accent {
    font-weight: 800;
    color: #f9d423;
    background: linear-gradient(90deg, #f9d423 0%, #f7666f 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.form-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.25rem;
    text-align: center;
    letter-spacing: 0.5px;
}

.form-subtitle {
    color: #6c757d;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    font-weight: 500;
}

.input-group-animate {
    position: relative;
    transition: box-shadow 0.2s;
}

.input-group-animate:focus-within {
    box-shadow: 0 0 0 2px #f9d42355;
}

.input-icon {
    position: absolute;
    top: 50%;
    left: 18px;
    transform: translateY(-50%);
    color: #a4508b;
    z-index: 5;
    font-size: 1.2rem;
    pointer-events: none;
}

.form-control {
    padding-left: 48px !important;
    height: 52px;
    border-radius: 12px !important;
    border: 1.5px solid #e0e0e0;
    font-size: 1.05rem;
    background: rgba(255, 255, 255, 0.85);
    transition: border 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    border-color: #f9d423;
    box-shadow: 0 0 0 2px #f9d42333;
    background: #fff;
}

.btn-login {
    font-weight: 700;
    font-size: 1.15rem;
    border-radius: 12px !important;
    background: linear-gradient(90deg, #a4508b 0%, #f7666f 60%, #f9d423 100%);
    border: none;
    color: #fff;
    padding: 0.95rem;
    box-shadow: 0 2px 12px rgba(249, 212, 35, 0.13);
    transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
    letter-spacing: 0.5px;
}

.btn-login:hover,
.btn-login:focus {
    background: linear-gradient(90deg, #f9d423 0%, #f7666f 100%);
    color: #fff;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 24px rgba(249, 212, 35, 0.18);
}

.btn-login:active {
    transform: translateY(0) scale(0.98);
}

.alert-danger {
    border-radius: 10px;
    padding: 0.85rem 1.1rem;
    font-size: 1rem;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #f9d42322 0%, #f7666f22 100%);
    border: none;
    color: #a4508b;
    font-weight: 600;
    text-align: center;
}

.login-footer {
    text-align: center;
    margin-top: 1.5rem;
}

.login-footer a {
    color: #a4508b;
    font-weight: 600;
    transition: color 0.18s, text-decoration 0.18s;
}

.login-footer a:hover {
    color: #f9d423;
    text-decoration: underline;
}

@media (max-width: 600px) {
    .login-container {
        padding: 0;
    }

    .glass {
        padding: 1.5rem 0.5rem 1.5rem 0.5rem;
        border-radius: 16px;
    }

    .brand-logo img {
        width: 54px;
        height: 54px;
    }
}
</style>