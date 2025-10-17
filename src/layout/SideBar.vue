<template>
    <aside :class="['sidebar', { 'sidebar-collapsed': collapsed, 'sidebar-hidden': isMobile && !showSidebar }]">
        <!-- Đã bỏ sidebar-header và nút toggle, chỉ còn menu và footer -->
        <nav class="sidebar-menu">
            <ul class="nav flex-column">
                <MenuItem icon="bi-house" label="Trang chủ" to="/" :collapsed="collapsed" />
                <MenuItem icon="bi-cart" label="Bán Hàng" to="/ban-hang" :collapsed="collapsed" />
                <MenuItem icon="bi-receipt" label="Quản lý hóa đơn" to="/quan-li-hoa-don" :collapsed="collapsed" />
                <MenuItem icon="bi-box-seam" label="Quản lý sản phẩm" :collapsed="collapsed">
                <MenuItem icon="bi-grid" label="Danh sách sản phẩm" to="/quan-li-san-pham" sub :collapsed="collapsed" />
                <MenuItem icon="bi-diagram-3" label="Quản lý biến thể" to="/quan-li-bien-the" sub
                    :collapsed="collapsed" />
                <MenuItem icon="bi-gear" label="Thuộc tính sản phẩm" to="/thuoc-tinh-san-pham" sub
                    :collapsed="collapsed" />
                </MenuItem>
                <MenuItem icon="bi-people" label="Quản lý tài khoản & người dùng" to="/quan-li-tai-khoan"
                    :collapsed="collapsed" />
                <MenuItem icon="bi-percent" label="Quản lý giảm giá" ref="discountMenu" :collapsed="collapsed">
                <MenuItem icon="bi-tags" label="Quản lý đợt giảm giá" to="/quan-li-giam-gia" sub :collapsed="collapsed"
                    @submenu-click="handleSubmenuClick" />
                <MenuItem icon="bi-ticket-perforated" label="Quản lý phiếu giảm giá" to="/quan-li-phieu-giam-gia" sub
                    :collapsed="collapsed" @submenu-click="handleSubmenuClick" />
                </MenuItem>
                <MenuItem icon="bi-shield-check" label="Quản lý bảo hành" to="/quan-li-bao-hanh"
                    :collapsed="collapsed" />
                <!-- <MenuItem icon="bi-bar-chart" label="Thống kê" to="/thong-ke" :collapsed="collapsed" />
                <MenuItem icon="bi-bell" label="Quản lý thông báo" to="/quan-li-thong-bao" :collapsed="collapsed" />
                <MenuItem icon="bi-gear" label="Quản lý hệ thống" to="/quan-li-he-thong" :collapsed="collapsed" /> -->
            </ul>
        </nav>

    </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MenuItem from './MenuItem.vue'
const collapsed = ref(false)
const showSidebar = ref(true)
const isMobile = ref(false)
const discountMenu = ref(null)

const toggleSidebar = () => (showSidebar.value = !showSidebar.value)
const toggleCollapse = () => (collapsed.value = !collapsed.value)

const handleSubmenuClick = () => {
    if (discountMenu.value) {
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

// Lắng nghe sự kiện từ Header để mở/đóng sidebar trên mobile
if (window) {
    window.addEventListener('toggle-sidebar', () => {
        showSidebar.value = !showSidebar.value
    })
}
</script>

<style scoped>
.sidebar {
    width: 210px;
    background: #fff;
    border-right: 1px solid #e5e7eb;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: width 0.24s ease, box-shadow 0.2s ease, background 0.2s ease;
    box-shadow: 0 1px 8px rgba(17, 24, 39, 0.03);
    color: #111827;
    border-radius: 12px 0 0 12px;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 0.90rem;
    /* chữ nhỏ, gọn */
    z-index: 1100;
}

.sidebar-collapsed {
    width: 48px;
    min-width: 48px;
    overflow-x: hidden;
    box-shadow: none;
}

.sidebar-hidden {
    display: none !important;
}

.sidebar-header {
    border-bottom: 1px solid #f3f4f6;
    min-height: 44px;
    background: #fafbfc;
}

.btn-toggle {
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #1f2937;
    transition: color 0.18s;
}

.btn-toggle:hover {
    color: #111827;
    background: #f3f4f6;
}

.sidebar-menu {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 6px 8px 6px;
    scroll-behavior: smooth;
}

/* Scrollbar mảnh, trung tính */
.sidebar-menu::-webkit-scrollbar {
    width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 8px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}

.sidebar-menu .nav {
    gap: 2px;
}

/* Link item (dùng deep do scoped) */
:deep(.sidebar-link),
:deep(.nav-link),
:deep(a.router-link) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    /* nhỏ hơn */
    color: #111827;
    text-decoration: none;
    border-radius: 8px;
    line-height: 1.25;
    transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease, transform 0.06s ease;
}

/* Hover nhẹ, không màu mè */
:deep(.sidebar-link:hover),
:deep(.nav-link:hover),
:deep(a.router-link:hover) {
    background: #f5f6f7;
    color: #111827;
    box-shadow: 0 1px 4px rgba(31, 41, 55, 0.05);
}

/* Active tối giản với vạch trái trung tính */
:deep(.router-link-active),
:deep(.active) {
    position: relative;
    background: #eef2f6;
    color: #0f172a !important;
    font-weight: 600;
}

:deep(.router-link-active)::before,
:deep(.active)::before {
    content: "";
    position: absolute;
    left: 0;
    top: 10%;
    bottom: 10%;
    width: 2px;
    border-radius: 0 2px 2px 0;
    background: #9ca3af;
    /* trung tính, không quá nổi */
}

:deep(.sidebar-link:active),
:deep(.nav-link:active),
:deep(a.router-link:active) {
    transform: translateY(1px);
}

.sidebar-footer {
    border-top: 1px solid #eef2f6;
    font-size: 0.85rem;
    background: #fafbfc;
    color: #111827;
    letter-spacing: 0.2px;
    font-weight: 500;
    border-radius: 0 0 12px 0;
    padding: 0.5rem 0.75rem;
    min-height: 40px;
}

.sidebar-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.2px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    background: #f5f6f7;
}

.sidebar-role {
    font-size: 0.75rem;
    color: #374151;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.btn-toggle-sidebar {
    background: #111827;
    color: #fff;
    border: none;
    border-radius: 10px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.06s ease;
    box-shadow: 0 1px 3px rgba(17, 24, 39, 0.12);
    outline: none;
}

.btn-toggle-sidebar:hover,
.btn-toggle-sidebar:focus {
    background: #0f172a;
    color: #fff;
    box-shadow: 0 2px 8px rgba(17, 24, 39, 0.18);
}

.btn-toggle-sidebar i {
    font-size: 1.1em;
    transition: transform 0.2s;
}

@media (max-width: 991px) {
    .sidebar {
        width: 168px;
    }

    .sidebar-collapsed {
        width: 44px;
        min-width: 44px;
    }
}

@media (max-width: 600px) {
    .sidebar {
        width: 100vw;
        min-width: 0;
        border-radius: 0 0 12px 0;
    }

    .sidebar-footer {
        padding: 0.45rem 0.6rem;
    }
}

@media (max-width: 767px) {
    .sidebar {
        width: 100vw;
        min-width: 0;
        border-radius: 0 0 12px 0;
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        z-index: 1050;
        background: #fff;
        transition: left 0.2s, width 0.2s;
        box-shadow: 0 4px 24px rgba(17, 24, 39, 0.08);
    }
}
</style>
