import axios from 'axios'

const API_URL = 'http://localhost:8080/api/chat'

export const chatService = {
  // Gửi tin nhắn mới
  sendMessage: async (data) => {
    const res = await axios.post(`${API_URL}/send`, data)
    return res.data
  },

  // Lấy danh sách tin nhắn trong conversation
  getMessages: async (conversationId) => {
    const res = await axios.get(`${API_URL}/conversation/${conversationId}/messages`)
    return res.data
  },

  // Lấy danh sách conversation của khách hàng
  getCustomerConversations: async (khachHangId) => {
    const res = await axios.get(`${API_URL}/customer/${khachHangId}/conversations`)
    return res.data
  },

  // Lấy danh sách conversation của nhân viên
  getStaffConversations: async (nhanVienId) => {
    const res = await axios.get(`${API_URL}/staff/${nhanVienId}/conversations`)
    return res.data
  },

  // Lấy tất cả conversation (admin)
  getAllConversations: async () => {
    const res = await axios.get(`${API_URL}/conversations`)
    return res.data
  },

  // Đánh dấu đã đọc
  markAsRead: async (conversationId, isFromCustomer) => {
    const res = await axios.put(`${API_URL}/conversation/${conversationId}/read`, null, {
      params: { isFromCustomer }
    })
    return res.data
  },

  // Đếm số tin nhắn chưa đọc của khách hàng
  getUnreadCountByCustomer: async (khachHangId) => {
    const res = await axios.get(`${API_URL}/customer/${khachHangId}/unread-count`)
    return res.data
  },

  // Đếm số tin nhắn chưa đọc của nhân viên
  getUnreadCountByStaff: async (nhanVienId) => {
    const res = await axios.get(`${API_URL}/staff/${nhanVienId}/unread-count`)
    return res.data
  },

  // Tìm hoặc tạo conversation
  findOrCreateConversation: async (khachHangId, nhanVienId = null) => {
    const res = await axios.get(`${API_URL}/find-conversation`, {
      params: { khachHangId, nhanVienId }
    })
    return res.data
  }
}

