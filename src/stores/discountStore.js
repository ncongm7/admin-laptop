import { defineStore } from 'pinia'
import axios from 'axios'

export const useDiscountStore = defineStore('discount', {
  state: () => ({
    discounts: [],
    stats: {
      active: 0,
      upcoming: 0,
      expired: 0,
      totalProducts: 0,
      totalRevenue: 0
    },
    loading: false,
    error: null
  }),
  actions: {
    async fetchDiscounts() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/discounts')
        this.discounts = res.data
        this.calculateStats()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },
    async createDiscount(data) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('/api/discounts', data)
        this.discounts.push(res.data)
        this.calculateStats()
        return res.data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async updateDiscount(id, data) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/discounts/${id}`, data)
        const idx = this.discounts.findIndex(d => d.id === id)
        if (idx !== -1) this.discounts[idx] = res.data
        this.calculateStats()
        return res.data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async deleteDiscount(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/discounts/${id}`)
        this.discounts = this.discounts.filter(d => d.id !== id)
        this.calculateStats()
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async applyDiscountToProducts({ discountId, productIds, discountType, discountValue }) {
      this.loading = true
      this.error = null
      try {
        await axios.post(`/api/discounts/${discountId}/apply-products`, {
          productIds,
          discountType,
          discountValue
        })
        // Optionally, refresh discounts or products here
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchStats() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/discounts/stats')
        this.stats = res.data
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },
    calculateStats() {
      // Tính toán lại stats từ danh sách discounts hiện tại
      const now = new Date()
      let active = 0, upcoming = 0, expired = 0, totalProducts = 0, totalRevenue = 0
      this.discounts.forEach(d => {
        const start = new Date(d.thoiGianBatDau)
        const end = new Date(d.thoiGianKetThuc)
        if (now < start) upcoming++
        else if (now > end) expired++
        else active++
        if (d.tongSanPham) totalProducts += d.tongSanPham
        if (d.tongDoanhThu) totalRevenue += d.tongDoanhThu
      })
      this.stats = { active, upcoming, expired, totalProducts, totalRevenue }
    }
  },
  getters: {
    getDiscountById: (state) => (id) => {
      return state.discounts.find(d => d.id === id)
    }
  }
})
