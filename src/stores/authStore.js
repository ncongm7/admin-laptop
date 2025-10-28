import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import * as authService from '@/service/authService'
import axiosInstance from '@/service/axiosInstance'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getUserId: (state) => state.user?.userId || state.user?.user_id || null,
    getUserName: (state) => state.user?.hoTen || state.user?.ho_ten || state.user?.tenDangNhap || 'User'
  },

  actions: {
    /**
     * Đăng nhập
     * @param {Object} credentials - { tenDangNhap, matKhau }
     */
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        // Gọi API đăng nhập
        const response = await authService.login({
          tenDangNhap: credentials.tenDangNhap,
          matKhau: credentials.matKhau
        })

        console.log('Login response:', response)

        // Backend trả về ResponseObject { isSuccess, data: LoginResponse, message }
        // LoginResponse { token, user: UserInfo }
        const loginData = response.data || response
        const jwtToken = loginData.token
        const userData = loginData.user

        if (!jwtToken) {
          throw new Error('Không nhận được token từ server')
        }

        if (!userData) {
          throw new Error('Không nhận được thông tin user từ server')
        }

        // Lưu vào state
        this.user = userData
        this.token = jwtToken

        // Lưu vào localStorage
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('user', JSON.stringify(userData))

        // Lưu userId để dùng cho bán hàng
        if (userData.userId || userData.user_id) {
          localStorage.setItem('userId', userData.userId || userData.user_id)
          localStorage.setItem('currentNhanVienId', userData.userId || userData.user_id)
        }

        // Set Authorization header cho các request sau
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`

        console.log('Đăng nhập thành công:', userData)

        return response
      } catch (err) {
        console.error('Lỗi đăng nhập:', err)
        this.error = err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Đăng nhập thất bại'
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Đăng xuất
     */
    async logout() {
      try {
        // Gọi API logout (nếu có)
        await authService.logout().catch(() => {
          // Ignore error khi logout
        })
      } catch (error) {
        console.error('Lỗi khi gọi API logout:', error)
      }

      // Xóa state
      this.user = null
      this.token = null
      this.error = null

      // Xóa localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')
      localStorage.removeItem('currentNhanVienId')

      // Xóa Authorization header
      delete axiosInstance.defaults.headers.common['Authorization']

      console.log('Đã đăng xuất')
    },

    /**
     * Kiểm tra trạng thái xác thực khi app khởi động
     */
    async checkAuthStatus() {
      // Kiểm tra token trong localStorage
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (!token) {
        return false
      }

      // Gán token vào state
      this.token = token
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Thử parse user từ localStorage
      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch (error) {
          console.error('Lỗi parse user từ localStorage:', error)
        }
      }

      // Gọi API để lấy lại thông tin user mới nhất
      try {
        const response = await authService.getCurrentUser()
        const userData = response.data || response

        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))

        // Cập nhật userId
        if (userData.userId || userData.user_id) {
          localStorage.setItem('userId', userData.userId || userData.user_id)
          localStorage.setItem('currentNhanVienId', userData.userId || userData.user_id)
        }

        console.log('Đã khôi phục phiên đăng nhập:', userData)
        return true
      } catch (error) {
        console.error('Token không hợp lệ hoặc đã hết hạn:', error)

        // Token không hợp lệ, xóa hết
        this.logout()
        return false
      }
    },

    /**
     * Khởi tạo từ localStorage (dùng khi app load)
     */
    initialize() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      if (token) {
        this.token = token
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      if (userStr) {
        try {
          this.user = JSON.parse(userStr)
        } catch (error) {
          console.error('Lỗi parse user:', error)
          this.user = null
        }
      }
    }
  }
})
