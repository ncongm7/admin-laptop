import axiosInstance from '../axiosInstance'

const API = '/api/yeu-cau-tra-hang-quan-ly'

// Get All - Lấy danh sách yêu cầu trả hàng
export const getYeuCauTraHang = async () => {
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
    console.error('Error fetching yeu cau tra hang:', error)
    throw error
  }
}

// Xóa yêu cầu trả hàng
export const deleteYeuCauTraHang = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API}/delete/${id}`)
    // Backend trả về ResponseObject { data, message, success }
    return response.data || { message: 'Xóa thành công' }
  } catch (error) {
    console.error('Error deleting yeu cau tra hang:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Get By Id - Lấy chi tiết yêu cầu trả hàng
export const getYeuCauTraHangById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API}/detail/${id}`)
    // Backend trả về ResponseObject { data, message, success }
    if (response.data && response.data.data !== undefined) {
      return response.data.data
    }
    return response.data
  } catch (error) {
    console.error('Error fetching yeu cau tra hang detail:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Update trạng thái yêu cầu trả hàng
export const updateTrangThai = async (id, trangThai, lyDoTuChoi = null, idNhanVienXuLy = null) => {
  try {
    const params = { trangThai }
    if (lyDoTuChoi) {
      params.lyDoTuChoi = lyDoTuChoi
    }
    if (idNhanVienXuLy) {
      params.idNhanVienXuLy = idNhanVienXuLy
    }

    const response = await axiosInstance.put(`${API}/update-trang-thai/${id}`, null, {
      params: params,
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
