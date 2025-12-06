import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { taoKhachHangMoi, capNhatKhachHang } from '@/service/banhang/banHangService'

/**
 * Composable quản lý khách hàng
 * Xử lý: tìm kiếm, tạo mới, cập nhật khách hàng cho hóa đơn
 */
export function useCustomerManagement(hoaDonHienTai, capNhatHoaDon, ensureHoaDonTonTai) {
  const isLoading = ref(false)
  const { success: showSuccess, error: showError } = useToast()

  const ensureHoaDonReady =
    typeof ensureHoaDonTonTai === 'function' ? ensureHoaDonTonTai : async () => hoaDonHienTai.value

  /**
   * Cập nhật khách hàng cho hóa đơn
   * Nếu customer = null → Khách vãng lai
   */
  const handleUpdateCustomer = async (customer) => {
    if (!hoaDonHienTai.value) return

    try {
      await ensureHoaDonReady()
    } catch (error) {
      console.error(
        '❌ [useCustomerManagement] Không thể sync hóa đơn trước khi cập nhật khách hàng:',
        error,
      )
      return
    }

    isLoading.value = true
    try {
      const payload = {
        // Nếu customer = null → backend sẽ set thành Khách lẻ
        khachHangId: customer ? customer.userId || customer.id : null,
      }

      console.log('🔄 [useCustomerManagement] Cập nhật khách hàng:', {
        idHoaDon: hoaDonHienTai.value.id,
        customerId: payload.khachHangId,
        customerName: customer ? customer.hoTen : 'Khách lẻ',
      })

      const response = await capNhatKhachHang(hoaDonHienTai.value.id, payload)

      if (response && response.data) {
        // Cập nhật hóa đơn
        capNhatHoaDon(response.data)

        const customerName = customer ? customer.hoTen : 'Khách lẻ'
        console.log('✅ Cập nhật khách hàng thành công:', customerName)
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật khách hàng:', error)
      showError(error.response?.data?.message || 'Không thể cập nhật khách hàng. Vui lòng thử lại!')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tìm kiếm khách hàng
   */
  const handleSearchCustomer = (keyword) => {
    // Search logic đã được xử lý trong component CustomerInfo
    console.log('Tìm kiếm khách hàng:', keyword)
  }

  /**
   * Tạo khách hàng mới (sử dụng modal/form thay vì prompt)
   * TODO: Trong tương lai có thể tạo modal chuyên nghiệp hơn
   */
  const handleCreateCustomer = async () => {
    const hoTen = prompt('Nhập họ tên khách hàng:')
    if (!hoTen || !hoTen.trim()) {
      console.log('⚠️ Hủy tạo khách hàng: Không nhập tên')
      return
    }

    const soDienThoai = prompt('Nhập số điện thoại:')
    if (!soDienThoai || !soDienThoai.trim()) {
      console.log('⚠️ Hủy tạo khách hàng: Không nhập SĐT')
      return
    }

    isLoading.value = true
    try {
      const payload = {
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        email: null,
        diaChi: null,
      }

      console.log('➕ [useCustomerManagement] Tạo khách hàng mới:', payload)

      const response = await taoKhachHangMoi(payload)

      console.log('📦 [useCustomerManagement] Response:', response)

      // Parse response: Backend có thể trả về { data: {...} } hoặc trực tiếp {...}
      const newCustomer = response?.data || response

      if (newCustomer && newCustomer.userId) {
        console.log('✅ Tạo khách hàng thành công:', newCustomer)

        // Tự động gán khách hàng mới cho hóa đơn hiện tại
        await handleUpdateCustomer(newCustomer)

        showSuccess(
          `Tạo khách hàng thành công!\nTên: ${newCustomer.hoTen}\nSĐT: ${newCustomer.soDienThoai}`,
        )
      } else {
        throw new Error('Response không hợp lệ')
      }
    } catch (error) {
      console.error('❌ Lỗi khi tạo khách hàng:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Không thể tạo khách hàng. Vui lòng thử lại!'
      showError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading,

    // Methods
    handleUpdateCustomer,
    handleSearchCustomer,
    handleCreateCustomer,
  }
}
