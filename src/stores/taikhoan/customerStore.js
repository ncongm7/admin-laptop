import { defineStore } from 'pinia'
import * as customerApi from '@/service/taikhoan/customerApi'

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
        this.customers = await customerApi.getAllCustomers(params)
        return this.customers
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
        const data = await customerApi.getCustomerById(id)
        return data
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
        const newCustomer = await customerApi.createCustomer(payload)
        this.customers.push(newCustomer)
        return newCustomer
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
        const updatedCustomer = await customerApi.updateCustomer(id, payload)
        const idx = this.customers.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.customers[idx] = { ...this.customers[idx], ...updatedCustomer }
        }
        return updatedCustomer
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
        await customerApi.deleteCustomer(id)
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
