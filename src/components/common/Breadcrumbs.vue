<template>
    <nav class="breadcrumbs" aria-label="breadcrumb">
        <ol class="breadcrumb-list">
            <li class="breadcrumb-item">
                <router-link to="/" class="breadcrumb-link">
                    <i class="bi bi-house-door"></i>
                    <span>Trang chủ</span>
                </router-link>
            </li>
            <li v-for="(crumb, index) in items" :key="index" class="breadcrumb-item" :class="{ 'active': index === items.length - 1 }">
                <i v-if="index === 0" class="bi bi-chevron-right separator"></i>
                <router-link v-if="crumb.to" :to="crumb.to" class="breadcrumb-link">
                    {{ crumb.label }}
                </router-link>
                <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
            </li>
        </ol>
    </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
    // Tab hiện tại (để hiển thị trong breadcrumb)
    currentTab: {
        type: String,
        default: null
    }
})

const route = useRoute()

// Tab labels mapping
const tabLabels = {
    'staff': 'Nhân viên',
    'customer': 'Khách hàng',
    'locked': 'Tài khoản bị khóa'
}

// Route name to label mapping
const routeLabels = {
    'DashBoardView': { label: 'Dashboard', to: '/' },
    'SalesView': { label: 'Bán hàng', to: '/ban-hang' },
    'QuanLiHoaDon': { label: 'Quản lý hóa đơn', to: '/quan-li-hoa-don' },
    'QuanLiSanPham': { label: 'Danh sách sản phẩm', to: '/quan-li-san-pham' },
    'QuanLiBienThe': { label: 'Quản lý biến thể', to: '/quan-li-bien-the' },
    'ThuocTinhSanPham': { label: 'Thuộc tính sản phẩm', to: '/thuoc-tinh-san-pham' },
    'QuanLiTaiKhoan': { label: 'Quản lý tài khoản', to: '/quan-li-tai-khoan' },
    'QuanLiGiamGia': { label: 'Quản lý đợt giảm giá', to: '/quan-li-giam-gia' },
    'QuanLiPhieuGiamGia': { label: 'Quản lý phiếu giảm giá', to: '/quan-li-phieu-giam-gia' },
    'QuanLiBaoHanh': { label: 'Quản lý bảo hành', to: '/quan-li-bao-hanh' },
    'QuanLiTraHang': { label: 'Quản lý trả hàng', to: '/quan-li-tra-hang' },
    'ThongKe': { label: 'Thống kê', to: '/thong-ke' }
}

const items = computed(() => {
    if (!route.name || route.name === 'DashBoardView') {
        return []
    }
    
    const routeLabel = routeLabels[route.name]
    if (!routeLabel) {
        // Fallback: Extract from path
        const pathSegments = route.path.split('/').filter(Boolean)
        return pathSegments.map((segment, index) => ({
            label: segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            to: '/' + pathSegments.slice(0, index + 1).join('/')
        }))
    }
    
    const breadcrumbItems = [routeLabel]
    
    // Thêm tab label nếu có
    if (props.currentTab && tabLabels[props.currentTab]) {
        breadcrumbItems.push({
            label: tabLabels[props.currentTab],
            to: null // Không có link cho tab
        })
    }
    
    return breadcrumbItems
})
</script>

<style scoped>
.breadcrumbs {
    margin: 0;
}

.breadcrumb-list {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 8px;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
}

.breadcrumb-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6c757d;
    text-decoration: none;
    transition: color 0.2s ease;
}

.breadcrumb-link:hover {
    color: #2D7458;
}

.breadcrumb-link i {
    font-size: 1rem;
}

.breadcrumb-current {
    color: #2D7458;
    font-weight: 600;
}

.separator {
    color: #adb5bd;
    font-size: 0.75rem;
    margin: 0 4px;
}

.breadcrumb-item.active .breadcrumb-link {
    color: #2D7458;
    font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
    .breadcrumbs {
        display: none;
    }
}
</style>

