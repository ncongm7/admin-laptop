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

        <!-- Middle Section: Pending Order Ticker -->
        <div class="header-middle">
            <PendingOrderTicker />
        </div>

        <!-- Right Section: Actions and User Menu -->
        <div class="header-right">
            <button class="header-action-btn notification-btn" title="Thông báo" @click="toggleNotificationDropdown">
                <i class="bi bi-bell"></i>
                <span v-if="notificationCount > 0" class="badge-count">{{ notificationCount > 99 ? '99+' :
                    notificationCount }}</span>
                <span v-else class="badge-dot"></span>
            </button>
            <!-- Notification Dropdown -->
            <div v-if="showNotificationDropdown" class="notification-dropdown">
                <div class="notification-header">
                    <h6>Thông báo</h6>
                    <button @click="clearNotifications" class="btn-clear">Xóa tất cả</button>
                </div>
                <div class="notification-list">
                    <div v-if="notifications.length === 0" class="notification-empty">
                        Không có thông báo mới
                    </div>
                    <div v-for="(notification, index) in notifications" :key="index" class="notification-item"
                        @click="handleNotificationClick(notification)">
                        <div class="notification-content">
                            <div class="notification-title">{{ notification.title || 'Thông báo mới' }}</div>
                            <div class="notification-message">{{ notification.message || notification.body || '' }}
                            </div>
                            <div class="notification-time">{{ formatTime(notification.timestamp || notification.time) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
import { ref, provide, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import PendingOrderTicker from '@/components/common/PendingOrderTicker.vue'
import socketService from '@/service/socketService'

const emit = defineEmits(['toggle-sidebar'])
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Current tab state (để truyền vào breadcrumb)
const currentTab = ref(null)

// Provide để các component con có thể update tab
provide('updateBreadcrumbTab', (tab) => {
    currentTab.value = tab
})

// Notification state
const showNotificationDropdown = ref(false)
const notifications = ref([])
const notificationCount = computed(() => notifications.value.length)

// Toggle notification dropdown
const toggleNotificationDropdown = () => {
    showNotificationDropdown.value = !showNotificationDropdown.value
}

// Clear all notifications
const clearNotifications = () => {
    notifications.value = []
}

// Handle notification click
const handleNotificationClick = (notification) => {
    // Xử lý khi click vào thông báo
    if (notification.url) {
        router.push(notification.url)
    }
    // Xóa thông báo đã xem
    const index = notifications.value.indexOf(notification)
    if (index > -1) {
        notifications.value.splice(index, 1)
    }
}

// Format time
const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

// Socket event handlers
const handleSocketNotification = (event) => {
    const data = event.detail
    notifications.value.unshift({
        title: data.title || 'Thông báo mới',
        message: data.message || data.body || '',
        timestamp: data.timestamp || new Date().toISOString(),
        url: data.url || null,
        type: data.type || 'info'
    })

    // Giới hạn số lượng thông báo
    if (notifications.value.length > 50) {
        notifications.value = notifications.value.slice(0, 50)
    }

    // Hiển thị dropdown nếu đang đóng
    if (!showNotificationDropdown.value) {
        showNotificationDropdown.value = true
        // Tự động đóng sau 5 giây
        setTimeout(() => {
            showNotificationDropdown.value = false
        }, 5000)
    }
}

const handleSocketOrderUpdate = (event) => {
    const data = event.detail
    notifications.value.unshift({
        title: 'Cập nhật đơn hàng',
        message: `Đơn hàng ${data.orderCode || data.ma || 'mới'} đã được cập nhật`,
        timestamp: new Date().toISOString(),
        url: data.url || `/quan-li-hoa-don/${data.orderId || data.id}`,
        type: 'order'
    })
}

const handleOpenInvoiceDetail = (event) => {
    const detail = event?.detail || {}
    const orderId = detail.orderId || detail.idHoaDon || detail.id || null
    const orderCode = detail.orderCode || detail.ma || null

    if (route.name === 'QuanLiHoaDon') {
        return
    }

    if (!orderId && !orderCode) {
        return
    }

    const query = {
        _invoiceTs: Date.now().toString()
    }

    if (orderId) {
        query.openInvoiceId = orderId
    }

    if (orderCode) {
        query.openInvoiceCode = orderCode
    }

    router.push({ name: 'QuanLiHoaDon', query }).catch(() => { })
}

// Subscribe to socket events
onMounted(() => {
    // Lắng nghe custom events từ socket
    window.addEventListener('socket-notification', handleSocketNotification)
    window.addEventListener('socket-order-update', handleSocketOrderUpdate)
    window.addEventListener('open-invoice-detail', handleOpenInvoiceDetail)

    // Click outside để đóng dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-btn') && !e.target.closest('.notification-dropdown')) {
            showNotificationDropdown.value = false
        }
    })
})

onUnmounted(() => {
    window.removeEventListener('socket-notification', handleSocketNotification)
    window.removeEventListener('socket-order-update', handleSocketOrderUpdate)
    window.removeEventListener('open-invoice-detail', handleOpenInvoiceDetail)
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
    flex: 0 0 auto;
}

/* Middle Section */
.header-middle {
    flex: 1 1 0;
    min-width: 0;
    margin: 0 16px;
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
    flex: 0 0 auto;
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

.badge-count {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background-color: #dc3545;
    color: #fff;
    border-radius: 9px;
    font-size: 0.7rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
}

.notification-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 360px;
    max-height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1050;
    display: flex;
    flex-direction: column;
}

.notification-header {
    padding: 16px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-header h6 {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
}

.btn-clear {
    background: none;
    border: none;
    color: #2D7458;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
}

.btn-clear:hover {
    background: #f1f3f5;
}

.notification-list {
    overflow-y: auto;
    max-height: 400px;
}

.notification-empty {
    padding: 40px 20px;
    text-align: center;
    color: #6c757d;
    font-size: 0.9rem;
}

.notification-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f5;
    cursor: pointer;
    transition: background 0.2s;
}

.notification-item:hover {
    background: #f8f9fa;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.notification-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: #212529;
}

.notification-message {
    font-size: 0.85rem;
    color: #6c757d;
    line-height: 1.4;
}

.notification-time {
    font-size: 0.75rem;
    color: #adb5bd;
    margin-top: 4px;
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
