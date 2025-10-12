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
                <MenuItem icon="bi-diagram-3" label="Quản lý biến thể" to="/quan-li-bien-the" sub :collapsed="collapsed" />
                <MenuItem icon="bi-gear" label="Thuộc tính sản phẩm" to="/thuoc-tinh-san-pham" sub :collapsed="collapsed" />
                </MenuItem>
                <MenuItem icon="bi-people" label="Quản lý tài khoản & người dùng" to="/quan-li-tai-khoan"
                    :collapsed="collapsed" />
                <MenuItem icon="bi-percent" label="Quản lý giảm giá" ref="discountMenu" :collapsed="collapsed">
                <MenuItem icon="bi-tags" label="Quản lý đợt giảm giá" to="/quan-li-giam-gia" sub :collapsed="collapsed"
                    @submenu-click="handleSubmenuClick" />
                <MenuItem icon="bi-ticket-perforated" label="Quản lý phiếu giảm giá" to="/quan-li-phieu-giam-gia" sub
                    :collapsed="collapsed" @submenu-click="handleSubmenuClick" />
                </MenuItem>
                <MenuItem icon="bi-arrow-counterclockwise" label="Quản lý trả hàng" to="/quan-li-tra-hang"
                    :collapsed="collapsed" />
                <MenuItem icon="bi-shield-check" label="Quản lý bảo hành" to="/quan-li-bao-hanh"
                    :collapsed="collapsed" />
                <MenuItem icon="bi-bar-chart" label="Thống kê" to="/thong-ke" :collapsed="collapsed" />
                <MenuItem icon="bi-bell" label="Quản lý thông báo" to="/quan-li-thong-bao" :collapsed="collapsed" />
                <MenuItem icon="bi-gear" label="Quản lý hệ thống" to="/quan-li-he-thong" :collapsed="collapsed" />
            </ul>
        </nav>
        <div class="sidebar-footer p-3 mt-auto d-flex align-items-center gap-2">
            <img class="sidebar-avatar" src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" />
            <div v-if="!collapsed">
                <span class="fw-semibold">Admin</span>
                <div class="sidebar-role">Quản trị viên</div>
            </div>
        </div>
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
    width: 240px;
    background: #fff;
    border-right: 1px solid #e5e7eb;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(.4, 2, .6, 1), box-shadow 0.2s;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    color: #111;
    border-radius: 12px 0 0 12px;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 0.97rem;
    z-index: 1100;
}

.sidebar-collapsed {
    width: 56px;
    min-width: 56px;
    overflow-x: hidden;
    box-shadow: none;
}

.sidebar-hidden {
    display: none !important;
}

.sidebar-header {
    border-bottom: 1px solid #f0f0f0;
    min-height: 48px;
    background: #fafbfc;
}

.btn-toggle {
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: #222;
    transition: color 0.18s;
}

.btn-toggle:hover {
    color: #1a237e;
    background: #f0f1f3;
}

.sidebar-menu {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding-top: 6px;
}

.sidebar-menu .nav {
    gap: 2px;
}

.sidebar-footer {
    border-top: 1px solid #e5e7eb;
    font-size: 0.93rem;
    background: #fafbfc;
    color: #111;
    letter-spacing: 0.2px;
    font-weight: 500;
    border-radius: 0 0 12px 0;
    padding: 0.7rem 1rem;
    min-height: 48px;
}

.sidebar-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #e5e7eb;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    background: #f4f6f8;
}

.sidebar-role {
    font-size: 0.78rem;
    color: #1a237e;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.btn-toggle-sidebar {
    background: #22c55e;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    box-shadow: 0 1px 4px #22c55e11;
    outline: none;
}

.btn-toggle-sidebar:hover,
.btn-toggle-sidebar:focus {
    background: #16a34a;
    color: #fff;
    box-shadow: 0 2px 8px #22c55e22;
}

.btn-toggle-sidebar i {
    font-size: 1.2em;
    transition: transform 0.2s;
}

@media (max-width: 991px) {
    .sidebar {
        width: 180px;
    }

    .sidebar-collapsed {
        width: 48px;
        min-width: 48px;
    }
}

@media (max-width: 600px) {
    .sidebar {
        width: 100vw;
        min-width: 0;
        border-radius: 0 0 12px 0;
    }

    .sidebar-footer {
        padding: 0.5rem 0.7rem;
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
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10);
    }
}
</style>
