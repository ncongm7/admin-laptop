import axios from './axiosInstance'

const API_URL = '/api/vai-tro'

export default {
  async getAllVaiTro() {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error('Error fetching vai tro:', error)
      throw error
    }
  },
}
