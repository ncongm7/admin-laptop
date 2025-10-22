import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/service/apiProductDetail'

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
        console.warn('fetchProductVariants called with undefined productId, keeping current value:', productIdGlobal.value)
      }
      loading.value = true
      console.log('Fetching variants for productId:', productId)
      const response = await api.get(`/ctsp?san_pham_id=${productId}`)
      console.log('API response:', response.data)
      variants.value = response.data.map((variant) => {
        console.log('Processing variant:', variant)
        return {
          ...variant,
          imeiCount: 0, // Sẽ được cập nhật sau
        }
      })
      console.log('Processed variants:', variants.value)

      // Lấy số lượng IMEI cho từng biến thể
      await Promise.all(
        variants.value.map(async (variant) => {
          try {
            const imeiResponse = await api.get(`/imei/count?ctsp_id=${variant.id}`)
            variant.imeiCount = imeiResponse.data.count
          } catch (e) {
            console.error('Error fetching IMEI count for variant:', variant.id, e)
            variant.imeiCount = 0
          }
        }),
      )
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
        sanPhamId: variantData.san_pham_id
      }

      console.log('Sending add data:', transformedData)
      const response = await api.post('/ctsp', transformedData)

      // Thêm ảnh nếu có
      if (variantData.images && variantData.images.length > 0) {
        await Promise.all(
          variantData.images.map(async (image) => {
            await api.post('/anh-san-pham', {
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
        sanPhamId: productIdGlobal.value || variantData.san_pham_id // Fallback nếu productIdGlobal.value là undefined
      }

      console.log('productIdGlobal.value:', productIdGlobal.value)
      console.log('variantData.san_pham_id:', variantData.san_pham_id)

      console.log('Sending update data:', transformedData)
      const response = await api.put(`/ctsp/${variantData.id}`, transformedData)

      // Xử lý ảnh - đây là logic đơn giản, thực tế cần phức tạp hơn
      if (variantData.images) {
        // Xóa ảnh cũ (trong thực tế cần kiểm tra ảnh nào thay đổi)
        await api.delete(`/anh-san-pham?ctsp_id=${variantData.id}`)

        // Thêm ảnh mới
        await Promise.all(
          variantData.images.map(async (image) => {
            await api.post('/anh-san-pham', {
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
      await api.delete(`/ctsp/${variantId}`)

      // Làm mới danh sách
      const productId = variants.value.find((v) => v.id === variantId)?.san_pham_id || productIdGlobal.value
      if (productId) {
        console.log('Refreshing variants after delete with productId:', productId)
        await fetchProductVariants(productId)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Thêm vào trong defineStore('productDetail', ...)
  const fetchAllVariants = async () => {
    try {
      loading.value = true
      const response = await api.get('/ctsp')
      variants.value = response.data.map((variant) => ({
        ...variant,
        imeiCount: 0,
      }))
      // Lấy số lượng IMEI cho từng biến thể
      await Promise.all(
        variants.value.map(async (variant) => {
          const imeiResponse = await api.get(`/imei/count?ctsp_id=${variant.id}`)
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

  return {
    variants,
    allVariants: computed(() => variants.value), // Thêm computed property
    loading,
    error,
    productIdGlobal,
    productDetail,
    fetchProductVariants,
    fetchAllVariants,
    addVariant,
    updateVariant,
    deleteVariant,
  }
})
