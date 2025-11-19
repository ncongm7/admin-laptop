import axios from 'axios'

/**
 * Service sử dụng API miễn phí để lấy danh sách tỉnh/thành phố, quận/huyện, phường/xã của Việt Nam
 * Sử dụng API từ GitHub: https://github.com/nongdenchet/vietnam-provinces-districts-wards
 * Hoặc API từ: https://provinces.open-api.vn/api/
 */

// Base URL cho API miễn phí - sử dụng provinces.open-api.vn (API công khai miễn phí)
const API_BASE_URL = 'https://provinces.open-api.vn/api'

const VietnamAddressService = {
  /**
   * Lấy danh sách tất cả tỉnh/thành phố
   * @returns {Promise} Promise chứa danh sách tỉnh/thành phố
   * Response: Array of {code: String, name: String}
   */
  getAllProvinces: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/p/`, {
        timeout: 10000, // 10 seconds timeout
      })
      // Format dữ liệu để tương thích với code hiện tại
      return response.data.map((item) => ({
        id: item.code,
        code: item.code,
        name: item.name,
      }))
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error)
      // Fallback: trả về danh sách rỗng hoặc có thể sử dụng dữ liệu tĩnh
      return []
    }
  },

  /**
   * Lấy danh sách quận/huyện theo mã tỉnh/thành phố
   * @param {String|Number} provinceCode - Mã tỉnh/thành phố
   * @returns {Promise} Promise chứa danh sách quận/huyện
   * Response: Array of {code: String, name: String, province_code: String}
   */
  getDistrictsByProvince: async (provinceCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/p/${provinceCode}?depth=2`, {
        timeout: 10000,
      })
      // API trả về tỉnh với danh sách quận/huyện bên trong
      if (response.data && response.data.districts) {
        return response.data.districts.map((item) => ({
          id: item.code,
          code: item.code,
          name: item.name,
          provinceCode: provinceCode,
        }))
      }
      return []
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quận/huyện:', error)
      return []
    }
  },

  /**
   * Lấy danh sách phường/xã theo mã quận/huyện
   * @param {String|Number} districtCode - Mã quận/huyện
   * @returns {Promise} Promise chứa danh sách phường/xã
   * Response: Array of {code: String, name: String, district_code: String}
   */
  getWardsByDistrict: async (districtCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/d/${districtCode}?depth=2`, {
        timeout: 10000,
      })
      // API trả về quận/huyện với danh sách phường/xã bên trong
      if (response.data && response.data.wards) {
        return response.data.wards.map((item) => ({
          id: item.code,
          code: item.code,
          name: item.name,
          districtCode: districtCode,
        }))
      }
      return []
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phường/xã:', error)
      return []
    }
  },

  /**
   * Lấy danh sách phường/xã theo mã tỉnh/thành phố (tương thích với code cũ)
   * @param {String|Number} provinceCode - Mã tỉnh/thành phố
   * @returns {Promise} Promise chứa danh sách phường/xã (tất cả phường/xã trong tỉnh)
   */
  getWardsByProvince: async (provinceCode) => {
    try {
      // Lấy tất cả quận/huyện trong tỉnh
      const districts = await VietnamAddressService.getDistrictsByProvince(provinceCode)
      
      // Lấy tất cả phường/xã từ tất cả quận/huyện
      const allWards = []
      for (const district of districts) {
        const wards = await VietnamAddressService.getWardsByDistrict(district.code)
        allWards.push(...wards)
      }
      
      return allWards
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phường/xã theo tỉnh:', error)
      return []
    }
  },

  /**
   * Tìm kiếm tỉnh/thành phố theo tên
   * @param {String} searchText - Text tìm kiếm
   * @returns {Promise} Promise chứa danh sách tỉnh/thành phố khớp
   */
  searchProvinces: async (searchText) => {
    try {
      const provinces = await VietnamAddressService.getAllProvinces()
      const searchLower = searchText.toLowerCase().trim()
      return provinces.filter((p) => p.name.toLowerCase().includes(searchLower))
    } catch (error) {
      console.error('Lỗi khi tìm kiếm tỉnh/thành phố:', error)
      return []
    }
  },
}

export default VietnamAddressService

