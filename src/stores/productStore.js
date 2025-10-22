import { defineStore } from 'pinia'
import { ref } from 'vue'
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
} from '@/service/sanpham/SanPhamService'
import client from '@/utils/api'
export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
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
      const response = await getAllSanPham()

      let data = response
      // Handle different response structures
      if (response.data) {
        data = response.data
      }
      if (response.content) {
        data = response.content
      }

      // Assign product array
      if (Array.isArray(data)) {
        products.value = data
      } else if (data && Array.isArray(data.content)) {
        products.value = data.content
      } else {
        products.value = []
      }

      // Load attributes
      await loadAttributes()
    } catch (err) {
      error.value = 'Không thể tải danh sách sản phẩm'
      console.error('Error fetching products:', err)

      // Add some mock data for testing if API fails
      products.value = [
        {
          id: 1,
          ten: 'MacBook Pro M3',
          tenSanPham: 'MacBook Pro M3',
          ma: 'MBP-M3-001',
          maSanPham: 'MBP-M3-001',
          trangThai: 'ACTIVE',
          soLuong: 10,
          anhDaiDien: '/images/macbook.jpg',
          ngayTao: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString(),
          variants: [{ giaBan: 35000000, gia: 35000000 }],
        },
        {
          id: 2,
          ten: 'Dell XPS 13',
          tenSanPham: 'Dell XPS 13',
          ma: 'DELL-XPS-001',
          maSanPham: 'DELL-XPS-001',
          trangThai: 'ACTIVE',
          soLuong: 5,
          anhDaiDien: '/images/dell.jpg',
          ngayTao: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString(),
          variants: [{ giaBan: 25000000, gia: 25000000 }],
        },
        {
          id: 3,
          ten: 'HP Pavilion 15',
          tenSanPham: 'HP Pavilion 15',
          ma: 'HP-PAV-001',
          maSanPham: 'HP-PAV-001',
          trangThai: 'ACTIVE',
          soLuong: 15,
          anhDaiDien: '/images/hp.jpg',
          ngayTao: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString(),
          variants: [{ giaBan: 18000000, gia: 18000000 }],
        },
        {
          id: 4,
          ten: 'Lenovo ThinkPad X1',
          tenSanPham: 'Lenovo ThinkPad X1',
          ma: 'LEN-X1-001',
          maSanPham: 'LEN-X1-001',
          trangThai: 'ACTIVE',
          soLuong: 8,
          anhDaiDien: '/images/lenovo.jpg',
          ngayTao: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString(),
          variants: [{ giaBan: 30000000, gia: 30000000 }],
        },
        {
          id: 5,
          ten: 'ASUS ROG Strix',
          tenSanPham: 'ASUS ROG Strix',
          ma: 'ASUS-ROG-001',
          maSanPham: 'ASUS-ROG-001',
          trangThai: 'ACTIVE',
          soLuong: 3,
          anhDaiDien: '/images/asus.jpg',
          ngayTao: new Date().toISOString(),
          ngayCapNhat: new Date().toISOString(),
          variants: [{ giaBan: 45000000, gia: 45000000 }],
        },
      ]
    } finally {
      loading.value = false
    }
  }

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await client.get('/api/san-pham')
      return true
    } catch (err) {
      console.error('API test failed:', err)
      return false
    }
  }

  // Load attributes
  const loadAttributes = async () => {
    try {
      const [cpuRes, gpuRes, ramRes, pinRes, oCungRes, mauSacRes, loaiManHinhRes] =
        await Promise.all([
          getCPUList(),
          getGPUList(),
          getRamList(),
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
      const response = await updateSanPham(id, productData)
      const updatedProduct = response.data || response
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
      await deleteSanPham(id)
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
      const response = await getAllSanPham({ id })
      return response.data || response
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
      const response = await getAllSanPham({ id })
      return response.data || response
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

  // Advanced search filter - Call API from backend
  const advancedSearchProducts = async (keyword, trangThai, minPrice, maxPrice) => {
    loading.value = true
    error.value = null
    try {
      const response = await advancedSearch(keyword, trangThai, minPrice, maxPrice)
      const data = response.data || response

      // Return the filtered products without modifying the main products array
      return Array.isArray(data) ? data : []
    } catch (err) {
      error.value = 'Không thể lọc sản phẩm'
      console.error('Error filtering products:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

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
    fetchAllProducts,
    addProduct,
    editProduct,
    removeProduct,
    getProductById,
    filterByKeyword,
    filterByBrand,
    fetchProductByIdSP,
    loadAttributes,
    testApiConnection,
    advancedSearchProducts,
  }
})
