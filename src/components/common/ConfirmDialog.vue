<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-overlay" @click="handleOverlayClick">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="confirm-content">
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
        </div>
        <div class="confirm-actions">
          <button 
            class="btn btn-cancel" 
            @click="handleCancel"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
          <button 
            :class="['btn', 'btn-confirm', `btn-${type}`]" 
            @click="handleConfirm"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'danger',
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: String,
    default: 'Bạn có chắc chắn muốn thực hiện hành động này?'
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const isVisible = ref(false)
const loading = ref(false)

const iconClass = computed(() => {
  const icons = {
    danger: 'bi bi-exclamation-triangle-fill text-danger',
    warning: 'bi bi-exclamation-circle-fill text-warning',
    info: 'bi bi-info-circle-fill text-info',
    success: 'bi bi-check-circle-fill text-success'
  }
  return icons[props.type]
})

const show = () => {
  isVisible.value = true
  loading.value = false
}

const hide = () => {
  isVisible.value = false
  loading.value = false
}

const handleOverlayClick = () => {
  if (!loading.value) {
    handleCancel()
  }
}

const handleCancel = () => {
  if (!loading.value) {
    hide()
    emit('cancel')
  }
}

const handleConfirm = async () => {
  loading.value = true
  try {
    await emit('confirm')
    hide()
  } catch (error) {
    loading.value = false
    // Keep dialog open on error
  }
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 90%;
  padding: 24px;
  text-align: center;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.confirm-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-confirm {
  color: white;
}

.btn-danger {
  background: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-warning {
  background: #f59e0b;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-info {
  background: #3b82f6;
}

.btn-info:hover:not(:disabled) {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
