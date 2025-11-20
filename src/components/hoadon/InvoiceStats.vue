<template>
  <div class="invoice-stats">
    <div class="row g-3">
      <!-- Tổng doanh thu -->
      <div class="col-md-3">
        <div class="stat-card stat-revenue">
          <div class="stat-icon">
            <i class="bi bi-cash-coin"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Tổng doanh thu</div>
            <div class="stat-value">{{ formatCurrency(stats.tongDoanhThu) }}</div>
            <div class="stat-change" :class="getChangeClass(stats.doanhThuChange)">
              <i :class="getChangeIcon(stats.doanhThuChange)"></i>
              {{ Math.abs(stats.doanhThuChange) }}% so với kỳ trước
            </div>
          </div>
        </div>
      </div>

      <!-- Số đơn -->
      <div class="col-md-3">
        <div class="stat-card stat-orders">
          <div class="stat-icon">
            <i class="bi bi-receipt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Số đơn hàng</div>
            <div class="stat-value">{{ stats.soDon }}</div>
            <div class="stat-change" :class="getChangeClass(stats.soDonChange)">
              <i :class="getChangeIcon(stats.soDonChange)"></i>
              {{ Math.abs(stats.soDonChange) }}% so với kỳ trước
            </div>
          </div>
        </div>
      </div>

      <!-- Đơn trung bình -->
      <div class="col-md-3">
        <div class="stat-card stat-average">
          <div class="stat-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Đơn trung bình</div>
            <div class="stat-value">{{ formatCurrency(stats.donTrungBinh) }}</div>
            <div class="stat-change" :class="getChangeClass(stats.donTrungBinhChange)">
              <i :class="getChangeIcon(stats.donTrungBinhChange)"></i>
              {{ Math.abs(stats.donTrungBinhChange) }}% so với kỳ trước
            </div>
          </div>
        </div>
      </div>

      <!-- Tỷ lệ hoàn thành -->
      <div class="col-md-3">
        <div class="stat-card stat-completion">
          <div class="stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-label">Tỷ lệ hoàn thành</div>
            <div class="stat-value">{{ stats.tyLeHoanThanh }}%</div>
            <div class="stat-change" :class="getChangeClass(stats.tyLeHoanThanhChange)">
              <i :class="getChangeIcon(stats.tyLeHoanThanhChange)"></i>
              {{ Math.abs(stats.tyLeHoanThanhChange) }}% so với kỳ trước
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-3 mt-3">
      <!-- Doanh thu theo giờ -->
      <div class="col-md-8">
        <div class="chart-card">
          <h6 class="chart-title">Doanh thu theo giờ (Hôm nay)</h6>
          <canvas ref="revenueChartCanvas"></canvas>
        </div>
      </div>

      <!-- Top sản phẩm -->
      <div class="col-md-4">
        <div class="chart-card">
          <h6 class="chart-title">Top 5 sản phẩm bán chạy</h6>
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <div v-else-if="topProducts.length === 0" class="text-center py-4 text-muted">
            Chưa có dữ liệu
          </div>
          <div v-else class="top-products-list">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="top-product-item"
            >
              <div class="product-rank">
                <span class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</span>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.tenSanPham }}</div>
                <div class="product-stats">
                  <span>{{ product.soLuong }} đơn</span>
                  <span class="text-muted">•</span>
                  <span>{{ formatCurrency(product.tongTien) }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getInvoiceStats } from '@/service/hoaDonService'

Chart.register(...registerables)

const stats = ref({
  tongDoanhThu: 0,
  soDon: 0,
  donTrungBinh: 0,
  tyLeHoanThanh: 0,
  doanhThuChange: 0,
  soDonChange: 0,
  donTrungBinhChange: 0,
  tyLeHoanThanhChange: 0
})

const topProducts = ref([])
const loading = ref(false)
const revenueChartCanvas = ref(null)
let revenueChart = null

/**
 * Load stats
 */
const loadStats = async () => {
  loading.value = true
  try {
    // TODO: Backend cần tạo API GET /api/v1/hoa-don/stats
    // Tạm thời dùng mock data
    const response = await getInvoiceStats()
    if (response && response.data) {
      stats.value = response.data.stats || stats.value
      topProducts.value = response.data.topProducts || []
      
      if (response.data.hourlyRevenue) {
        renderRevenueChart(response.data.hourlyRevenue)
      }
    }
  } catch (error) {
    console.warn('⚠️ API stats chưa có, dùng mock data:', error)
    // Mock data for demo
    stats.value = {
      tongDoanhThu: 50000000,
      soDon: 150,
      donTrungBinh: 333333,
      tyLeHoanThanh: 85,
      doanhThuChange: 12.5,
      soDonChange: 8.3,
      donTrungBinhChange: 3.9,
      tyLeHoanThanhChange: 2.1
    }
    topProducts.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Render revenue chart
 */
const renderRevenueChart = (hourlyData) => {
  if (!revenueChartCanvas.value) return

  const ctx = revenueChartCanvas.value.getContext('2d')
  
  if (revenueChart) {
    revenueChart.destroy()
  }

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourlyData.map(d => d.gio + 'h'),
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: hourlyData.map(d => d.doanhThu),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
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
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return (value / 1000000).toFixed(1) + 'M'
            }
          }
        }
      }
    }
  })
}

/**
 * Get change class
 */
const getChangeClass = (change) => {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-danger'
  return 'text-muted'
}

/**
 * Get change icon
 */
const getChangeIcon = (change) => {
  if (change > 0) return 'bi bi-arrow-up'
  if (change < 0) return 'bi bi-arrow-down'
  return 'bi bi-dash'
}

/**
 * Get rank class
 */
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

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
.invoice-stats {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-revenue .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-orders .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-average .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-completion .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #212529;
}

.chart-card canvas {
  max-height: 300px;
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
  border-radius: 8px;
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
  font-size: 0.875rem;
  color: white;
}

.rank-gold {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
}

.rank-normal {
  background: #6c757d;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.product-stats {
  font-size: 0.875rem;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

