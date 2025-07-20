// apiProduct.js
import axiosInstance from './axiosInstance'

const idUser = JSON.parse(localStorage.getItem('user'))?.id

// Tạo sản phẩm mới
export const createProduct = async (data) => {
  try {
    // Lấy idUser từ localStorage, đảm bảo là string
    console.log('ID user:', idUser)
    console.log('ID user:', localStorage.getItem('user'))

    const response = await axiosInstance.post(`/products/post`, data)
    console.log('ID user:', idUser)
    console.log('Tạo sản phẩm thành công:', response.data)
    return response.data
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error.response ? error.response.data : error)
    throw error
  }
}

// Cập nhật sản phẩm
export const updateProduct = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/products/${id}`, data)
    console.log(`Cập nhật sản phẩm #${id} thành công:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm #${id}:`, error.response ? error.response.data : error)
    throw error
  }
}

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/products/${id}`)
    console.log(`Xóa sản phẩm #${id} thành công:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm #${id}:`, error.response ? error.response.data : error)
    throw error
  }
}
// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/products')
    return response.data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error.response ? error.response.data : error)
    throw error
  }
}

// Lấy chi tiết sản phẩm theo id
export const fetchProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/products/${id}`)
    return response.data
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm #${id}:`, error.response ? error.response.data : error)
    throw error
  }
}
