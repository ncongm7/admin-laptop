import axios from 'axios'

// Base URL trỏ về backend Spring Boot
const API_URL = 'http://localhost:8080/api/dia-chi'
// Base URL cho API tỉnh/thành phố và xã/phường
const API_ADDRESS_URL = 'http://localhost:8080/api/dia-chi-tinh-xa'

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

  // ========== API TỈNH/THÀNH PHỐ VÀ XÃ/PHƯỜNG ==========

  /**
   * Lấy danh sách tất cả tỉnh/thành phố từ backend
   * @returns {Promise} Promise chứa danh sách tỉnh/thành phố
   * Response: Array of {id: Integer, name: String, code: String}
   */
  getAllProvinces: () => {
    return axios.get(`${API_ADDRESS_URL}/hien-thi-tinh-all`)
  },

  /**
   * Lấy danh sách xã/phường theo mã tỉnh/thành phố
   * @param {Integer} provinceCode - Mã tỉnh/thành phố (id hoặc code)
   * @returns {Promise} Promise chứa danh sách xã/phường
   * Response: Array of {id, districtId, districtCode, provinceId, provinceCode, name, shortname, code}
   */
  getWardsByProvince: (provinceCode) => {
    return axios.get(`${API_ADDRESS_URL}/xa-phuong/${provinceCode}`)
  },
}

export default DiaChiService
