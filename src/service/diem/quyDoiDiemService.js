import axiosInstance from '../axiosInstance';

const API_URL = '/api/v1/diem/quy-doi';

export const quyDoiDiemService = {
  /**
   * Lấy tất cả quy đổi điểm
   */
  async getAllQuyDoiDiem() {
    const response = await axiosInstance.get(`${API_URL}/all`);
    return response.data.data;
  },
  
  /**
   * Lấy quy đổi điểm đang hoạt động
   */
  async getQuyDoiDiemDangHoatDong() {
    const response = await axiosInstance.get(`${API_URL}/active`);
    return response.data.data;
  },
  
  /**
   * Tạo quy đổi điểm mới (admin)
   * @param {Object} request - { tienTichDiem, tienTieuDiem, trangThai }
   */
  async createQuyDoiDiem(request) {
    const response = await axiosInstance.post(`${API_URL}`, request);
    return response.data.data;
  },
  
  /**
   * Cập nhật quy đổi điểm (admin)
   * @param {string} id - ID quy đổi điểm
   * @param {Object} request - { tienTichDiem, tienTieuDiem, trangThai }
   */
  async updateQuyDoiDiem(id, request) {
    const response = await axiosInstance.put(`${API_URL}/${id}`, request);
    return response.data.data;
  },
  
  /**
   * Vô hiệu hóa quy đổi điểm (admin)
   * @param {string} id - ID quy đổi điểm
   */
  async deactivateQuyDoiDiem(id) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

