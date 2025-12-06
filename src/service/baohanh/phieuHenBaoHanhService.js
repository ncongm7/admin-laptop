import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/phieu-hen-bao-hanh'

/**
 * Service quản lý phiếu hẹn bảo hành (Admin)
 */
export const phieuHenBaoHanhService = {
  /**
   * Tạo phiếu hẹn bảo hành
   * @param {string} idBaoHanh - UUID của phiếu bảo hành
   * @param {Object} requestData - Dữ liệu phiếu hẹn
   * @returns {Promise} Response chứa thông tin phiếu hẹn
   */
  taoPhieuHen(idBaoHanh, requestData) {
    if (!idBaoHanh) {
      return Promise.reject(new Error('ID bảo hành là bắt buộc'))
    }
    return axiosInstance.post(`${API_BASE}/bao-hanh/${idBaoHanh}`, requestData)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  },

  /**
   * Lấy chi tiết phiếu hẹn
   * @param {string} id - UUID của phiếu hẹn
   * @returns {Promise} Response chứa thông tin phiếu hẹn
   */
  getPhieuHenById(id) {
    if (!id) {
      return Promise.reject(new Error('ID phiếu hẹn là bắt buộc'))
    }
    return axiosInstance.get(`${API_BASE}/${id}`)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  },

  /**
   * Lấy danh sách phiếu hẹn theo bảo hành
   * @param {string} idBaoHanh - UUID của phiếu bảo hành
   * @returns {Promise} Response chứa danh sách phiếu hẹn
   */
  getPhieuHenByBaoHanh(idBaoHanh) {
    if (!idBaoHanh) {
      return Promise.reject(new Error('ID bảo hành là bắt buộc'))
    }
    return axiosInstance.get(`${API_BASE}/bao-hanh/${idBaoHanh}`)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return Array.isArray(response.data) ? response.data : []
      })
  },

  /**
   * Xác nhận phiếu hẹn
   * @param {string} id - UUID của phiếu hẹn
   * @returns {Promise} Response chứa thông tin phiếu hẹn đã xác nhận
   */
  xacNhanPhieuHen(id) {
    if (!id) {
      return Promise.reject(new Error('ID phiếu hẹn là bắt buộc'))
    }
    return axiosInstance.put(`${API_BASE}/${id}/xac-nhan`)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  },

  /**
   * Gửi email phiếu hẹn
   * @param {string} id - UUID của phiếu hẹn
   * @returns {Promise} Response
   */
  guiEmailPhieuHen(id) {
    if (!id) {
      return Promise.reject(new Error('ID phiếu hẹn là bắt buộc'))
    }
    return axiosInstance.post(`${API_BASE}/${id}/gui-email`)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  }
}

export default phieuHenBaoHanhService

