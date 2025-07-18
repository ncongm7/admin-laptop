<template>
    <header class="header shadow-sm d-flex align-items-center justify-content-between px-3 py-2 bg-gradient">
        <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-light d-md-none me-2" @click="$emit('toggle-sidebar')">
                <i class="bi bi-list fs-4"></i>
            </button>
            <router-link to="/" class="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2">
                <i class="bi bi-laptop fs-3 text-primary"></i>
                <span class="brand-gradient">LaptopShop</span>
            </router-link>
        </div>
        <div class="d-flex align-items-center gap-3">
            <!-- Theme switch -->
            <button class="btn btn-light rounded-circle theme-btn" @click="toggleTheme">
                <i :class="isDark ? 'bi bi-moon-stars-fill' : 'bi bi-brightness-high-fill'"></i>
            </button>
            <!-- Notification -->
            <div class="position-relative me-2">
                <button class="btn btn-light position-relative shadow-sm rounded-circle p-2 notif-btn">
                    <i class="bi bi-bell fs-5"></i>
                    <span class="badge bg-danger rounded-circle notif-badge">3</span>
                </button>
            </div>
            <!-- User dropdown -->
            <div v-if="user" class="dropdown">
                <button
                    class="btn btn-light dropdown-toggle d-flex align-items-center gap-2 shadow-sm rounded-pill px-3 py-2"
                    type="button" data-bs-toggle="dropdown">
                    <span class="avatar-wrapper">
                        <img :src="user.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'"
                            class="avatar-img me-2" alt="avatar" />
                        <span class="badge-online"></span>
                    </span>
                    <span class="d-none d-md-inline fw-semibold">{{ user.ten || user.username || 'Admin' }}</span>
                    <span class="user-role ms-2">{{ user.role || 'Admin' }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><router-link class="dropdown-item" to="/profile">Thông tin cá nhân</router-link></li>
                    <li><router-link class="dropdown-item" to="/change-password">Đổi mật khẩu</router-link></li>
                    <li>
                        <hr class="dropdown-divider" />
                    </li>
                    <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">Đăng xuất</a></li>
                </ul>
            </div>
            <div v-else>
                <router-link to="/login" class="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                    <i class="bi bi-box-arrow-in-right me-2"></i> Đăng nhập
                </router-link>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const router = useRouter()
const user = computed(() => userStore.user)

const isDark = ref(false)
const toggleTheme = () => {
    isDark.value = !isDark.value
    document.body.classList.toggle('dark-theme', isDark.value)
}

const handleLogout = () => {
    userStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.header {
    min-height: 60px;
    position: sticky;
    top: 0;
    z-index: 300;
    background: linear-gradient(90deg, #a4508b 0%, #f7666f 60%, #f9d423 100%);
    box-shadow: 0 2px 12px rgba(164, 80, 139, 0.10);
    backdrop-filter: blur(8px);
}

.theme-btn {
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.85);
    border: none;
    box-shadow: 0 1px 4px rgba(249, 212, 35, 0.10);
    transition: background 0.18s;
}

.theme-btn:hover {
    background: #ffe484;
    color: #a4508b;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
}

.badge-online {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: #4cd964;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 4px #4cd96499;
}

.user-role {
    font-size: 0.85rem;
    color: #f9d423;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.bg-gradient {
    background: linear-gradient(90deg, #a4508b 0%, #f7666f 60%, #f9d423 100%) !important;
}

.brand-gradient {
    background: linear-gradient(90deg, #fff 30%, #f9d423 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    letter-spacing: 1px;
}

.avatar-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(164, 80, 139, 0.13);
    transition: box-shadow 0.18s, border 0.18s;
}

.avatar-img:hover {
    box-shadow: 0 4px 16px rgba(249, 212, 35, 0.18);
    border: 2px solid #f9d423;
}

.notif-btn {
    background: rgba(255, 255, 255, 0.85);
    transition: box-shadow 0.18s, background 0.18s;
}

.notif-btn:hover {
    background: #ffe484;
    box-shadow: 0 2px 12px rgba(249, 212, 35, 0.13);
}

.notif-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.7em;
    padding: 3px 6px;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(249, 212, 35, 0.13);
}

.dropdown-toggle {
    background: rgba(255, 255, 255, 0.85);
    border: none;
    font-weight: 500;
    transition: background 0.18s, box-shadow 0.18s;
}

.dropdown-toggle:hover {
    background: #ffe484;
    color: #a4508b;
}

.dropdown-menu {
    min-width: 180px;
    border-radius: 10px;
    box-shadow: 0 4px 24px rgba(164, 80, 139, 0.10);
    padding: 8px 0;
    font-size: 1rem;
}

.dropdown-item {
    padding: 10px 20px;
    transition: background 0.15s, color 0.15s;
}

.dropdown-item:hover {
    background: #ffe484;
    color: #a4508b;
}

.btn-outline-light {
    border: 2px solid #fff;
    color: #fff;
    background: transparent;
    transition: background 0.18s, color 0.18s, border 0.18s;
}

.btn-outline-light:hover {
    background: #fff;
    color: #a4508b;
    border: 2px solid #f9d423;
}
</style>
