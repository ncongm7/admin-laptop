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
            matKhau: credentials.matKhau
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
        console.error('Lỗi khi lấy thông tin user:', error)
        throw error
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

