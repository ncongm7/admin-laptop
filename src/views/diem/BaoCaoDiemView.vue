<template>
  <main class="container">
    <h1 class="mb-4">
      <i class="bi bi-graph-up me-2"></i>
      Báo cáo Điểm tích lũy
    </h1>

    <!-- Date Range Filter -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Từ ngày</label>
            <input v-model="dateFrom" type="date" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Đến ngày</label>
            <input v-model="dateTo" type="date" class="form-control" />
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button class="btn btn-primary w-100" @click="loadReport" :disabled="loading">
              <i class="bi bi-search me-1"></i>Lọc
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

    <!-- Metrics Cards -->
    <div v-else class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card text-center bg-primary text-white">
          <div class="card-body">
            <h6 class="card-title">Tổng điểm đã tích</h6>
            <h2>{{ totalPointsEarned.toLocaleString() }}</h2>
            <small>Trong kỳ</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center bg-warning text-white">
          <div class="card-body">
            <h6 class="card-title">Tổng điểm đã tiêu</h6>
            <h2>{{ totalPointsSpent.toLocaleString() }}</h2>
            <small>Trong kỳ</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center bg-success text-white">
          <div class="card-body">
            <h6 class="card-title">Số KH có điểm</h6>
            <h2>{{ customersWithPoints.toLocaleString() }}</h2>
            <small>Tổng số</small>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center bg-info text-white">
          <div class="card-body">
            <h6 class="card-title">Điểm còn lại</h6>
            <h2>{{ totalPointsRemaining.toLocaleString() }}</h2>
            <small>Tổng số</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Customers -->
    <div class="card shadow-sm mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-trophy me-2"></i>
          Top 10 Khách hàng tích điểm nhiều nhất
        </h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên khách hàng</th>
                <th>SĐT</th>
                <th>Tổng điểm</th>
                <th>Đã tích</th>
                <th>Đã dùng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in topCustomers" :key="item.userId">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.tenKhachHang || '-' }}</td>
                <td>{{ item.soDienThoai || '-' }}</td>
                <td>
                  <span class="badge bg-primary fs-6">{{ item.tongDiem || 0 }}</span>
                </td>
                <td class="text-success">{{ item.diemDaCong || 0 }}</td>
                <td class="text-warning">{{ item.diemDaDung || 0 }}</td>
              </tr>
              <tr v-if="topCustomers.length === 0">
                <td colspan="6" class="text-center text-muted">Chưa có dữ liệu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div class="text-end mb-4">
      <button class="btn btn-success" @click="exportReport" :disabled="loading">
        <i class="bi bi-file-earmark-excel me-2"></i>Xuất Excel
      </button>
    </div>
  </main>
</template>

<script>
import { tichDiemService } from '@/service/diem/tichDiemService'
import { khachHangService } from '@/service/taikhoan/khachHangService'

export default {
  name: 'BaoCaoDiemView',
  data() {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    return {
      loading: false,
      dateFrom: firstDayOfMonth.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      customersWithPoints: 0,
      totalPointsRemaining: 0,
      topCustomers: []
    }
  },
  mounted() {
    this.loadReport()
  },
  methods: {
    async loadReport() {
      try {
        this.loading = true
        
        // Get all customers
        const customersResponse = await khachHangService.getAll()
        const customers = customersResponse.data?.data || customersResponse.data || []
        
        // Load points for all customers
        const customersWithPoints = []
        let totalEarned = 0
        let totalSpent = 0
        let totalRemaining = 0
        
        for (const customer of customers) {
          try {
            const tichDiem = await tichDiemService.getTichDiemByUserId(customer.id)
            if (tichDiem && tichDiem.tongDiem > 0) {
              customersWithPoints.push({
                userId: customer.id,
                tenKhachHang: customer.hoTen || tichDiem.tenKhachHang,
                soDienThoai: customer.soDienThoai || tichDiem.soDienThoai,
                tongDiem: tichDiem.tongDiem || 0,
                diemDaCong: tichDiem.diemDaCong || 0,
                diemDaDung: tichDiem.diemDaDung || 0
              })
              
              totalEarned += tichDiem.diemDaCong || 0
              totalSpent += tichDiem.diemDaDung || 0
              totalRemaining += tichDiem.tongDiem || 0
            }
          } catch (error) {
            // Customer might not have points wallet
            console.warn('Customer không có ví điểm:', customer.id)
          }
        }
        
        // Sort by total points descending
        customersWithPoints.sort((a, b) => (b.tongDiem || 0) - (a.tongDiem || 0))
        
        this.totalPointsEarned = totalEarned
        this.totalPointsSpent = totalSpent
        this.customersWithPoints = customersWithPoints.length
        this.totalPointsRemaining = totalRemaining
        this.topCustomers = customersWithPoints.slice(0, 10)
      } catch (error) {
        console.error('Lỗi khi tải báo cáo:', error)
        alert('Lỗi: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },
    exportReport() {
      // Simple CSV export
      const csvContent = [
        ['Tên KH', 'SĐT', 'Tổng điểm', 'Đã tích', 'Đã dùng'].join(','),
        ...this.topCustomers.map(c => [
          c.tenKhachHang || '',
          c.soDienThoai || '',
          c.tongDiem || 0,
          c.diemDaCong || 0,
          c.diemDaDung || 0
        ].join(','))
      ].join('\n')
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `bao-cao-diem-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

