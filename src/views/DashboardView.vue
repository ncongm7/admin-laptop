<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Bảng điều khiển</h1>
      <div class="dashboard-actions">
        <DateRangePicker @update:modelValue="handleDateChange" />
        <button class="btn-refresh" @click="refreshData">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="!error" class="stats-grid">
      <SalesOverview :total="stats.totalSales" :growth="stats.salesGrowth" :loading="loading" />
      <RevenueStats :revenue="stats.revenue" :profit="stats.profit" :loading="loading" />
      <CustomerStats :count="stats.customerCount" :growth="stats.customerGrowth" :loading="loading"
        :moiThangNay="stats.customerMoiThangNay" :hoatDong="stats.customerHoatDong" />
      <InventoryAlert :low-stock="lowStockItems" :critical="criticalItems" :loading="loading" />
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-if="!error" class="dashboard-content">
      <!-- Left Column -->
      <div class="content-left">
        <SalesChart :data="chartData" :loading="loading" class="chart-card" />
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
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
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

// Sử dụng storeToRefs để reactive với store state (optional, hoặc dùng trực tiếp từ store)
const { isLoading: loading, stats, chartData, topProducts, recentTransactions, customerActivities, error } = storeToRefs(dashboardStore)

const dateRange = ref({
  start: new Date(new Date().setDate(new Date().getDate() - 30)),
  end: new Date()
})

const fetchData = async () => {
  try {
    await dashboardStore.fetchDashboardData(dateRange.value)
  } catch (err) {
    console.error('❌ [DashboardView] Lỗi khi fetch dữ liệu:', err)
  }
}

const handleDateChange = (range) => {
  // range is [startDate, endDate] from DateRangePicker
  if (range && Array.isArray(range) && range.length === 2) {
    dateRange.value = {
      start: new Date(range[0]),
      end: new Date(range[1])
    }
    fetchData()
  }
}

const refreshData = () => {
  fetchData()
}

// Tồn kho từ API thống kê
const lowStockItems = computed(() => stats.value?.lowStockCount || 0)
const criticalItems = computed(() => stats.value?.criticalStockCount || 0)

onMounted(() => {
  fetchData()
})
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

.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  color: #991b1b;
  text-align: center;
}
</style>