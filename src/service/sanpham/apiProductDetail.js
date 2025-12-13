import axios from 'axios'

// Tạo instance axios với base URL
const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor để thêm token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
// Upload ảnh lên server
export const uploadImage = async (formData) => {
    try {
        const response = await api.post('/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error)
        throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh')
    }
}
