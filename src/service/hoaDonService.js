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
 * Lấy số lượng hóa đơn theo trạng thái
 * @returns {Promise} { total, CHO_THANH_TOAN, DA_THANH_TOAN, DA_HUY, DANG_GIAO, HOAN_THANH }
 */
export const getHoaDonStatusCounts = async () => {
    try {
        console.log('📊 [HoaDonService] Lấy số lượng hóa đơn theo trạng thái')
        
        // TODO: Backend cần tạo endpoint GET /api/v1/hoa-don/status-counts
        // Tạm thời return null để fallback về client-side calculation
        const response = await axiosInstance.get(`${API_BASE}/status-counts`)
        
        console.log('✅ [HoaDonService] Status counts:', response.data)
        return response.data
    } catch (error) {
        // Nếu API chưa có, fallback về null để dùng client-side
        if (error.response?.status === 404) {
            console.warn('⚠️ [HoaDonService] API status-counts chưa có, dùng client-side calculation')
            return null
        }
        console.error('❌ [HoaDonService] Lỗi khi lấy status counts:', error)
        throw error
    }
}

/**
 * Xác nhận đơn hàng online
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {String} nhanVienId - UUID của nhân viên (optional)
 * @returns {Promise}
 */
export const xacNhanDonHang = async (idHoaDon, nhanVienId = null) => {
    try {
        console.log('✅ [HoaDonService] Xác nhận đơn hàng:', idHoaDon)

        const params = nhanVienId ? { nhanVienId } : {}
        const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/xac-nhan`, null, { params })

        console.log('✅ [HoaDonService] Xác nhận đơn hàng thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi xác nhận đơn hàng:', error)
        throw error
    }
}

/**
 * Hủy đơn hàng online
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {String} nhanVienId - UUID của nhân viên (optional)
 * @returns {Promise}
 */
export const huyDonHang = async (idHoaDon, nhanVienId = null) => {
    try {
        console.log('🚫 [HoaDonService] Hủy đơn hàng:', idHoaDon)

        const params = nhanVienId ? { nhanVienId } : {}
        const response = await axiosInstance.put(`${API_BASE}/${idHoaDon}/huy`, null, { params })

        console.log('✅ [HoaDonService] Hủy đơn hàng thành công:', response.data)
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi hủy đơn hàng:', error)
        throw error
    }
}

export default {
    getHoaDons,
    getHoaDonDetail,
    xacNhanDonHang,
    huyDonHang
}

