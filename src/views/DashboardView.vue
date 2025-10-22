<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Bảng điều khiển</h1>
      <div class="dashboard-actions">
        <DateRangePicker @change="handleDateChange" />
        <button class="btn-refresh" @click="refreshData">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <SalesOverview :total="stats.totalSales" :growth="stats.salesGrowth" :loading="loading" />
      <RevenueStats :revenue="stats.revenue" :profit="stats.profit" :loading="loading" />
      <CustomerStats :count="stats.customerCount" :growth="stats.customerGrowth" :loading="loading" />
      <InventoryAlert :low-stock="lowStockItems" :critical="criticalItems" :loading="loading" />
    </div>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="content-left">
        <SalesChart :data="chartData.sales" :loading="loading" class="chart-card" />
        <RecentTransactions :transactions="recentTransactions" :loading="loading" class="transactions-card" />
      </div>

      <!-- Right Column -->
      <div class="content-right">
        <TopProducts :products="topProducts" :loading="loading" class="products-card" />
        <CustomerActivity :activities="customerActivities" :loading="loading" class="activity-card" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useProductDetailStore } from '@/stores/productDetailStore'
import DateRangePicker from '@/components/trahang/DateRangePicker.vue'

// Components
import SalesOverview from '@/dashboardview/SalesOverview.vue'
import RevenueStats from '@/dashboardview/RevenueStats.vue'
import CustomerStats from '@/dashboardview/CustomerStats.vue'
import InventoryAlert from '@/dashboardview/InventoryAlert.vue'
import SalesChart from '@/dashboardview/SalesChart.vue'
import RecentTransactions from '@/dashboardview/RecentTransactions.vue'
import TopProducts from '@/dashboardview/TopProducts.vue'
import CustomerActivity from '@/dashboardview/CustomerActivity.vue'

const dashboardStore = useDashboardStore()
const productDetailStore = useProductDetailStore()
const loading = ref(true)
const dateRange = ref({
  start: new Date(new Date().setDate(new Date().getDate() - 30)),
  end: new Date()
})

const stats = ref({
  totalSales: 0,
  salesGrowth: 0,
  revenue: 0,
  profit: 0,
  customerCount: 0,
  customerGrowth: 0,
  // lowStockItems: 0, // Xóa dòng này
  // criticalItems: 0 // Xóa dòng này
})

const chartData = ref({ sales: [] })
const recentTransactions = ref([])
const topProducts = ref([])
const customerActivities = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    await Promise.all([
      dashboardStore.fetchDashboardData(dateRange.value),
      productDetailStore.fetchAllVariants()
    ])
    // Update all data from store
    stats.value = dashboardStore.stats
    chartData.value = dashboardStore.chartData
    recentTransactions.value = dashboardStore.recentTransactions
    topProducts.value = dashboardStore.topProducts
    customerActivities.value = dashboardStore.customerActivities
  } finally {
    loading.value = false
  }
}

const handleDateChange = (range) => {
  dateRange.value = range
  fetchData()
}

const refreshData = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})

// Tính toán tồn kho thấp và hết hàng từ productDetailStore
const lowStockItems = computed(() =>
  productDetailStore.variants.filter(v => v.imeiCount > 0 && v.imeiCount <= 5).length
)
const criticalItems = computed(() =>
  productDetailStore.variants.filter(v => v.imeiCount === 0).length
)
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-refresh {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #f1f5f9;
  transform: rotate(180deg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card,
.transactions-card,
.products-card,
.activity-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>