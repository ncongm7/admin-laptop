import axiosInstance from '../axiosInstance'

const API_BASE = '/api/v1/bao-hanh'

/**
 * Service quản lý bảo hành (Admin)
 */
export const baohanhService = {
  /**
   * Tiếp nhận sản phẩm bảo hành
   * @param {string} idBaoHanh - UUID của phiếu bảo hành
   * @param {Object} requestData - Dữ liệu tiếp nhận
   * @returns {Promise} Response
   */
  tiepNhanSanPham(idBaoHanh, requestData) {
    if (!idBaoHanh) {
      return Promise.reject(new Error('ID bảo hành là bắt buộc'))
    }

    if (!requestData.idNhanVienTiepNhan) {
      return Promise.reject(new Error('ID nhân viên tiếp nhận là bắt buộc'))
    }

    const formData = new FormData()
    // Đảm bảo idNhanVienTiepNhan là string UUID
    formData.append('idNhanVienTiepNhan', String(requestData.idNhanVienTiepNhan))

    if (requestData.ghiChu) {
      formData.append('ghiChu', requestData.ghiChu)
    }

    if (requestData.hinhAnhTinhTrang && requestData.hinhAnhTinhTrang.length > 0) {
      requestData.hinhAnhTinhTrang.forEach((file) => {
        formData.append('hinhAnhTinhTrang', file)
      })
    }

    console.log('📤 [baohanhService] Sending tiepNhanSanPham request:', {
      idBaoHanh,
      idNhanVienTiepNhan: requestData.idNhanVienTiepNhan,
      hasGhiChu: !!requestData.ghiChu,
      imageCount: requestData.hinhAnhTinhTrang ? requestData.hinhAnhTinhTrang.length : 0
    })

    return axiosInstance.post(`${API_BASE}/tiep-nhan/${idBaoHanh}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000 // Tăng timeout cho upload file
    })
      .then(response => {
        console.log('✅ [baohanhService] tiepNhanSanPham response:', response.data)
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
      .catch(error => {
        console.error('❌ [baohanhService] tiepNhanSanPham error:', error.response?.data || error.message)
        throw error
      })
  },

  /**
   * Thêm chi phí phát sinh
   * @param {string} idLichSuBaoHanh - UUID của lịch sử bảo hành
   * @param {Object} requestData - Dữ liệu chi phí
   * @returns {Promise} Response
   */
  themChiPhiPhatSinh(idLichSuBaoHanh, requestData) {
    if (!idLichSuBaoHanh) {
      return Promise.reject(new Error('ID lịch sử bảo hành là bắt buộc'))
    }
    return axiosInstance.post(`${API_BASE}/chi-phi/${idLichSuBaoHanh}`, requestData)
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  },

  /**
   * Bàn giao sản phẩm
   * @param {string} idBaoHanh - UUID của phiếu bảo hành
   * @param {Object} requestData - Dữ liệu bàn giao
   * @returns {Promise} Response
   */
  banGiaoSanPham(idBaoHanh, requestData) {
    if (!idBaoHanh) {
      return Promise.reject(new Error('ID bảo hành là bắt buộc'))
    }

    const formData = new FormData()
    if (requestData.idNhanVienBanGiao) {
      formData.append('idNhanVienBanGiao', requestData.idNhanVienBanGiao)
    }
    if (requestData.ghiChu) {
      formData.append('ghiChu', requestData.ghiChu)
    }
    if (requestData.hinhAnhSauSua && requestData.hinhAnhSauSua.length > 0) {
      requestData.hinhAnhSauSua.forEach((file) => {
        formData.append('hinhAnhSauSua', file)
      })
    }
    if (requestData.xacNhanKhachHang !== undefined) {
      formData.append('xacNhanKhachHang', requestData.xacNhanKhachHang)
    }

    return axiosInstance.post(`${API_BASE}/ban-giao/${idBaoHanh}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        if (response.data && response.data.data !== undefined) {
          return response.data.data
        }
        return response.data
      })
  }
}

export default baohanhService

