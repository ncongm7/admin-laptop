<template>
    <aside :class="['sidebar', { 'sidebar-collapsed': collapsed, 'sidebar-hidden': isMobile && !showSidebar }]">

        <nav class="sidebar-menu">
            <ul class="nav flex-column">
                <MenuItem icon="bi-house" label="Trang chủ" to="/" />
                <MenuItem icon="bi-cart" label="Bán Hàng" to="/ban-hang" />
                <MenuItem icon="bi-receipt" label="Quản lý hóa đơn" to="/quan-li-hoa-don" />
                <MenuItem icon="bi-box-seam" label="Quản lý sản phẩm">
                <MenuItem icon="bi-grid" label="Danh sách sản phẩm" to="/quan-li-san-pham" sub />
                <MenuItem icon="bi-list-check" label="Tất cả chi tiết sản phẩm" to="/product-variants" sub />
                </MenuItem>
                <MenuItem icon="bi-people" label="Quản lý tài khoản & người dùng" to="/quan-li-tai-khoan" />
                <MenuItem icon="bi-percent" label="Quản lý giảm giá" ref="discountMenu">
                    <MenuItem icon="bi-tags" label="Quản lý đợt giảm giá" to="/quan-li-giam-gia" sub @submenu-click="handleSubmenuClick" />
                    <MenuItem icon="bi-ticket-perforated" label="Quản lý phiếu giảm giá" to="/quan-li-phieu-giam-gia" sub @submenu-click="handleSubmenuClick" />
                </MenuItem>
                <MenuItem icon="bi-arrow-counterclockwise" label="Quản lý trả hàng" to="/quan-li-tra-hang" />
                <MenuItem icon="bi-shield-check" label="Quản lý bảo hành" to="/quan-li-bao-hanh" />
                <MenuItem icon="bi-bar-chart" label="Thống kê" to="/thong-ke" />
                <MenuItem icon="bi-bell" label="Quản lý thông báo" to="/quan-li-thong-bao" />
                <MenuItem icon="bi-gear" label="Quản lý hệ thống" to="/quan-li-he-thong" />
            </ul>
        </nav>
        <div class="sidebar-footer p-3 mt-auto d-flex align-items-center">
            <i class="bi bi-person-circle me-2"></i>
            <span>Admin</span>
        </div>
    </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MenuItem from './MenuItem.vue'
const collapsed = ref(false)
const showSidebar = ref(true)
const isMobile = ref(false)
const discountMenu = ref(null)

const toggleSidebar = () => (showSidebar.value = !showSidebar.value)

const handleSubmenuClick = () => {
    // Chuyển menu từ hover state sang click state
    if (discountMenu.value) {
        // Trigger click state cho parent menu
        discountMenu.value.open = true
        discountMenu.value.isHovered = false
    }
}

function handleResize() {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value) showSidebar.value = false
    else showSidebar.value = true
}
onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* ======= PHONG CÁCH APPLE ======= */
.sidebar {
    width: 240px;
    background: #f8f8f8;
    border-right: 1px solid #e0e0e0;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(.4, 2, .6, 1), box-shadow 0.2s;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
    color: #222;
    border-radius: 16px 0 0 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sidebar-collapsed {
    width: 0;
    overflow: hidden;
    box-shadow: none;
}

.sidebar-hidden {
    display: none !important;
}

.sidebar-menu {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding-top: 10px;
}

.sidebar-menu .nav {
    gap: 4px;
}

.sidebar-menu .nav :deep(.menu-item) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-radius: 10px;
    color: #222;
    font-weight: 500;
    font-size: 1.05rem;
    background: transparent;
    transition: background 0.18s, color 0.18s, border-left 0.18s;
    cursor: pointer;
    border-left: 4px solid transparent;
}

.sidebar-menu .nav :deep(.menu-item.active),
.sidebar-menu .nav :deep(.menu-item.router-link-exact-active) {
    background: #e5f1fb;
    color: #007aff;
    border-left: 4px solid #007aff;
}

.sidebar-menu .nav :deep(.menu-item:hover) {
    background: #e9e9eb;
    color: #007aff;
}

.sidebar-menu .nav :deep(.menu-item i) {
    font-size: 1.25em;
    color: #888;
    transition: color 0.18s;
}

.sidebar-menu .nav :deep(.menu-item.active i),
.sidebar-menu .nav :deep(.menu-item.router-link-exact-active i),
.sidebar-menu .nav :deep(.menu-item:hover i) {
    color: #007aff;
}

.sidebar-footer {
    border-top: 1px solid #e0e0e0;
    font-size: 1rem;
    background: #fff;
    color: #888;
    letter-spacing: 0.5px;
    font-weight: 500;
    border-radius: 0 0 16px 0;
    padding: 1rem 1.5rem;
}

.sidebar-footer i {
    font-size: 1.2em;
    margin-right: 8px;
    color: #888;
}

@media (max-width: 991px) {
    .sidebar {
        width: 210px;
    }
}

@media (max-width: 600px) {
    .sidebar {
        width: 100vw;
        min-width: 0;
        border-radius: 0 0 16px 0;
    }

    .sidebar-footer {
        padding: 0.7rem 1rem;
    }

    .sidebar-menu .nav :deep(.menu-item) {
        padding: 12px 12px;
        font-size: 1rem;
    }
}

@media (max-width: 767px) {
    .sidebar {
        width: 100vw;
        min-width: 0;
        border-radius: 0 0 16px 0;
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 1050;
        background: #f8f8f8;
        transition: left 0.2s, width 0.2s;
    }
}
</style>
