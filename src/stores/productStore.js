// Update productStore.js to handle the paginated response
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createSanPham,
  updateSanPham,
  deleteSanPham,
  bulkDeleteSanPham,
  getAllSanPham,
  getSanPhamById,
  getCPUList,
  getGPUList,
  getLoaiManHinhList,
  getMauSacList,
  getOCungList,
  getPinList,
  getRamList,
  advancedSearch,
  advancedSearchPage,
  getAllSanPhamChiTiet,
  deleteCTSP,
  searchSanPhamChiTiet,
  updateChiTietSanPham
} from '@/service/sanpham/SanPhamService'
// import client from '@/utils/api'
export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const variants = ref([]) // chi tiết sản phẩm (CTSP)
  const loading = ref(false)
  const variantsLoading = ref(false)
  const error = ref(null) // Thêm để theo dõi lỗi

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

   // Normalize a ChiTietSanPhamResponse into structure used by component
  const normalizeCtsp = (item) => {
 
    return {
      ...item,
      // backend returns flat fields like tenCpu, tenRam, dungLuongOCung, ...
      cpu: item.tenCpu ? { tenCpu: item.tenCpu, id: item.idCpu } : (item.cpu || null),
      ram: item.tenRam ? { tenRam: item.tenRam, id: item.idRam } : (item.ram || null),
      gpu: item.tenGpu ? { tenGpu: item.tenGpu, id: item.idGpu } : (item.gpu || null),
      oCung: item.dungLuongOCung ? { dungLuong: item.dungLuongOCung, id: item.idOCung } : (item.oCung || null),
      loaiManHinh: item.kichThuocManHinh ? { kichThuoc: item.kichThuocManHinh, id: item.idLoaiManHinh } : (item.loaiManHinh || null),
      pin: item.dungLuongPin ? { dungLuongPin: item.dungLuongPin, id: item.idPin } : (item.pin || null),
      mauSac: item.tenMauSac ? { tenMau: item.tenMauSac, id: item.idMauSac, hexCode: item.hexCodeMauSac } : (item.mauSac || null),
      tenSanPham: item.tenSanPham || item.productName || '',
      maCtsp: item.maCtsp || item.code || '',
      giaBan: item.giaBan,
      soLuongTon: item.soLuongTon,
      trangThai: item.trangThai,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  } 
  
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
        // Sort by creation date (newest first)
        products.value = data.sort((a, b) => {
          const dateA = new Date(a.ngayTao || a.createdAt || 0)
          const dateB = new Date(b.ngayTao || b.createdAt || 0)
          return dateB - dateA
        })
        console.log('Products loaded successfully:', products.value.length)
      } else if (data && Array.isArray(data.content)) {
        // Sort by creation date (newest first)
        products.value = data.content.sort((a, b) => {
          const dateA = new Date(a.ngayTao || a.createdAt || 0)
          const dateB = new Date(b.ngayTao || b.createdAt || 0)
          return dateB - dateA
        })
        console.log('Products loaded successfully:', products.value.length)
      } else {
        products.value = []
        console.log('No products found')
      }

      // Load variants for each product to calculate min/max prices
      await fetchAllVariants()
      
      // Map variants to products
      products.value = products.value.map(product => {
        const productVariants = variants.value.filter(variant => 
          variant.idSanPham === product.id || variant.sanPhamId === product.id
        )
        return {
          ...product,
          variants: productVariants
        }
      })

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

  // Lấy toàn bộ variants (chi tiết sản phẩm)
 const fetchAllVariants = async () => {
    variantsLoading.value = true
    error.value = null
    try {
      const res = await getAllSanPhamChiTiet()
      const data = res.data || res
      if (Array.isArray(data)) {
        variants.value = data.map(normalizeCtsp)
      } else if (data && Array.isArray(data.content)) {
        variants.value = data.content.map(normalizeCtsp)
      } else {
        variants.value = []
      }
      return variants.value
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách biến thể'
      variants.value = []
      throw err
    } finally {
      variantsLoading.value = false
    }
  }

 // Xóa 1 biến thể (nếu cần)
  const removeVariant = async (id) => {
    variantsLoading.value = true
    try {
      await deleteCTSP(id)
      variants.value = variants.value.filter((v) => v.id !== id)
    } catch (err) {
      error.value = err.message || 'Không thể xóa biến thể'
      throw err
    } finally {
      variantsLoading.value = false
    }
  }

  // Cập nhật 1 biến thể
  const updateVariant = async (id, payload) => {
    variantsLoading.value = true
    error.value = null
    try {
      const response = await updateChiTietSanPham(id, payload)
      const updatedVariant = response.data || response
      
      // Update the variant in the local array
      const index = variants.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        variants.value[index] = normalizeCtsp(updatedVariant)
      }
      
      return updatedVariant
    } catch (err) {
      error.value = err.message || 'Không thể cập nhật biến thể'
      console.error('Error updating variant:', err)
      throw err
    } finally {
      variantsLoading.value = false
    }
  }


  // Fetch filtered variants (server-side)
   const fetchFilteredVariants = async (filters = {}, page = 0, size = 20) => {
    variantsLoading.value = true
    error.value = null
    try {
      const params = {
        keyword: filters.keyword ?? null,
        cpu: filters.cpu ?? null,
        gpu: filters.gpu ?? null,
        ram: filters.ram ?? null,
        color: filters.color ?? null,
        storage: filters.storage ?? null,
        screen: filters.screen ?? null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        page,
        size,
      }
      
      const response = await searchSanPhamChiTiet(params)
      
      const data = response.data || response
      let list = []
      let paginationInfo = {}
      
      if (data && data.content) {
        // Paginated response
        list = data.content
        paginationInfo = {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          currentPage: data.number,
          pageSize: data.size,
          first: data.first,
          last: data.last
        }
      } else if (Array.isArray(data)) {
        // Simple array response
        list = data
        paginationInfo = {
          totalElements: data.length,
          totalPages: Math.ceil(data.length / size),
          currentPage: page,
          pageSize: size
        }
      }
      
      variants.value = list.map(normalizeCtsp)
      
      // Return both variants and pagination info
      return {
        content: variants.value,
        ...paginationInfo
      }
    } catch (err) {
      error.value = err.message || 'Không thể tải biến thể'
      console.error('Error in fetchFilteredVariants:', err)
      variants.value = []
      throw err
    } finally {
      variantsLoading.value = false
    }
  }

  // Load attributes
  const loadAttributes = async () => {
    try {
      const [cpuRes, gpuRes, ramRes, ocungRes, mauRes, screenRes, pinRes] = await Promise.all([
        getCPUList().catch(() => ({ data: [] })),
        getGPUList().catch(() => ({ data: [] })),
        getRamList().catch(() => ({ data: [] })),
        getOCungList().catch(() => ({ data: [] })),
        getMauSacList().catch(() => ({ data: [] })),
        getLoaiManHinhList().catch(() => ({ data: [] })),
        getPinList().catch(() => ({ data: [] })),
      ])
      
      // Filter only active items (trangThai = 1) and ensure hexCode for colors
      cpus.value = (cpuRes.data || []).filter(item => item.trangThai === 1)
      gpus.value = (gpuRes.data || []).filter(item => item.trangThai === 1)
      rams.value = (ramRes.data || []).filter(item => item.trangThai === 1)
      storages.value = (ocungRes.data || []).filter(item => item.trangThai === 1)
      colors.value = (mauRes.data || [])
        .filter(item => item.trangThai === 1)
        .map(item => ({
          ...item,
          hexCode: item.hexCode || item.mauHex || '#000000' // Ensure hexCode exists
        }))
      screens.value = (screenRes.data || []).filter(item => item.trangThai === 1)
      batteries.value = (pinRes.data || []).filter(item => item.trangThai === 1)
      
      
    } catch (err) {
      console.error('Error loading attributes', err)
    }
  }

  // Thêm sản phẩm mới
  const addProduct = async (productData) => {
    loading.value = true
    error.value = null
    try {
      const response = await createSanPham(productData)
      const newProduct = response.data || response
      // Add new product at the beginning of the list
      products.value.unshift(newProduct)
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
      console.log('ProductStore: Updating product with ID:', id, 'Data:', productData)
      
      const response = await updateSanPham(id, productData)
      const updatedProduct = response.data || response
      
      console.log('ProductStore: Update response:', updatedProduct)
      
      // Update the product in the local array
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        // Preserve variants if they exist
        const existingVariants = products.value[index].variants || []
        products.value[index] = {
          ...updatedProduct,
          variants: productData.variants || existingVariants
        }
        console.log('ProductStore: Updated product in local array:', products.value[index])
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

  // Alias for editProduct to match ProductsView usage
  const updateProduct = editProduct

  // Xóa sản phẩm (với cascade delete cho variants)
  const removeProduct = async (id) => {
    loading.value = true
    error.value = null
    try {
      console.log('ProductStore: Deleting product with ID:', id)
      
      // First, get all variants for this product
      const productVariants = variants.value.filter(variant => 
        variant.idSanPham === id || variant.sanPhamId === id
      )
      
      console.log(`ProductStore: Found ${productVariants.length} variants to delete first`)
      
      // Delete all variants first (cascade delete)
      if (productVariants.length > 0) {
        console.log('ProductStore: Deleting variants first...')
        const deleteVariantPromises = productVariants.map(variant => 
          deleteCTSP(variant.id).catch(err => {
            console.warn(`Failed to delete variant ${variant.id}:`, err)
            // Continue even if some variants fail to delete
            return null
          })
        )
        
        await Promise.allSettled(deleteVariantPromises)
        console.log('ProductStore: Variants deletion completed')
        
        // Update local variants state
        variants.value = variants.value.filter(variant => 
          variant.idSanPham !== id && variant.sanPhamId !== id
        )
      }
      
      // Now delete the main product
      console.log('ProductStore: Deleting main product...')
      const response = await deleteSanPham(id)
      console.log('ProductStore: Delete response:', response)
      
      // Remove from local state
      products.value = products.value.filter((p) => p.id !== id)
      console.log('ProductStore: Product removed from local state')
      
      return response
    } catch (err) {
      error.value = err.message || 'Không thể xóa sản phẩm'
      console.error('ProductStore: Error deleting product:', err)
      console.error('ProductStore: Full error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        code: err.code
      })
      
      // Provide more specific error messages
      if (err.response?.status === 404) {
        throw new Error('Sản phẩm không tồn tại hoặc đã được xóa')
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Dữ liệu không hợp lệ'
        throw new Error(`Không thể xóa sản phẩm: ${errorMsg}`)
      } else if (err.response?.status === 500) {
        const serverError = err.response?.data?.message || err.response?.data?.error || 'Lỗi server không xác định'
        console.error('Server error details:', err.response?.data)
        
        // Check for foreign key constraint errors
        if (serverError.includes('REFERENCE constraint') || serverError.includes('FK_')) {
          throw new Error('Không thể xóa sản phẩm này vì vẫn còn dữ liệu liên quan (biến thể, đơn hàng, v.v.). Vui lòng xóa các dữ liệu liên quan trước.')
        }
        
        throw new Error(`Lỗi server: ${serverError}`)
      } else if (err.code === 'NETWORK_ERROR') {
        throw new Error('Lỗi kết nối mạng - Kiểm tra kết nối internet hoặc server')
      }
      
      // Default error with more details
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi không xác định'
      throw new Error(`Không thể xóa sản phẩm: ${errorMsg}`)
    } finally {
      loading.value = false
    }
  }

  // Xóa nhiều sản phẩm (với cascade delete)
  const bulkRemoveProducts = async (ids) => {
    loading.value = true
    error.value = null
    try {
      console.log('ProductStore: Bulk deleting products with IDs:', ids)
      
      // Delete each product individually with cascade delete
      for (const id of ids) {
        await removeProduct(id)
      }
      
      console.log('ProductStore: Bulk delete completed successfully')
    } catch (err) {
      error.value = err.message || 'Không thể xóa sản phẩm'
      console.error('ProductStore: Error bulk deleting products:', err)
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
      const response = await getSanPhamById(id)
      const productData = response.data || response
      
      // Load variants for this product
      const productVariants = variants.value.filter(variant => 
        variant.idSanPham === id || variant.sanPhamId === id
      )
      
      return {
        ...productData,
        variants: productVariants
      }
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
      return response.data || response
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
  const advancedSearchProductsPage = async (keyword, trangThai, minPrice, maxPrice, page = 0, size = 10) => {
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

  return {
    products,
    variants,
    loading,
    variantsLoading,
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
    fetchAllVariants,
    fetchFilteredVariants,
    addProduct,
    editProduct,
    updateProduct,
    removeProduct,
    bulkRemoveProducts,
    removeVariant,
    updateVariant,
    getProductById,
    filterByKeyword,
    filterByBrand,
    fetchProductByIdSP,
    loadAttributes,
    advancedSearchProducts,
    advancedSearchProductsPage,
  }
})
