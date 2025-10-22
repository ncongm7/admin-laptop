import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // địa chỉ backend thật
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: 'Bearer ...' nếu có auth
  },
})

// Response interceptor to normalize errors and avoid app crash
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data && typeof error.response.data === 'string'
        ? error.response.data
        : error?.response?.data?.message || error.message || 'Có lỗi xảy ra.'
    // eslint-disable-next-line no-console
    console.error('API error:', msg)
    return Promise.reject(error)
  },
)

export default axiosInstance
