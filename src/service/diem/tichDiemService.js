import axiosInstance from '../axiosInstance';

const API_URL = '/api/v1/diem';

export const tichDiemService = {
  /**
   * Lấy thông tin ví điểm của khách hàng
   * @param {string} userId - ID khách hàng
   */
  async getTichDiemByUserId(userId) {
    const response = await axiosInstance.get(`${API_URL}/tich-diem/${userId}`);
    return response.data.data;
  },
  
  /**
   * Lấy lịch sử điểm có phân trang
   * @param {string} userId - ID khách hàng
   * @param {number} page - Số trang (bắt đầu từ 0)
   * @param {number} size - Số lượng record mỗi trang
   * @param {number} loaiDiem - Loại điểm (1 = Tích điểm, 2 = Tiêu điểm, null = Tất cả)
   */
  async getLichSuDiem(userId, page = 0, size = 10, loaiDiem = null) {
    const params = { userId, page, size };
    if (loaiDiem !== null) {
      params.loaiDiem = loaiDiem;
    }
    const response = await axiosInstance.get(`${API_URL}/lich-su/me`, { params });
    return response.data.data;
  },
  
  /**
   * Lấy lịch sử điểm theo hóa đơn
   * @param {string} hoaDonId - ID hóa đơn
   */
  async getLichSuDiemByHoaDonId(hoaDonId) {
    const response = await axiosInstance.get(`${API_URL}/lich-su/hoa-don/${hoaDonId}`);
    return response.data.data;
  },
  
  /**
   * Thêm/bớt điểm thủ công (admin)
   * @param {Object} request - { userId, soDiemCong, lyDo, ghiChu }
   */
  async themBotDiemThuCong(request) {
    const response = await axiosInstance.post(`${API_URL}/tich-diem/manual`, request);
    return response.data;
  }
};

