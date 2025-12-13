<template>
  <div class="message-templates">
    <button class="btn btn-sm btn-outline-secondary" @click="showTemplates = !showTemplates" title="Templates">
      <i class="bi bi-chat-quote"></i>
      <span class="d-none d-md-inline">Templates</span>
    </button>

    <!-- Templates Dropdown -->
    <div v-if="showTemplates" class="templates-dropdown">
      <div class="templates-header">
        <h6 class="mb-0">Message Templates</h6>
        <button class="btn btn-sm btn-link" @click="showTemplates = false">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="templates-list">
        <button
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          @click="selectTemplate(template)">
          <div class="template-title">
            <i :class="template.icon"></i>
            <span>{{ template.title }}</span>
          </div>
          <div class="template-preview">{{ template.text }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const showTemplates = ref(false)

const templates = ref([
  {
    id: 1,
    title: 'Chào hỏi',
    text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
    icon: 'bi bi-hand-thumbs-up'
  },
  {
    id: 2,
    title: 'Cảm ơn',
    text: 'Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi sớm nhất có thể!',
    icon: 'bi bi-heart'
  },
  {
    id: 3,
    title: 'Đơn hàng đang xử lý',
    text: 'Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật thông tin sớm nhất có thể.',
    icon: 'bi bi-box-seam'
  },
  {
    id: 4,
    title: 'Đơn hàng đã giao',
    text: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi!',
    icon: 'bi bi-check-circle'
  },
  {
    id: 5,
    title: 'Hỗ trợ bảo hành',
    text: 'Chúng tôi đã nhận được yêu cầu bảo hành của bạn. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
    icon: 'bi bi-shield-check'
  },
  {
    id: 6,
    title: 'Yêu cầu thông tin',
    text: 'Để hỗ trợ bạn tốt hơn, vui lòng cung cấp thêm thông tin về [vấn đề của bạn].',
    icon: 'bi bi-info-circle'
  }
])

const selectTemplate = (template) => {
  emit('select', template.text)
  showTemplates.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.message-templates')) {
    showTemplates.value = false
  }
}

// Add click outside listener
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.message-templates {
  position: relative;
}

.templates-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.templates-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.templates-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.templates-list {
  overflow-y: auto;
  max-height: 300px;
}

.template-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.template-item:hover {
  background: #f5f5f5;
}

.template-item:last-child {
  border-bottom: none;
}

.template-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  margin-bottom: 4px;
}

.template-title i {
  color: #667eea;
  font-size: 14px;
}

.template-preview {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Scrollbar */
.templates-list::-webkit-scrollbar {
  width: 6px;
}

.templates-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.templates-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.templates-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

