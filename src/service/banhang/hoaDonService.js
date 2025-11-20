import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/ban-hang'

/**
 * ========================================
 * SERVICE QUẢN LÝ HÓA ĐƠN
 * ========================================
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
            payload,
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
            `${API_BASE}/hoa-don/xoa-san-pham/${idHoaDonChiTiet}`,
        )
        return response.data
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error)
        throw error
    }
}

/**
 * Lấy thông tin hóa đơn theo ID
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const layThongTinHoaDon = async (idHoaDon) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}`)
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy thông tin hóa đơn:', error)
        throw error
    }
}

/**
 * Lấy danh sách hóa đơn chờ của nhân viên
 * @param {String} nhanVienId - UUID của nhân viên
 * @returns {Promise}
 */
export const layDanhSachHoaDonCho = async (nhanVienId) => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/hoa-don/cho`)
        return response.data
    } catch (error) {
        console.error('Lỗi khi lấy danh sách hóa đơn chờ:', error)
        throw error
    }
}

/**
 * Hủy/Xóa hóa đơn chờ
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const huyHoaDon = async (idHoaDon) => {
    try {
        console.log('🗑️ [HoaDonService] Xóa hóa đơn chờ:', idHoaDon)
        const response = await axiosInstance.delete(`${API_BASE}/hoa-don/${idHoaDon}`)
        console.log('✅ [HoaDonService] Xóa hóa đơn thành công')
        return response.data
    } catch (error) {
        console.error('❌ [HoaDonService] Lỗi khi xóa hóa đơn:', error)
        throw error
    }
}

// Alias cho rõ ràng hơn
export const xoaHoaDonCho = huyHoaDon

/**
 * Cập nhật số lượng sản phẩm trong hóa đơn
 * @param {String} idHoaDonChiTiet - UUID của hóa đơn chi tiết
 * @param {Object} payload - { soLuong: Number }
 * @returns {Promise}
 */
export const capNhatSoLuongSanPham = async (idHoaDonChiTiet, payload) => {
    try {
        const response = await axiosInstance.put(
            `${API_BASE}/hoa-don/cap-nhat-so-luong/${idHoaDonChiTiet}`,
            payload,
        )
        return response.data
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error)
        throw error
    }
}

/**
 * Cập nhật khách hàng cho hóa đơn - Thêm ID Khách Hàng
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - { khachHangId: UUID }
 * @returns {Promise}
 */
export const capNhatKhachHang = async (idHoaDon, payload) => {
    try {
        const response = await axiosInstance.put(`${API_BASE}/hoa-don/${idHoaDon}/khach-hang`, payload)
        return response.data
    } catch (error) {
        console.error('Lỗi khi cập nhật khách hàng:', error)
        throw error
    }
}

/**
 * In hóa đơn
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise}
 */
export const inHoaDon = async (idHoaDon) => {
    try {
        // Backend trả về HTML, không phải blob
        const response = await axiosInstance.get(`${API_BASE}/hoa-don/${idHoaDon}/in`, {
            responseType: 'text', // Đổi từ 'blob' sang 'text' vì backend trả về HTML string
        })
        // Convert HTML string thành Blob để xử lý như cũ
        const blob = new Blob([response.data], { type: 'text/html' })
        return blob
    } catch (error) {
        console.error('Lỗi khi in hóa đơn:', error)
        throw error
    }
}

