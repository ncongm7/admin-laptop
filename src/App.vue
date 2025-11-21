<template>
  <div class="app-layout">
    <Header v-if="!isLoginPage" @toggle-sidebar="toggleSidebar" />
    <div v-if="!isLoginPage" class="main-content">
      <SideBar v-show="!sidebarCollapsed" />
      <main class="main-area">
        <router-view />
      </main>
    </div>
    <main v-else class="login-main">
      <router-view />
    </main>
    
    <!-- Toast Container -->
    <ToastContainer />
    
    <!-- Confirm Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Header from './layout/Header.vue'
import SideBar from './layout/SideBar.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import ConfirmDialog from './components/common/ConfirmDialog.vue'
import socketService from '@/service/socketService'

const sidebarCollapsed = ref(false)
const toggleSidebar = () => (sidebarCollapsed.value = !sidebarCollapsed.value)
const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

// Auth Store
const authStore = useAuthStore()

// Khởi tạo auth khi app load
onMounted(async () => {
  console.log('App mounted - Checking auth status...')
  await authStore.checkAuthStatus()
  
  // Kết nối socket sau khi đã xác thực (chỉ khi backend hỗ trợ)
  if (authStore.isAuthenticated) {
    // Kiểm tra xem có muốn bật socket không (có thể dùng env variable)
    const socketEnabled = import.meta.env.VITE_ENABLE_SOCKET !== 'false'
    
    if (socketEnabled) {
      console.log('Đang kết nối socket...')
      socketService.connect()
      
      // Subscribe vào các topic thông báo (sẽ được subscribe khi kết nối thành công)
      // Đăng ký subscriptions sẽ được xử lý trong socketService khi onConnect
      socketService.on('connect', () => {
        // Đợi một chút để đảm bảo STOMP connection hoàn toàn sẵn sàng
        setTimeout(() => {
          socketService.subscribe('/topic/notifications', (data) => {
            console.log('Nhận được thông báo:', data)
            window.dispatchEvent(new CustomEvent('socket-notification', { detail: data }))
          })
          
          socketService.subscribe('/topic/orders', (data) => {
            console.log('Nhận được cập nhật đơn hàng:', data)
            window.dispatchEvent(new CustomEvent('socket-order-update', { detail: data }))
          })
        }, 150) // Đợi 150ms để đảm bảo connection sẵn sàng
      })
    } else {
      console.log('Socket đã bị vô hiệu hóa qua environment variable')
    }
  }
})

// Lắng nghe thay đổi trạng thái đăng nhập để kết nối/ngắt socket
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  const socketEnabled = import.meta.env.VITE_ENABLE_SOCKET !== 'false'
  
  if (isAuthenticated && socketEnabled && !socketService.backendUnsupported) {
    console.log('User đã đăng nhập, kết nối socket...')
    socketService.connect()
  } else if (!isAuthenticated) {
    console.log('User đã đăng xuất, ngắt kết nối socket...')
    socketService.disconnect()
  }
})

// Cleanup khi app unmount
onUnmounted(() => {
  socketService.disconnect()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.main-content {
  display: flex;
  flex: 1 1 0;
  min-height: 0;
}

.main-area {
  flex: 1 1 0;
  padding: 0;
  /* Bỏ padding ở đây để các view tự quản lý */
  background: #f4f6f9;
  /* Màu nền chung cho khu vực nội dung */
  min-height: calc(100vh - 64px);
  /* 64px là chiều cao header mới */
  overflow-x: auto;
  transition: margin-left 0.2s;
}

.login-main {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
}

@media (max-width: 991px) {
  .main-area {
    margin-left: 0 !important;
  }
}
</style>
