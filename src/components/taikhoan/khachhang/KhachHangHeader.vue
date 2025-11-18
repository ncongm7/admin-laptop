<template>
  <div>
    <template v-if="!showForm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button
            class="btn btn-outline-primary me-2"
            @click="exportToExcel"
            :disabled="isExporting"
          >
            <i class="fas fa-file-excel me-1" v-if="!isExporting"></i>
            <i class="fas fa-spinner fa-spin me-1" v-if="isExporting"></i>
            {{ isExporting ? 'Đang xuất...' : 'Xuất Excel' }}
          </button>
          <button class="btn btn-primary" @click="$emit('themMoi')">Thêm khách hàng</button>
        </div>
      </div>
      <!-- Các nội dung khác nếu có -->
    </template>
    <KhachHangFormDN v-else @close="showForm = false" />
  </div>
</template>

<script>
import KhachHangFormDN from './KhachHangFormDN.vue'
import KhachHangService from '@/service/taikhoan/khachHangService'
import ExcelExporter from '@/utils/excelExport.js'
import { useToast } from '@/composables/useToast'

export default {
  components: { KhachHangFormDN },
  data() {
    return {
      showForm: false,
      isExporting: false,
    }
  },
  created() {
    // Khởi tạo toast composable
    const { success: showSuccess, error: showError, warning: showWarning } = useToast()
    
    // Lưu vào this để sử dụng trong methods
    this.showSuccess = showSuccess
    this.showError = showError
    this.showWarning = showWarning
  },
  methods: {
    async exportToExcel() {
      try {
        this.isExporting = true

        // Lấy tất cả dữ liệu khách hàng
        const response = await KhachHangService.getAll()
        const customers = response.data || []

        if (customers.length === 0) {
          this.showWarning('Không có dữ liệu khách hàng để xuất')
          return
        }

        // Sử dụng ExcelExporter để xuất file
        const filename = `Danh_Sach_Khach_Hang_${new Date().toISOString().split('T')[0]}.xlsx`
        ExcelExporter.exportCustomers(customers, filename)

        // Hiển thị thông báo thành công
        this.showSuccess(`Đã xuất thành công ${customers.length} khách hàng`)
      } catch (error) {
        console.error('Lỗi khi xuất Excel:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi khi xuất Excel'
        this.showError(errorMessage)
      } finally {
        this.isExporting = false
      }
    },
  },
}
</script>
