<template>
    <header class="app-header">
        <!-- Left Section: Logo, Toggle, and Breadcrumbs -->
        <div class="header-left">
            <button class="sidebar-toggle-btn" @click="toggleSidebar">
                <i class="bi bi-list"></i>
            </button>
            <div class="logo">
                <i class="bi bi-laptop logo-icon"></i>
                <span class="logo-text">Viet<span class="logo-highlight">LapTop</span></span>
            </div>
            <!-- Breadcrumbs -->
            <Breadcrumbs :current-tab="currentTab" />
        </div>

        <!-- Right Section: Actions and User Menu -->
        <div class="header-right">
            <button class="header-action-btn notification-btn" title="Thông báo">
                <i class="bi bi-bell"></i>
                <span class="badge-dot"></span>
            </button>
            <div class="user-menu dropdown">
                <button class="user-avatar-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img :src="getAvatarUrl(authStore.user?.avatar)" alt="User Avatar" class="user-avatar" />
                    <div class="user-info">
                        <span class="user-name">{{ displayUserName }}</span>
                        <span class="user-role">{{ displayUserRole }}</span>
                    </div>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="">
                            <i class="bi bi-person me-2"></i>Thông tin cá nhân
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" @click.prevent="">
                            <i class="bi bi-gear me-2"></i>Cài đặt
                        </a>
                    </li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li>
                        <a class="dropdown-item text-danger" @click.prevent="logout">
                            <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const authStore = useAuthStore()

// Current tab state (để truyền vào breadcrumb)
const currentTab = ref(null)

// Provide để các component con có thể update tab
provide('updateBreadcrumbTab', (tab) => {
    currentTab.value = tab
})

// Computed properties để hiển thị thông tin user
const displayUserName = computed(() => {
    return authStore.getUserName || 'Nhân viên'
})

const displayUserRole = computed(() => {
    const role = authStore.getUserRole
    if (!role) return 'Nhân viên'

    // Format role để hiển thị đẹp
    const roleMap = {
        'ADMIN': 'Quản trị viên',
        'NHAN_VIEN': 'Nhân viên',
        'KHACH_HANG': 'Khách hàng',
        'STAFF': 'Nhân viên',
        'MANAGER': 'Quản lý',
        'CASHIER': 'Thu ngân',
        'Quản trị viên': 'Quản trị viên',
        'Nhân viên': 'Nhân viên',
        'Khách hàng': 'Khách hàng'
    }

    return roleMap[role] || role
})

function getAvatarUrl(avatar) {
    if (!avatar) return 'https://i.pravatar.cc/40'

    // Nếu là relative URL, thêm base URL
    if (avatar.startsWith('/uploads/')) {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
        return `${baseURL}${avatar}`
    }

    // Nếu là base64 hoặc full URL, trả về trực tiếp
    return avatar
}

const toggleSidebar = () => {
    emit('toggle-sidebar')
}

const logout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        await authStore.logout()
        router.push('/login')
    }
}
</script>

<style scoped>
.app-header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-bottom: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 1020;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Left Section */
.header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1;
}

.sidebar-toggle-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #495057;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.sidebar-toggle-btn:hover {
    background-color: #f1f3f5;
    color: #2D7458;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 1.25rem;
    color: #212529;
    white-space: nowrap;
}

.logo-icon {
    color: #2D7458;
    font-size: 1.7rem;
}

.logo-highlight {
    color: #396E7C;
}

/* Right Section */
.header-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-action-btn {
    position: relative;
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #495057;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s ease;
    cursor: pointer;
}

.header-action-btn:hover {
    background-color: #f1f3f5;
    color: #2D7458;
}

.badge-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background-color: #dc3545;
    border-radius: 50%;
    border: 2px solid #fff;
}

.user-menu .user-avatar-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 4px 12px 4px 8px;
    border-radius: 10px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.user-menu .user-avatar-btn:hover {
    background-color: #f1f3f5;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #212529;
}

.user-role {
    font-size: 0.75rem;
    color: #6c757d;
}

.dropdown-icon {
    font-size: 0.8rem;
    color: #6c757d;
}

/* Dropdown Menu */
.dropdown-menu {
    min-width: 220px;
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 8px;
    margin-top: 8px;
}

.dropdown-item {
    padding: 10px 16px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
    color: #2D7458;
}

.dropdown-item i {
    font-size: 1rem;
}

.dropdown-divider {
    margin: 8px 0;
}

.dropdown-item.text-danger {
    color: #dc3545;
}

.dropdown-item.text-danger:hover {
    background-color: #fff5f5;
    color: #dc3545;
}

/* Responsive */
@media (max-width: 991px) {
    .header-left {
        gap: 12px;
    }

    .logo {
        font-size: 1.1rem;
    }

    .logo-icon {
        font-size: 1.5rem;
    }
}

@media (max-width: 768px) {
    .app-header {
        padding: 0 16px;
    }

    .user-info {
        display: none;
    }
}
</style>
