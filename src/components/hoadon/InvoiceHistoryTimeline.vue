<template>
  <div class="invoice-history-timeline">
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <p class="text-muted mt-2">Đang tải lịch sử...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else-if="history.length === 0" class="text-center py-5">
      <i class="bi bi-clock-history" style="font-size: 3rem; color: #ccc;"></i>
      <p class="text-muted mt-3">Chưa có lịch sử thay đổi</p>
    </div>

    <div v-else class="timeline">
      <div
        v-for="(item, index) in history"
        :key="index"
        class="timeline-item"
        :class="getItemClass(item.loaiThayDoi)"
      >
        <div class="timeline-marker">
          <i :class="getItemIcon(item.loaiThayDoi)"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-title">{{ getItemTitle(item.loaiThayDoi) }}</span>
            <span class="timeline-time">{{ formatDateTime(item.thoiGian) }}</span>
          </div>
          <div class="timeline-body">
            <p class="mb-1">{{ item.moTa || item.ghiChu || 'Không có mô tả' }}</p>
            <div v-if="item.nguoiThucHien" class="timeline-user">
              <i class="bi bi-person"></i>
              {{ item.nguoiThucHien.hoTen || item.nguoiThucHien }}
            </div>
            <div v-if="item.giaTriCu && item.giaTriMoi" class="timeline-change">
              <span class="badge bg-secondary">{{ item.giaTriCu }}</span>
              <i class="bi bi-arrow-right mx-2"></i>
              <span class="badge bg-primary">{{ item.giaTriMoi }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHoaDonHistory } from '@/service/hoaDonService'

const props = defineProps({
  invoiceId: {
    type: String,
    required: true
  }
})

const history = ref([])
const loading = ref(false)
const error = ref('')

/**
 * Load history
 */
const loadHistory = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await getHoaDonHistory(props.invoiceId)
    history.value = response.data || []
  } catch (err) {
    console.error('❌ Lỗi khi load lịch sử:', err)
    error.value = err.response?.data?.message || 'Không thể tải lịch sử. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

/**
 * Get item class by type
 */
const getItemClass = (loaiThayDoi) => {
  const classes = {
    'TRANG_THAI': 'timeline-status',
    'THANH_TOAN': 'timeline-payment',
    'CHINH_SUA': 'timeline-edit',
    'TAO_MOI': 'timeline-create',
    'HUY': 'timeline-cancel'
  }
  return classes[loaiThayDoi] || ''
}

/**
 * Get item icon by type
 */
const getItemIcon = (loaiThayDoi) => {
  const icons = {
    'TRANG_THAI': 'bi bi-arrow-repeat',
    'THANH_TOAN': 'bi bi-wallet2',
    'CHINH_SUA': 'bi bi-pencil',
    'TAO_MOI': 'bi bi-plus-circle',
    'HUY': 'bi bi-x-circle'
  }
  return icons[loaiThayDoi] || 'bi bi-circle'
}

/**
 * Get item title by type
 */
const getItemTitle = (loaiThayDoi) => {
  const titles = {
    'TRANG_THAI': 'Thay đổi trạng thái',
    'THANH_TOAN': 'Thanh toán',
    'CHINH_SUA': 'Chỉnh sửa',
    'TAO_MOI': 'Tạo mới',
    'HUY': 'Hủy đơn'
  }
  return titles[loaiThayDoi] || 'Thay đổi'
}

/**
 * Format date time
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.invoice-history-timeline {
  max-height: 600px;
  overflow-y: auto;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.25rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.timeline-marker i {
  font-size: 0.875rem;
  color: #6c757d;
}

.timeline-item.timeline-status .timeline-marker {
  border-color: #0dcaf0;
  background: #0dcaf0;
}

.timeline-item.timeline-status .timeline-marker i {
  color: #fff;
}

.timeline-item.timeline-payment .timeline-marker {
  border-color: #198754;
  background: #198754;
}

.timeline-item.timeline-payment .timeline-marker i {
  color: #fff;
}

.timeline-item.timeline-edit .timeline-marker {
  border-color: #ffc107;
  background: #ffc107;
}

.timeline-item.timeline-edit .timeline-marker i {
  color: #000;
}

.timeline-item.timeline-create .timeline-marker {
  border-color: #0d6efd;
  background: #0d6efd;
}

.timeline-item.timeline-create .timeline-marker i {
  color: #fff;
}

.timeline-item.timeline-cancel .timeline-marker {
  border-color: #dc3545;
  background: #dc3545;
}

.timeline-item.timeline-cancel .timeline-marker i {
  color: #fff;
}

.timeline-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border-left: 3px solid #dee2e6;
}

.timeline-item.timeline-status .timeline-content {
  border-left-color: #0dcaf0;
}

.timeline-item.timeline-payment .timeline-content {
  border-left-color: #198754;
}

.timeline-item.timeline-edit .timeline-content {
  border-left-color: #ffc107;
}

.timeline-item.timeline-create .timeline-content {
  border-left-color: #0d6efd;
}

.timeline-item.timeline-cancel .timeline-content {
  border-left-color: #dc3545;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timeline-title {
  font-weight: 600;
  color: #212529;
}

.timeline-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.timeline-body {
  font-size: 0.9rem;
  color: #495057;
}

.timeline-user {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.timeline-change {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}
</style>

