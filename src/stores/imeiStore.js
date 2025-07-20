import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance from '@/service/axiosInstance'

export const useImeiStore = defineStore('imei', () => {
    const imeis = ref([])
    const iemiDetail = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Lấy danh sách IMEI theo ctsp_id
    const fetchImeis = async (ctsp_id) => {
        try {
            loading.value = true
            const response = await axiosInstance.get(`/api/imei?ctsp_id=${ctsp_id}`)
            imeis.value = response.data
        } catch (err) {
            error.value = err.message
            console.error('Lỗi khi lấy danh sách IMEI:', err)
        } finally {
            loading.value = false
        }
    }

    // Thêm nhiều IMEI cho biến thể
    const addImeis = async (ctsp_id, imeiList) => {
        try {
            loading.value = true
            console.log('Đang thêm IMEI:', imeiList)

            await axiosInstance.post('/api/imei/post', {
                ctsp_id: ctsp_id,
                imeis: imeiList,
            })
            await fetchImeis(ctsp_id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    // Xóa IMEI
    const deleteImei = async (imeiId, variantId) => {
        try {
            loading.value = true
            await api.delete(`/imei/${imeiId}`)
            await fetchImeis(variantId)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    // Tạo IMEI tự động
    const generateImei = async (variantId, count = 1) => {
        try {
            loading.value = true
            await api.post('/imei/generate', {
                ctsp_id: variantId,
                count,
            })
            await fetchImeis(variantId)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        imeis,
        loading,
        error,
        fetchImeis,
        addImeis,
        deleteImei,
        generateImei,
    }
})
