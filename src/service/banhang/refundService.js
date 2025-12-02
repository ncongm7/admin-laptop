import axiosInstance from '../axiosInstance'

/**
 * Service xử lý hoàn tiền cho đơn hàng
 */

/**
 * Hủy đơn hàng và hoàn tiền
 * @param {string} hoaDonId - UUID hóa đơn
 * @param {Object} data - {lyDoHuy, soTienHoan}
 * @returns {Promise}
 */
export const cancelOrderWithRefund = async (hoaDonId, data) => {
  try {
    const response = await axiosInstance.post(
      `/api/v1/admin/hoa-don/${hoaDonId}/cancel-refund`,
      data,
    )
    return response.data
  } catch (error) {
    console.error('❌ [refundService] Cancel with refund error:', error)
    throw error
  }
}

/**
 * Lấy lịch sử hoàn tiền của đơn hàng
 * @param {string} hoaDonId - UUID hóa đơn
 * @returns {Promise}
 */
export const getRefundHistory = async (hoaDonId) => {
  try {
    const response = await axiosInstance.get(`/api/v1/admin/hoa-don/${hoaDonId}/refund-history`)
    return response.data
  } catch (error) {
    console.error('❌ [refundService] Get refund history error:', error)
    throw error
  }
}

/**
 * Kiểm tra đơn hàng có thể hoàn tiền không
 * @param {Object} hoaDon - Thông tin hóa đơn
 * @returns {boolean}
 */
export const canRefund = (hoaDon) => {
  if (!hoaDon) return false

  // Chỉ hoàn tiền cho đơn đã thanh toán QR
  const isQRPaid =
    hoaDon.trangThaiThanhToan === 1 &&
    (hoaDon.phuongThucThanhToan || hoaDon.tenPhuongThucThanhToan || '').toLowerCase().includes('qr')

  // Trạng thái cho phép hủy: CHO_THANH_TOAN (0) hoặc DANG_GIAO (3)
  const canCancel =
    hoaDon.trangThai === 0 ||
    hoaDon.trangThai === 3 ||
    hoaDon.trangThai === 'CHO_THANH_TOAN' ||
    hoaDon.trangThai === 'DANG_GIAO'

  return isQRPaid && canCancel
}

export default {
  cancelOrderWithRefund,
  getRefundHistory,
  canRefund,
}
