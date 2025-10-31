import axiosInstance from '../axiosInstance'

const XaPhuongService = {
  // Lấy tất cả tỉnh/thành phố
  getAllTinh: () => {
    return axiosInstance.get('/api/dia-chi-tinh-xa/hien-thi-tinh-all')
  },

  // Lấy danh sách xã/phường theo code tỉnh
  getXaPhuongByTinh: (code) => {
    return axiosInstance.get(`/api/dia-chi-tinh-xa/xa-phuong/${code}`)
  },

  // Tìm kiếm tỉnh theo tên
  searchTinhByName: (ten) => {
    return axiosInstance.get(`/api/dia-chi-tinh-xa/ten-tinh/${ten}`)
  },
}

export default XaPhuongService

