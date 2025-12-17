import { defineStore } from 'pinia'
import {
  fetchThongKeTongQuan,
  fetchBieuDoData,
  fetchSanPhamBanChay,
  fetchGiaoDichGanDay,
  fetchHoatDongKhachHang,
} from '@/service/thongke/thongKeService'

/**
 * Pinia Store quản lý state cho Dashboard
 */
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    isLoading: false,
    error: null,
    stats: {
      totalSales: 0,
      salesGrowth: 0,
      revenue: 0,
      revenueGrowth: 0,
      profit: 0,
      customerCount: 0,
      customerGrowth: 0,
      customerMoiThangNay: 0,
      customerHoatDong: 0,
      lowStockCount: 0,
      criticalStockCount: 0,
    },
    chartData: {
      labels: [],
      values: [],
      rawData: [],
    },
    topProducts: [],
    recentTransactions: [],
    customerActivities: [],
  }),

  actions: {
    /**
     * Fetch dữ liệu Dashboard từ API
     * @param {Object} dateRange - { start: Date, end: Date }
     * @param {String} groupBy - 'day', 'week', 'month', 'quarter', 'year'
     */
    async fetchDashboardData(dateRange, groupBy = 'day') {
      this.isLoading = true
      this.error = null

      try {
        console.log('🔄 [DashboardStore] Đang fetch dữ liệu Dashboard...')

        // Format dates thành yyyy-MM-dd
        const startDate = this.formatDate(dateRange.start)
        const endDate = this.formatDate(dateRange.end)

        console.log('📅 [DashboardStore] Khoảng thời gian:', { startDate, endDate, groupBy })

        // Fetch tất cả dữ liệu song song
        const [tongQuanData, bieuDoData, sanPhamData, giaoDichData, hoatDongData] = await Promise.all([
          fetchThongKeTongQuan(startDate, endDate),
          fetchBieuDoData(startDate, endDate, groupBy),
          fetchSanPhamBanChay(startDate, endDate, 5),
          fetchGiaoDichGanDay(10),
          fetchHoatDongKhachHang(10),
        ])

        console.log('✅ [DashboardStore] Dữ liệu nhận được:', {
          tongQuan: tongQuanData,
          bieuDo: bieuDoData,
          sanPham: sanPhamData,
          giaoDich: giaoDichData,
          hoatDong: hoatDongData,
        })

        // Update stats
        if (tongQuanData?.data) {
          this.stats.totalSales = tongQuanData.data.doanhSo?.giaTri || 0
          this.stats.salesGrowth = tongQuanData.data.doanhSo?.soSanhKyTruoc || 0
          this.stats.revenue = tongQuanData.data.doanhThu?.giaTri || 0
          this.stats.revenueGrowth = tongQuanData.data.doanhThu?.soSanhKyTruoc || 0
          this.stats.profit = tongQuanData.data.doanhThu?.loiNhuan || 0
          this.stats.customerCount = tongQuanData.data.khachHang?.giaTri || 0
          this.stats.customerGrowth = tongQuanData.data.khachHang?.soSanhKyTruoc || 0
          this.stats.customerMoiThangNay = tongQuanData.data.khachHang?.moiThangNay || 0
          this.stats.customerHoatDong = tongQuanData.data.khachHang?.hoatDong || 0
          this.stats.lowStockCount = tongQuanData.data.tonKho?.sapHetHang || 0
          this.stats.criticalStockCount = tongQuanData.data.tonKho?.canBoSung || 0
        }

        // Update chart data - cần format cho Chart.js
        if (bieuDoData?.data && Array.isArray(bieuDoData.data) && bieuDoData.data.length > 0) {
          this.chartData = {
            labels: bieuDoData.data.map((item) => item.thoiGian),
            values: bieuDoData.data.map((item) => parseFloat(item.doanhThu) || 0),
            rawData: bieuDoData.data,
          }
          console.log('📊 [DashboardStore] Chart data updated:', this.chartData)
        } else {
          console.warn('⚠️ [DashboardStore] Không có dữ liệu biểu đồ')
        }

        // Update top products
        if (sanPhamData?.data && Array.isArray(sanPhamData.data) && sanPhamData.data.length > 0) {
          this.topProducts = sanPhamData.data.map((product) => ({
            id: product.id,
            name: product.tenSanPham,
            image: product.anhDaiDien || 'https://via.placeholder.com/80?text=No+Image',
            sold: product.soLuongBan,
            revenue: parseFloat(product.doanhThu) || 0,
          }))
          console.log('🏆 [DashboardStore] Top products updated:', this.topProducts)
        } else {
          console.warn('⚠️ [DashboardStore] Không có dữ liệu sản phẩm bán chạy')
        }

        // Update recent transactions
        if (giaoDichData?.data && Array.isArray(giaoDichData.data) && giaoDichData.data.length > 0) {
          this.recentTransactions = giaoDichData.data.map((item) => ({
            id: item.id,
            customer: item.tenKhachHang || 'Khách lẻ',
            date: this.formatRelativeTime(item.ngayTao),
            amount: parseFloat(item.tongTien) || 0,
            type: item.loai || 'sale',
          }))
          console.log('💳 [DashboardStore] Recent transactions updated:', this.recentTransactions)
        } else {
          console.warn('⚠️ [DashboardStore] Không có dữ liệu giao dịch gần đây')
          this.recentTransactions = []
        }

        // Update customer activities
        if (hoatDongData?.data && Array.isArray(hoatDongData.data) && hoatDongData.data.length > 0) {
          this.customerActivities = hoatDongData.data.map((item) => ({
            id: item.id,
            customer: item.tenKhachHang || 'Khách lẻ',
            description: item.moTa || 'Hoạt động',
            time: this.formatRelativeTime(item.thoiGian),
            type: item.loai || 'purchase',
          }))
          console.log('👥 [DashboardStore] Customer activities updated:', this.customerActivities)
        } else {
          console.warn('⚠️ [DashboardStore] Không có dữ liệu hoạt động khách hàng')
          this.customerActivities = []
        }

        console.log('✅ [DashboardStore] Đã cập nhật state thành công')
      } catch (err) {
        console.error('❌ [DashboardStore] Lỗi khi fetch dữ liệu:', err)
        this.error = err.message || 'Không thể tải dữ liệu Dashboard'

        // Set default values khi lỗi
        this.resetData()
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Format thời gian tương đối (ví dụ: "2 phút trước", "1 giờ trước")
     */
    formatRelativeTime(timestamp) {
      if (!timestamp) return 'Vừa xong'

      const now = new Date()
      const time = new Date(timestamp)
      const diffMs = now - time
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Vừa xong'
      if (diffMins < 60) return `${diffMins} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`

      // Format ngày tháng nếu quá lâu
      return time.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },

    /**
     * Format Date thành string yyyy-MM-dd
     */
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * Reset tất cả dữ liệu về giá trị mặc định
     */
    resetData() {
      this.stats = {
        totalSales: 0,
        salesGrowth: 0,
        revenue: 0,
        revenueGrowth: 0,
        profit: 0,
        customerCount: 0,
        customerGrowth: 0,
        customerMoiThangNay: 0,
        customerHoatDong: 0,
        lowStockCount: 0,
        criticalStockCount: 0,
      }
      this.chartData = {
        labels: [],
        values: [],
        rawData: [],
      }
      this.topProducts = []
      this.recentTransactions = []
      this.customerActivities = []
    },
  },
})
