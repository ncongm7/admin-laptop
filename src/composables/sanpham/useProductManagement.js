import { ref, nextTick } from 'vue'
import { useToast } from '@/composables/common/useToast'
import { useConfirm } from '@/composables/common/useConfirm'
import {
  themSanPhamVaoHoaDon,
  xoaSanPhamKhoiHoaDon,
  timSanPhamTheoIMEI,
} from '@/service/banhang/banHangService'
import { xoaVoucher } from '@/service/banhang/voucherService'

/**
 * Composable quản lý sản phẩm trong hóa đơn
 * Xử lý: thêm sản phẩm, xóa sản phẩm, modal số lượng, quét IMEI
 */
export function useProductManagement(hoaDonHienTai, capNhatHoaDon, ensureHoaDonTonTai) {
  // Toast & Confirm
  const { error: showError, success: showSuccess, warning: showWarning } = useToast()
  const { showConfirm } = useConfirm()

  // State
  const isLoading = ref(false)
  const showQuantityModal = ref(false)
  const selectedProduct = ref(null)
  const soLuongNhap = ref(1)
  const quantityInput = ref(null)

  // Helper đảm bảo hóa đơn đã tồn tại trên backend
  const ensureHoaDonReady =
    typeof ensureHoaDonTonTai === 'function' ? ensureHoaDonTonTai : async () => hoaDonHienTai.value

  /**
   * Xử lý khi chọn sản phẩm từ tìm kiếm
   *
   * ProductSearch component emit cấu trúc mới:
   * {
   *   variant: ChiTietSanPhamResponse,  // Biến thể đã chọn
   *   quantity: Number,                 // Số lượng đã nhập
   *   product: SanPhamResponse          // Sản phẩm cha
   * }
   */
  const handleProductSelected = (data) => {
    console.log('📦 [useProductManagement] Nhận data từ ProductSearch:', data)

    // Kiểm tra xem data có phải là object mới (variant + quantity) hay object cũ (product trực tiếp)
    let variant, quantity, product

    if (data && data.variant) {
      // Cấu trúc mới từ ProductSearch component
      variant = data.variant
      quantity = data.quantity || 1
      product = data.product

      console.log('📦 [useProductManagement] Cấu trúc mới - Variant đã chọn:', {
        variantId: variant?.id,
        tenSanPham: variant?.tenSanPham,
        maCtsp: variant?.maCtsp,
        quantity: quantity,
      })
    } else {
      // Cấu trúc cũ - Tương thích ngược
      variant = data
      quantity = 1
      product = null

      console.log('📦 [useProductManagement] Cấu trúc cũ - Product trực tiếp:', {
        id: data?.id,
        maCTSP: data?.maCTSP || data?.maCtsp,
      })
    }

    // Validate variant structure
    if (!variant) {
      console.error('❌ [useProductManagement] Variant is null or undefined')
      showError('Lỗi: Không có thông tin sản phẩm!')
      return
    }

    if (!variant.id) {
      console.error('❌ [useProductManagement] Variant missing ID field!', variant)
      showError(
        `Lỗi: Sản phẩm "${variant.tenSP || variant.tenSanPham || 'Unknown'}" không có ID hợp lệ. Vui lòng thử lại!`,
      )
      return
    }

    // Lưu variant vào selectedProduct (vì logic cũ dùng selectedProduct)
    selectedProduct.value = variant
    soLuongNhap.value = quantity

    // Nếu đã nhập số lượng từ ProductSearch modal, gọi luôn confirmAddProduct
    if (data.variant && data.quantity) {
      console.log('✅ [useProductManagement] Đã nhập số lượng, thêm luôn vào hóa đơn')
      confirmAddProduct()
    } else {
      // Hiển thị modal số lượng (cấu trúc cũ)
      showQuantityModal.value = true

      // Focus vào input số lượng
      nextTick(() => {
        if (quantityInput.value) {
          quantityInput.value.focus()
        }
      })
    }
  }

  /**
   * Xác nhận thêm sản phẩm vào hóa đơn
   */
  const confirmAddProduct = async () => {
    if (!selectedProduct.value || !hoaDonHienTai.value) {
      console.error('❌ [useProductManagement] Thiếu thông tin:', {
        hasProduct: !!selectedProduct.value,
        hasHoaDon: !!hoaDonHienTai.value,
      })
      return
    }

    if (soLuongNhap.value < 1 || soLuongNhap.value > (selectedProduct.value.soLuongTon || 0)) {
      showError('Số lượng không hợp lệ!')
      return
    }

    // Validate product ID
    const productId = selectedProduct.value.id
    if (!productId) {
      console.error('❌ [useProductManagement] Product ID bị thiếu!', selectedProduct.value)
      showError('Lỗi: Không tìm thấy ID sản phẩm. Vui lòng chọn lại sản phẩm!')
      return
    }

    // Check if ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (typeof productId !== 'string' || !uuidRegex.test(productId)) {
      console.error('❌ [useProductManagement] Product ID không phải UUID hợp lệ!', {
        productId,
        product: selectedProduct.value,
        type: typeof productId,
      })
      showError(
        `Lỗi: ID sản phẩm không hợp lệ (${productId}). Có thể đây là mã sản phẩm (${selectedProduct.value.maCTSP || selectedProduct.value.maCtsp}), không phải UUID. Vui lòng thử lại!`,
      )
      return
    }

    // Đảm bảo hóa đơn đã được tạo trên backend trước khi thêm sản phẩm
    try {
      await ensureHoaDonReady()
    } catch (error) {
      console.error(
        '❌ [useProductManagement] Không thể sync hóa đơn trước khi thêm sản phẩm:',
        error,
      )
      return
    }

    if (!hoaDonHienTai.value) {
      showError('Hóa đơn không tồn tại. Vui lòng tạo hóa đơn mới!')
      return
    }

    isLoading.value = true
    try {
      const payload = {
        chiTietSanPhamId: productId,
        soLuong: soLuongNhap.value,
      }

      console.log('📤 [useProductManagement] Gửi yêu cầu thêm sản phẩm:', {
        idHoaDon: hoaDonHienTai.value.id,
        payload,
        productInfo: {
          tenSP: selectedProduct.value.tenSP || selectedProduct.value.tenSanPham,
          maCTSP: selectedProduct.value.maCTSP || selectedProduct.value.maCtsp,
          id: selectedProduct.value.id,
        },
      })

      const response = await themSanPhamVaoHoaDon(hoaDonHienTai.value.id, payload)

      if (response && response.data) {
        // Cập nhật hóa đơn
        capNhatHoaDon(response.data)

        // Đóng modal
        closeQuantityModal()

        console.log('✅ [useProductManagement] Thêm sản phẩm thành công')
        showSuccess(
          `Đã thêm "${selectedProduct.value.tenSP || selectedProduct.value.tenSanPham}" vào hóa đơn!`,
        )
      }
    } catch (error) {
      console.error('❌ [useProductManagement] Lỗi khi thêm sản phẩm:', error)

      // Log chi tiết response từ backend
      const errorData = error.response?.data
      console.error('❌ [useProductManagement] Chi tiết lỗi:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: errorData,
        dataString: JSON.stringify(errorData, null, 2),
        payload: {
          chiTietSanPhamId: selectedProduct.value.id,
          soLuong: soLuongNhap.value,
        },
      })

      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Không thể thêm sản phẩm. Vui lòng thử lại!'

      if (errorData) {
        // Backend có thể trả về nhiều cấu trúc khác nhau
        errorMessage =
          errorData.message || errorData.error || errorData.status || JSON.stringify(errorData)
      } else if (error.message) {
        errorMessage = error.message
      }

      console.error('❌ [useProductManagement] Thông báo lỗi sẽ hiển thị:', errorMessage)
      showError(`${errorMessage} (Mã lỗi: ${error.response?.status || 'Unknown'})`)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Kiểm tra và tự động xóa voucher nếu không đủ điều kiện
   */
  const checkAndRemoveInvalidVoucher = async (hoaDon) => {
    if (!hoaDon || !hoaDon.idPhieuGiamGia || !hoaDon.phieuGiamGia) {
      return // Không có voucher, không cần check
    }

    const voucher = hoaDon.phieuGiamGia
    const tongTien = hoaDon.tongTien || 0
    const hoaDonToiThieu = voucher.hoaDonToiThieu || 0

    // Kiểm tra điều kiện hóa đơn tối thiểu
    if (hoaDonToiThieu > 0 && tongTien < hoaDonToiThieu) {
      console.log('⚠️ [useProductManagement] Voucher không đủ điều kiện, tự động xóa:', {
        voucher: voucher.tenPhieuGiamGia || voucher.ma,
        tongTien,
        hoaDonToiThieu,
      })

      try {
        const response = await xoaVoucher(hoaDon.id)
        if (response && response.data) {
          capNhatHoaDon(response.data)
          showWarning(
            `Voucher "${voucher.tenPhieuGiamGia || voucher.ma}" đã bị xóa vì không đủ điều kiện (tối thiểu: ${formatCurrency(hoaDonToiThieu)})`,
          )
        }
      } catch (error) {
        console.error('Lỗi khi xóa voucher:', error)
        // Không hiển thị lỗi để không làm gián đoạn flow
      }
    }
  }

  /**
   * Format currency helper
   */
  const formatCurrency = (value) => {
    if (!value) return '0'
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  /**
   * Xóa sản phẩm khỏi hóa đơn
   */
  const handleDeleteItem = async (idHoaDonChiTiet, productName = 'sản phẩm này') => {
    // Hiển thị confirm dialog trước khi xóa
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa "${productName}" khỏi hóa đơn?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      type: 'warning',
    })

    if (!confirmed) return

    isLoading.value = true
    try {
      const response = await xoaSanPhamKhoiHoaDon(idHoaDonChiTiet)

      if (response && response.data) {
        // Cập nhật hóa đơn
        capNhatHoaDon(response.data)

        // Kiểm tra và tự động xóa voucher nếu không đủ điều kiện
        await checkAndRemoveInvalidVoucher(response.data)

        console.log('Xóa sản phẩm thành công')
        showSuccess(`Đã xóa "${productName}" khỏi hóa đơn!`)
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error)
      showError('Không thể xóa sản phẩm. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Quét mã IMEI/Serial và tự động thêm sản phẩm vào hóa đơn
   */
  const handleScanImei = async (imeiCode) => {
    if (!hoaDonHienTai.value || !imeiCode) return

    console.log('Quét mã IMEI/Barcode:', imeiCode)

    try {
      await ensureHoaDonReady()
    } catch (error) {
      console.error('❌ [useProductManagement] Không thể sync hóa đơn trước khi quét IMEI:', error)
      return
    }

    isLoading.value = true
    try {
      // 1. Tìm sản phẩm theo IMEI
      const response = await timSanPhamTheoIMEI(imeiCode)

      if (response && response.data) {
        const product = response.data

        // Kiểm tra tồn kho
        if (!product.soLuongTon || product.soLuongTon < 1) {
          showWarning('Sản phẩm này đã hết hàng!')
          return
        }

        // 2. Tự động thêm vào hóa đơn với số lượng = 1
        const payload = {
          chiTietSanPhamId: product.id,
          soLuong: 1,
          imei: imeiCode, // Gửi mã IMEI để backend xử lý
        }

        const addResponse = await themSanPhamVaoHoaDon(hoaDonHienTai.value.id, payload)

        if (addResponse && addResponse.data) {
          // Cập nhật hóa đơn
          capNhatHoaDon(addResponse.data)

          console.log('Thêm sản phẩm từ IMEI thành công:', product.tenSP)
        }
      }
    } catch (error) {
      console.error('Lỗi khi quét mã IMEI:', error)
      const errorMessage =
        error.response?.data?.message || 'Không tìm thấy sản phẩm với mã IMEI này!'
      showError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Đóng modal số lượng
   */
  const closeQuantityModal = () => {
    showQuantityModal.value = false
    selectedProduct.value = null
    soLuongNhap.value = 1
  }

  return {
    // State
    isLoading,
    showQuantityModal,
    selectedProduct,
    soLuongNhap,
    quantityInput,

    // Methods
    handleProductSelected,
    confirmAddProduct,
    handleDeleteItem,
    handleScanImei,
    closeQuantityModal,
  }
}
