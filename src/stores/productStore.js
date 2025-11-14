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
  deleteCTSPWithCascade,
  searchSanPhamChiTiet,
  updateChiTietSanPham,
  getHinhAnhByCtspId,
  getSerialsByCtspId,
  getAllSerial,
  importSerialsFromExcel,
  createSerialsBatch
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
    // Get hexCode from colors store if available
    let mauSacInfo = null
    if (item.tenMauSac || item.idMauSac) {
      const colorFromStore = colors.value.find(c => c.id === item.idMauSac)
      if (colorFromStore) {
        mauSacInfo = {
          tenMau: colorFromStore.tenMau,
          id: colorFromStore.id,
          hexCode: colorFromStore.hexCode || '#cccccc'
        }
      } else {
        // Fallback to item data if not found in store
        mauSacInfo = {
          tenMau: item.tenMauSac,
          id: item.idMauSac,
          hexCode: item.hexCodeMauSac || '#cccccc'
        }
      }
    } else if (item.mauSac) {
      mauSacInfo = item.mauSac
    }
 
    return {
      ...item,
      // backend returns flat fields like tenCpu, tenRam, dungLuongOCung, ...
      cpu: item.tenCpu ? { tenCpu: item.tenCpu, id: item.idCpu } : (item.cpu || null),
      ram: item.tenRam ? { tenRam: item.tenRam, id: item.idRam } : (item.ram || null),
      gpu: item.tenGpu ? { tenGpu: item.tenGpu, id: item.idGpu } : (item.gpu || null),
      oCung: item.dungLuongOCung ? { dungLuong: item.dungLuongOCung, id: item.idOCung } : (item.oCung || null),
      loaiManHinh: item.kichThuocManHinh ? { kichThuoc: item.kichThuocManHinh, id: item.idLoaiManHinh } : (item.loaiManHinh || null),
      pin: item.dungLuongPin ? { dungLuongPin: item.dungLuongPin, id: item.idPin } : (item.pin || null),
      mauSac: mauSacInfo,
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
      const response = await getAllSanPham()

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
      } else if (data && Array.isArray(data.content)) {
        // Sort by creation date (newest first)
        products.value = data.content.sort((a, b) => {
          const dateA = new Date(a.ngayTao || a.createdAt || 0)
          const dateB = new Date(b.ngayTao || b.createdAt || 0)
          return dateB - dateA
        })
      } else {
        products.value = []
      }

      // Load variants for each product to calculate min/max prices
      await fetchAllVariants()
      
      // Map variants to products
      // Note: anhDaiDien should be set when creating product, so we don't load it here
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
      
      let variantsList = []
      if (Array.isArray(data)) {
        variantsList = data.map(normalizeCtsp)
      } else if (data && Array.isArray(data.content)) {
        variantsList = data.content.map(normalizeCtsp)
      } else {
        variants.value = []
        return variants.value
      }
      
      // Load images for each variant
      variants.value = await Promise.all(variantsList.map(async (variant) => {
        let images = []
        try {
          const imagesResponse = await getHinhAnhByCtspId(variant.id)
          images = imagesResponse.data || []
        } catch (err) {
          // Silently skip if images fail to load
        }
        
        return {
          ...variant,
          images
        }
      }))
      
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
    console.log('ProductStore: Starting to remove variant with ID:', id)
    variantsLoading.value = true
    
    try {
      // Validate ID
      if (!id) {
        throw new Error('ID biến thể không hợp lệ')
      }
      
      console.log('ProductStore: Calling deleteCTSPWithCascade API with ID:', id)
      const response = await deleteCTSPWithCascade(id)
      console.log('ProductStore: Cascade delete API response:', response)
      
      // Remove from local state only if API call succeeds
      const originalLength = variants.value.length
      variants.value = variants.value.filter((v) => v.id !== id)
      console.log(`ProductStore: Removed variant from local state. Count: ${originalLength} -> ${variants.value.length}`)
      
      // Clear any previous errors
      error.value = null
      
      return response
    } catch (err) {
      console.error('ProductStore: Error removing variant:', err)
      console.error('ProductStore: Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      
      // Handle different types of errors
      let errorMessage = 'Không thể xóa biến thể'
      
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        
        if (status === 500 && (data?.message?.includes('REFERENCE constraint') || data?.message?.includes('FK_'))) {
          errorMessage = 'Lỗi khi xóa dữ liệu liên quan. Hệ thống đã thử xóa serial và hình ảnh nhưng vẫn có lỗi.'
        } else if (status === 404) {
          errorMessage = 'Biến thể không tồn tại hoặc đã bị xóa'
        } else if (status === 403) {
          errorMessage = 'Không có quyền xóa biến thể này'
        } else if (data?.message) {
          errorMessage = data.message
        }
      } else if (err.message?.includes('REFERENCE constraint') || err.message?.includes('FK_')) {
        errorMessage = 'Lỗi khi xóa dữ liệu liên quan. Hệ thống đã thử xóa serial và hình ảnh nhưng vẫn có lỗi.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      variantsLoading.value = false
    }
  }

  // Cập nhật 1 biến thể
  const updateVariant = async (id, payload) => {
    console.log('ProductStore: Starting to update variant with ID:', id)
    console.log('ProductStore: Update payload:', payload)
    
    variantsLoading.value = true
    error.value = null
    
    try {
      // Validate ID
      if (!id) {
        throw new Error('ID biến thể không hợp lệ')
      }
      
      // Validate payload
      if (!payload || typeof payload !== 'object') {
        throw new Error('Dữ liệu cập nhật không hợp lệ')
      }
      
      // Prepare the payload - only include provided values
      const updatePayload = {
        idSanPham: payload.idSanPham,
        maCtsp: payload.maCtsp,
        tenSanPham: payload.tenSanPham?.trim() || '',
        giaBan: Number(payload.giaBan) || 0,
        soLuongTon: Number(payload.soLuongTon) ?? 0,  // Backend requires this field
        trangThai: payload.trangThai ?? 1
      }
      
      // Only include attribute IDs if they are provided (keep as UUID strings)
      if (payload.idCpu) updatePayload.idCpu = payload.idCpu
      if (payload.idRam) updatePayload.idRam = payload.idRam
      if (payload.idGpu) updatePayload.idGpu = payload.idGpu
      if (payload.idMauSac) updatePayload.idMauSac = payload.idMauSac
      if (payload.idOCung) updatePayload.idOCung = payload.idOCung
      if (payload.idLoaiManHinh) updatePayload.idLoaiManHinh = payload.idLoaiManHinh
      if (payload.idPin) updatePayload.idPin = payload.idPin
      
      console.log('ProductStore: Prepared update payload:', updatePayload)
      
      // Only validate essential fields - attributes are optional
      if (!updatePayload.tenSanPham) {
        throw new Error('Tên sản phẩm không được để trống')
      }
      
      if (updatePayload.giaBan <= 0) {
        throw new Error('Giá bán phải lớn hơn 0')
      }
      
      console.log('ProductStore: Calling updateChiTietSanPham API')
      const response = await updateChiTietSanPham(id, updatePayload)
      console.log('ProductStore: Update API response:', response)
      
      const updatedVariant = response.data || response
      
      // Update the variant in the local array
      const index = variants.value.findIndex((v) => v.id === id)
      if (index !== -1) {
        variants.value[index] = normalizeCtsp(updatedVariant)
        console.log('ProductStore: Updated variant in local state at index:', index)
      } else {
        console.warn('ProductStore: Variant not found in local state for update')
      }
      
      // Clear any previous errors
      error.value = null
      
      return updatedVariant
    } catch (err) {
      console.error('ProductStore: Error updating variant:', err)
      console.error('ProductStore: Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      
      let errorMessage = 'Không thể cập nhật biến thể'
      
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
            break
          case 404:
            errorMessage = 'Biến thể không tồn tại'
            break
          case 403:
            errorMessage = 'Không có quyền cập nhật biến thể này'
            break
          case 500:
            errorMessage = 'Lỗi server khi cập nhật biến thể'
            break
          default:
            errorMessage = data?.message || `Lỗi ${status}: ${err.message}`
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      error.value = errorMessage
      throw new Error(errorMessage)
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
      const response = await updateSanPham(id, productData)
      const updatedProduct = response.data || response
      
      // Update the product in the local array
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        // Preserve variants if they exist
        const existingVariants = products.value[index].variants || []
        products.value[index] = {
          ...updatedProduct,
          variants: productData.variants || existingVariants
        }
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
      // First, get all variants for this product
      const productVariants = variants.value.filter(variant => 
        variant.idSanPham === id || variant.sanPhamId === id
      )
      
      // Delete all variants first (cascade delete)
      if (productVariants.length > 0) {
        const deleteVariantPromises = productVariants.map(variant => 
          deleteCTSP(variant.id).catch(() => null)
        )
        
        await Promise.allSettled(deleteVariantPromises)
        
        // Update local variants state
        variants.value = variants.value.filter(variant => 
          variant.idSanPham !== id && variant.sanPhamId !== id
        )
      }
      
      // Now delete the main product
      const response = await deleteSanPham(id)
      
      // Remove from local state
      products.value = products.value.filter((p) => p.id !== id)
      
      return response
    } catch (err) {
      error.value = err.message || 'Không thể xóa sản phẩm'
      
      // Provide more specific error messages
      if (err.response?.status === 404) {
        throw new Error('Sản phẩm không tồn tại hoặc đã được xóa')
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Dữ liệu không hợp lệ'
        throw new Error(`Không thể xóa sản phẩm: ${errorMsg}`)
      } else if (err.response?.status === 500) {
        const serverError = err.response?.data?.message || err.response?.data?.error || 'Lỗi server không xác định'
        
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
      // Delete each product individually with cascade delete
      for (const id of ids) {
        await removeProduct(id)
      }
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

  // Serial Management Methods
  const getAllSerials = async () => {
    try {
      console.log('ProductStore: Fetching all serials...')
      console.log('ProductStore: API endpoint will be: /api/serial/all')
      const response = await getAllSerial()
      console.log('ProductStore: API Response:', response)
      console.log('ProductStore: Successfully fetched', response.data?.length || 0, 'serials')
      return response
    } catch (err) {
      console.error('ProductStore: Error fetching all serials:', err)
      console.error('ProductStore: Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      })
      error.value = err.message || 'Không thể tải danh sách serial'
      throw err
    }
  }

  const getSerialsByVariantId = async (variantId) => {
    try {
      const response = await getSerialsByCtspId(variantId)
      return response
    } catch (err) {
      console.error('Error fetching serials:', err)
      throw err
    }
  }

  const saveVariantSerials = async (variantId, serials) => {
    try {
      const serialRequests = serials.map(serial => ({
        ctspId: variantId,
        serialNo: serial.soSerial,
        trangThai: serial.trangThai || 1
      }))
      
      const response = await createSerialsBatch(serialRequests)
      return response
    } catch (err) {
      console.error('Error saving serials:', err)
      throw err
    }
  }

  const importSerialsFromExcelFile = async (formData) => {
    try {
      const ctspId = formData.get('ctspId')
      const file = formData.get('file')
      
      const response = await importSerialsFromExcel(ctspId, file)
      return response
    } catch (err) {
      console.error('Error importing serials from Excel:', err)
      throw err
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
    getAllSerials,
    getSerialsByVariantId,
    saveVariantSerials,
    importSerialsFromExcel: importSerialsFromExcelFile,
  }
})