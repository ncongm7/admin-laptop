import { defineStore } from 'pinia'
import axios from 'axios'

export const useReturnStore = defineStore('returnStore', {
  state: () => ({
    returns: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAllReturns() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/returns')
        this.returns = res.data
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },
    async fetchReturnById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/returns/${id}`)
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async updateReturnStatus(id, status, note = '') {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/returns/${id}/status`, { status, note })
        // Cập nhật lại trong danh sách returns nếu có
        const idx = this.returns.findIndex(r => r.id === id)
        if (idx !== -1) {
          this.returns[idx].trangThai = status
        }
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async processReturn(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post(`/api/returns/${id}/process`, payload)
        // Cập nhật lại trong danh sách returns nếu có
        const idx = this.returns.findIndex(r => r.id === id)
        if (idx !== -1) {
          this.returns[idx] = { ...this.returns[idx], ...res.data }
        }
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async fetchReturnAnalytics(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/returns/analytics', { params })
        return res.data
      } catch (err) {
        this.error = err
        return {
          reasons: [],
          trends: [],
          topProducts: []
        }
      } finally {
        this.loading = false
      }
    }
  }
})
