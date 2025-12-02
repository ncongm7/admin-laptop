import { ref } from 'vue'
import { thanhToanHoaDon, kiemTraVaCapNhatGia } from '@/service/banhang/banHangService'
import { inHoaDon, layThongTinHoaDon } from '@/service/banhang/hoaDonService'
import { useToast } from '@/composables/useToast'

/**
 * Composable quản lý thanh toán
 * Xử lý: mở modal thanh toán, xác nhận thanh toán
 */
export function usePayment(hoaDonHienTai, xoaHoaDonSauThanhToan, capNhatHoaDon) {
  const { error: showError, success: showSuccess, warning: showWarning } = useToast()
  const isLoading = ref(false)
  const showPaymentModal = ref(false)

  /**
   * Mở modal thanh toán
   * Trước khi mở modal, kiểm tra và cập nhật giá sản phẩm (nếu có thay đổi)
   */
  const openPaymentModal = async () => {
    if (
      !hoaDonHienTai.value ||
      !hoaDonHienTai.value.hoaDonChiTiet ||
      hoaDonHienTai.value.hoaDonChiTiet.length === 0
    ) {
      showWarning('Vui lòng thêm sản phẩm vào hóa đơn trước khi thanh toán!')
      return
    }

    // Kiểm tra và cập nhật giá trước khi mở modal thanh toán
    try {
      console.log('🔍 [usePayment] Kiểm tra giá sản phẩm trước khi thanh toán...')
      const response = await kiemTraVaCapNhatGia(hoaDonHienTai.value.id)
      
      // Parse response
      const data = response?.data || response
      
      if (data && data.coThayDoi && capNhatHoaDon) {
        // Có thay đổi giá, cập nhật hóa đơn và hiển thị thông báo
        capNhatHoaDon(data.hoaDon)
        
        // Tạo thông báo chi tiết
        let thongBao = `Đã cập nhật giá của ${data.soSanPhamThayDoi} sản phẩm:\n`
        if (data.danhSachThayDoi && data.danhSachThayDoi.length > 0) {
          data.danhSachThayDoi.forEach((item, index) => {
            thongBao += `${index + 1}. ${item.tenSanPham}: ${formatCurrency(item.giaCu)} → ${formatCurrency(item.giaMoi)}\n`
          })
        }
        thongBao += '\nVui lòng kiểm tra lại giá trước khi thanh toán.'
        
        showWarning(thongBao)
        console.log('✅ [usePayment] Đã cập nhật giá sản phẩm:', data.danhSachThayDoi)
      }
    } catch (error) {
      console.error('❌ [usePayment] Lỗi khi kiểm tra giá:', error)
      // Không chặn việc mở modal, chỉ log lỗi
      showError('Không thể kiểm tra giá sản phẩm. Vui lòng thử lại.')
      return
    }

    // Mở modal thanh toán
    showPaymentModal.value = true
  }

  /**
   * Helper: Format currency
   */
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
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
      const errorMessage = error.response?.data?.message || error.response?.data?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại!'
      showError(errorMessage)
      
      // Reload hóa đơn để đồng bộ dữ liệu (giá có thể đã được backend cập nhật)
      if (hoaDonHienTai.value && capNhatHoaDon) {
        try {
          console.log('🔄 [usePayment] Đang reload hóa đơn để đồng bộ dữ liệu...')
          const response = await layThongTinHoaDon(hoaDonHienTai.value.id)
          
          if (response && response.data) {
            capNhatHoaDon(response.data)
            console.log('✅ [usePayment] Đã reload hóa đơn thành công')
          }
        } catch (reloadError) {
          console.error('❌ [usePayment] Lỗi khi reload hóa đơn:', reloadError)
        }
      }
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
