import axiosInstance from '../common/axiosInstance'

export const getAllWarranties = async (params) => {
    const response = await axiosInstance.get('/api/warranties', { params })
    return response.data
}

export const getWarrantyById = async (id) => {
    const response = await axiosInstance.get(`/api/warranties/${id}`)
    return response.data
}

export const createWarranty = async (payload) => {
    const response = await axiosInstance.post('/api/warranties', payload)
    return response.data
}

export const updateWarranty = async (id, payload) => {
    const response = await axiosInstance.put(`/api/warranties/${id}`, payload)
    return response.data
}

export const cancelWarranty = async (id) => {
    const response = await axiosInstance.put(`/api/warranties/${id}/cancel`)
    return response.data
}

export const getWarrantyStats = async (params) => {
    const response = await axiosInstance.get('/api/warranties/stats', { params })
    return response.data
}
