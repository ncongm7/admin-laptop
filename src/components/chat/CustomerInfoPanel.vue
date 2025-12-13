<template>
  <div v-if="isOpen" class="customer-info-panel">
    <div class="panel-overlay" @click="close"></div>
    <div class="panel-content">
      <div class="panel-header">
        <h5 class="mb-0">Thông tin khách hàng</h5>
        <button class="btn btn-sm btn-link" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div v-if="isLoading" class="panel-body text-center py-4">
        <div class="spinner-border spinner-border-sm" role="status"></div>
      </div>

      <div v-else-if="customerInfo" class="panel-body">
        <!-- Customer Basic Info -->
        <div class="info-section">
          <h6 class="section-title">
            <i class="bi bi-person"></i>
            Thông tin cơ bản
          </h6>
          <div class="info-item">
            <span class="info-label">Họ tên:</span>
            <span class="info-value">{{ customerInfo.hoTen || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mã KH:</span>
            <span class="info-value">{{ customerInfo.maKhachHang || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">SĐT:</span>
            <span class="info-value">{{ customerInfo.soDienThoai || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ customerInfo.email || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Địa chỉ:</span>
            <span class="info-value">{{ customerInfo.diaChi || 'N/A' }}</span>
          </div>
        </div>

        <!-- Order History -->
        <div class="info-section">
          <h6 class="section-title">
            <i class="bi bi-bag"></i>
            Lịch sử mua hàng
          </h6>
          <div class="info-item">
            <span class="info-label">Tổng đơn hàng:</span>
            <span class="info-value">{{ orderStats.totalOrders || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tổng tiền đã mua:</span>
            <span class="info-value">{{ formatPrice(orderStats.totalAmount || 0) }} VNĐ</span>
          </div>
          <div class="info-item">
            <span class="info-label">Đơn hàng gần nhất:</span>
            <span class="info-value">{{ orderStats.lastOrderDate || 'Chưa có' }}</span>
          </div>
        </div>

        <!-- Chat History -->
        <div class="info-section">
          <h6 class="section-title">
            <i class="bi bi-chat-dots"></i>
            Lịch sử chat
          </h6>
          <div class="info-item">
            <span class="info-label">Số cuộc trò chuyện:</span>
            <span class="info-value">{{ chatStats.totalConversations || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tin nhắn chưa đọc:</span>
            <span class="info-value">{{ chatStats.unreadMessages || 0 }}</span>
          </div>
        </div>

        <!-- Notes Section -->
        <div class="info-section">
          <h6 class="section-title">
            <i class="bi bi-sticky"></i>
            Ghi chú
          </h6>
          <textarea
            v-model="notes"
            class="form-control"
            rows="3"
            placeholder="Thêm ghi chú về khách hàng..."
            @blur="saveNotes"
          ></textarea>
        </div>
      </div>

      <div v-else class="panel-body text-center py-4">
        <p class="text-muted">Không tìm thấy thông tin khách hàng</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  customerId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const customerInfo = ref(null)
const orderStats = ref({})
const chatStats = ref({})
const notes = ref('')
const isLoading = ref(false)

const API_URL = 'http://localhost:8080/api'

const loadCustomerInfo = async () => {
  if (!props.customerId) return

  isLoading.value = true
  try {
    // Load customer info
    const customerRes = await axios.get(`${API_URL}/khach-hang/${props.customerId}`)
    customerInfo.value = customerRes.data?.data || customerRes.data

    // Load order stats
    try {
      const ordersRes = await axios.get(`${API_URL}/hoadon/khach-hang/${props.customerId}`)
      const orders = ordersRes.data?.data || ordersRes.data || []
      
      orderStats.value = {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + (order.tongTienSauGiam || 0), 0),
        lastOrderDate: orders.length > 0 && orders[0].ngayTao 
          ? new Date(orders[0].ngayTao).toLocaleDateString('vi-VN')
          : 'Chưa có'
      }
    } catch (error) {
      console.warn('Could not load order stats:', error)
      orderStats.value = { totalOrders: 0, totalAmount: 0, lastOrderDate: 'Chưa có' }
    }

    // Load chat stats
    try {
      const chatRes = await axios.get(`${API_URL}/chat/customer/${props.customerId}/conversations`)
      const conversations = chatRes.data?.data || chatRes.data || []
      
      chatStats.value = {
        totalConversations: conversations.length,
        unreadMessages: conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
      }
    } catch (error) {
      console.warn('Could not load chat stats:', error)
      chatStats.value = { totalConversations: 0, unreadMessages: 0 }
    }

    // Load notes (from localStorage for now, can be moved to backend)
    const savedNotes = localStorage.getItem(`customer_notes_${props.customerId}`)
    notes.value = savedNotes || ''

  } catch (error) {
    console.error('Error loading customer info:', error)
    customerInfo.value = null
  } finally {
    isLoading.value = false
  }
}

const saveNotes = () => {
  if (props.customerId) {
    localStorage.setItem(`customer_notes_${props.customerId}`, notes.value)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

const close = () => {
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.customerId) {
    loadCustomerInfo()
  }
})

watch(() => props.customerId, (newVal) => {
  if (props.isOpen && newVal) {
    loadCustomerInfo()
  }
})
</script>

<style scoped>
.customer-info-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
}

.panel-overlay {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
}

.panel-content {
  width: 400px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.info-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #667eea;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 13px;
}

.info-value {
  color: #333;
  font-size: 13px;
  text-align: right;
  flex: 1;
  margin-left: 12px;
}

/* Scrollbar */
.panel-body::-webkit-scrollbar {
  width: 6px;
}

.panel-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.panel-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.panel-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

