import { ref, computed } from 'vue';
import dashboardService from '@/service/dashboard.service';
import dayjs from 'dayjs';

export function useDashboardStats() {
  const loading = ref(false);
  const error = ref(null);
  
  // State data
  const revenueStats = ref(null);
  const channelStats = ref([]);
  const paymentStats = ref([]);
  const cashFlowStats = ref(null);
  
  // Date range (Default: Today)
  const dateRange = ref({
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  /**
   * Load toàn bộ dữ liệu thống kê
   */
  const loadAllStats = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { startDate, endDate } = dateRange.value;
      
      // Chạy song song các request để tối ưu tốc độ
      const [rev, chan, pay, flow] = await Promise.all([
        dashboardService.getRevenueStats(startDate, endDate),
        dashboardService.getChannelStats(startDate, endDate),
        dashboardService.getPaymentMethodStats(startDate, endDate),
        dashboardService.getCashFlowStats(startDate, endDate)
      ]);
      
      revenueStats.value = rev.data;
      channelStats.value = chan.data;
      paymentStats.value = pay.data;
      cashFlowStats.value = flow.data;
      
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
      error.value = "Không thể tải dữ liệu thống kê. Vui lòng kiểm tra kết nối.";
    } finally {
      loading.value = false;
    }
  };

  /**
   * Format tiền tệ (VND)
   */
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(val);
  };

  /**
   * Tính toán % tăng trưởng (mockup logic nếu backend chưa có)
   * Hoặc format số liệu hiển thị
   */
  const paymentStatusBreakdown = computed(() => {
    if (!paymentStats.value) return [];
    return paymentStats.value.map(p => ({
      method: p.phuongThuc,
      confirmed: p.doanhThuDaXacNhan,
      pending: p.doanhThuChuaXacNhan,
      total: p.doanhThu
    }));
  });

  return {
    loading,
    error,
    dateRange,
    revenueStats,
    channelStats,
    paymentStats,
    cashFlowStats,
    loadAllStats,
    formatCurrency,
    paymentStatusBreakdown
  };
}
