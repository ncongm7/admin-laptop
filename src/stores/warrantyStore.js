import { defineStore } from 'pinia'
import axios from 'axios'

export const useWarrantyStore = defineStore('warranty', {
  state: () => ({
    warranties: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAllWarranties(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/warranties', { params })
        this.warranties = res.data
      } catch (err) {
        this.error = err
        this.warranties = []
      } finally {
        this.loading = false
      }
    },
    async fetchWarrantyById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/warranties/${id}`)
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async createWarranty(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('/api/warranties', payload)
        this.warranties.unshift(res.data)
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async updateWarranty(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/warranties/${id}`, payload)
        const idx = this.warranties.findIndex(w => w.id === id)
        if (idx !== -1) {
          this.warranties[idx] = { ...this.warranties[idx], ...res.data }
        }
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async cancelWarranty(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/warranties/${id}/cancel`)
        const idx = this.warranties.findIndex(w => w.id === id)
        if (idx !== -1) {
          this.warranties[idx].status = 'CANCELLED'
        }
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async fetchWarrantyStats(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/warranties/stats', { params })
        return res.data
      } catch (err) {
        this.error = err
        return {
          active: 0,
          expired: 0,
          cancelled: 0,
          total: 0,
          repairCount: 0
        }
      } finally {
        this.loading = false
      }
    }
  }
})
