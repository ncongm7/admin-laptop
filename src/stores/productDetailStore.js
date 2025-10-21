import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deleteCTSP, deleteCTSPWithCascade, getCTSPBySanPham } from '@/service/sanpham/SanPhamService'
import api from '@/utils/api'

export const useProductDetailStore = defineStore('productDetail', () => {
  const variants = ref([])
  const loading = ref(false)
  const error = ref(null)
  const productDetail = ref({})
  const productIdGlobal = ref(null)

  // Lấy danh sách biến thể theo productId
  const fetchProductVariants = async (productId) => {
    try {
      if (productId) {
        productIdGlobal.value = productId
        console.log('Setting productIdGlobal.value to:', productId)
      } else {
        console.warn(
          'fetchProductVariants called with undefined productId, keeping current value:',
          productIdGlobal.value,
        )
      }
      loading.value = true
      console.log('Fetching variants for productId:', productId)
      
      // Use the proper service function
      const response = await getCTSPBySanPham(productId)
      console.log('API response:', response.data)
      
      const data = response.data || response
      variants.value = Array.isArray(data) ? data.map((variant) => {
        console.log('Processing variant:', variant)
        return {
          ...variant,
          imeiCount: 0, // Sẽ được cập nhật sau
        }
      }) : []
      console.log('Processed variants:', variants.value)
    } catch (err) {
      error.value = err.message
      console.error('Lỗi khi lấy danh sách biến thể:', err)
    } finally {
      loading.value = false
    }
  }

  // Thêm biến thể mới
  const addVariant = async (variantData) => {
    try {
      loading.value = true

      // Transform field names để match với backend
      const transformedData = {
        tenSP: variantData.tenSP,
        ramId: variantData.ram_id,
        oCungId: variantData.o_cung_id,
        mauSacId: variantData.mau_sac_id,
        giaBan: variantData.giaBan,
        thoiGianBaoHanh: variantData.thoiGianBaoHanh,
        sanPhamId: variantData.san_pham_id,
      }

      console.log('Sending add data:', transformedData)
      const response = await api.post('/api/chi-tiet-san-pham', transformedData)

      // Thêm ảnh nếu có
      if (variantData.images && variantData.images.length > 0) {
        await Promise.all(
          variantData.images.map(async (image) => {
            await api.post('/api/anh-san-pham', {
              ctspId: response.data.id,
              uri: image.uri,
              isDefault: image.is_default,
            })
          }),
        )
      }

      // Làm mới danh sách
      const productIdToRefresh = variantData.san_pham_id || productIdGlobal.value
      console.log('Refreshing variants after add with productId:', productIdToRefresh)
      await fetchProductVariants(productIdToRefresh)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cập nhật biến thể
  const updateVariant = async (variantData) => {
    try {
      loading.value = true

      console.log('updateVariant called with productIdGlobal.value:', productIdGlobal.value)

      // Transform field names để match với backend
      const transformedData = {
        id: variantData.id,
        tenSP: variantData.tenSP,
        ramId: variantData.ram_id,
        oCungId: variantData.o_cung_id,
        mauSacId: variantData.mau_sac_id,
        giaBan: variantData.giaBan,
        thoiGianBaoHanh: variantData.thoiGianBaoHanh,
        sanPhamId: productIdGlobal.value || variantData.san_pham_id, // Fallback nếu productIdGlobal.value là undefined
      }

      console.log('productIdGlobal.value:', productIdGlobal.value)
      console.log('variantData.san_pham_id:', variantData.san_pham_id)

      console.log('Sending update data:', transformedData)
      const response = await api.put(`/api/chi-tiet-san-pham/${variantData.id}`, transformedData)

      // Xử lý ảnh - đây là logic đơn giản, thực tế cần phức tạp hơn
      if (variantData.images) {
        // Xóa ảnh cũ (trong thực tế cần kiểm tra ảnh nào thay đổi)
        await api.delete(`/api/anh-san-pham?ctsp_id=${variantData.id}`)

        // Thêm ảnh mới
        await Promise.all(
          variantData.images.map(async (image) => {
            await api.post('/api/anh-san-pham', {
              ctspId: variantData.id,
              uri: image.uri,
              isDefault: image.is_default,
            })
          }),
        )
      }

      // Làm mới danh sách
      const productIdToRefresh = response.data.san_pham_id || productIdGlobal.value
      console.log('Refreshing variants with productId:', productIdToRefresh)
      await fetchProductVariants(productIdToRefresh)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Xóa biến thể
  const deleteVariant = async (variantId) => {
    try {
      loading.value = true
      console.log('Deleting variant with ID:', variantId)
      
      // Use cascade delete to handle foreign key constraints
      await deleteCTSPWithCascade(variantId)
      
      console.log('Variant deleted successfully')

      // Remove from local state
      variants.value = variants.value.filter(v => v.id !== variantId)

      // Làm mới danh sách
      const productId =
        variants.value.find((v) => v.id === variantId)?.san_pham_id || 
        variants.value.find((v) => v.id === variantId)?.idSanPham || 
        productIdGlobal.value
      
      if (productId) {
        console.log('Refreshing variants after delete with productId:', productId)
        await fetchProductVariants(productId)
      }
      
      // Show success message
      alert('Xóa biến thể thành công!')
    } catch (err) {
      console.error('Error deleting variant:', err)
      
      // Handle foreign key constraint errors with user-friendly messages
      let errorMessage = err.message || 'Lỗi khi xóa biến thể'
      if (errorMessage.includes('REFERENCE constraint') || errorMessage.includes('FK_')) {
        errorMessage = 'Biến thể có dữ liệu liên quan (serial). Hệ thống đang tự động xóa các dữ liệu liên quan trước...'
      }
      
      error.value = errorMessage
      alert('Lỗi khi xóa biến thể: ' + errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Thêm vào trong defineStore('productDetail', ...)
  const fetchAllVariants = async () => {
    try {
      loading.value = true
      const response = await api.get('/api/chi-tiet-san-pham')
      variants.value = response.data.map((variant) => ({
        ...variant,
        imeiCount: 0,
      }))
      // Lấy số lượng IMEI cho từng biến thể
      await Promise.all(
        variants.value.map(async (variant) => {
          const imeiResponse = await api.get(`/api/imei/count?ctsp_id=${variant.id}`)
          variant.imeiCount = imeiResponse.data.count
        }),
      )
    } catch (err) {
      error.value = err.message
      console.error('Lỗi khi lấy tất cả biến thể:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch product detail
  const fetchProductDetail = async (productId) => {
    try {
      loading.value = true
      // Use the product store's method to fetch product details
      // This assumes that the product detail is fetched through the product store
      console.log('fetchProductDetail called for productId:', productId)
      // We'll set the productDetail from the productStore in the component
      // since the productDetailStore doesn't have direct access to productStore
    } catch (err) {
      error.value = err.message
      console.error('Error fetching product detail:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    variants,
    allVariants: computed(() => variants.value), // Thêm computed property
    loading,
    error,
    productIdGlobal,
    productDetail,
    fetchProductVariants,
    fetchAllVariants,
    fetchProductDetail,
    addVariant,
    updateVariant,
    deleteVariant,
  }
})
