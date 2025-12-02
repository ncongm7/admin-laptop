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
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="section-title mb-0">
              <i class="bi bi-bar-chart"></i> Doanh thu hôm nay
            </h6>
            <div class="chart-info">
              <small class="text-muted">
                <i class="bi bi-info-circle"></i>
                Tổng: <strong>{{ formatCurrency(stats.todayRevenue) }}</strong>
              </small>
            </div>
          </div>
          <div class="chart-container" v-show="!isLoading">
            <canvas ref="revenueChartCanvas"></canvas>
          </div>
          <div v-if="!isLoading && (labels.length === 0 || (data && data.length > 0 && data.every(v => v === 0)))" class="chart-empty-state">
            <i class="bi bi-inbox" style="font-size: 2rem; color: #dee2e6;"></i>
            <p class="text-muted mb-0 mt-2">Chưa có dữ liệu doanh thu hôm nay</p>
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
                <div class="product-name">{{ product.tenSanPham || product.name || 'N/A' }}</div>
                <div class="product-meta">
                  <span class="text-muted small">Đã bán: {{ (product.soLuongDaBan || product.sold || 0).toLocaleString() }}</span>
                  <span class="text-success small ms-2">
                    Doanh thu: {{ formatCurrency(product.doanhThu || product.revenue || 0) }}
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
const labels = ref([])
const data = ref([])

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
 * Format date to yyyy-MM-dd
 */
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Load statistics
 */
const loadStats = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const today = formatDate(new Date())
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000))

    console.log('📊 [SalesQuickStats] Đang tải thống kê cho hôm nay:', today)

    // Load tổng quan
    const [todayStatsResponse, yesterdayStatsResponse, chartDataResponse, topProductsResponse] = await Promise.all([
      fetchThongKeTongQuan(today, today),
      fetchThongKeTongQuan(yesterday, yesterday),
      fetchBieuDoData(today, today, 'day'), // Backend chỉ hỗ trợ 'day', 'month', 'year'
      fetchSanPhamBanChay(today, today, 5)
    ])

    console.log('✅ [SalesQuickStats] Dữ liệu nhận được:', {
      todayStats: todayStatsResponse,
      yesterdayStats: yesterdayStatsResponse,
      chartData: chartDataResponse,
      topProducts: topProductsResponse
    })

    // Parse response structure từ backend
    // Response có cấu trúc: { success: true, data: ThongKeTongQuanResponse, message: "..." }
    const todayStats = todayStatsResponse?.data || todayStatsResponse
    const yesterdayStats = yesterdayStatsResponse?.data || yesterdayStatsResponse

    // Lấy doanh thu từ doanhThu.giaTri
    const todayRevenue = todayStats?.doanhThu?.giaTri
      ? parseFloat(todayStats.doanhThu.giaTri)
      : 0

    // Lấy số đơn từ doanhSo.giaTri
    const todayOrdersCount = todayStats?.doanhSo?.giaTri
      ? parseInt(todayStats.doanhSo.giaTri)
      : 0

    const yesterdayRevenue = yesterdayStats?.doanhThu?.giaTri
      ? parseFloat(yesterdayStats.doanhThu.giaTri)
      : 0

    const yesterdayOrders = yesterdayStats?.doanhSo?.giaTri
      ? parseInt(yesterdayStats.doanhSo.giaTri)
      : 0

    // Tính toán % thay đổi
    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : (todayRevenue > 0 ? 100 : 0)

    const ordersChange = yesterdayOrders > 0
      ? ((todayOrdersCount - yesterdayOrders) / yesterdayOrders) * 100
      : (todayOrdersCount > 0 ? 100 : 0)

    stats.value = {
      todayRevenue,
      todayOrders: todayOrdersCount,
      averageOrderValue: todayOrdersCount > 0 ? todayRevenue / todayOrdersCount : 0,
      revenueChange,
      ordersChange
    }

    console.log('📈 [SalesQuickStats] Stats đã tính:', stats.value)

    // Top products
    const topProductsData = topProductsResponse?.data || topProductsResponse
    if (topProductsData && Array.isArray(topProductsData)) {
      topProducts.value = topProductsData.map(item => ({
        id: item.id,
        tenSanPham: item.tenSanPham,
        soLuongDaBan: item.soLuongBan || 0,
        doanhThu: parseFloat(item.doanhThu) || 0
      }))
    } else {
      topProducts.value = []
    }

    // Render chart - đợi DOM sẵn sàng
    // Đợi nhiều lần để đảm bảo canvas đã được render hoàn toàn
    await nextTick()
    await nextTick() // Double nextTick để chắc chắn
    // Đợi thêm một chút để đảm bảo canvas đã được mount vào DOM
    await new Promise(resolve => setTimeout(resolve, 150))
    await renderChart(chartDataResponse)

  } catch (err) {
    console.error('❌ [SalesQuickStats] Lỗi khi load thống kê:', err)
    error.value = err.response?.data?.message || err.message || 'Không thể tải thống kê. Vui lòng thử lại!'
    showError(error.value)
  } finally {
    isLoading.value = false
  }
}

/**
 * Tạo gradient cho chart
 */
const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  return gradient
}

/**
 * Render revenue chart
 */
