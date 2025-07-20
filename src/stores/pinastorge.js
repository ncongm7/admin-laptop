// stores/userStore.js
import { defineStore } from 'pinia'
import userApi from '@/service/ApiUser.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchAllUsers() {
      this.isLoading = true
      try {
        const users = await userApi.getAllUsers()
        this.users = users
        return users
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserById(id) {
      this.isLoading = true
      try {
        const user = await userApi.getUserById(id)
        this.currentUser = user
        return user
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createUser(userData) {
      this.isLoading = true
      try {
        const newUser = await userApi.createUser(userData)
        this.users.push(newUser)
        return newUser
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(userData) {
      this.isLoading = true
      try {
        const updatedUser = await userApi.updateUser(userData.id, userData)
        const index = this.users.findIndex((u) => u.id === userData.id)
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser)
        }
        return updatedUser
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async toggleUserStatus(id) {
      this.isLoading = true
      try {
        const updatedUser = await userApi.toggleUserStatus(id)
        const index = this.users.findIndex((u) => u.id === id)
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser)
        }
        return updatedUser
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },

  getters: {
    staffUsers: (state) => state.users.filter((u) => u.role === 'ADMIN' || u.role === 'NHAN_VIEN'),
    customerUsers: (state) => state.users.filter((u) => u.role === 'KHACH_HANG'),
    activeUsers: (state) => state.users.filter((u) => u.status),
    inactiveUsers: (state) => state.users.filter((u) => !u.status),
  },
})
