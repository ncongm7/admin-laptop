import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  fetchProductById,
} from '@/service/apiProduct'
import axiosInstance from '@/service/axiosInstance'
export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const productDetail = ref({})

  // Lấy toàn bộ sản phẩm
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await getAllProducts()
      // Gán mảng sản phẩm trước
      products.value = data

      // Gọi API lấy số lượng cho từng sản phẩm
      await Promise.all(
        products.value.map(async (product) => {
          try {
            // Gọi API lấy tổng số lượng tồn kho cho sản phẩm này
            const res = await axiosInstance.get(`/products/${product.id}/inventory`)
            product.soLuong = res.data.soLuong
            console.log(`Số lượng tồn kho cho sản phẩm ${product.id}:`, product.soLuong)
          } catch (e) {
            product.soLuong = 0 // hoặc null nếu lỗi
          }
        })
      )
      // Force update để UI nhận thay đổi
      products.value = [...products.value]
    } catch (err) {
      error.value = 'Không thể tải danh sách sản phẩm'
      console.error('Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  // Thêm sản phẩm mới
  const addProduct = async (productData) => {
    // loading.value = true
    error.value = null
    try {
      const newProduct = await createProduct(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = 'Không thể tạo sản phẩm mới'
      console.error('Error creating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sửa sản phẩm
  const editProduct = async (id, productData) => {
    loading.value = true
    error.value = null
    try {
      const updatedProduct = await updateProduct(id, productData)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return updatedProduct
    } catch (err) {
      error.value = 'Không thể cập nhật sản phẩm'
      console.error('Error updating product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Xóa sản phẩm
  const removeProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteProduct(id)
      products.value = products.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value = 'Không thể xóa sản phẩm'
      console.error('Error deleting product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Lấy chi tiết sản phẩm theo id
  const getProductById = async (id) => {
    loading.value = true
    error.value = null
    try {
      return await fetchProductById(id)
    } catch (err) {
      error.value = 'Không thể tải thông tin sản phẩm'
      console.error('Error fetching product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProductByIdSP = async (id) => {
    loading.value = true
    error.value = null
    try {
      return await fetchProductById(id)
    } catch (err) {
      error.value = 'Không thể tải thông tin sản phẩm'
      console.error('Error fetching product:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Lọc sản phẩm theo tên (search)
  const filterByKeyword = (keyword) => {
    const searchTerm = keyword.trim().toLowerCase()
    return products.value.filter(
      (product) =>
        product.tenSanPham.toLowerCase().includes(searchTerm) ||
        (product.moTaNgan && product.moTaNgan.toLowerCase().includes(searchTerm)),
    )
  }

  // Lọc sản phẩm theo hãng
  const filterByBrand = (brandId) => {
    return products.value.filter((product) => product.hang_id === brandId)
  }

  return {
    products,
    loading,
    error,
    getAllProducts,
    fetchAllProducts,
    addProduct,
    editProduct,
    removeProduct,
    getProductById,
    filterByKeyword,
    filterByBrand,
    fetchProductByIdSP,
  }
})