const renderChart = async (chartDataResponse) => {
  // Đợi canvas sẵn sàng với retry mechanism
  let retries = 0
  const maxRetries = 10

  while (!revenueChartCanvas.value && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100))
    retries++
  }

  if (!revenueChartCanvas.value) {
    console.error('❌ [SalesQuickStats] Chart canvas không sẵn sàng sau', maxRetries, 'lần thử')
    return
  }

  // Đảm bảo canvas đã được mount vào DOM
  if (!revenueChartCanvas.value.getContext) {
    console.error('❌ [SalesQuickStats] Canvas chưa được mount vào DOM')
    await nextTick()
    if (!revenueChartCanvas.value || !revenueChartCanvas.value.getContext) {
      console.error('❌ [SalesQuickStats] Vẫn không thể truy cập canvas')
      return
    }
  }

  // Destroy chart cũ nếu có
  if (revenueChart) {
    revenueChart.destroy()
    revenueChart = null
  }

  // Parse data từ response
  // Response có cấu trúc: { success: true, data: BieuDoDoanhSoResponse[], message: "..." }
  let chartLabels = []
  let chartData = []
  let orderCounts = []

  const responseData = chartDataResponse?.data || chartDataResponse

  if (responseData && Array.isArray(responseData)) {
    responseData.forEach(item => {
      // item là BieuDoDoanhSoResponse: { thoiGian, doanhThu, soHoaDon }
      const timeLabel = item.thoiGian || item.time || item.label || ''
      const revenue = item.doanhThu
        ? parseFloat(item.doanhThu)
        : (item.revenue ? parseFloat(item.revenue) : 0)
      const orders = item.soHoaDon || 0

      chartLabels.push(timeLabel)
      chartData.push(revenue)
      orderCounts.push(orders)
    })
  }

  // Lưu vào ref để dùng trong template
  labels.value = chartLabels
  data.value = chartData

  // Nếu không có dữ liệu, tạo dữ liệu mẫu để hiển thị
  if (chartLabels.length === 0) {
    console.warn('⚠️ [SalesQuickStats] Không có dữ liệu biểu đồ, tạo dữ liệu mẫu')
    // Tạo labels cho 24 giờ trong ngày
    chartLabels = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, '0')
      return `${hour}:00`
    })
    chartData = Array.from({ length: 24 }, () => 0)
    orderCounts = Array.from({ length: 24 }, () => 0)
    labels.value = chartLabels
    data.value = chartData
  }

  console.log('📊 [SalesQuickStats] Rendering chart với', chartLabels.length, 'điểm dữ liệu')

  try {
    const ctx = revenueChartCanvas.value.getContext('2d')

    // Tạo gradient cho background
    const gradient = createGradient(
      ctx,
      'rgba(13, 202, 240, 0.3)',
      'rgba(13, 202, 240, 0.05)'
    )

    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: 'Doanh thu (VND)',
            data: chartData,
            borderColor: '#0dcaf0',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointRadius: chartLabels.length > 10 ? 3 : 5,
            pointHoverRadius: chartLabels.length > 10 ? 5 : 8,
            pointBackgroundColor: '#0dcaf0',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#0aa2c0',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
            borderWidth: 2.5,
            // Animation
            animation: {
              duration: 1500,
              easing: 'easeInOutQuart'
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            borderColor: '#0dcaf0',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (context) => {
                return `Thời gian: ${context[0].label}`
              },
              label: (context) => {
                const revenue = context.parsed.y
                const index = context.dataIndex
                const orders = orderCounts[index] || 0
                return [
                  `Doanh thu: ${formatCurrency(revenue)}`,
                  `Số đơn: ${orders.toLocaleString()} đơn`,
                  orders > 0 ? `TB/đơn: ${formatCurrency(revenue / orders)}` : ''
                ].filter(Boolean)
              },
              labelColor: () => {
                return {
                  borderColor: '#0dcaf0',
                  backgroundColor: '#0dcaf0'
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              color: '#6c757d',
              font: {
                size: 11
              },
              maxRotation: chartLabels.length > 12 ? 45 : 0,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#6c757d',
              font: {
                size: 11
              },
              callback: (value) => {
                if (value >= 1000000000) {
                  return `${(value / 1000000000).toFixed(1)}T`
                }
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`
                }
                return value.toLocaleString()
              },
              padding: 8
            }
          }
        },
        // Animation
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart'
        },
        // Hover effects
        onHover: (event, activeElements) => {
          if (activeElements.length > 0) {
            event.native.target.style.cursor = 'pointer'
          } else {
            event.native.target.style.cursor = 'default'
          }
        }
      }
    })
  } catch (err) {
    console.error('❌ [SalesQuickStats] Lỗi khi render chart:', err)
  }
}

/**
 * Refresh stats
 */
const refreshStats = async () => {
  await loadStats()
}

// Auto-refresh interval
let refreshInterval = null

// Lifecycle
onMounted(() => {
  loadStats()

  // Tự động refresh mỗi 5 phút
  refreshInterval = setInterval(() => {
    if (!isLoading.value) {
      console.log('🔄 [SalesQuickStats] Tự động refresh thống kê...')
      loadStats()
    }
  }, 5 * 60 * 1000) // 5 phút
})

onUnmounted(() => {
  // Clear auto-refresh interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  // Destroy chart khi component unmount
  if (revenueChart) {
    revenueChart.destroy()
    revenueChart = null
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
  height: 300px;
  position: relative;
  padding: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px;
  margin-top: 10px;
}

.chart-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
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

