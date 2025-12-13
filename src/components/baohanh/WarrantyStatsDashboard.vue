<template>
  <div class="warranty-stats-dashboard">
    <div class="row g-3 mb-4">
      <!-- Total Warranties Card -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Tổng số</div>
                <div class="stat-value text-primary">{{ stats.total || 0 }}</div>
              </div>
              <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-shield-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending (Chờ xử lý) -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Chờ xử lý</div>
                <div class="stat-value text-warning">{{ stats.pending || 0 }}</div>
              </div>
              <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                <i class="bi bi-clock-history"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Received (Đã tiếp nhận) -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Đã nhận</div>
                <div class="stat-value text-info">{{ stats.received || 0 }}</div>
              </div>
              <div class="stat-icon bg-info bg-opacity-10 text-info">
                <i class="bi bi-inbox"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Repairing (Đang sửa chữa) -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Đang sửa</div>
                <div class="stat-value text-primary">{{ stats.repairing || 0 }}</div>
              </div>
              <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-tools"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Waiting Handover (Chờ bàn giao) -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Chờ giao</div>
                <div class="stat-value text-warning">{{ stats.waitingHandover || 0 }}</div>
              </div>
              <div class="stat-icon bg-warning bg-opacity-10 text-warning">
                <i class="bi bi-box-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed -->
      <div class="col-md-2">
        <div class="stat-card card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="stat-label text-muted">Hoàn thành</div>
                <div class="stat-value text-success">{{ stats.completed || 0 }}</div>
              </div>
              <div class="stat-icon bg-success bg-opacity-10 text-success">
                <i class="bi bi-check2-all"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Trend Chart (Simple Bar Chart) -->
    <div v-if="stats.monthlyData && stats.monthlyData.length > 0" class="card border-0 shadow-sm">
      <div class="card-header bg-white">
        <h6 class="mb-0">Xu hướng 12 tháng gần nhất</h6>
      </div>
      <div class="card-body">
        <div class="chart-container">
          <div v-for="(month, index) in stats.monthlyData" :key="index" class="chart-bar">
            <div
              class="bar"
              :style="{ height: getBarHeight(month.count) + '%' }"
              :title="`${month.month}: ${month.count}`"
            >
              <span class="bar-value">{{ month.count }}</span>
            </div>
            <div class="bar-label">{{ formatMonth(month.month) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getWarrantyStatistics } from '@/service/baohanh/PhieuBaoHanhService'

const stats = ref({
  total: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
  rejected: 0,
  monthlyData: [],
})

const loading = ref(false)

const maxCount = computed(() => {
  if (!stats.value.monthlyData || stats.value.monthlyData.length === 0) return 1
  return Math.max(...stats.value.monthlyData.map((m) => m.count || 0), 1)
})

const getBarHeight = (count) => {
  if (!count || maxCount.value === 0) return 0
  return (count / maxCount.value) * 100
}

const formatMonth = (monthStr) => {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  return `${month}/${year.slice(2)}`
}

const loadStats = async () => {
  loading.value = true
  try {
    const data = await getWarrantyStatistics()
    stats.value = data || {}
  } catch (error) {
    console.error('Error loading warranty statistics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
})

defineExpose({ loadStats })
</script>

<style scoped>
.warranty-stats-dashboard {
  margin-bottom: 1.5rem;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.5rem;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 20px 0;
  gap: 8px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #0d6efd 0%, #0a58ca 100%);
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.bar:hover {
  background: linear-gradient(180deg, #0a58ca 0%, #084298 100%);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.bar-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  white-space: nowrap;
}
</style>
