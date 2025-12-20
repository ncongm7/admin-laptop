import axios from 'axios';

// Base URL cho API Backend
const API_URL = 'http://localhost:8080/api/v1/thongke';

/**
 * Service cho Dashboard Thống Kê Doanh Nghiệp
 * Mapping trực tiếp với DoanhThuController backend
 */
const dashboardService = {
  
  /**
   * Lấy chi tiết doanh thu (Actual vs Expected)
   * @param {String} startDate YYYY-MM-DD
   * @param {String} endDate YYYY-MM-DD
   * @returns {Promise} DoanhThuChiTietDTO
   */
  async getRevenueStats(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/doanh-thu-chi-tiet`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Stats Service Error [Revenue]:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê theo kênh bán (POS/Online)
   * @param {String} startDate 
   * @param {String} endDate 
   * @returns {Promise} List<ThongKeTheoKenhDTO>
   */
  async getChannelStats(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/theo-kenh`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Stats Service Error [Channel]:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê theo phương thức thanh toán
   * @param {String} startDate 
   * @param {String} endDate 
   * @returns {Promise} List<ThongKeTheoPhuongThucDTO>
   */
  async getPaymentMethodStats(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/theo-phuong-thuc`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Stats Service Error [Payment]:", error);
      throw error;
    }
  },

  /**
   * Lấy phân tích dòng tiền (Cash Flow)
   * @param {String} startDate 
   * @param {String} endDate 
   * @returns {Promise} DongTienDTO
   */
  async getCashFlowStats(startDate, endDate) {
    try {
      const response = await axios.get(`${API_URL}/dong-tien`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Stats Service Error [CashFlow]:", error);
      throw error;
    }
  }
};

export default dashboardService;
