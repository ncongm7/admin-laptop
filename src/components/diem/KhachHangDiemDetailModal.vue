<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-star-fill me-2 text-warning"></i>
            Chi tiết Điểm: {{ khachHang?.tenKhachHang || 'N/A' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>
          
          <div v-else>
            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'info' }" @click.prevent="activeTab = 'info'">
                  Thông tin ví điểm
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'history' }" @click.prevent="activeTab = 'history'">
                  Lịch sử điểm
                </a>
              </li>
            </ul>
            
            <!-- Tab Content: Info -->
            <div v-if="activeTab === 'info'">
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <div class="card text-center bg-primary text-white">
                    <div class="card-body">
                      <h6>Tổng điểm</h6>
                      <h3>{{ tichDiem?.tongDiem || 0 }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card text-center bg-success text-white">
                    <div class="card-body">
                      <h6>Đã tích</h6>
                      <h3>{{ tichDiem?.diemDaCong || 0 }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card text-center bg-warning text-white">
                    <div class="card-body">
                      <h6>Đã dùng</h6>
                      <h3>{{ tichDiem?.diemDaDung || 0 }}</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="d-flex justify-content-end">
                <button class="btn btn-primary" @click="openManualPointsModal">
                  <i class="bi bi-plus-circle me-2"></i>Thêm/Bớt điểm thủ công
                </button>
              </div>
            </div>
            
            <!-- Tab Content: History -->
            <div v-if="activeTab === 'history'">
              <div class="mb-3">
                <select v-model="historyFilter" class="form-select" style="max-width: 200px">
                  <option value="">Tất cả</option>
                  <option :value="1">Tích điểm</option>
                  <option :value="2">Tiêu điểm</option>
                </select>
              </div>
              
              <div class="table-responsive" style="max-height: 400px; overflow-y: auto">
                <table class="table table-sm table-hover">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Ngày</th>
                      <th>Loại</th>
                      <th>Số điểm</th>
                      <th>Hóa đơn</th>
                      <th>Trạng thái</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredHistory" :key="item.id">
                      <td>{{ formatDate(item.thoiGian) }}</td>
                      <td>
                        <span :class="item.loaiDiem === 1 ? 'badge bg-success' : 'badge bg-warning'">
                          {{ item.tenLoaiDiem || (item.loaiDiem === 1 ? 'Tích' : 'Tiêu') }}
                        </span>
                      </td>
                      <td>
                        <strong :class="item.loaiDiem === 1 ? 'text-success' : 'text-danger'">
                          {{ item.loaiDiem === 1 ? '+' : '-' }}{{ item.soDiemCong || item.soDiemDaDung || 0 }}
                        </strong>
                      </td>
                      <td>
                        <small>{{ item.maHoaDon || '-' }}</small>
                      </td>
                      <td>
                        <span :class="getTrangThaiBadgeClass(item.trangThai)">
                          {{ item.tenTrangThai || getTrangThaiText(item.trangThai) }}
                        </span>
                      </td>
                      <td>
                        <small class="text-muted">{{ item.ghiChu || '-' }}</small>
                      </td>
                    </tr>
                    <tr v-if="filteredHistory.length === 0">
                      <td colspan="6" class="text-center text-muted">Chưa có lịch sử</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
    
    <!-- Manual Points Modal -->
    <ManualPointsModal
      v-if="showManualModal"
      :show="showManualModal"
      :khachHang="khachHang"
      :tichDiem="tichDiem"
      @close="closeManualModal"
      @saved="handleManualPointsSaved"
    />
  </div>
</template>

<script>
import { tichDiemService } from '@/service/diem/tichDiemService'
import ManualPointsModal from './ManualPointsModal.vue'

export default {
  name: 'KhachHangDiemDetailModal',
  components: {
    ManualPointsModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    khachHang: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'pointsUpdated'],
  data() {
    return {
      tichDiem: null,
      lichSuDiem: [],
      loading: false,
      activeTab: 'info',
      historyFilter: '',
      showManualModal: false
    }
  },
  computed: {
    filteredHistory() {
      if (!this.historyFilter) {
        return this.lichSuDiem
      }
      return this.lichSuDiem.filter(item => item.loaiDiem === this.historyFilter)
    }
  },
  watch: {
    show(newVal) {
      if (newVal && this.khachHang) {
        this.loadData()
      }
    }
  },
  methods: {
    async loadData() {
      if (!this.khachHang?.userId) return
      
      try {
        this.loading = true
        this.tichDiem = await tichDiemService.getTichDiemByUserId(this.khachHang.userId)
        
        const historyPage = await tichDiemService.getLichSuDiem(this.khachHang.userId, 0, 100)
        this.lichSuDiem = historyPage.content || []
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
        alert('Không thể tải dữ liệu: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },
    openManualPointsModal() {
      this.showManualModal = true
    },
    closeManualModal() {
      this.showManualModal = false
    },
    handleManualPointsSaved() {
      this.closeManualModal()
      this.loadData()
      this.$emit('pointsUpdated')
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    getTrangThaiText(trangThai) {
      const map = { 0: 'Chưa sử dụng', 1: 'Đã sử dụng', 2: 'Hết hạn' }
      return map[trangThai] || 'N/A'
    },
    getTrangThaiBadgeClass(trangThai) {
      const map = {
        0: 'badge bg-success',
        1: 'badge bg-secondary',
        2: 'badge bg-danger'
      }
      return map[trangThai] || 'badge bg-secondary'
    }
  }
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.nav-tabs .nav-link {
  cursor: pointer;
}
</style>

