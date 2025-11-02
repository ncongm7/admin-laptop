import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // địa chỉ backend thật
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

//tu động thêm tokeen vào request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token')

    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Xử lý lỗi response (không tự động logout)
axiosInstance.interceptors.response.use(
  (response) => {
    // Trả về response nếu thành công
    return response
  },
  (error) => {
    // Nếu gặp lỗi 401 Unauthorized, log ra console
    // KHÔNG tự động logout để tránh mất session khi reload
    if (error.response && error.response.status === 401) {
      console.warn('API trả về 401 Unauthorized:', error.config.url)
      console.warn('Vui lòng kiểm tra token hoặc đăng nhập lại')
    }

    // Trả về lỗi để component xử lý
    return Promise.reject(error)
  }
)

export default axiosInstance
