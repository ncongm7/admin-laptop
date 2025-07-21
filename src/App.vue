<template>
  <div class="app-layout">
    <header v-if="!isLoginPage" @toggle-sidebar="toggleSidebar"/>
    <div v-if="!isLoginPage" class="main-content">
      <SideBar v-show="!sidebarCollapsed" />
      <main class="main-area">
        <router-view />
      </main>
    </div>
    <main v-else class="login-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './layout/Header.vue'
import SideBar from './layout/SideBar.vue'
const sidebarCollapsed = ref(false)
const toggleSidebar = () => (sidebarCollapsed.value = !sidebarCollapsed.value)
const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
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
  padding: 24px;
  background: #fff;
  min-height: calc(100vh - 60px);
  /* 60px là chiều cao header */
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
