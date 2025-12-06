import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/ly-do-bao-hanh'

/**
 * Service quản lý lý do bảo hành (Admin)
 */
export const lyDoBaoHanhService = {
  /**
   * Lấy tất cả lý do bảo hành đang active
   * @returns {Promise} Response chứa danh sách lý do
   */
  getAllLyDo() {
    return axiosInstance.get(API_BASE)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return Array.isArray(response.data) ? response.data : []
      })
  },

  /**
   * Lấy lý do bảo hành theo loại
   * @param {string} loai - Loại lý do: 'PHAN_CUNG', 'PHAN_MEM', 'PHU_KIEN', 'KHAC'
   * @returns {Promise} Response chứa danh sách lý do theo loại
   */
  getLyDoByLoai(loai) {
    if (!loai) {
      return Promise.reject(new Error('Loại lý do là bắt buộc'))
    }
    return axiosInstance.get(`${API_BASE}/loai/${loai}`)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return Array.isArray(response.data) ? response.data : []
      })
  }
}

export default lyDoBaoHanhService

