import axiosInstance from '../common/axiosInstance'

const API_BASE = '/api/v1/ban-hang'

/**
 * ========================================
 * SERVICE QUẢN LÝ SERIAL/IMEI
 * ========================================
 */

/**
 * Lấy danh sách Serial khả dụng theo Chi tiết sản phẩm
 * @param {String} ctspId - UUID của chi tiết sản phẩm
 * @returns {Promise}
 */
export const layDanhSachSerialKhaDung = async (ctspId) => {
  try {
    console.log('📦 Lấy danh sách serial khả dụng cho CTSP:', ctspId)
    const response = await axiosInstance.get(`/api/serial/ctsp/${ctspId}`)
    console.log('✅ Đã lấy', response.data?.length || 0, 'serial')
    return response.data
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách serial:', error)
    throw error
  }
}

/**
 * Xác thực Serial Number trước khi thanh toán
 * @param {Object} serialData - { idHoaDon, idChiTietSanPham, serialNumber }
 * @returns {Promise}
 */
export const xacThucSerial = async (serialData) => {
  try {
    console.log('🔍 Kiểm tra serial:', serialData)
    const response = await axiosInstance.post(`${API_BASE}/hoa-don/xac-thuc-serial`, serialData)
    console.log('✅ Đã xác thực serial:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Lỗi xác thực serial:', error)
    throw error
  }
}

/**
 * Tìm sản phẩm theo IMEI/Serial
 * @param {String} imei - Mã IMEI hoặc Serial
 * @returns {Promise}
 */
export const timSanPhamTheoIMEI = async (imei) => {
  try {
    console.log('🔍 Tìm sản phẩm theo IMEI:', imei)
    const response = await axiosInstance.get(`${API_BASE}/san-pham/imei/${imei}`)
    console.log('✅ Tìm thấy sản phẩm:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Lỗi khi tìm sản phẩm theo IMEI:', error)
    throw error
  }
}

