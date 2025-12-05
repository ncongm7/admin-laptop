<template>
  <aside
    :class="[
      'sidebar',
      { 'sidebar-collapsed': collapsed, 'sidebar-hidden': isMobile && !showSidebar },
    ]"
  >
    <nav class="sidebar-menu">
      <ul class="nav flex-column">
        <MenuItem
          v-for="item in filteredMenuItems"
          :key="item.id"
          :icon="item.icon"
          :label="item.label"
          :to="item.to"
          :collapsed="collapsed"
        >
          <MenuItem
            v-for="child in item.children"
            :key="child.id"
            :icon="child.icon"
            :label="child.label"
            :to="child.to"
            :sub="true"
            :collapsed="collapsed"
            @submenu-click="() => {}"
          />
        </MenuItem>
      </ul>
    </nav>

    <div class="sidebar-footer p-3 mt-auto d-flex align-items-center gap-2">
      <img
        class="sidebar-avatar"
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="avatar"
      />
      <div v-if="!collapsed">
        <span class="fw-semibold">{{ authStore.user?.hoTen || 'Admin' }}</span>
        <div class="sidebar-role">{{ authStore.user?.role || 'Quản trị viên' }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import MenuItem from './MenuItem.vue'

const authStore = useAuthStore()
const collapsed = ref(false)
const showSidebar = ref(true)
const isMobile = ref(false)

// Menu items data
const menuItems = ref([
  { 
    id: 'home',
    icon: 'bi-house-door',
    label: 'Trang chủ',
    to: '/'
  },
  { 
    id: 'sales',
    icon: 'bi-cart-check',
    label: 'Bán hàng',
    to: '/ban-hang'
  },
  { 
    id: 'invoices',
    icon: 'bi-receipt-cutoff',
    label: 'Quản lý hóa đơn',
    to: '/quan-li-hoa-don'
  },
  { 
    id: 'products',
    icon: 'bi-box-seam',
    label: 'Quản lý sản phẩm',
    children: [
      { id: 'product-list', icon: 'bi-grid', label: 'Danh sách sản phẩm', to: '/quan-li-san-pham' },
      { id: 'product-variants', icon: 'bi-diagram-3', label: 'Quản lý biến thể', to: '/quan-li-bien-the' },
      { id: 'product-attributes', icon: 'bi-gear', label: 'Thuộc tính sản phẩm', to: '/thuoc-tinh-san-pham' }
    ]
  },
  { 
    id: 'accounts',
    icon: 'bi-people',
    label: 'Quản lý tài khoản',
    to: '/quan-li-tai-khoan'
  },
  { 
    id: 'discounts',
    icon: 'bi-percent',
    label: 'Quản lý giảm giá',
    children: [
      { id: 'discount-campaigns', icon: 'bi-tags', label: 'Quản lý đợt giảm giá', to: '/quan-li-giam-gia' },
      { id: 'vouchers', icon: 'bi-ticket-perforated', label: 'Quản lý phiếu giảm giá', to: '/quan-li-phieu-giam-gia' }
    ]
  },
  { 
    id: 'warranty',
    icon: 'bi-shield-check',
    label: 'Quản lý bảo hành',
    to: '/quan-li-bao-hanh'
  },
  // { 
  //   id: 'returns',
  //   icon: 'bi-arrow-counterclockwise',
  //   label: 'Quản lý trả hàng',
  //   to: '/quan-li-tra-hang'
  // },
  { 
    id: 'chat',
    icon: 'bi-chat-dots',
    label: 'Quản lý chat',
    to: '/quan-li-chat'
  }
])

// Filter menu items based on user role
const filteredMenuItems = computed(() => {
  const isAdmin = authStore.isAdmin
  const isNhanVien = authStore.isNhanVien
  
  // Nếu chưa đăng nhập, không hiển thị menu
  if (!authStore.isAuthenticated) {
    return []
  }
  
  // Admin: Hiển thị tất cả menu
  if (isAdmin) {
    return menuItems.value
  }
  
  // Nhân viên: Hiển thị menu nhưng "Quản lý tài khoản" vẫn hiển thị (sẽ route khác trong component)
  // Có thể ẩn một số menu nhạy cảm nếu cần
  return menuItems.value.filter(item => {
    // Nhân viên có thể xem tất cả menu, nhưng quyền truy cập sẽ được kiểm tra trong từng component
    return true
  })
})

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
  width: 260px;
  background: #fff;
  border-right: 1px solid #e9ecef;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  color: #111;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
  z-index: 1100;
}

.sidebar-collapsed {
  width: 64px;
  min-width: 64px;
  overflow-x: hidden;
  box-shadow: none;
}

.sidebar-hidden {
  display: none !important;
}

.sidebar-menu {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

.sidebar-menu .nav {
  gap: 4px;
}

.sidebar-footer {
  border-top: 1px solid #e9ecef;
  font-size: 0.9rem;
  background: linear-gradient(135deg, rgba(45, 116, 88, 0.03) 0%, rgba(57, 110, 124, 0.03) 100%);
  color: #111;
  padding: 16px;
  min-height: 60px;
}

.sidebar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(45, 116, 88, 0.2);
  box-shadow: 0 2px 6px rgba(45, 116, 88, 0.15);
  background: #f4f6f8;
}

.sidebar-role {
  font-size: 0.8rem;
  color: #2D7458;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 991px) {
  .sidebar {
    width: 220px;
  }

  .sidebar-collapsed {
    width: 56px;
    min-width: 56px;
  }
}

@media (max-width: 767px) {
  .sidebar {
    width: 280px;
    min-width: 0;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1050;
    background: #fff;
    transition: left 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }
}
</style>
