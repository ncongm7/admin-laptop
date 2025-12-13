import { defineStore } from 'pinia'
import * as warrantyService from '@/service/baohanh/warrantyService'

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
        this.warranties = await warrantyService.getAllWarranties(params)
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
        const data = await warrantyService.getWarrantyById(id)
        return data
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
        const newWarranty = await warrantyService.createWarranty(payload)
        this.warranties.unshift(newWarranty)
        return newWarranty
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
        const updatedWarranty = await warrantyService.updateWarranty(id, payload)
        const idx = this.warranties.findIndex(w => w.id === id)
        if (idx !== -1) {
          this.warranties[idx] = { ...this.warranties[idx], ...updatedWarranty }
        }
        return updatedWarranty
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
        const res = await warrantyService.cancelWarranty(id)
        const idx = this.warranties.findIndex(w => w.id === id)
        if (idx !== -1) {
          this.warranties[idx].status = 'CANCELLED'
        }
        return res
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
        const stats = await warrantyService.getWarrantyStats(params)
        return stats
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
