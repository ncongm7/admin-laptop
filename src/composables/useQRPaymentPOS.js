import { ref, onMounted, onUnmounted } from 'vue'
import { generateQRPayment, checkPaymentStatus } from '@/service/banhang/paymentService'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * Composable xử lý thanh toán QR cho POS Admin
 * @param {Object} options - { hoaDon, onPaymentConfirmed }
 */
export function useQRPaymentPOS(options = {}) {
  const { hoaDon, onPaymentConfirmed } = options

  // State
  const qrCodeData = ref(null)
  const loading = ref(false)
  const error = ref('')
  const status = ref('pending') // pending | checking | confirmed | expired
  const showQRModal = ref(false)
  const transactionId = ref('')

  let stompClient = null
  let paymentCheckInterval = null

  /**
   * Tạo QR code thanh toán cho POS
   */
  const generateQR = async () => {
    if (!hoaDon.value) {
      error.value = 'Không tìm thấy thông tin hóa đơn'
      return
    }

    loading.value = true
    error.value = ''
    status.value = 'pending'

    try {
      console.log('🔄 [useQRPaymentPOS] Generating QR for invoice:', hoaDon.value.id)

      const response = await generateQRPayment({
        hoaDonId: hoaDon.value.id,
        amount: hoaDon.value.tongTienSauGiam || hoaDon.value.tongTien,
        orderCode: hoaDon.value.ma,
        description: `Thanh toan hoa don ${hoaDon.value.ma}`,
      })

      qrCodeData.value = response.data
      showQRModal.value = true
      status.value = 'checking'

      console.log('✅ [useQRPaymentPOS] QR generated:', qrCodeData.value)

      // Kết nối WebSocket để nhận thông báo thanh toán
      connectWebSocket()
    } catch (err) {
      console.error('❌ [useQRPaymentPOS] Generate QR error:', err)
      error.value = err.response?.data?.message || 'Không thể tạo mã QR. Vui lòng thử lại.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Kết nối WebSocket để nhận thông báo thanh toán
   */
  const connectWebSocket = () => {
    if (!hoaDon.value?.id) return

    try {
      const socket = new SockJS('http://localhost:8080/ws')
      stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('🔌 [WebSocket]', str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      stompClient.onConnect = () => {
        console.log('✅ [WebSocket] Connected for payment notification')

        // Subscribe to payment confirmation topic
        stompClient.subscribe(`/topic/payment-confirmed/${hoaDon.value.id}`, (message) => {
          console.log('💰 [WebSocket] Payment confirmed:', message.body)

          const data = JSON.parse(message.body)
          handlePaymentConfirmed(data)
        })
      }

      stompClient.onStompError = (frame) => {
        console.error('❌ [WebSocket] Error:', frame.headers['message'])
        console.error('Details:', frame.body)
      }

      stompClient.activate()
    } catch (err) {
      console.error('❌ [useQRPaymentPOS] WebSocket connection error:', err)
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnectWebSocket = () => {
    if (stompClient && stompClient.connected) {
      stompClient.deactivate()
      console.log('🔌 [WebSocket] Disconnected')
    }
  }

  /**
   * Xử lý khi thanh toán được xác nhận
   */
  const handlePaymentConfirmed = (paymentData) => {
    status.value = 'confirmed'
    transactionId.value = paymentData.transactionId

    console.log('✅ [useQRPaymentPOS] Payment confirmed:', paymentData)

    // Gọi callback
    if (onPaymentConfirmed) {
      onPaymentConfirmed(paymentData)
    }

    // Tự động đóng modal sau 2 giây
    setTimeout(() => {
      closeQRModal()
    }, 2000)
  }

  /**
   * Đóng QR modal
   */
  const closeQRModal = () => {
    showQRModal.value = false
    disconnectWebSocket()
    reset()
  }

  /**
   * Xử lý khi QR code hết hạn
   */
  const handleExpired = () => {
    status.value = 'expired'
    error.value = 'Mã QR đã hết hạn. Vui lòng tạo lại.'
  }

  /**
   * Reset state
   */
  const reset = () => {
    qrCodeData.value = null
    loading.value = false
    error.value = ''
    status.value = 'pending'
    transactionId.value = ''
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnectWebSocket()
  })

  return {
    // State
    qrCodeData,
    loading,
    error,
    status,
    showQRModal,
    transactionId,

    // Methods
    generateQR,
    closeQRModal,
    handleExpired,
    reset,
  }
}
