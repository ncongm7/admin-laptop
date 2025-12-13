import axiosInstance from '../common/axiosInstance'

export const getDiscounts = async () => {
    const response = await axiosInstance.get('/api/discounts')
    return response.data
}

export const createDiscount = async (data) => {
    const response = await axiosInstance.post('/api/discounts', data)
    return response.data
}

export const updateDiscount = async (id, data) => {
    const response = await axiosInstance.put(`/api/discounts/${id}`, data)
    return response.data
}

export const deleteDiscount = async (id) => {
    await axiosInstance.delete(`/api/discounts/${id}`)
}

export const applyDiscountToProducts = async (discountId, payload) => {
    // payload: { productIds, discountType, discountValue }
    await axiosInstance.post(`/api/discounts/${discountId}/apply-products`, payload)
}

export const getDiscountStats = async () => {
    const response = await axiosInstance.get('/api/discounts/stats')
    return response.data
}
