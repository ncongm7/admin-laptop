// Update productStore.js to handle the paginated response
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createSanPham,
  updateSanPham,
  deleteSanPham,
  getAllSanPham,
  getCPUList,
  getGPUList,
  getLoaiManHinhList,
  getMauSacList,
  getOCungList,
  getPinList,
  getRamList,
  advancedSearch,
  advancedSearchPage,
} from '@/service/sanpham/SanPhamService'
import client from '@/utils/api'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null) // Thêm để theo dõi lỗi
  const productDetail = ref({})

  // Attributes
  const brands = ref([])
  const cpus = ref([])
  const rams = ref([])
  const gpus = ref([])
  const storages = ref([])
  const colors = ref([])
  const screens = ref([])
  const displays = ref([])
  const oses = ref([])
  const batteries = ref([])
  const cameras = ref([])

  // Lấy toàn bộ sản phẩm
  const fetchAllProducts = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('Fetching products...')
      const response = await getAllSanPham()
      console.log('API response:', response)

      // Handle different response formats
      let data = response.data || response

      // If response has content property (from paginated responses)
      if (response.content) {
        data = response.content
      }

      // Ensure we have an array of products
      if (Array.isArray(data)) {
        products.value = data
        console.log('Products loaded successfully:', products.value.length)
      } else if (data && Array.isArray(data.content)) {
        products.value = data.content
        console.log('Products loaded successfully:', products.value.length)
      } else {
        products.value = []
        console.log('No products found')
      }

      await loadAttributes()
      return products.value
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách sản phẩm'
      console.error('Error fetching products:', err)
      products.value = [] // Reset nếu lỗi
      throw err
    } finally {
      loading.value = false
    }
  }

  // Load attributes
  const loadAttributes = async () => {
    try {
      const [cpuRes, gpuRes, ramRes, pinRes, oCungRes, mauSacRes, loaiManHinhRes] =
        await Promise.all([
          getCPUList(),
          getGPUList(),
          getRamList(), // Fixed endpoint
          getPinList(),
          getOCungList(),
          getMauSacList(),
          getLoaiManHinhList(),
        ])

      cpus.value = cpuRes.data || []
      gpus.value = gpuRes.data || []
      rams.value = ramRes.data || []
      batteries.value = pinRes.data || []
      storages.value = oCungRes.data || []
      colors.value = mauSacRes.data || []
      screens.value = loaiManHinhRes.data || []
    } catch (err) {
      error.value = err.message || 'Lỗi tải thuộc tính'
      console.error('Error loading attributes:', err)
    }
  }

  // Thêm sản phẩm mới
  const addProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await createSanPham(productData)
      const newProduct = response.data || response
      products.value.push(newProduct)
      return newProduct
    } catch (err) {
      error.value = err.message || 'Không thể tạo sản phẩm mới'
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
      const response = await updateSanPham(id, productData)
      const updatedProduct = response.data || response
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return updatedProduct
    } catch (err) {
      error.value = err.message || 'Không thể cập nhật sản phẩm'
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
      await deleteSanPham(id)
      products.value = products.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value = err.message || 'Không thể xóa sản phẩm'
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
      const response = await getAllSanPham({ id })
      return response.data || response
    } catch (err) {
      error.value = err.message || 'Không thể tải thông tin sản phẩm'
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
      const response = await getAllSanPham({ id })
      const productData = response.data || response

      console.log('Fetched product data:', productData)
      console.log('Available fields in product data:', Object.keys(productData))

      // Update the product detail ref
      productDetail.value = productData

      // Also update in the products array if it exists there
      const index = products.value.findIndex((p) => p.id == id)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...productData }
      }

      return productData
    } catch (err) {
      error.value = err.message || 'Không thể tải thông tin sản phẩm'
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

  // Advanced search filter - Call API from backend
  const advancedSearchProducts = async (keyword, trangThai, minPrice, maxPrice) => {
    loading.value = true
    error.value = null
    try {
      const response = await advancedSearch(keyword, trangThai, minPrice, maxPrice)
      const data = response.data || response

      return Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message || 'Không thể lọc sản phẩm'
      console.error('Error filtering products:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Advanced search with pagination
  const advancedSearchProductsPage = async (
    keyword,
    trangThai,
    minPrice,
    maxPrice,
    page = 0,
    size = 10,
  ) => {
    loading.value = true
    error.value = null
    try {
      const response = await advancedSearchPage(keyword, trangThai, minPrice, maxPrice, page, size)
      const data = response.data || response

      return Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.message || 'Không thể lọc sản phẩm'
      console.error('Error filtering products:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed property to get a product by ID
  const getProductByIdComputed = computed(() => (id) => {
    return products.value.find((product) => product.id == id) || null
  })

  return {
    products,
    loading,
    error,
    brands,
    cpus,
    rams,
    gpus,
    storages,
    colors,
    screens,
    displays,
    oses,
    batteries,
    cameras,
    productDetail,
    fetchAllProducts,
    addProduct,
    editProduct,
    removeProduct,
    getProductById,
    filterByKeyword,
    filterByBrand,
    fetchProductByIdSP,
    loadAttributes,
    advancedSearchProducts,
    advancedSearchProductsPage,
    getProductByIdComputed,
  }
})