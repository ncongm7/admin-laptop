import axiosInstance from './axiosInstance'

/**
 * Service xử lý xác thực người dùng
 */

/**
 * Đăng nhập
 * @param {Object} credentials - { tenDangNhap: string, matKhau: string }
 * @returns {Promise}
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', {
      tenDangNhap: credentials.tenDangNhap,
      matKhau: credentials.matKhau,
    })
    return response.data
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error)
    throw error
  }
}

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {Promise}
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me')
    return response.data
  } catch (error) {
    // Xử lý lỗi 400/401 một cách graceful - return null thay vì throw
    // Không log để tránh spam console khi token hết hạn (đây là trường hợp bình thường)
    if (error.response?.status === 400 || error.response?.status === 401) {
      // Token không hợp lệ hoặc hết hạn - return null để caller xử lý
      return null
    }
    // Các lỗi khác (500, network error, etc.) mới log
    if (error.response?.status >= 500 || !error.response) {
      console.error('Lỗi khi lấy thông tin user:', error)
    }
    // Vẫn return null để không break UI
    return null
  }
}

/**
 * Đăng xuất
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/logout')
    return response.data
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error)
    throw error
  }
}

/**
 * Làm mới token
 * @returns {Promise}
 */
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/refresh')
    return response.data
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error)
    throw error
  }
}
