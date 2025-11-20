import axios from '../axiosInstance'

const API_URL = '/api/tai-khoan'

export default {
  /**
   * GET /api/tai-khoan - Danh sách tài khoản
   */
  async getAllTaiKhoan() {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching tai khoan list:', error)
      throw error
    }
  },

  /**
   * GET /api/tai-khoan/{id} - Chi tiết tài khoản
   */
  async getTaiKhoanById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching tai khoan by id:', error)
      throw error
    }
  },

  /**
   * POST /api/tai-khoan - Tạo tài khoản
   */
  async createTaiKhoan(taiKhoanData) {
    try {
      // Chuyển đổi maVaiTro từ UUID string sang VaiTro object
      let requestData = { ...taiKhoanData }
      
      if (taiKhoanData.maVaiTro && typeof taiKhoanData.maVaiTro === 'string') {
        // Nếu là UUID string, tạo VaiTro object với chỉ id (Jackson sẽ tự deserialize)
        requestData.maVaiTro = { id: taiKhoanData.maVaiTro }
      } else if (!taiKhoanData.maVaiTro) {
        // Nếu không có maVaiTro, set null
        requestData.maVaiTro = null
      }
      
      const response = await axios.post(API_URL, requestData)
      return response.data
    } catch (error) {
      console.error('Error creating tai khoan:', error)
      throw error
    }
  },

  /**
   * PUT /api/tai-khoan/{id} - Cập nhật tài khoản
   */
  async updateTaiKhoan(id, taiKhoanData) {
    try {
      // Chuyển đổi maVaiTro từ UUID string sang VaiTro object
      let requestData = { ...taiKhoanData }
      
      if (taiKhoanData.maVaiTro && typeof taiKhoanData.maVaiTro === 'string') {
        // Nếu là UUID string, tạo VaiTro object với chỉ id (Jackson sẽ tự deserialize)
        requestData.maVaiTro = { id: taiKhoanData.maVaiTro }
      } else if (!taiKhoanData.maVaiTro) {
        // Nếu không có maVaiTro, set null
        requestData.maVaiTro = null
      }
      
      const response = await axios.put(`${API_URL}/${id}`, requestData)
      return response.data
    } catch (error) {
      console.error('Error updating tai khoan:', error)
      throw error
    }
  },

  /**
   * PUT /api/tai-khoan/{id}/reset-password - Reset mật khẩu
   */
  async resetPassword(id, newPassword) {
    try {
      const response = await axios.put(`${API_URL}/${id}/reset-password`, {
        newPassword: newPassword,
      })
      return response.data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  },

  /**
   * PUT /api/tai-khoan/{id}/toggle-status - Khóa/Mở khóa tài khoản
   */
  async toggleStatus(id) {
    try {
      const response = await axios.put(`${API_URL}/${id}/toggle-status`)
      return response.data
    } catch (error) {
      console.error('Error toggling status:', error)
      throw error
    }
  },

  /**
   * DELETE /api/tai-khoan/{id} - Xóa tài khoản
   */
  async deleteTaiKhoan(id) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting tai khoan:', error)
      throw error
    }
  },

  /**
   * GET /api/tai-khoan/{id}/login-history - Lịch sử đăng nhập
   */
  async getLoginHistory(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}/login-history`)
      return response.data
    } catch (error) {
      console.error('Error fetching login history:', error)
      throw error
    }
  },

  /**
   * GET /api/tai-khoan/search?tenDangNhap=... - Tìm kiếm tài khoản theo tên đăng nhập
   */
  async searchByTenDangNhap(tenDangNhap) {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: {
          tenDangNhap: tenDangNhap || null,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error searching tai khoan:', error)
      throw error
    }
  },

  /**
   * GET /api/tai-khoan/search-advanced?tenDangNhap=...&tenVaiTro=...&trangThai=...
   * - Tìm kiếm tài khoản với nhiều điều kiện
   */
  async searchTaiKhoan(searchParams) {
    try {
      // Xử lý trangThai: chỉ gửi nếu là số hợp lệ (0 hoặc 1)
      let trangThaiParam = null
      if (searchParams?.trangThai !== undefined && searchParams?.trangThai !== null && searchParams?.trangThai !== '') {
        const trangThaiNum = parseInt(searchParams.trangThai)
        if (!isNaN(trangThaiNum) && (trangThaiNum === 0 || trangThaiNum === 1)) {
          trangThaiParam = trangThaiNum
        }
      }
      
      const response = await axios.get(`${API_URL}/search-advanced`, {
        params: {
          tenDangNhap: searchParams?.tenDangNhap || null,
          tenVaiTro: searchParams?.tenVaiTro || null,
          trangThai: trangThaiParam,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error searching tai khoan:', error)
      throw error
    }
  },
}

