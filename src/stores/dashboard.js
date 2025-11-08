import { defineStore } from 'pinia'
import {
  fetchThongKeTongQuan,
  fetchBieuDoData,
  fetchSanPhamBanChay,
} from '@/service/thongKeService'

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
     */
    async fetchDashboardData(dateRange) {
      this.isLoading = true
      this.error = null

      try {
        console.log('🔄 [DashboardStore] Đang fetch dữ liệu Dashboard...')

        // Format dates thành yyyy-MM-dd
        const startDate = this.formatDate(dateRange.start)
        const endDate = this.formatDate(dateRange.end)

        console.log('📅 [DashboardStore] Khoảng thời gian:', { startDate, endDate })

        // Fetch tất cả dữ liệu song song
        const [tongQuanData, bieuDoData, sanPhamData] = await Promise.all([
          fetchThongKeTongQuan(startDate, endDate),
          fetchBieuDoData(startDate, endDate, 'day'),
          fetchSanPhamBanChay(startDate, endDate, 5),
        ])

        console.log('✅ [DashboardStore] Dữ liệu nhận được:', {
          tongQuan: tongQuanData,
          bieuDo: bieuDoData,
          sanPham: sanPhamData,
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

        // TODO: Thêm API cho giao dịch gần đây và hoạt động khách hàng
        // Tạm thời dùng mock data
        this.recentTransactions = this.generateMockTransactions()
        this.customerActivities = this.generateMockActivities()

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
     * Tạo mock data cho giao dịch gần đây (tạm thời)
     */
    generateMockTransactions() {
      return [
        {
          id: 1,
          customer: 'Nguyễn Văn A',
          date: '2 phút trước',
          amount: 15000000,
          type: 'sale',
        },
        {
          id: 2,
          customer: 'Trần Thị B',
          date: '15 phút trước',
          amount: 8500000,
          type: 'sale',
        },
        {
          id: 3,
          customer: 'Lê Văn C',
          date: '1 giờ trước',
          amount: 12000000,
          type: 'sale',
        },
        {
          id: 4,
          customer: 'Phạm Thị D',
          date: '2 giờ trước',
          amount: -3000000,
          type: 'refund',
        },
        {
          id: 5,
          customer: 'Hoàng Văn E',
          date: '3 giờ trước',
          amount: 20000000,
          type: 'sale',
        },
      ]
    },

    /**
     * Tạo mock data cho hoạt động khách hàng (tạm thời)
     */
    generateMockActivities() {
      return [
        {
          id: 1,
          customer: 'Nguyễn Văn A',
          description: 'Đã mua 1 sản phẩm',
          time: '5 phút trước',
          type: 'purchase',
        },
        {
          id: 2,
          customer: 'Trần Thị B',
          description: 'Đăng nhập vào hệ thống',
          time: '20 phút trước',
          type: 'login',
        },
        {
          id: 3,
          customer: 'Lê Văn C',
          description: 'Đánh giá sản phẩm 5 sao',
          time: '1 giờ trước',
          type: 'review',
        },
        {
          id: 4,
          customer: 'Phạm Thị D',
          description: 'Đăng ký tài khoản mới',
          time: '2 giờ trước',
          type: 'register',
        },
        {
          id: 5,
          customer: 'Hoàng Văn E',
          description: 'Đã mua 2 sản phẩm',
          time: '3 giờ trước',
          type: 'purchase',
        },
      ]
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
