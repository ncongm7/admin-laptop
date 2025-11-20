<template>
  <div class="sales-quick-stats card">
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="bi bi-graph-up"></i> Thống kê bán hàng nhanh
      </h6>
      <button class="btn btn-sm btn-light" @click="refreshStats" :disabled="isLoading">
        <i class="bi" :class="isLoading ? 'bi-hourglass-split' : 'bi-arrow-clockwise'"></i>
      </button>
    </div>

    <div class="card-body">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Stats Content -->
      <div v-else>
        <!-- Summary Cards -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="stat-card revenue">
              <div class="stat-icon">
                <i class="bi bi-currency-dollar"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Doanh thu hôm nay</div>
                <div class="stat-value">{{ formatCurrency(stats.todayRevenue || 0) }}</div>
                <div class="stat-change" :class="getRevenueChangeClass(stats.revenueChange)">
                  <i class="bi" :class="getRevenueChangeIcon(stats.revenueChange)"></i>
                  {{ formatPercentage(stats.revenueChange) }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card orders">
              <div class="stat-icon">
                <i class="bi bi-receipt"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Số đơn đã bán</div>
                <div class="stat-value">{{ stats.todayOrders || 0 }}</div>
                <div class="stat-change" :class="getOrdersChangeClass(stats.ordersChange)">
                  <i class="bi" :class="getOrdersChangeIcon(stats.ordersChange)"></i>
                  {{ formatPercentage(stats.ordersChange) }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card average">
              <div class="stat-icon">
                <i class="bi bi-calculator"></i>
              </div>
              <div class="stat-content">
                <div class="stat-label">Giá trị đơn trung bình</div>
                <div class="stat-value">{{ formatCurrency(stats.averageOrderValue || 0) }}</div>
                <div class="stat-change text-muted">
                  <small>Hôm nay</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="chart-section mb-4">
          <h6 class="section-title mb-3">
            <i class="bi bi-bar-chart"></i> Doanh thu theo giờ
          </h6>
          <div class="chart-container">
            <canvas ref="revenueChartCanvas"></canvas>
          </div>
        </div>

        <!-- Top Products -->
        <div class="top-products-section">
          <h6 class="section-title mb-3">
            <i class="bi bi-trophy"></i> Top sản phẩm bán chạy
          </h6>
          <div v-if="topProducts.length === 0" class="text-center text-muted py-3">
            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
            <p class="mb-0 mt-2">Chưa có dữ liệu</p>
          </div>
          <div v-else class="top-products-list">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id || index"
              class="top-product-item"
            >
              <div class="product-rank">
                <span class="rank-badge" :class="getRankClass(index)">
                  {{ index + 1 }}
                </span>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.tenSanPham || product.tenSP || 'N/A' }}</div>
                <div class="product-meta">
                  <span class="text-muted small">Đã bán: {{ product.soLuongDaBan || 0 }}</span>
                  <span class="text-success small ms-2">
                    Doanh thu: {{ formatCurrency(product.doanhThu || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { fetchThongKeTongQuan, fetchBieuDoData, fetchSanPhamBanChay } from '@/service/thongKeService'
import { useToast } from '@/composables/useToast'
import { format } from 'date-fns'

Chart.register(...registerables)

const { error: showError } = useToast()

const isLoading = ref(false)
const error = ref('')
const stats = ref({
  todayRevenue: 0,
  todayOrders: 0,
  averageOrderValue: 0,
  revenueChange: 0,
  ordersChange: 0
})
const topProducts = ref([])
const revenueChartCanvas = ref(null)
let revenueChart = null

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

/**
 * Format percentage
 */
const formatPercentage = (value) => {
  if (!value) return '0%'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Get revenue change class
 */
const getRevenueChangeClass = (change) => {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-danger'
  return 'text-muted'
}

/**
 * Get revenue change icon
 */
const getRevenueChangeIcon = (change) => {
  if (change > 0) return 'bi-arrow-up'
  if (change < 0) return 'bi-arrow-down'
  return 'bi-dash'
}

/**
 * Get orders change class
 */
const getOrdersChangeClass = (change) => {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-danger'
  return 'text-muted'
}

/**
 * Get orders change icon
 */
const getOrdersChangeIcon = (change) => {
  if (change > 0) return 'bi-arrow-up'
  if (change < 0) return 'bi-arrow-down'
  return 'bi-dash'
}

/**
 * Get rank badge class
 */
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}

/**
 * Load statistics
 */
const loadStats = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

    // Load tổng quan
    const [todayStats, yesterdayStats, chartData, topProductsData] = await Promise.all([
      fetchThongKeTongQuan(today, today),
      fetchThongKeTongQuan(yesterday, yesterday),
      fetchBieuDoData(today, today, 'hour'),
      fetchSanPhamBanChay(today, today, 5)
    ])

    // Tính toán stats
    const todayRevenue = todayStats?.data?.tongDoanhThu || todayStats?.tongDoanhThu || 0
    const todayOrdersCount = todayStats?.data?.tongDonHang || todayStats?.tongDonHang || 0
    const yesterdayRevenue = yesterdayStats?.data?.tongDoanhThu || yesterdayStats?.tongDoanhThu || 0
    const yesterdayOrders = yesterdayStats?.data?.tongDonHang || yesterdayStats?.tongDonHang || 0

    stats.value = {
      todayRevenue,
      todayOrders: todayOrdersCount,
      averageOrderValue: todayOrdersCount > 0 ? todayRevenue / todayOrdersCount : 0,
      revenueChange: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0,
      ordersChange: yesterdayOrders > 0 ? ((todayOrdersCount - yesterdayOrders) / yesterdayOrders) * 100 : 0
    }

    // Top products
    if (topProductsData?.data && Array.isArray(topProductsData.data)) {
      topProducts.value = topProductsData.data
    } else if (Array.isArray(topProductsData)) {
      topProducts.value = topProductsData
    } else {
      topProducts.value = []
    }

    // Render chart
    await nextTick()
    renderChart(chartData)

  } catch (err) {
    console.error('❌ Lỗi khi load thống kê:', err)
    error.value = err.response?.data?.message || 'Không thể tải thống kê. Vui lòng thử lại!'
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Render revenue chart
 */
const renderChart = (chartData) => {
  if (!revenueChartCanvas.value) return

  // Destroy chart cũ nếu có
  if (revenueChart) {
    revenueChart.destroy()
  }

  // Parse data
  let labels = []
  let data = []

  if (chartData?.data) {
    if (Array.isArray(chartData.data)) {
      chartData.data.forEach(item => {
        labels.push(item.thoiGian || item.time || item.label || '')
        data.push(item.doanhThu || item.revenue || item.value || 0)
      })
    }
  } else if (Array.isArray(chartData)) {
    chartData.forEach(item => {
      labels.push(item.thoiGian || item.time || item.label || '')
      data.push(item.doanhThu || item.revenue || item.value || 0)
    })
  }

  // Nếu không có dữ liệu, tạo dữ liệu mẫu
  if (labels.length === 0) {
    labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    data = Array.from({ length: 24 }, () => 0)
  }

  revenueChart = new Chart(revenueChartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Doanh thu (VND)',
        data,
        borderColor: '#0dcaf0',
        backgroundColor: 'rgba(13, 202, 240, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `Doanh thu: ${formatCurrency(context.parsed.y)}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`
              }
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`
              }
              return value
            }
          }
        }
      }
    }
  })
}

/**
 * Refresh stats
 */
const refreshStats = async () => {
  await loadStats()
}

// Lifecycle
onMounted(() => {
  loadStats()
})

onUnmounted(() => {
  if (revenueChart) {
    revenueChart.destroy()
  }
})
</script>

<style scoped>
.sales-quick-stats {
  height: fit-content;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border-left: 4px solid;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.revenue {
  border-left-color: #0dcaf0;
}

.stat-card.orders {
  border-left-color: #198754;
}

.stat-card.average {
  border-left-color: #ffc107;
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #0dcaf0;
}

.stat-card.orders .stat-icon {
  color: #198754;
}

.stat-card.average .stat-icon {
  color: #ffc107;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
}

.chart-container {
  height: 250px;
  position: relative;
}

.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.2s;
}

.top-product-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.product-rank {
  flex-shrink: 0;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #856404;
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #495057;
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a857 100%);
  color: white;
}

.rank-normal {
  background: #e9ecef;
  color: #495057;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 767.98px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .top-product-item {
    padding: 0.5rem;
  }
}
</style>

