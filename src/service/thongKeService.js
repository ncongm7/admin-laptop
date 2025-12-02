import axiosInstance from './axiosInstance'

const API_BASE = '/api/v1/thongke'

/**
 * Service quản lý API thống kê Dashboard
 */

/**
 * Lấy thống kê tổng quan cho Dashboard
 * @param {String} startDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param {String} endDate - Ngày kết thúc (yyyy-MM-dd)
 * @returns {Promise}
 */
export const fetchThongKeTongQuan = async (startDate, endDate) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/tong-quan`, {
            params: { startDate, endDate }
        })
        return response.data
    } catch (error) {
        console.error('❌ [ThongKeService] Lỗi khi lấy thống kê tổng quan:', error)
        throw error
    }
}

/**
 * Lấy dữ liệu biểu đồ doanh số
 * @param {String} startDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param {String} endDate - Ngày kết thúc (yyyy-MM-dd)
 * @param {String} groupBy - Nhóm theo: 'day', 'month', 'year'
 * @returns {Promise}
 */
export const fetchBieuDoData = async (startDate, endDate, groupBy = 'day') => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/bieu-do-doanh-so`, {
            params: { startDate, endDate, groupBy }
        })
        return response.data
    } catch (error) {
        console.error('❌ [ThongKeService] Lỗi khi lấy dữ liệu biểu đồ:', error)
        throw error
    }
}

/**
 * Lấy top sản phẩm bán chạy
 * @param {String} startDate - Ngày bắt đầu (yyyy-MM-dd)
 * @param {String} endDate - Ngày kết thúc (yyyy-MM-dd)
 * @param {Number} limit - Số lượng sản phẩm (mặc định: 5)
 * @returns {Promise}
 */
export const fetchSanPhamBanChay = async (startDate, endDate, limit = 5) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/san-pham-ban-chay`, {
            params: { startDate, endDate, limit }
        })
        return response.data
    } catch (error) {
        console.error('❌ [ThongKeService] Lỗi khi lấy sản phẩm bán chạy:', error)
        throw error
    }
}

/**
 * Lấy giao dịch gần đây
 * @param {Number} limit - Số lượng giao dịch (mặc định: 10)
 * @returns {Promise}
 */
export const fetchGiaoDichGanDay = async (limit = 10) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/giao-dich-gan-day`, {
            params: { limit }
        })
        return response.data
    } catch (error) {
        console.error('❌ [ThongKeService] Lỗi khi lấy giao dịch gần đây:', error)
        throw error
    }
}

/**
 * Lấy hoạt động khách hàng gần đây
 * @param {Number} limit - Số lượng hoạt động (mặc định: 10)
 * @returns {Promise}
 */
export const fetchHoatDongKhachHang = async (limit = 10) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/hoat-dong-khach-hang`, {
            params: { limit }
        })
        return response.data
    } catch (error) {
        console.error('❌ [ThongKeService] Lỗi khi lấy hoạt động khách hàng:', error)
        throw error
    }
}

