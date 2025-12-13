import axiosInstance from '../common/axiosInstance'

export const getAllCustomers = async (params) => {
    const response = await axiosInstance.get('/api/customers', { params })
    return response.data
}

export const getCustomerById = async (id) => {
    const response = await axiosInstance.get(`/api/customers/${id}`)
    return response.data
}

export const createCustomer = async (payload) => {
    const response = await axiosInstance.post('/api/customers', payload)
    return response.data
}

export const updateCustomer = async (id, payload) => {
    const response = await axiosInstance.put(`/api/customers/${id}`, payload)
    return response.data
}

export const deleteCustomer = async (id) => {
    const response = await axiosInstance.delete(`/api/customers/${id}`)
    return response.data
}
