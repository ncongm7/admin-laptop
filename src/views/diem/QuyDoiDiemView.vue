<template>
  <main class="container">
    <h1 class="mb-4">
      <i class="bi bi-calculator me-2"></i>
      Quản lý Quy đổi Điểm
    </h1>

    <!-- Thanh công cụ -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex gap-2">
        <select v-model="statusFilter" class="form-select" style="max-width: 160px">
          <option value="">Tất cả trạng thái</option>
          <option :value="1">Đang hoạt động</option>
          <option :value="0">Vô hiệu hóa</option>
        </select>
      </div>
      <button class="btn btn-success" @click="openAddModal">
        <i class="bi bi-plus-circle me-2"></i>Thêm mới
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Bảng danh sách -->
    <div v-else class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-bordered table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Tiền tích điểm (VND)</th>
                <th>Tiền tiêu điểm (VND/điểm)</th>
                <th>Trạng thái</th>
                <th style="width: 200px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredList" :key="item.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ formatCurrency(item.tienTichDiem) }}</td>
                <td>{{ formatCurrency(item.tienTieuDiem) }}</td>
                <td>
                  <span :class="item.trangThai === 1 ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ item.trangThai === 1 ? 'Đang hoạt động' : 'Vô hiệu hóa' }}
                  </span>
                </td>
                <td class="d-flex gap-2">
                  <button class="btn btn-warning btn-sm" @click="openEditModal(item)">
                    <i class="bi bi-pencil me-1"></i>Sửa
                  </button>
                  <button 
                    v-if="item.trangThai === 1"
                    class="btn btn-secondary btn-sm" 
                    @click="deactivate(item.id)"
                    title="Vô hiệu hóa"
                  >
                    <i class="bi bi-x-circle me-1"></i>Tắt
                  </button>
                  <button 
                    v-else
                    class="btn btn-success btn-sm" 
                    @click="activate(item.id)"
                    title="Kích hoạt"
                  >
                    <i class="bi bi-check-circle me-1"></i>Bật
                  </button>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="5" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa -->
    <QuyDoiDiemModal
      v-if="showModal"
      :show="showModal"
      :item="selectedItem"
      @close="closeModal"
      @saved="handleSaved"
    />
  </main>
</template>

<script>
import { quyDoiDiemService } from '@/service/diem/quyDoiDiemService'
import QuyDoiDiemModal from '@/components/diem/QuyDoiDiemModal.vue'

export default {
  name: 'QuyDoiDiemView',
  components: {
    QuyDoiDiemModal
  },
  data() {
    return {
      list: [],
      loading: false,
      statusFilter: '',
      showModal: false,
      selectedItem: null
    }
  },
  computed: {
    filteredList() {
      if (!this.statusFilter) {
        return this.list
      }
      return this.list.filter(item => item.trangThai === this.statusFilter)
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      try {
        this.loading = true
        this.list = await quyDoiDiemService.getAllQuyDoiDiem()
      } catch (error) {
        console.error('Lỗi khi tải danh sách quy đổi điểm:', error)
        alert('Không thể tải danh sách quy đổi điểm: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },
    openAddModal() {
      this.selectedItem = null
      this.showModal = true
    },
    openEditModal(item) {
      this.selectedItem = { ...item }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedItem = null
    },
    handleSaved() {
      this.closeModal()
      this.fetchList()
    },
    async deactivate(id) {
      if (!confirm('Bạn có chắc muốn vô hiệu hóa quy đổi điểm này?')) {
        return
      }
      try {
        await quyDoiDiemService.deactivateQuyDoiDiem(id)
        alert('Vô hiệu hóa thành công')
        this.fetchList()
      } catch (error) {
        console.error('Lỗi khi vô hiệu hóa:', error)
        alert('Lỗi: ' + (error.response?.data?.message || error.message))
      }
    },
    async activate(id) {
      try {
        // Để kích hoạt, cần update với trangThai = 1
        const item = this.list.find(i => i.id === id)
        if (item) {
          await quyDoiDiemService.updateQuyDoiDiem(id, {
            tienTichDiem: item.tienTichDiem,
            tienTieuDiem: item.tienTieuDiem,
            trangThai: 1
          })
          alert('Kích hoạt thành công')
          this.fetchList()
        }
      } catch (error) {
        console.error('Lỗi khi kích hoạt:', error)
        alert('Lỗi: ' + (error.response?.data?.message || error.message))
      }
    },
    formatCurrency(value) {
      if (!value) return '0'
      return new Intl.NumberFormat('vi-VN').format(value)
    }
  }
}
</script>

<style scoped>
.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>

