import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class SocketService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.subscriptions = new Map() // Lưu các subscription để có thể unsubscribe sau
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000 // 3 giây
    this.listeners = new Map() // Lưu các event listeners
    this.isEnabled = true // Flag để bật/tắt socket
    this.backendUnsupported = false // Flag để đánh dấu backend không hỗ trợ WebSocket
  }

  /**
   * Khởi tạo kết nối WebSocket
   */
  connect() {
    // Kiểm tra xem socket có được bật không
    if (!this.isEnabled) {
      console.log('Socket đã bị vô hiệu hóa')
      return
    }

    // Nếu backend không hỗ trợ WebSocket, không thử kết nối
    if (this.backendUnsupported) {
      console.warn('Backend không hỗ trợ WebSocket, bỏ qua kết nối')
      return
    }

    if (this.client && this.isConnected) {
      console.log('Socket đã được kết nối')
      return
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('Không có token, không thể kết nối socket')
      return
    }

    // Tạo SockJS connection
    const socket = new SockJS('http://localhost:8080/ws')
    
    // Tạo STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Chỉ log trong development
        if (import.meta.env.DEV) {
          console.log('STOMP:', str)
        }
      },
      onConnect: (frame) => {
        console.log('✅ Socket đã kết nối thành công')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Đợi một chút để đảm bảo STOMP connection hoàn toàn sẵn sàng
        setTimeout(() => {
          // Gửi token để xác thực (nếu backend yêu cầu)
          if (token && this.client && this.client.connected) {
            try {
              this.client.publish({
                destination: '/app/auth',
                body: JSON.stringify({ token })
              })
            } catch (error) {
              console.warn('Không thể gửi token xác thực:', error)
            }
          }

          // Gọi các listeners đã đăng ký
          const connectListeners = this.listeners.get('connect')
          if (connectListeners && Array.isArray(connectListeners)) {
            connectListeners.forEach((callback) => {
              try {
                if (typeof callback === 'function') {
                  callback(frame)
                }
              } catch (error) {
                console.error('Lỗi trong connect listener:', error)
              }
            })
          }

          // Resubscribe các subscriptions đã đăng ký trước đó
          this.resubscribeAll()
        }, 100) // Đợi 100ms để STOMP connection sẵn sàng
      },
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame)
        this.isConnected = false
        
        // Kiểm tra nếu lỗi do backend không hỗ trợ
        const errorMessage = frame?.headers?.message || frame?.body || ''
        if (errorMessage.includes('No static resource') || errorMessage.includes('404') || errorMessage.includes('500')) {
          console.warn('⚠️ Backend không hỗ trợ WebSocket, vô hiệu hóa socket')
          this.backendUnsupported = true
          this.isEnabled = false
        }
        
        // Gọi error listeners
        const errorListeners = this.listeners.get('error')
        if (errorListeners && Array.isArray(errorListeners)) {
          errorListeners.forEach((callback) => {
            try {
              if (typeof callback === 'function') {
                callback(frame)
              }
            } catch (error) {
              console.error('Lỗi trong error listener:', error)
            }
          })
        }
      },
      onWebSocketClose: (event) => {
        // Kiểm tra nếu close do lỗi backend không hỗ trợ
        if (this.backendUnsupported) {
          console.warn('WebSocket đã đóng - Backend không hỗ trợ')
          return
        }

        console.warn('⚠️ WebSocket đã đóng:', event)
        this.isConnected = false
        
        // Gọi disconnect listeners
        const disconnectListeners = this.listeners.get('disconnect')
        if (disconnectListeners && Array.isArray(disconnectListeners)) {
          disconnectListeners.forEach((callback) => {
            try {
              if (typeof callback === 'function') {
                callback(event)
              }
            } catch (error) {
              console.error('Lỗi trong disconnect listener:', error)
            }
          })
        }

        // Thử kết nối lại nếu chưa vượt quá số lần thử và backend hỗ trợ
        if (!this.backendUnsupported && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`Đang thử kết nối lại lần ${this.reconnectAttempts}...`)
          setTimeout(() => {
            this.connect()
          }, this.reconnectDelay)
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Đã vượt quá số lần thử kết nối lại')
          // Đánh dấu backend không hỗ trợ sau nhiều lần thử thất bại
          this.backendUnsupported = true
        }
      },
      onDisconnect: () => {
        console.log('Socket đã ngắt kết nối')
        this.isConnected = false
        this.subscriptions.clear()
      }
    })

    // Xử lý lỗi khi tạo socket
    socket.onerror = (error) => {
      console.error('❌ SockJS Error:', error)
      // Kiểm tra nếu lỗi 404 hoặc 500, có thể backend không hỗ trợ
      if (error?.target?.status === 404 || error?.target?.status === 500) {
        console.warn('⚠️ Backend không hỗ trợ WebSocket endpoint /ws')
        this.backendUnsupported = true
        this.isEnabled = false
      }
    }

    // Bắt đầu kết nối
    try {
      this.client.activate()
    } catch (error) {
      console.error('❌ Lỗi khi kích hoạt STOMP client:', error)
      this.backendUnsupported = true
    }
  }

  /**
   * Ngắt kết nối
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe tất cả
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()

      // Ngắt kết nối
      this.client.deactivate()
      this.client = null
      this.isConnected = false
      console.log('Socket đã ngắt kết nối')
    }
  }

  /**
   * Subscribe vào một topic
   * @param {string} destination - Đường dẫn topic (ví dụ: '/topic/notifications')
   * @param {Function} callback - Callback khi nhận được message
   * @param {string} id - ID của subscription (để unsubscribe sau)
   */
  subscribe(destination, callback, id = null) {
    // Kiểm tra cả isConnected và client.connected
    if (!this.client || !this.isConnected || !this.client.connected) {
      console.warn('Socket chưa kết nối, không thể subscribe. Lưu vào pending subscriptions.')
      // Lưu lại để subscribe sau khi kết nối
      this.pendingSubscriptions = this.pendingSubscriptions || []
      this.pendingSubscriptions.push({ destination, callback, id })
      return null
    }

    try {
      const subscriptionId = id || `sub-${Date.now()}-${Math.random()}`
      
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body)
          callback(data, message)
        } catch (error) {
          // Nếu không parse được JSON, trả về raw body
          callback(message.body, message)
        }
      })

      this.subscriptions.set(subscriptionId, subscription)
      console.log(`✅ Đã subscribe vào ${destination} với ID: ${subscriptionId}`)
      
      return subscriptionId
    } catch (error) {
      console.error(`❌ Lỗi khi subscribe vào ${destination}:`, error)
      // Lưu vào pending để thử lại sau
      this.pendingSubscriptions = this.pendingSubscriptions || []
      this.pendingSubscriptions.push({ destination, callback, id })
      return null
    }
  }

  /**
   * Unsubscribe từ một topic
   * @param {string} subscriptionId - ID của subscription
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionId)
      console.log(`Đã unsubscribe ${subscriptionId}`)
    }
  }

  /**
   * Gửi message đến một destination
   * @param {string} destination - Đường dẫn destination
   * @param {Object} body - Body của message
   */
  send(destination, body) {
    if (!this.client || !this.isConnected) {
      console.warn('Socket chưa kết nối, không thể gửi message')
      return false
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    })

    return true
  }

  /**
   * Resubscribe tất cả các subscriptions đã đăng ký
   */
  resubscribeAll() {
    // Xử lý các subscriptions đang chờ
    if (this.pendingSubscriptions && this.pendingSubscriptions.length > 0) {
      this.pendingSubscriptions.forEach(({ destination, callback, id }) => {
        this.subscribe(destination, callback, id)
      })
      this.pendingSubscriptions = []
    }
  }

  /**
   * Đăng ký event listener
   * @param {string} event - Tên event: 'connect', 'disconnect', 'error'
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * Hủy đăng ký event listener
   * @param {string} event - Tên event
   * @param {Function} callback - Callback function cần xóa
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      isEnabled: this.isEnabled,
      backendUnsupported: this.backendUnsupported,
      clientConnected: this.client?.connected || false
    }
  }

  /**
   * Bật/tắt socket
   * @param {boolean} enabled - true để bật, false để tắt
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    if (!enabled) {
      this.disconnect()
    }
  }

  /**
   * Reset trạng thái backend unsupported (dùng khi backend đã được cấu hình)
   */
  resetBackendStatus() {
    this.backendUnsupported = false
    this.reconnectAttempts = 0
  }
}

// Export singleton instance
export default new SocketService()

