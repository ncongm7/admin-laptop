import axiosInstance from './axiosInstance'

const API_BASE = '/api/v1/hoa-don'

/**
 * Service quản lý hóa đơn
 */

/**
 * Lấy danh sách hóa đơn (có phân trang, tìm kiếm, lọc)
 * @param {Object} params - {
 *   page: number,
 *   size: number,
 *   keyword: string,
 *   trangThai: number (0-4),
 *   loaiHoaDon: number (0: Tại quầy, 1: Online),
 *   trangThaiThanhToan: number (0: Chưa, 1: Đã),
 *   startDate: string (yyyy-MM-dd),
 *   endDate: string (yyyy-MM-dd)
 * }
 * @returns {Promise}
 */
export const getHoaDons = async (params = {}) => {
  try {
    console.log('📋 [HoaDonService] Lấy danh sách hóa đơn:', params)

    const response = await axiosInstance.get(API_BASE, { params })

    console.log('✅ [HoaDonService] Response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [HoaDonService] Lỗi khi lấy danh sách hóa đơn:', error)
    throw error
  }
}

/**
 * Lấy chi tiết một hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const getHoaDonDetail = async (idHoaDon) => {
  try {
    console.log('🔍 [HoaDonService] Lấy chi tiết hóa đơn:', idHoaDon)

    const response = await axiosInstance.get(`${API_BASE}/${idHoaDon}`)

    console.log('✅ [HoaDonService] Chi tiết hóa đơn:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [HoaDonService] Lỗi khi lấy chi tiết hóa đơn:', error)
    throw error
  }
}

/**
 * Cập nhật trạng thái đơn hàng
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Number} trangThai - Trạng thái mới (0-4)
 * @returns {Promise}
 */
export const updateOrderStatus = async (idHoaDon, trangThai) => {
  try {
    console.log('🔄 [HoaDonService] Cập nhật trạng thái:', { idHoaDon, trangThai })

    const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/status`, null, {
      params: { trangThai },
    })

    console.log('✅ [HoaDonService] Cập nhật trạng thái thành công:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [HoaDonService] Lỗi khi cập nhật trạng thái:', error)
    throw error
  }
}

export default {
  getHoaDons,
  getHoaDonDetail,
  updateOrderStatus,
}
