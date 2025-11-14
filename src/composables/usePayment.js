import { ref } from 'vue'
import { thanhToanHoaDon } from '@/service/banhang/banHangService'
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

        // Xóa hóa đơn khỏi danh sách chờ
        xoaHoaDonSauThanhToan()

        // Đóng modal
        closePaymentModal()

        // TODO: In hóa đơn hoặc chuyển sang trang chi tiết hóa đơn
        console.log('Thanh toán thành công:', response.data)
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
