import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/ban-hang'

/**
 * ========================================
 * SERVICE QUẢN LÝ THANH TOÁN
 * ========================================
 */

/**
 * Lấy danh sách phương thức thanh toán
 * @returns {Promise}
 */
export const layDanhSachPhuongThucThanhToan = async () => {
  try {
    console.log('📋 [ThanhToanService] Lấy danh sách phương thức thanh toán...')
    const response = await axiosInstance.get('/api/phuong-thuc-thanh-toan')
    console.log('✅ [ThanhToanService] Response:', response.data)

    // Parse response: có thể là { data: [...] } hoặc trực tiếp [...]
    const danhSach = response.data?.data || response.data || []
    console.log('✅ [ThanhToanService] Danh sách phương thức thanh toán:', danhSach)

    return danhSach
  } catch (error) {
    console.error('❌ [ThanhToanService] Lỗi khi lấy danh sách phương thức thanh toán:', error)
    console.error('⚠️ [ThanhToanService] Vui lòng tạo dữ liệu phương thức thanh toán trong database!')

    // Trả về mảng rỗng thay vì fake data
    return []
  }
}

/**
 * Thanh toán hóa đơn (với Serial Numbers)
 * @param {String} idHoaDon - UUID của hóa đơn
 * @param {Object} payload - {
 *   idPhuongThucThanhToan: UUID,
 *   soTienThanhToan: Number,
 *   ghiChu: String,
 *   maGiaoDich: String,
 *   serialNumbers: [{ idHoaDonChiTiet, idChiTietSanPham, serialNumber }]
 * }
 * @returns {Promise}
 */
export const thanhToanHoaDon = async (idHoaDon, payload) => {
  try {
    console.log('💳 Thanh toán hóa đơn:', {
      idHoaDon,
      serialCount: payload.serialNumbers?.length || 0,
    })
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/${idHoaDon}/thanh-toan`, payload)
    console.log('✅ Thanh toán thành công')
    return response.data
  } catch (error) {
    console.error('❌ Lỗi khi thanh toán:', error)
    throw error
  }
}

/**
 * Kiểm tra và cập nhật giá sản phẩm trước khi thanh toán
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise} { coThayDoi, soSanPhamThayDoi, danhSachThayDoi, hoaDon }
 */
export const kiemTraVaCapNhatGia = async (idHoaDon) => {
  try {
    console.log('🔍 [ThanhToanService] Kiểm tra và cập nhật giá sản phẩm...')
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/${idHoaDon}/kiem-tra-cap-nhat-gia`)
    console.log('✅ [ThanhToanService] Đã kiểm tra giá:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [ThanhToanService] Lỗi khi kiểm tra giá:', error)
    throw error
  }
}

/**
 * Kiểm tra toàn bộ (giá, voucher, điểm) trước khi xác nhận thanh toán
 * @param {String} idHoaDon - UUID của hóa đơn
 * @returns {Promise} { coThayDoi, message, thayDoiGia, thayDoiVoucher, thayDoiDiem, hoaDonMoi }
 */
export const kiemTraTruocThanhToan = async (idHoaDon) => {
  try {
    console.log('🔍 [ThanhToanService] Kiểm tra toàn bộ trước khi xác nhận thanh toán...')
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/${idHoaDon}/kiem-tra-truoc-thanh-toan`)
    console.log('✅ [ThanhToanService] Đã kiểm tra:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [ThanhToanService] Lỗi khi kiểm tra trước thanh toán:', error)
    throw error
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

