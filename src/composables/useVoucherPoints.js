import { ref } from 'vue'
import {
    apDungVoucher,
    suDungDiemTichLuy
} from '@/service/banHangService'
import { useToast } from '@/composables/useToast'

/**
 * Composable quản lý voucher và điểm tích lũy
 * Xử lý: áp dụng voucher, sử dụng điểm tích lũy
 */
export function useVoucherPoints(hoaDonHienTai, capNhatHoaDon) {
    const { success: showSuccess, error: showError, warning: showWarning } = useToast()
    const isLoading = ref(false)

    /**
     * Áp dụng voucher/phiếu giảm giá
     * @param {String} idPhieuGiamGia - UUID của phiếu giảm giá (mới)
     * @param {String} voucherCode - Mã voucher (cũ, để tương thích)
     */
    const handleApplyVoucher = async (idPhieuGiamGia, voucherCode = null) => {
        if (!hoaDonHienTai.value) return

        isLoading.value = true
        try {
            // Nếu có ID thì dùng ID (mới), nếu không thì dùng mã (cũ - để tương thích)
            const payload = idPhieuGiamGia 
                ? { idPhieuGiamGia } 
                : { maVoucher: voucherCode }

            const response = await apDungVoucher(hoaDonHienTai.value.id, payload)

            if (response && response.data) {
                // Cập nhật hóa đơn
                capNhatHoaDon(response.data)

                showSuccess('Áp dụng voucher thành công!')
                console.log('Voucher đã áp dụng:', idPhieuGiamGia || voucherCode)
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng voucher:', error)
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.data?.message ||
                                'Mã voucher không hợp lệ hoặc đã hết hạn!'
            showError(errorMessage)
            throw error // Re-throw để parent component có thể xử lý
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Sử dụng điểm tích lũy
     */
    const handleUsePoints = async (points) => {
        if (!hoaDonHienTai.value || points <= 0) return

        // Kiểm tra khách hàng có đủ điểm không
        const khachHang = hoaDonHienTai.value.khachHang
        if (!khachHang || !khachHang.diemTichLuy || khachHang.diemTichLuy < points) {
            showWarning('Khách hàng không đủ điểm tích lũy!')
            return
        }

        isLoading.value = true
        try {
            const payload = {
                diemSuDung: points
            }

            const response = await suDungDiemTichLuy(hoaDonHienTai.value.id, payload)

            if (response && response.data) {
                // Cập nhật hóa đơn
                capNhatHoaDon(response.data)

                showSuccess(`Sử dụng ${points} điểm tích lũy thành công!`)
                console.log('Điểm tích lũy đã sử dụng:', points)
            }
        } catch (error) {
            console.error('Lỗi khi sử dụng điểm tích lũy:', error)
            showError(error.response?.data?.message || 'Không thể sử dụng điểm tích lũy. Vui lòng thử lại!')
        } finally {
            isLoading.value = false
        }
    }

    return {
        // State
        isLoading,

        // Methods
        handleApplyVoucher,
        handleUsePoints
    }
}

