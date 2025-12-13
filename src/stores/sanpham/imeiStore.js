import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as imeiService from '@/service/sanpham/imeiService'

export const useImeiStore = defineStore('imei', () => {
    const imeis = ref([])
    const iemiDetail = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Lấy danh sách IMEI theo ctsp_id
    const fetchImeis = async (ctsp_id) => {
        try {
            loading.value = true
            imeis.value = await imeiService.getImeisByVariant(ctsp_id)
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

            await imeiService.addImeis(ctsp_id, imeiList)
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
            await imeiService.deleteImei(imeiId)
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
            await imeiService.generateImeis(variantId, count)
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
