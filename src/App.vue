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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Header from './layout/Header.vue'
import SideBar from './layout/SideBar.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import ConfirmDialog from './components/common/ConfirmDialog.vue'

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
