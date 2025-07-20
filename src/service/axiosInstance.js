import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // địa chỉ backend thật
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: 'Bearer ...' nếu có auth
  },
})

export default axiosInstance
