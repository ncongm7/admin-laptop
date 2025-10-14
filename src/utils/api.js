import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8080', // Đảm bảo cổng khớp với backend
  withCredentials: true, // Bật credentials để xác thực
  headers: {
    'Content-Type': 'application/json',
  },
})

export default client
