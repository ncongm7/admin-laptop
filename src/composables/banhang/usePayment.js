import { ref } from 'vue'
import { thanhToanHoaDon, kiemTraVaCapNhatGia } from '@/service/banhang/banHangService'
import { inHoaDon, layThongTinHoaDon } from '@/service/banhang/hoaDonService'
import { useInvoiceStore } from '@/stores/hoadon/invoiceStore'
import { useToast } from '@/composables/common/useToast'

/**
 * Composable quản lý thanh toán
 * Xử lý: mở modal thanh toán, xác nhận thanh toán
 */
export function usePayment(
  hoaDonHienTai,
  xoaHoaDonSauThanhToan,
  capNhatHoaDon,
  ensureHoaDonTonTai,
) {
  const { error: showError, success: showSuccess, warning: showWarning } = useToast()
  const invoiceStore = useInvoiceStore()
  const isLoading = ref(false)
  const showPaymentModal = ref(false)

  const ensureHoaDonReady =
    typeof ensureHoaDonTonTai === 'function' ? ensureHoaDonTonTai : async () => hoaDonHienTai.value

  /**
   * In hóa đơn sau khi thanh toán thành công
   */
  const printInvoiceAfterPayment = async (hoaDonId) => {
    const blob = await inHoaDon(hoaDonId)
    if (!blob) {
      throw new Error('Không nhận được dữ liệu hóa đơn để in')
    }

    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')

    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      }
    } else {
      const link = document.createElement('a')
      link.href = url
      link.download = `HoaDon_${hoaDonId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

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

    try {
      await ensureHoaDonReady()
    } catch (error) {
      console.error('❌ [usePayment] Không thể sync hóa đơn trước khi mở modal thanh toán:', error)
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
    try {
      await ensureHoaDonReady()
    } catch (error) {
      console.error('❌ [usePayment] Không thể sync hóa đơn trước khi thanh toán:', error)
      return { success: false, error: error.message }
    }

    isLoading.value = true
    try {
      const response = await thanhToanHoaDon(hoaDonHienTai.value.id, paymentData)

      if (response) {
        const responseWrapper = response.data || response
        const hoaDonResponse = responseWrapper?.data || responseWrapper

        if (
          hoaDonResponse &&
          hoaDonResponse.trangThaiThanhToan === 1 &&
          !hoaDonResponse.trangThai
        ) {
          hoaDonResponse.trangThai = 'DA_THANH_TOAN'
        }

        // Thông báo thành công trước khi điều hướng
        showSuccess('Thanh toán thành công!')

        // Đồng bộ dữ liệu hóa đơn vào store để trang chi tiết dùng lại ngay
        let normalizedInvoice = null
        try {
          normalizedInvoice = invoiceStore.upsertInvoice(hoaDonResponse, {
            payment: paymentData,
            staffName:
              hoaDonHienTai.value?.tenNhanVien ||
              hoaDonHienTai.value?.nhanVien?.hoTen ||
              hoaDonHienTai.value?.nhanVien?.tenNhanVien ||
              null,
          })
          if (normalizedInvoice?.code) {
            invoiceStore.updateInvoiceStatus(normalizedInvoice.code, 'DA_THANH_TOAN')
          }
        } catch (storeError) {
          console.warn('⚠️ [usePayment] Không thể đồng bộ hóa đơn vào store:', storeError)
        }

        if (capNhatHoaDon && typeof capNhatHoaDon === 'function') {
          try {
            capNhatHoaDon(hoaDonResponse)
          } catch (updateError) {
            console.warn('⚠️ [usePayment] Không thể cập nhật hóa đơn hiện tại:', updateError)
          }
        }

        // Đóng modal thanh toán NGAY LẬP TỨC trước khi xử lý gì khác
        closePaymentModal()

        // Xóa hóa đơn khỏi danh sách chờ
        xoaHoaDonSauThanhToan()

        // Trả về hóa đơn đã thanh toán để component cha xử lý (mở preview modal)
        return {
          success: true,
          hoaDon: normalizedInvoice || hoaDonResponse,
          id: normalizedInvoice?.id || hoaDonResponse?.id || hoaDonHienTai.value?.id,
          ma: normalizedInvoice?.code || hoaDonResponse?.ma || hoaDonHienTai.value?.ma,
        }
      }

      // Nếu không có response, trả về lỗi
      return { success: false, error: 'Không nhận được phản hồi từ server' }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        'Thanh toán thất bại. Vui lòng thử lại!'
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

      // Trả về lỗi để component cha biết
      return { success: false, error: errorMessage }
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
