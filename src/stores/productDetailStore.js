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
      // ✅ SỬA: Đổi endpoint từ /ctsp sang /chi-tiet-san-pham để match backend
      const response = await api.get(`/chi-tiet-san-pham/san-pham/${productId}`)
      console.log('API response:', response.data)
      variants.value = response.data.map((variant) => {
        console.log('Processing variant:', variant)
        return {
          ...variant,
          imeiCount: 0, // Sẽ được cập nhật sau
        }
      })
      console.log('Processed variants:', variants.value)

      // Lấy số lượng Serial (IMEI) cho từng biến thể
      await Promise.all(
        variants.value.map(async (variant) => {
          try {
            // ✅ SỬA: Backend dùng /api/serial thay vì /imei
            // Lấy danh sách serial và đếm số lượng
            const serialResponse = await api.get(`/serial/ctsp/${variant.id}`)
            variant.imeiCount = serialResponse.data?.length || 0
          } catch (e) {
            console.error('Error fetching Serial count for variant:', variant.id, e)
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
      // ✅ SỬA: Đổi endpoint từ /ctsp sang /chi-tiet-san-pham
      const response = await api.post('/chi-tiet-san-pham', transformedData)

      // Thêm ảnh nếu có
      if (variantData.images && variantData.images.length > 0) {
        await Promise.all(
          variantData.images.map(async (image) => {
            // ✅ SỬA: Backend dùng /api/hinh-anh, và field là idSpct, url, anhChinhDaiDien
            await api.post('/hinh-anh', {
              idSpct: response.data.id,
              url: image.uri,
              anhChinhDaiDien: image.is_default || false,
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
      // ✅ SỬA: Đổi endpoint từ /ctsp sang /chi-tiet-san-pham
      const response = await api.put(`/chi-tiet-san-pham/${variantData.id}`, transformedData)

      // Xử lý ảnh - đây là logic đơn giản, thực tế cần phức tạp hơn
      if (variantData.images) {
        // Xóa ảnh cũ (trong thực tế cần kiểm tra ảnh nào thay đổi)
        // ✅ SỬA: Backend dùng /api/hinh-anh/ctsp/{ctspId}
        await api.delete(`/hinh-anh/ctsp/${variantData.id}`)

        // Thêm ảnh mới
        await Promise.all(
          variantData.images.map(async (image) => {
            // ✅ SỬA: Backend dùng /api/hinh-anh với field idSpct, url, anhChinhDaiDien
            await api.post('/hinh-anh', {
              idSpct: variantData.id,
              url: image.uri,
              anhChinhDaiDien: image.is_default || false,
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
      // ✅ SỬA: Đổi endpoint từ /ctsp sang /chi-tiet-san-pham
      await api.delete(`/chi-tiet-san-pham/${variantId}`)

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
      // ✅ SỬA: Đổi endpoint từ /ctsp sang /chi-tiet-san-pham
      const response = await api.get('/chi-tiet-san-pham')
      variants.value = response.data.map((variant) => ({
        ...variant,
        imeiCount: 0,
      }))
      // Lấy số lượng Serial (IMEI) cho từng biến thể
      await Promise.all(
        variants.value.map(async (variant) => {
          try {
            // ✅ SỬA: Backend dùng /api/serial/ctsp/{ctspId}
            const serialResponse = await api.get(`/serial/ctsp/${variant.id}`)
            variant.imeiCount = serialResponse.data?.length || 0
          } catch (e) {
            console.error('Error fetching Serial count:', e)
            variant.imeiCount = 0
          }
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
