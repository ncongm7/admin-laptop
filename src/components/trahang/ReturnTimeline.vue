<template>
  <div class="return-timeline">
    <div class="card card-soft">
      <div class="card-header">
        <h5 class="mb-0">Lịch sử xử lý</h5>
      </div>
      <div class="card-body">
        <div class="timeline">
          <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else-if="timelineItems.length === 0" class="text-center py-3 text-muted">
            <i class="bi bi-clock-history fs-4"></i>
            <p class="mt-2 mb-0">Chưa có lịch sử xử lý</p>
          </div>

          <div v-else>
            <div v-for="(item, index) in timelineItems" :key="index" class="timeline-item">
              <div class="timeline-marker" :class="statusClass(item.action)"></div>
              <div class="timeline-content">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-1">{{ getActionText(item.action) }}</h6>
                  <small class="text-muted">{{ formatDateTime(item.timestamp) }}</small>
                </div>
                <p class="mb-1" v-if="item.processor">
                  <i class="bi bi-person-fill"></i>
                  {{ item.processor.name }}
                </p>
                <p class="mb-0 text-muted" v-if="item.notes">{{ item.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReturnStore } from '@/stores/returnStore'
import { formatDateTime } from '@/utils/formatters'

const props = defineProps({
  returnId: {
    type: [String, Number],
    required: true,
  },
})

const returnStore = useReturnStore()
const timelineItems = ref([])
const loading = ref(false)

const statusClass = (action) => {
  const classMap = {
    CREATE: 'bg-primary',
    APPROVE: 'bg-success',
    REJECT: 'bg-danger',
    COMPLETE: 'bg-secondary',
  }
  return classMap[action] || 'bg-info'
}

const getActionText = (action) => {
  const textMap = {
    CREATE: 'Tạo yêu cầu',
    APPROVE: 'Đã duyệt',
    REJECT: 'Từ chối',
    COMPLETE: 'Hoàn tất',
  }
  return textMap[action] || action
}

const fetchTimeline = async () => {
  try {
    loading.value = true
    const items = await returnStore.getReturnTimeline(props.returnId)
    timelineItems.value = items
  } catch (error) {
    console.error('Error fetching timeline:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTimeline()
})
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 1.5rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1.5rem;
  border-left: 2px solid #e9ecef;
}

.timeline-item:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}

.timeline-marker {
  position: absolute;
  left: -8px;
  top: 0;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
}

.timeline-content {
  padding: 0.5rem 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 0;
  width: 1.5rem;
  height: 14px;
}

.bg-primary {
  background-color: #0d6efd;
}

.bg-success {
  background-color: #198754;
}

.bg-danger {
  background-color: #dc3545;
}

.bg-secondary {
  background-color: #6c757d;
}

.bg-info {
  background-color: #0dcaf0;
}

.card-soft {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
  background-color: #ffffff;
}
</style>
