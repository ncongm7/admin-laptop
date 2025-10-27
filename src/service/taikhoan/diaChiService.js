import axios from 'axios'

// Base URL trỏ về backend Spring Boot
const API_URL = 'http://localhost:8080/api/dia-chi'

const DiaChiService = {
  // Lấy danh sách tất cả địa chỉ
  getAll: () => {
    return axios.get(`${API_URL}/hien-thi`)
  },

  // Lấy địa chỉ theo mã khách hàng
  findByMaKhachHang: (maKhachHang) => {
    return axios.get(`${API_URL}/find-by-ma-khach-hang/${maKhachHang}`)
  },

  // Lấy thông tin 1 địa chỉ theo ID
  getOne: (id) => {
    return axios.get(`${API_URL}/getOne/${id}`)
  },

  // Thêm địa chỉ mới
  addDiaChi: (data) => {
    return axios.post(`${API_URL}/add`, data)
  },

  // Cập nhật thông tin địa chỉ
  updateDiaChi: (id, data) => {
    return axios.put(`${API_URL}/sua/${id}`, data)
  },

  // Xóa địa chỉ theo ID
  deleteDiaChi: (id) => {
    return axios.delete(`${API_URL}/xoa/${id}`)
  },
}

export default DiaChiService
