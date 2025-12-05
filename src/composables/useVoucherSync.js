import { onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import SockJS from 'sockjs-client'
import { Stomp } from '@stomp/stompjs'

/**
 * Composable để đồng bộ real-time khi voucher bị thay đổi/xóa
 * Sử dụng WebSocket để nhận thông báo từ backend
 */
export function useVoucherSync(hoaDonHienTai, onVoucherInvalidated) {
  const { warning } = useToast()

  let stompClient = null
  let subscription = null

  const connect = () => {
    try {
      const socket = new SockJS('http://localhost:8080/ws')
      stompClient = Stomp.over(socket)

      // Tắt debug log
      stompClient.debug = () => {}

      stompClient.connect(
        {},
        (frame) => {
          console.log('✅ [VoucherSync] Đã kết nối WebSocket')

          // Subscribe vào topic voucher-invalidated
          subscription = stompClient.subscribe('/topic/voucher-invalidated', (message) => {
            try {
              const notification = JSON.parse(message.body)
              console.log('🔔 [VoucherSync] Nhận thông báo voucher:', notification)

              // Kiểm tra xem có phải hóa đơn hiện tại không
              if (hoaDonHienTai.value && notification.invoiceId === hoaDonHienTai.value.id) {
                console.log('⚠️ [VoucherSync] Voucher của hóa đơn hiện tại đã bị vô hiệu!')

                // Hiển thị thông báo
                warning(
                  `Voucher "${notification.voucherCode}" đã bị ${notification.reason.includes('xóa') ? 'xóa' : 'cập nhật'}. Vui lòng kiểm tra lại giá!`,
                )

                // Gọi callback để refresh hóa đơn
                if (onVoucherInvalidated) {
                  onVoucherInvalidated(notification)
                }
              }
            } catch (error) {
              console.error('❌ [VoucherSync] Lỗi khi xử lý thông báo:', error)
            }
          })

          console.log('✅ [VoucherSync] Đã subscribe vào /topic/voucher-invalidated')
        },
        (error) => {
          console.error('❌ [VoucherSync] Lỗi kết nối WebSocket:', error)
        },
      )
    } catch (error) {
      console.error('❌ [VoucherSync] Lỗi khởi tạo WebSocket:', error)
    }
  }

  const disconnect = () => {
    if (subscription) {
      subscription.unsubscribe()
      console.log('🔌 [VoucherSync] Đã unsubscribe khỏi /topic/voucher-invalidated')
    }
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log('🔌 [VoucherSync] Đã ngắt kết nối WebSocket')
      })
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
  }
}
