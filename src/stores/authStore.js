import { defineStore } from 'pinia'

import axios from '@/service/axiosInstance'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  actions: {
    async login({ username, password }) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('/api/users/login', { username, password })
        this.user = res.data.user
        this.token = res.data.token
        // Lưu token vào localStorage để giữ đăng nhập
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Đăng nhập thất bại'
        throw err
      } finally {
        this.loading = false
      }
    },
    async logout() {
      this.user = null
      this.token = null
      this.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    },
    async fetchUser() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/auth/me')
        this.user = res.data
        localStorage.setItem('user', JSON.stringify(this.user))
        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Không lấy được thông tin người dùng'
        throw err
      } finally {
        this.loading = false
      }
    },
    initialize() {
      // Khởi tạo trạng thái từ localStorage khi load lại trang
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      if (user) {
        try {
          this.user = JSON.parse(user)
        } catch {
          this.user = null
        }
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  }
})
