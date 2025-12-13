import { defineStore } from 'pinia'
import {
  getYeuCauTraHang,
  getYeuCauTraHangById,
  updateTrangThai,
} from '@/service/trahang/YeuCauTraHangQuanLyService'

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
        const data = await getYeuCauTraHang()
        this.returns = Array.isArray(data) ? data : []
      } catch (err) {
        this.error = err
        console.error('Error fetching returns:', err)
      } finally {
        this.loading = false
      }
    },
    async fetchReturnById(id) {
      this.loading = true
      this.error = null
      try {
        const data = await getYeuCauTraHangById(id)
        return data
      } catch (err) {
        this.error = err
        console.error('Error fetching return by id:', err)
        return null
      } finally {
        this.loading = false
      }
    },
    async updateReturnStatus(id, trangThai, lyDoTuChoi = null, idNhanVienXuLy = null) {
      this.loading = true
      this.error = null
      try {
        const data = await updateTrangThai(id, trangThai, lyDoTuChoi, idNhanVienXuLy)
        // Cập nhật lại trong danh sách returns nếu có
        const idx = this.returns.findIndex((r) => r.id === id)
        if (idx !== -1) {
          this.returns[idx] = data
        }
        return data
      } catch (err) {
        this.error = err
        console.error('Error updating return status:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    // Method này không còn dùng nữa, đã thay bằng updateReturnStatus
    // async processReturn(id, payload) {
    //   ...
    // },
    // async fetchReturnAnalytics(params = {}) {
    //   ...
    // },
  },
})
