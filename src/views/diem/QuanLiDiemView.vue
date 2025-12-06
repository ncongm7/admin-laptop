<template>
  <main class="container">
    <h1 class="mb-4">
      <i class="bi bi-star-fill me-2 text-warning"></i>
      Quản lý Điểm Khách hàng
    </h1>

    <!-- Search Section -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Tìm kiếm khách hàng</label>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Tên, SĐT, Email..."
              @keyup.enter="searchKhachHang"
            />
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="searchKhachHang" :disabled="loading">
              <i class="bi bi-search me-1"></i>Tìm
            </button>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="resetSearch" :disabled="loading">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Tên khách hàng</th>
                <th>SĐT</th>
                <th>Email</th>
                <th>Tổng điểm</th>
                <th>Đã tích</th>
                <th>Đã dùng</th>
                <th style="width: 150px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in khachHangList" :key="item.userId">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.tenKhachHang || '-' }}</td>
                <td>{{ item.soDienThoai || '-' }}</td>
                <td>{{ item.email || '-' }}</td>
                <td>
                  <span class="badge bg-primary fs-6">{{ item.tongDiem || 0 }}</span>
                </td>
                <td>
                  <span class="text-success">{{ item.diemDaCong || 0 }}</span>
                </td>
                <td>
                  <span class="text-warning">{{ item.diemDaDung || 0 }}</span>
                </td>
                <td>
                  <button class="btn btn-info btn-sm" @click="openDetailModal(item)">
                    <i class="bi bi-eye me-1"></i>Chi tiết
                  </button>
                </td>
              </tr>
              <tr v-if="khachHangList.length === 0">
                <td colspan="8" class="text-center text-muted py-4">
                  {{ searchQuery ? 'Không tìm thấy khách hàng' : 'Chưa có dữ liệu. Vui lòng tìm kiếm khách hàng.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <KhachHangDiemDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :khachHang="selectedKhachHang"
      @close="closeDetailModal"
      @pointsUpdated="handlePointsUpdated"
    />
  </main>
</template>

<script>
import { tichDiemService } from '@/service/diem/tichDiemService'
import { khachHangService } from '@/service/taikhoan/khachHangService'
import KhachHangDiemDetailModal from '@/components/diem/KhachHangDiemDetailModal.vue'

export default {
  name: 'QuanLiDiemView',
  components: {
    KhachHangDiemDetailModal
  },
  data() {
    return {
      khachHangList: [],
      loading: false,
      searchQuery: '',
      showDetailModal: false,
      selectedKhachHang: null
    }
  },
  methods: {
    async searchKhachHang() {
      if (!this.searchQuery.trim()) {
        alert('Vui lòng nhập từ khóa tìm kiếm')
        return
      }
      
      try {
        this.loading = true
        // Search customers
        const searchResponse = await khachHangService.search(this.searchQuery, this.searchQuery)
        const customers = searchResponse.data?.data || searchResponse.data || []
        
        // Load points for each customer
        const khachHangWithPoints = []
        for (const customer of customers) {
          try {
            const tichDiem = await tichDiemService.getTichDiemByUserId(customer.id)
            khachHangWithPoints.push({
              userId: customer.id,
              tenKhachHang: customer.hoTen,
              soDienThoai: customer.soDienThoai,
              email: customer.email,
              tongDiem: tichDiem.tongDiem || 0,
              diemDaCong: tichDiem.diemDaCong || 0,
              diemDaDung: tichDiem.diemDaDung || 0
            })
          } catch (error) {
            // Customer might not have points wallet yet
            khachHangWithPoints.push({
              userId: customer.id,
              tenKhachHang: customer.hoTen,
              soDienThoai: customer.soDienThoai,
              email: customer.email,
              tongDiem: 0,
              diemDaCong: 0,
              diemDaDung: 0
            })
          }
        }
        
        this.khachHangList = khachHangWithPoints
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error)
        alert('Lỗi: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },
    resetSearch() {
      this.searchQuery = ''
      this.khachHangList = []
    },
    openDetailModal(item) {
      this.selectedKhachHang = item
      this.showDetailModal = true
    },
    closeDetailModal() {
      this.showDetailModal = false
      this.selectedKhachHang = null
    },
    handlePointsUpdated() {
      this.closeDetailModal()
      // Reload current search
      if (this.searchQuery) {
        this.searchKhachHang()
      }
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

