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
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message)
    }
    return Promise.reject(error)
  },
)

// Add request interceptor to log requests
client.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method, config.url, config.data)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  },
)

export default client
