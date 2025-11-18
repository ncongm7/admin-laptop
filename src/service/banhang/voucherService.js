import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/ban-hang'

/**
 * ========================================
 * SERVICE QUẢN LÝ VOUCHER & ĐIỂM TÍCH LŨY
 * ========================================
 */

/**
 * Lấy danh sách gợi ý voucher cho hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const layGoiYVoucher = async (idHoaDon) => {
  try {
    console.log('🎟️ [VoucherService] Lấy gợi ý voucher cho hóa đơn:', idHoaDon)
    const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}/goi-y-voucher`)
    console.log('✅ [VoucherService] Danh sách voucher gợi ý:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [VoucherService] Lỗi khi lấy gợi ý voucher:', error)
    throw error
  }
}

/**
 * Áp dụng voucher/phiếu giảm giá vào hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { idPhieuGiamGia: UUID }
 * @returns {Promise}
 */
export const apDungVoucher = async (idHoaDon, payload) => {
  try {
    console.log('🎟️ [VoucherService] Áp dụng voucher:', { idHoaDon, payload })
    const response = await axiosInstance.post(
      `${API_BASE}/hoa-don/${idHoaDon}/ap-dung-voucher`,
      payload,
    )
    console.log('✅ [VoucherService] Áp dụng voucher thành công')
    return response.data
  } catch (error) {
    console.error('❌ [VoucherService] Lỗi khi áp dụng voucher:', error)
    throw error
  }
}

/**
 * Xóa voucher khỏi hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const xoaVoucher = async (idHoaDon) => {
  try {
    console.log('🗑️ [VoucherService] Xóa voucher khỏi hóa đơn:', idHoaDon)
    const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}/voucher`)
    console.log('✅ [VoucherService] Xóa voucher thành công')
    return response.data
  } catch (error) {
    console.error('❌ [VoucherService] Lỗi khi xóa voucher:', error)
    throw error
  }
}

/**
 * Hủy voucher đã áp dụng
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const huyVoucher = async (idHoaDon) => {
  try {
    console.log('🗑️ [VoucherService] Hủy voucher:', idHoaDon)
    const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}/huy-voucher`)
    console.log('✅ [VoucherService] Hủy voucher thành công')
    return response.data
  } catch (error) {
    console.error('❌ [VoucherService] Lỗi khi hủy voucher:', error)
    throw error
  }
}

/**
 * Sử dụng điểm tích lũy
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { diemSuDung: Number }
 * @returns {Promise}
 */
export const suDungDiemTichLuy = async (idHoaDon, payload) => {
  try {
    console.log('💎 [VoucherService] Sử dụng điểm tích lũy:', { idHoaDon, payload })
    const response = await axiosInstance.post(
      `${API_BASE}/hoa-don/${idHoaDon}/su-dung-diem`,
      payload,
    )
    console.log('✅ [VoucherService] Sử dụng điểm thành công')
    return response.data
  } catch (error) {
    console.error('❌ [VoucherService] Lỗi khi sử dụng điểm tích lũy:', error)
    throw error
  }
}

