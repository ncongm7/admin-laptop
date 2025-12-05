import axiosInstance from '../axiosInstance'

/**
 * Service xử lý thanh toán QR cho admin
 */

/**
 * Tạo QR code thanh toán
 * @param {Object} data - {hoaDonId, amount, orderCode, description}
 * @returns {Promise}
 */
export const generateQRPayment = (data) => {
  return axiosInstance.post('/api/v1/payment/qr/generate', data)
}

/**
 * Kiểm tra trạng thái thanh toán
 * @param {string} orderId - UUID của đơn hàng
 * @returns {Promise}
 */
export const checkPaymentStatus = (orderId) => {
  return axiosInstance.get(`/api/v1/payment/status/${orderId}`)
}

/**
 * Hủy đơn hàng có hoàn tiền
 * @param {string} hoaDonId - UUID hóa đơn
 * @param {Object} data - {lyDoHuy, soTienHoan}
 * @returns {Promise}
 */
export const cancelOrderWithRefund = (hoaDonId, data) => {
  return axiosInstance.post(`/api/v1/admin/orders/${hoaDonId}/cancel-refund`, data)
}

/**
 * Lấy lịch sử hoàn tiền
 * @param {string} hoaDonId - UUID hóa đơn
 * @returns {Promise}
 */
export const getRefundHistory = (hoaDonId) => {
  return axiosInstance.get(`/api/v1/admin/orders/${hoaDonId}/refund-history`)
}
