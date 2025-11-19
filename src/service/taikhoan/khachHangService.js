import axios from 'axios'

//  Base URL trỏ về backend Spring Boot
const API_URL = 'http://localhost:8080/api/khach-hang'

const KhachHangService = {
  //  Lấy danh sách tất cả khách hàng
  getAll: () => {
    return axios.get(`${API_URL}/hien-thi`)
  },

  //  Thêm khách hàng mới
  addKhachHang: (data) => {
    return axios.post(`${API_URL}/add-khach-hang`, data)
  },

  //  Cập nhật thông tin khách hàng
  updateKhachHang: (id, data) => {
    return axios.put(`${API_URL}/sua-khach-hang/${id}`, data)
  },

  //  Xóa khách hàng theo ID
  deleteKhachHang: (id) => {
    return axios.delete(`${API_URL}/xoa/${id}`)
  },

  //  Phân trang khách hàng
  getPhanTrang: (pageOne, pageSize) => {
    return axios.get(`${API_URL}/phan-trang/${pageOne}/${pageSize}`)
  },

  // Lấy thông tin 1 khách hàng theo ID
  getOne: (id) => {
    return axios.get(`${API_URL}/getOne/${id}`)
  },

  // Tìm kiếm khách hàng
  search: (ten, sdt) => {
    return axios.get(`${API_URL}/tim-kiem`, {
      params: {
        ten: ten || null,
        sdt: sdt || null,
      },
    })
  },

  // Tạo mã khách hàng tự động
  generateCode: () => {
    return axios.get(`${API_URL}/generate-code`)
  },

  // Lấy thông tin khách hàng theo mã khách hàng
  getByMaKhachHang: (maKhachHang) => {
    return axios.get(`${API_URL}/by-ma/${maKhachHang}`)
  },
}

export default KhachHangService
