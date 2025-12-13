import axiosInstance from '../common/axiosInstance'

/**
 * ========================================
 * SERVICE QUẢN LÝ KHÁCH HÀNG (BÁN HÀNG)
 * ========================================
 */

/**
 * Tìm kiếm khách hàng (dùng cho bán hàng)
 * @param {Object} params - { keyword: String, page: Number, size: Number }
 * @returns {Promise}
 */
export const timKiemKhachHang = async (params = {}) => {
  try {
    console.log('🔍 [KhachHangService] Tìm kiếm khách hàng:', params)

    // Tìm theo tên hoặc SĐT
    const response = await axiosInstance.get('/api/khach-hang/tim-kiem', {
      params: {
        ten: params.keyword || null,
        sdt: params.keyword || null,
      },
    })

    console.log('✅ [KhachHangService] Kết quả tìm kiếm:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [KhachHangService] Lỗi khi tìm kiếm khách hàng:', error)
    throw error
  }
}

/**
 * Tạo khách hàng mới (dùng cho bán hàng)
 * @param {Object} payload - { hoTen: String, soDienThoai: String, email: String, diaChi: String }
 * @returns {Promise}
 */
export const taoKhachHangMoi = async (payload) => {
  try {
    console.log('➕ [KhachHangService] Tạo khách hàng mới:', payload)

    const response = await axiosInstance.post('/api/khach-hang/add-khach-hang', payload)

    console.log('✅ [KhachHangService] Tạo khách hàng thành công:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [KhachHangService] Lỗi khi tạo khách hàng:', error)
    throw error
  }
}

/**
 * Lấy danh sách tất cả khách hàng
 * @returns {Promise}
 */
export const layDanhSachKhachHang = async () => {
  try {
    console.log('📋 [KhachHangService] Lấy danh sách khách hàng...')
    const response = await axiosInstance.get('/api/khach-hang/hien-thi')
    console.log('✅ [KhachHangService] Danh sách khách hàng:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ [KhachHangService] Lỗi khi lấy danh sách khách hàng:', error)
    throw error
  }
}

