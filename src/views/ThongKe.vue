<template>
  <div class="thong-ke-container">
    <!-- Header -->
    <div class="thong-ke-header">
      <h1 class="thong-ke-title">Thống kê chi tiết</h1>
      <div class="thong-ke-actions">
        <DateRangePicker @update:modelValue="handleDateChange" />
        <button class="btn-refresh" @click="refreshData" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spinning': loading }"></i>
        </button>
        <button class="btn-export" @click="exportReport" :disabled="loading">
          <i class="bi bi-download"></i> Xuất báo cáo
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="thong-ke-content">
      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Tổng doanh thu</div>
            <div class="stat-value">{{ formatCurrency(stats.revenue) }}</div>
            <div class="stat-change" :class="stats.revenueGrowth >= 0 ? 'positive' : 'negative'">
              <i :class="stats.revenueGrowth >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ Math.abs(stats.revenueGrowth).toFixed(1) }}%
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon sales">
            <i class="bi bi-cart-check"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Số đơn hàng</div>
            <div class="stat-value">{{ stats.totalSales.toLocaleString() }}</div>
            <div class="stat-change" :class="stats.salesGrowth >= 0 ? 'positive' : 'negative'">
              <i :class="stats.salesGrowth >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ Math.abs(stats.salesGrowth).toFixed(1) }}%
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon profit">
            <i class="bi bi-graph-up-arrow"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Lợi nhuận</div>
            <div class="stat-value">{{ formatCurrency(stats.profit) }}</div>
            <div class="stat-label-small">Từ {{ formatDate(dateRange.start) }} đến {{ formatDate(dateRange.end) }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon customers">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-info">
            <div class="stat-label">Khách hàng</div>
            <div class="stat-value">{{ stats.customerCount.toLocaleString() }}</div>
            <div class="stat-change" :class="stats.customerGrowth >= 0 ? 'positive' : 'negative'">
              <i :class="stats.customerGrowth >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ Math.abs(stats.customerGrowth).toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Biểu đồ doanh thu</h3>
            <div class="chart-controls">
              <button 
                v-for="period in periods" 
                :key="period.value"
                :class="['btn-period', { active: selectedPeriod === period.value }]"
                @click="changePeriod(period.value)"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <SalesChart :data="chartData" :loading="false" />
        </div>
      </div>

      <!-- Tables Section -->
      <div class="tables-section">
        <div class="table-card">
          <div class="table-header">
            <h3>Top sản phẩm bán chạy</h3>
            <router-link to="/san-pham" class="view-all">Xem tất cả</router-link>
          </div>
          <div class="table-content">
            <table class="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="topProducts.length === 0">
                  <td colspan="4" class="text-center">Không có dữ liệu</td>
                </tr>
                <tr v-for="(product, index) in topProducts" :key="product.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="product-info">
                      <img :src="product.image" :alt="product.name" class="product-image" />
                      <span>{{ product.name }}</span>
                    </div>
                  </td>
                  <td>{{ product.sold.toLocaleString() }}</td>
                  <td class="text-end">{{ formatCurrency(product.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import DateRangePicker from '@/components/trahang/DateRangePicker.vue'
import SalesChart from '@/dashboardview/SalesChart.vue'
import { formatCurrency } from '@/utils/helpers'

const dashboardStore = useDashboardStore()
const { isLoading: loading, stats, chartData, topProducts, error } = storeToRefs(dashboardStore)

const dateRange = ref({
  start: new Date(new Date().setDate(new Date().getDate() - 30)),
  end: new Date()
})

const selectedPeriod = ref('day')

const periods = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tháng', value: 'month' },
  { label: 'Năm', value: 'year' }
]

const fetchData = async () => {
  try {
    await dashboardStore.fetchDashboardData(dateRange.value)
    // Cập nhật biểu đồ theo period đã chọn
    await updateChartData()
  } catch (err) {
    console.error('❌ [ThongKe] Lỗi khi fetch dữ liệu:', err)
  }
}

const updateChartData = async () => {
  try {
    const { fetchBieuDoData } = await import('@/service/thongKeService')
    const startDate = formatDate(dateRange.value.start)
    const endDate = formatDate(dateRange.value.end)
    const bieuDoData = await fetchBieuDoData(startDate, endDate, selectedPeriod.value)
    
    if (bieuDoData?.data && Array.isArray(bieuDoData.data) && bieuDoData.data.length > 0) {
      dashboardStore.chartData = {
        labels: bieuDoData.data.map((item) => item.thoiGian),
        values: bieuDoData.data.map((item) => parseFloat(item.doanhThu) || 0),
        rawData: bieuDoData.data,
      }
    }
  } catch (err) {
    console.error('❌ [ThongKe] Lỗi khi cập nhật biểu đồ:', err)
  }
}

const handleDateChange = (range) => {
  if (range && Array.isArray(range) && range.length === 2) {
    dateRange.value = {
      start: new Date(range[0]),
      end: new Date(range[1])
    }
    fetchData()
  }
}

const changePeriod = async (period) => {
  selectedPeriod.value = period
  await updateChartData()
}

const refreshData = () => {
  fetchData()
}

const exportReport = () => {
  // TODO: Implement export to PDF/Excel
  alert('Tính năng xuất báo cáo đang được phát triển')
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.thong-ke-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.thong-ke-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.thong-ke-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.thong-ke-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-refresh,
.btn-export {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-refresh {
  width: 40px;
  height: 40px;
  padding: 0;
  justify-content: center;
}

.btn-refresh:hover,
.btn-export:hover {
  background: #f1f5f9;
}

.btn-refresh:disabled,
.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  color: #991b1b;
  text-align: center;
  margin-bottom: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.sales {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.profit {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.customers {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.stat-label-small {
  font-size: 11px;
  color: #94a3b8;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.btn-period {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-period:hover {
  background: #f1f5f9;
}

.btn-period.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

.tables-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.table-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.view-all {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
}

.view-all:hover {
  text-decoration: underline;
}

.table-content {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8fafc;
}

.data-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .thong-ke-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
