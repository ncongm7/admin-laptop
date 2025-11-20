import { ref } from 'vue'
import { thanhToanHoaDon } from '@/service/banhang/banHangService'
import { inHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'

/**
 * Composable quản lý thanh toán
 * Xử lý: mở modal thanh toán, xác nhận thanh toán
 */
export function usePayment(hoaDonHienTai, xoaHoaDonSauThanhToan) {
  const { error: showError, success: showSuccess, warning: showWarning } = useToast()
  const isLoading = ref(false)
  const showPaymentModal = ref(false)

  /**
   * Mở modal thanh toán
   */
  const openPaymentModal = () => {
    if (
      !hoaDonHienTai.value ||
      !hoaDonHienTai.value.hoaDonChiTiet ||
      hoaDonHienTai.value.hoaDonChiTiet.length === 0
    ) {
      showWarning('Vui lòng thêm sản phẩm vào hóa đơn trước khi thanh toán!')
      return
    }
    showPaymentModal.value = true
  }

  /**
   * Xử lý xác nhận thanh toán
   */
  const handlePaymentConfirmed = async (paymentData) => {
    isLoading.value = true
    try {
      const response = await thanhToanHoaDon(hoaDonHienTai.value.id, paymentData)

      if (response && response.data) {
        // Thông báo thành công
        showSuccess('Thanh toán thành công!')

        // Lưu ID hóa đơn để in sau
        const hoaDonId = hoaDonHienTai.value.id

        // Xóa hóa đơn khỏi danh sách chờ
        xoaHoaDonSauThanhToan()

        // Đóng modal
        closePaymentModal()

        // Tự động in hóa đơn sau khi thanh toán thành công
        try {
          await printInvoiceAfterPayment(hoaDonId)
        } catch (error) {
          console.error('Lỗi khi in hóa đơn:', error)
          // Không hiển thị lỗi vì thanh toán đã thành công, chỉ log
        }
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error)
      showError(error.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Đóng modal thanh toán
   */
  const closePaymentModal = () => {
    showPaymentModal.value = false
  }

  /**
   * In hóa đơn sau khi thanh toán thành công
   */
  const printInvoiceAfterPayment = async (hoaDonId) => {
    try {
      const blob = await inHoaDon(hoaDonId)
      
      // Tạo URL từ blob
      const url = URL.createObjectURL(blob)
      
      // Mở cửa sổ mới để in
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          // Cleanup sau khi in
          setTimeout(() => {
            URL.revokeObjectURL(url)
          }, 1000)
        }
      } else {
        // Nếu popup bị chặn, tải file về
        const link = document.createElement('a')
        link.href = url
        link.download = `HoaDon_${hoaDonId}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Lỗi khi in hóa đơn:', error)
      throw error
    }
  }

  return {
    // State
    isLoading,
    showPaymentModal,

    // Methods
    openPaymentModal,
    handlePaymentConfirmed,
    closePaymentModal,
  }
}
