// Complete fixed version of api.js
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: false, // Set to false to avoid CORS issues with credentials
})

// Add response interceptor to handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data)
      console.error('API Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      })
      
      // Log specific details for 500 errors
      if (error.response.status === 500) {
        console.error('Server 500 Error - Full Details:', {
          requestUrl: error.config?.url,
          requestMethod: error.config?.method,
          requestData: error.config?.data,
          responseData: error.response.data,
          timestamp: new Date().toISOString()
        })
        
        // Provide user-friendly error message for 500 errors
        const userMessage = error.response.data?.message || 
                           'Có lỗi xảy ra trên server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
        
        // Create a new error with user-friendly message
        const userError = new Error(userMessage)
        userError.originalError = error
        userError.status = 500
        return Promise.reject(userError)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request)
      console.error('Network Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        code: error.code
      })
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  },
)

// Add request interceptor
client.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

export default client
