import axiosInstance from './axiosInstance'

const API_BASE = '/api/v1/ban-hang'

/**
 * Service quản lý API bán hàng tại quầy
 */

/**
 * Tạo hóa đơn chờ mới
 * @param {Object} payload - { nhanVienId: UUID, khachHangId: UUID (optional) }
 * @returns {Promise}
 */
export const taoHoaDonChoMoi = async (payload) => {
    try {
        const response = await axiosInstance.post(`${API_BASE}/hoa-don/tao-moi`, payload)
        return response.data
    } catch (error) {
        console.error('Lỗi khi tạo hóa đơn:', error)
        throw error
    }
}

/**
 * Thêm sản phẩm vào hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { chiTietSanPhamId: UUID, soLuong: Number }
 * @returns {Promise}
 */
export const themSanPhamVaoHoaDon = async (idHoaDon, payload) => {
    try {
        const response = await axiosInstance.post(
            `${API_BASE}/hoa-don/${idHoaDon}/them-san-pham`,
            payload
        )
        return response.data
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error)
        throw error
    }
}

/**
 * Xóa sản phẩm khỏi hóa đơn
 * @param {String} idHoaDonChiTiet - UUID của hóa đơn chi tiết
 * @returns {Promise}
 */
export const xoaSanPhamKhoiHoaDon = async (idHoaDonChiTiet) => {
    try {
        const response = await axiosInstance.delete(
            `${API_BASE}/hoa-don/xoa-san-pham/${idHoaDonChiTiet}`
        )
        return response.data
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error)
        throw error
    }
}

/**
 * Thanh toán hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { idPhuongThucThanhToan: UUID, soTienThanhToan: Number, ghiChu: String, maGiaoDich: String }
 * @returns {Promise}
 */
export const thanhToanHoaDon = async (idHoaDon, payload) => {
    try {
        const response = await axiosInstance.post(
            `${API_BASE}/hoa-don/${idHoaDon}/thanh-toan`,
            payload
        )
        return response.data
    } catch (error) {
        console.error('Lỗi khi thanh toán:', error)
        throw error
    }
}

/**
 * Tìm kiếm sản phẩm
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemSanPham = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/api/chi-tiet-san-pham', { params })
        return response.data
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error)
        throw error
    }
}

/**
 * Tìm kiếm khách hàng
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemKhachHang = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/api/khach-hang/search', { params })
        return response.data
    } catch (error) {
        console.error('Lỗi khi tìm kiếm khách hàng:', error)
        throw error
    }
}

/**
 * Lấy danh sách phương thức thanh toán
 * @returns {Promise}
 */
export const layDanhSachPhuongThucThanhToan = async () => {
    try {
        const response = await axiosInstance.get('/api/phuong-thuc-thanh-toan')
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phương thức thanh toán:', error)
        // Trả về dữ liệu mặc định nếu API chưa có
        return [
            { id: '1', tenPhuongThuc: 'Tiền mặt' },
            { id: '2', tenPhuongThuc: 'Chuyển khoản' },
            { id: '3', tenPhuongThuc: 'Thẻ tín dụng' }
        ]
    }
}

/**
 * Lấy danh sách nhân viên (để lấy UUID nhân viên đầu tiên)
 * @returns {Promise}
 */
export const layDanhSachNhanVien = async () => {
    try {
        const response = await axiosInstance.get('/api/nhan-vien/hien-thi-nv')
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error)
        throw error
    }
}

