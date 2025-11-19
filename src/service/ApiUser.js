// userApi.js
import axios from './axiosInstance'

const API_URL = '/api/users'

export default {
  async getAllUsers() {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  async getUserById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  async getMyAccount() {
    try {
      const response = await axios.get(`${API_URL}/me`)
      return response.data
    } catch (error) {
      console.error('Error fetching my account:', error)
      throw error
    }
  },

  async createUser(userData) {
    try {
      const response = await axios.post(API_URL, userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async toggleUserStatus(id) {
    try {
      const response = await axios.patch(`${API_URL}/${id}/toggle-status`)
      return response.data
    } catch (error) {
      console.error('Error toggling user status:', error)
      throw error
    }
  },

  async exportUsers(filterParams) {
    try {
      const response = await axios.get(`${API_URL}/export`, {
        params: filterParams,
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      console.error('Error exporting users:', error)
      throw error
    }
  },

  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials)
      return response.data
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },
}
