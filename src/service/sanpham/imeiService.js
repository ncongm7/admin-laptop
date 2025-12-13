import axiosInstance from '../common/axiosInstance'

export const getImeisByVariant = async (ctsp_id) => {
    const response = await axiosInstance.get(`/api/imei?ctsp_id=${ctsp_id}`)
    return response.data
}

export const addImeis = async (ctsp_id, imeiList) => {
    // payload: { ctsp_id, imeis: [] }
    await axiosInstance.post('/api/imei/post', {
        ctsp_id: ctsp_id,
        imeis: imeiList,
    })
}

export const deleteImei = async (imeiId) => {
    await axiosInstance.delete(`/api/imei/${imeiId}`)
}

export const generateImeis = async (variantId, count) => {
    await axiosInstance.post('/api/imei/generate', {
        ctsp_id: variantId,
        count,
    })
}
