import { defineStore } from 'pinia'
import axios from 'axios'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAllCustomers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/customers', { params })
        this.customers = res.data
        return res.data
      } catch (err) {
        this.error = err
        this.customers = []
        return []
      } finally {
        this.loading = false
      }
    },
    async fetchCustomerById(id) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get(`/api/customers/${id}`)
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async createCustomer(payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.post('/api/customers', payload)
        this.customers.push(res.data)
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async updateCustomer(id, payload) {
      this.loading = true
      this.error = null
      try {
        const res = await axios.put(`/api/customers/${id}`, payload)
        const idx = this.customers.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.customers[idx] = { ...this.customers[idx], ...res.data }
        }
        return res.data
      } catch (err) {
        this.error = err
        return null
      } finally {
        this.loading = false
      }
    },
    async deleteCustomer(id) {
      this.loading = true
      this.error = null
      try {
        await axios.delete(`/api/customers/${id}`)
        this.customers = this.customers.filter(c => c.id !== id)
        return true
      } catch (err) {
        this.error = err
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
