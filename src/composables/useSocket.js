import { onMounted, onUnmounted, ref } from 'vue'
import socketService from '@/service/socketService'

/**
 * Composable để sử dụng socket trong components
 */
export function useSocket() {
  const isConnected = ref(false)
  const subscriptions = ref([])

  /**
   * Kết nối socket
   */
  const connect = () => {
    socketService.connect()
    
    // Lắng nghe sự kiện kết nối
    socketService.on('connect', () => {
      isConnected.value = true
    })

    // Lắng nghe sự kiện ngắt kết nối
    socketService.on('disconnect', () => {
      isConnected.value = false
    })

    // Lắng nghe lỗi
    socketService.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  /**
   * Subscribe vào một topic
   * @param {string} destination - Đường dẫn topic
   * @param {Function} callback - Callback khi nhận message
   * @param {string} id - ID của subscription
   */
  const subscribe = (destination, callback, id = null) => {
    const subscriptionId = socketService.subscribe(destination, callback, id)
    if (subscriptionId) {
      subscriptions.value.push(subscriptionId)
    }
    return subscriptionId
  }

  /**
   * Unsubscribe từ một topic
   * @param {string} subscriptionId - ID của subscription
   */
  const unsubscribe = (subscriptionId) => {
    socketService.unsubscribe(subscriptionId)
    const index = subscriptions.value.indexOf(subscriptionId)
    if (index > -1) {
      subscriptions.value.splice(index, 1)
    }
  }

  /**
   * Gửi message
   * @param {string} destination - Đường dẫn destination
   * @param {Object} body - Body của message
   */
  const send = (destination, body) => {
    return socketService.send(destination, body)
  }

  /**
   * Ngắt kết nối
   */
  const disconnect = () => {
    // Unsubscribe tất cả
    subscriptions.value.forEach((id) => {
      socketService.unsubscribe(id)
    })
    subscriptions.value = []
    
    // Có thể không disconnect hoàn toàn nếu muốn giữ kết nối cho các component khác
    // socketService.disconnect()
  }

  // Tự động kết nối khi component mount
  onMounted(() => {
    connect()
  })

  // Tự động cleanup khi component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    socketService
  }
}

