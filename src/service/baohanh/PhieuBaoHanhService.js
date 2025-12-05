import axiosInstance from '../axiosInstance'

const API = '/api/phieu-bao-hanh-quan-ly'

// Get All - Lấy danh sách phiếu bảo hành
export const getPhieuBaoHanh = async () => {
  try {
    const response = await axiosInstance.get(`${API}/danh-sach`)
    // Backend trả về ResponseObject { data, message, success }
    // Nếu response.data có cấu trúc ResponseObject, lấy data từ đó
    if (response.data && response.data.data !== undefined) {
      return response.data.data || []
    }
    // Nếu response.data là array trực tiếp
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching phieu bao hanh:', error)
    throw error
  }
}

// Xóa phiếu bảo hành
export const deletePhieuBaoHanh = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API}/delete/${id}`)
    // Backend trả về ResponseObject { data, message, success }
    return response.data || { message: 'Xóa thành công' }
  } catch (error) {
    console.error('Error deleting phieu bao hanh:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Get By Id - Lấy chi tiết phiếu bảo hành
export const getPhieuBaoHanhById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API}/detail/${id}`)
    // Backend trả về ResponseObject { data, message, success }
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  } catch (error) {
    console.error('Error fetching phieu bao hanh detail:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Update trạng thái phiếu bảo hành
export const updateTrangThai = async (id, trangThai) => {
  try {
    const response = await axiosInstance.put(`${API}/update-trang-thai/${id}`, null, {
      params: { trangThai },
    })
    // Backend trả về ResponseObject { data, message, success }
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  } catch (error) {
    console.error('Error updating trang thai:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Tạo yêu cầu bảo hành (cho admin)
export const taoYeuCauBaoHanh = async (requestData) => {
  try {
    // Tạo FormData để gửi file
    const formData = new FormData()
    formData.append('idHoaDon', requestData.idHoaDon)
    formData.append('idKhachHang', requestData.idKhachHang)
    formData.append('idHoaDonChiTiet', requestData.idHoaDonChiTiet)

    if (requestData.idSerialDaBan) {
      formData.append('idSerialDaBan', requestData.idSerialDaBan)
    }

    formData.append('lyDoTraHang', requestData.lyDoTraHang || '')
    formData.append('tinhTrangLucTra', requestData.tinhTrangLucTra || 'Không xác định')

    if (requestData.moTaTinhTrang) {
      formData.append('moTaTinhTrang', requestData.moTaTinhTrang)
    }

    formData.append('soLuong', requestData.soLuong || 1)

    // Thêm ảnh nếu có
    if (requestData.hinhAnh && requestData.hinhAnh.length > 0) {
      requestData.hinhAnh.forEach((file) => {
        formData.append('hinhAnh', file)
      })
    }

    const response = await axiosInstance.post('/api/v1/bao-hanh/tao-yeu-cau', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Backend trả về ResponseObject { data, message, success }
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  } catch (error) {
    console.error('Error creating warranty request:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
