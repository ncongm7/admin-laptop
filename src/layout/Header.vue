<template>
    <header class="app-header">
        <!-- Left Section: Logo and Sidebar Toggle -->
        <div class="header-left">
            <button class="sidebar-toggle-btn" @click="toggleSidebar">
                <i class="bi bi-list"></i>
            </button>
            <div class="logo">
                <i class="bi bi-laptop logo-icon"></i>
                <span class="logo-text">Viet<span class="logo-highlight">LapTop</span></span>
            </div>
        </div>

        <!-- Center Section: Global Search -->
        <div class="header-center">
            <div class="global-search">
                <i class="bi bi-search search-icon"></i>
                <input type="text" placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..." />
            </div>
        </div>

        <!-- Right Section: Actions and User Menu -->
        <div class="header-right">
            <button class="header-action-btn">
                <i class="bi bi-bell"></i>
                <span class="badge-dot"></span>
            </button>
            <button class="header-action-btn">
                <i class="bi bi-grid-3x3-gap"></i>
            </button>
            <div class="user-menu dropdown">
                <button class="user-avatar-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img :src="authStore.user?.avatar || 'https://i.pravatar.cc/40'" alt="User Avatar"
                        class="user-avatar" />
                    <div class="user-info">
                        <span class="user-name">{{ authStore.user?.hoTen || 'Nhân viên' }}</span>
                        <span class="user-role">{{ authStore.user?.role || 'Staff' }}</span>
                    </div>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Thông tin cá nhân</a></li>
                    <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Cài đặt</a></li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li><a class="dropdown-item text-danger" @click="logout"><i
                                class="bi bi-box-arrow-right me-2"></i>Đăng xuất</a></li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';

const emit = defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();

const toggleSidebar = () => {
    emit('toggle-sidebar');
};

const logout = () => {
    authStore.logout();
    // Có thể cần chuyển hướng về trang đăng nhập ở đây
    // router.push('/login');
};
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

/* Left */
.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.sidebar-toggle-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #495057;
    cursor: pointer;
}

.logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 1.25rem;
    color: #212529;
}

.logo-icon {
    color: #0d6efd;
    font-size: 1.7rem;
}

.logo-highlight {
    color: #0d6efd;
}

/* Center */
.header-center {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    padding: 0 2rem;
}

.global-search {
    position: relative;
    width: 100%;
    max-width: 450px;
}

.global-search .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.global-search input {
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.75rem;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    background-color: #f8f9fa;
    transition: all 0.2s ease;
}

.global-search input:focus {
    background-color: #fff;
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Right */
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
    transition: background-color 0.2s;
}

.header-action-btn:hover {
    background-color: #f1f3f5;
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
    padding: 4px 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.user-menu .user-avatar-btn:hover {
    background-color: #f1f3f5;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
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
</style>