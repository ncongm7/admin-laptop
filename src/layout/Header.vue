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
    min-height: 56px;
    position: sticky;
    top: 0;
    z-index: 300;
    background: #22c55e;
    box-shadow: 0 2px 8px #22c55e22;
    color: #fff;
    font-size: 0.97rem;
    backdrop-filter: blur(6px);
}

.navbar-brand,
.brand-gradient {
    color: #fff !important;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 1px;
    background: none !important;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: unset;
}

.theme-btn {
    font-size: 1.1rem;
    background: #fff;
    color: #22c55e;
    border: none;
    box-shadow: 0 1px 4px #22c55e11;
    transition: background 0.18s, color 0.18s;
}

.theme-btn:hover {
    background: #e8fbe9;
    color: #22c55e;
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
    background: #22c55e;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 4px #22c55e99;
}

.user-role {
    font-size: 0.82rem;
    color: #22c55e;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.avatar-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px #22c55e13;
    transition: box-shadow 0.18s, border 0.18s;
}

.avatar-img:hover {
    box-shadow: 0 4px 16px #22c55e18;
    border: 2px solid #22c55e;
}

.notif-btn {
    background: #fff;
    color: #22c55e;
    transition: box-shadow 0.18s, background 0.18s;
}

.notif-btn:hover {
    background: #e8fbe9;
    color: #22c55e;
    box-shadow: 0 2px 8px #22c55e13;
}

.notif-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.7em;
    padding: 3px 6px;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px #22c55e13;
}

.dropdown-toggle {
    background: #fff;
    color: #22c55e;
    font-weight: 500;
    transition: background 0.18s, box-shadow 0.18s, color 0.18s;
}

.dropdown-toggle:hover {
    background: #e8fbe9;
    color: #22c55e;
}

.dropdown-menu {
    min-width: 180px;
    border-radius: 10px;
    box-shadow: 0 4px 16px #22c55e10;
    padding: 8px 0;
    font-size: 0.97rem;
}

.dropdown-item {
    padding: 9px 18px;
    transition: background 0.15s, color 0.15s;
    color: #222;
}

.dropdown-item:hover {
    background: #e8fbe9;
    color: #22c55e;
}
</style>
