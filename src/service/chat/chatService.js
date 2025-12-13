import axios from 'axios'

const API_URL = 'http://localhost:8080/api/chat'

// Create axios instance with timeout and retry configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[ChatService] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[ChatService] Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[ChatService] Response from ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('[ChatService] Response error:', error)

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond')
      error.userMessage = 'Yêu cầu bị timeout. Vui lòng thử lại.'
    } else if (!error.response) {
      console.error('Network error - no response from server')
      error.userMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.'
    } else if (error.response.status === 500) {
      console.error('Server error 500')
      error.userMessage = 'Lỗi server. Vui lòng thử lại sau.'
    } else if (error.response.status === 401) {
      console.error('Unauthorized')
      error.userMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
    }

    return Promise.reject(error)
  }
)

// Retry helper function
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error.message)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}

export const chatService = {
  // Gửi tin nhắn mới
  sendMessage: async (data) => {
    try {
      const res = await retryRequest(() => apiClient.post('/send', data), 2)
      return res.data
    } catch (error) {
      console.error('[sendMessage] Error:', error)
      throw error
    }
  },

  // Lấy danh sách tin nhắn trong conversation
  getMessages: async (conversationId) => {
    try {
      const res = await retryRequest(() => apiClient.get(`/conversation/${conversationId}/messages`))
      return res.data
    } catch (error) {
      console.error('[getMessages] Error:', error)
      throw error
    }
  },

  // Lấy danh sách conversation của khách hàng
  getCustomerConversations: async (khachHangId) => {
    try {
      const res = await retryRequest(() => apiClient.get(`/customer/${khachHangId}/conversations`))
      return res.data
    } catch (error) {
      console.error('[getCustomerConversations] Error:', error)
      throw error
    }
  },

  // Lấy danh sách conversation của nhân viên
  getStaffConversations: async (nhanVienId) => {
    try {
      const res = await retryRequest(() => apiClient.get(`/staff/${nhanVienId}/conversations`))
      return res.data
    } catch (error) {
      console.error('[getStaffConversations] Error:', error)
      throw error
    }
  },

  // Lấy tất cả conversation (admin)
  getAllConversations: async () => {
    try {
      const res = await retryRequest(() => apiClient.get('/conversations'))
      return res.data
    } catch (error) {
      console.error('[getAllConversations] Error:', error)
      throw error
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (conversationId, isFromCustomer) => {
    try {
      const res = await apiClient.put(`/conversation/${conversationId}/read`, null, {
        params: { isFromCustomer }
      })
      return res.data
    } catch (error) {
      console.error('[markAsRead] Error:', error)
      // Don't throw - marking as read is not critical
      return null
    }
  },

  // Đếm số tin nhắn chưa đọc của khách hàng
  getUnreadCountByCustomer: async (khachHangId) => {
    try {
      const res = await apiClient.get(`/customer/${khachHangId}/unread-count`)
      return res.data
    } catch (error) {
      console.error('[getUnreadCountByCustomer] Error:', error)
      return { data: 0 } // Return 0 on error
    }
  },

  // Đếm số tin nhắn chưa đọc của nhân viên
  getUnreadCountByStaff: async (nhanVienId) => {
    try {
      const res = await apiClient.get(`/staff/${nhanVienId}/unread-count`)
      return res.data
    } catch (error) {
      console.error('[getUnreadCountByStaff] Error:', error)
      return { data: 0 } // Return 0 on error
    }
  },

  // Tìm hoặc tạo conversation
  findOrCreateConversation: async (khachHangId, nhanVienId = null) => {
    try {
      const res = await retryRequest(() => apiClient.get('/find-conversation', {
        params: { khachHangId, nhanVienId }
      }))
      return res.data
    } catch (error) {
      console.error('[findOrCreateConversation] Error:', error)
      throw error
    }
  },

  // Upload file
  uploadFile: async (formData) => {
    try {
      const res = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds for file upload
      })
      return res.data
    } catch (error) {
      console.error('[uploadFile] Error:', error)
      throw error
    }
  }
}
