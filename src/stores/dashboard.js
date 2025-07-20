import { ref } from 'vue'

const dashboardData = ref({
  totalSales: 0,
  totalCustomers: 0,
  totalProducts: 0,
  recentOrders: [],
  loading: false,
  error: null
})

function setDashboardData(data) {
  dashboardData.value = { ...dashboardData.value, ...data }
}

function resetDashboardData() {
  dashboardData.value = {
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    loading: false,
    error: null
  }
}

export function useDashboardStore() {
  return {
    dashboardData,
    setDashboardData,
    resetDashboardData
  }
}
