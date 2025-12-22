<style>
table th,
table td {
  vertical-align: middle;
  font-size: 0.9rem;
}

input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
}

.bg-success {
  background-color: #198754 !important;
  color: white;
}

.bg-secondary {
  background-color: #6c757d !important;
  color: white;
}

.bg-warning {
  background-color: #ffc107 !important;
  color: #000 !important;
}
</style>
<template>
  <div>
    <table class="table table-bordered table-hover">
      <thead class="table-light">
        <tr>
          <th><input type="checkbox" v-model="selectAll" @change="toggleAll" /></th>
          <th>#</th>
          <th>Mã KH</th>
          <th>Họ và tên</th>
          <th>Điện thoại</th>
          <th>Email</th>
          <th>Sinh nhật</th>
          <!-- <th>Địa chỉ</th> -->
          <th>Giới tính</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(customer, index) in filteredCustomers"
          :key="customer.id"
          @dblclick="openDetail(customer)"
        >
          <th><input type="checkbox" v-model="selected" :value="customer.id" /></th>
          <td>{{ pageOne * pageSize + index + 1 }}</td>
          <td>{{ customer.maKhachHang }}</td>
          <td>{{ customer.hoTen }}</td>
          <td>{{ customer.soDienThoai }}</td>
          <td>{{ customer.email }}</td>
          <td>{{ formatDate(customer.ngaySinh) }}</td>
          <!-- <td>{{ customer.diaChi }}</td> -->
          <td>{{ customer.gioiTinh === 1 ? 'Nam' : 'Nữ' }}</td>
          <td>
            <span class="badge" :class="hasTaiKhoan(customer) ? 'bg-success' : 'bg-warning'">
              {{ hasTaiKhoan(customer) ? 'Đã có tài khoản' : 'Chưa có tài khoản' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <!-- Bên trái: Email + SMS -->
      <div class="d-flex gap-2">
        <!-- <button type="button" class="btn btn-success">Email</button>
        <button type="button" class="btn btn-success">SMS</button> -->
      </div>

      <!-- Bên phải: Pagination + Select + Icon -->
      <div class="d-flex align-items-center gap-2">
        <span class="text-muted small">
          <template v-if="taiKhoanFilter && taiKhoanFilter !== 'all'">
            Hiển thị: {{ filteredCustomers.length }} / {{ customers.length }} khách hàng
            <span class="badge bg-info ms-2" style="font-size: 0.7rem;">
              {{ taiKhoanFilter === 'has' ? 'Đã có tài khoản' : 'Chưa có tài khoản' }}
            </span>
          </template>
          <template v-else>
          Trang {{ pageOne + 1 }} / {{ totalPages || 1 }} (Tổng: {{ totalCustomers }} khách hàng)
          </template>
        </span>
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="prevPage"
          :disabled="pageOne === 0"
        >
          &lt;
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          @click="nextPage"
          :disabled="pageOne >= totalPages - 1"
        >
          &gt;
        </button>

        <!-- <select
          class="form-select form-select-sm"
          style="width: 140px"
          v-model="pageSize"
          @change="onPageSizeChange"
        >
          <option value="5" selected>Hiển thị 5 kết quả</option>
          <option value="10">Hiển thị 10 kết quả</option>
          <option value="20">Hiển thị 20 kết quả</option>
          <option value="50">Hiển thị 50 kết quả</option>
        </select> -->
<!--
        <button class="btn btn-sm btn-outline-warning" title="Sinh nhật khách hàng">
          <img
            src="https://cdn-icons-png.flaticon.com/128/1244/1244336.png"
            alt="Birthday Icon"
            width="16"
            height="16"
          />
        </button> -->
      </div>
    </div>

    <!--  Modal chi tiết khách hàng -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0, 0, 0, 0.3)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết khách hàng</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Đang tải thông tin khách hàng...</p>
            </div>
            <CustomerDetail v-else :data="selectedCustomer" @update-success="onUpdateSuccess" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomerDetail from './KhachHangForrm.vue'
import KhachHangService from '../../../service/taikhoan/khachHangService'
import { useToast } from '@/composables/common/useToast'

export default {
  components: { CustomerDetail },
  data() {
    return {
      customers: [],
      selected: [],
      selectAll: false,
      showModal: false,
      selectedCustomer: null,
      pageOne: 0,
      pageSize: 5,
      totalPages: 0,
      totalCustomers: 0,
      loading: false,
      taiKhoanFilter: '', // Filter theo tài khoản: '', 'has', 'no'
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
  mounted() {
    this.fetchCustomers()
  },
  computed: {
    filteredCustomers() {
      if (!this.taiKhoanFilter || this.taiKhoanFilter === 'all') {
        return this.customers
      }
      const filtered = this.customers.filter(customer => {
        if (!customer) return false
        const hasAccount = this.hasTaiKhoan(customer)
        if (this.taiKhoanFilter === 'has') {
          return hasAccount === true
        } else if (this.taiKhoanFilter === 'no') {
          return hasAccount === false
        }
        return true
      })
      return filtered
    },
  },
  // Expose dữ liệu cho parent component
  expose: ['customers', 'fetchCustomers', 'searchCustomers', 'setTaiKhoanFilter'],
  methods: {
    async fetchCustomers() {
      try {
        const res = await KhachHangService.getPhanTrang(this.pageOne, this.pageSize)
        console.log('Dữ liệu customers từ API:', res.data)

        // API trả về object với data, total, totalPages
        const responseData = res.data || {}

        // Kiểm tra xem response có cấu trúc mới (với total, totalPages) hay cũ (chỉ là array)
        if (responseData.data && Array.isArray(responseData.data)) {
          // Cấu trúc mới: { data: [], total: number, totalPages: number }
          this.customers = responseData.data || []
          this.totalCustomers = responseData.total || 0
          this.totalPages = responseData.totalPages || 0
        } else if (Array.isArray(responseData)) {
          // Cấu trúc cũ: chỉ là array (fallback cho tương thích ngược)
          this.customers = responseData
          // Ước tính tổng số trang
          if (this.customers.length === this.pageSize) {
            this.totalPages = this.pageOne + 2
          } else {
            this.totalPages = this.pageOne + 1
          }
          this.totalCustomers = this.pageOne * this.pageSize + this.customers.length
        } else {
          this.customers = []
          this.totalPages = 0
          this.totalCustomers = 0
        }

        // Debug: Log để kiểm tra dữ liệu từ backend
        if (this.customers && this.customers.length > 0) {
          const firstCustomer = this.customers[0]
          console.log('Sample customer data:', {
            hoTen: firstCustomer.hoTen,
            hasTaiKhoan: firstCustomer.hasTaiKhoan,
            maTaiKhoan: firstCustomer.maTaiKhoan,
            allKeys: Object.keys(firstCustomer)
          })
        }

        // Emit event để thông báo cho parent component về số lượng khách hàng
        // Nếu đang filter, dùng số lượng filtered, nếu không dùng total từ backend
        const countToEmit = (this.taiKhoanFilter && this.taiKhoanFilter !== 'all')
          ? this.filteredCustomers.length
          : (this.totalCustomers || this.customers.length)
        this.$emit('customers-updated', countToEmit)
      } catch (err) {
        console.error(' Lỗi khi load khách hàng:', err)
        this.customers = []
        this.totalPages = 0
        this.totalCustomers = 0
      }
    },
    async openDetail(customer) {
      try {
        this.loading = true
        this.showModal = true

        // Kiểm tra customer và ID
        console.log('Customer object:', customer)
        console.log('Customer keys:', customer ? Object.keys(customer) : 'Customer is null')
        console.log('Toàn bộ customer data:', JSON.stringify(customer, null, 2))

        if (!customer) {
          console.error('Customer object không tồn tại')
          this.showError('Không tìm thấy thông tin khách hàng')
          this.showModal = false
          return
        }

        // Kiểm tra xem có UUID không
        if (customer.id) {
          console.log('Có UUID, gọi API để lấy chi tiết:', customer.id)
          try {
            // Lấy thông tin chi tiết khách hàng
            const res = await KhachHangService.getOne(customer.id)
            console.log('API response:', res)
            const data = res.data || res
            this.selectedCustomer = data

            // Lấy tổng tiền khách hàng đã sử dụng
            try {
              const tongTienRes = await KhachHangService.getTongTien(customer.id)
              const tongTien = tongTienRes?.data ?? tongTienRes ?? 0
              // Đảm bảo nếu null, undefined, hoặc NaN thì set về 0
              this.selectedCustomer.totalSpent =
                tongTien != null && !isNaN(tongTien) ? Number(tongTien) : 0
              console.log('Tổng tiền khách hàng:', this.selectedCustomer.totalSpent)
            } catch (error) {
              console.warn('Không thể lấy tổng tiền:', error)
              this.selectedCustomer.totalSpent = 0
            }

            console.log('Dữ liệu khách hàng từ API:', data)
          } catch (apiError) {
            console.warn('API lỗi, sử dụng dữ liệu từ table:', apiError)
            this.selectedCustomer = customer
            // Vẫn thử lấy tổng tiền nếu có ID
            if (customer.id) {
              try {
                const tongTienRes = await KhachHangService.getTongTien(customer.id)
                const tongTien = tongTienRes?.data ?? tongTienRes ?? 0
                // Đảm bảo nếu null, undefined, hoặc NaN thì set về 0
                this.selectedCustomer.totalSpent =
                  tongTien != null && !isNaN(tongTien) ? Number(tongTien) : 0
              } catch {
                this.selectedCustomer.totalSpent = 0
              }
            }
            console.log('Sử dụng dữ liệu từ table:', customer)
          }
        } else {
          console.log('Không có UUID, sử dụng dữ liệu từ table')
          this.selectedCustomer = customer
          // Không có ID nên không thể lấy tổng tiền, set về 0
          this.selectedCustomer.totalSpent = 0
          console.log('Dữ liệu khách hàng từ table:', customer)
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết khách hàng:', error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Lỗi khi tải thông tin khách hàng'
        this.showError(errorMessage)
        this.showModal = false
      } finally {
        this.loading = false
      }
    },
    // Thêm method để đóng modal
    closeModal() {
      this.showModal = false
      this.selectedCustomer = null
    },
    // Thêm method để xử lý khi cập nhật thành công
    onUpdateSuccess() {
      console.log('Cập nhật thành công, đóng modal và reload dữ liệu')
      this.closeModal()
      this.fetchCustomers() // Reload dữ liệu từ API
    },
    toggleAll() {
      if (this.selectAll) {
        this.selected = this.customers.map((c) => c.id)
      } else {
        this.selected = []
      }
    },
    nextPage() {
      if (this.pageOne < this.totalPages - 1) {
        this.pageOne++
        this.fetchCustomers()
      }
    },
    prevPage() {
      if (this.pageOne > 0) {
        this.pageOne--
        this.fetchCustomers()
      }
    },
    onPageSizeChange() {
      // Reset về trang đầu khi thay đổi kích thước trang
      this.pageOne = 0
      this.fetchCustomers()
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN')
    },
    hasTaiKhoan(customer) {
      if (!customer) return false

      // Kiểm tra xem khách hàng có tài khoản hay không
      // Ưu tiên kiểm tra hasTaiKhoan từ backend (Boolean)
      if (customer.hasTaiKhoan !== undefined && customer.hasTaiKhoan !== null) {
        return customer.hasTaiKhoan === true
      }

      // Fallback: kiểm tra maTaiKhoan (object hoặc ID)
      if (customer.maTaiKhoan !== undefined && customer.maTaiKhoan !== null) {
        // Nếu là object, kiểm tra có id không
        if (typeof customer.maTaiKhoan === 'object' && customer.maTaiKhoan.id) {
          return true
        }
        // Nếu là string/UUID, coi như có tài khoản
        if (typeof customer.maTaiKhoan === 'string' && customer.maTaiKhoan.trim() !== '') {
          return true
        }
      }

      // Nếu không có cả hai, coi như chưa có tài khoản
      return false
    },
    async searchCustomers(searchParams) {
      try {
        console.log('Tìm kiếm khách hàng với params:', searchParams)

        // Cập nhật filter tài khoản
        if (searchParams && searchParams.taiKhoanFilter) {
          this.taiKhoanFilter = searchParams.taiKhoanFilter
        }

        if (!searchParams.keyword && !searchParams.status) {
          // Nếu không có điều kiện tìm kiếm, load lại dữ liệu bình thường
          this.fetchCustomers()
          return
        }

        // Gọi API tìm kiếm
        const res = await KhachHangService.search(searchParams.keyword, searchParams.keyword)
        console.log('Kết quả tìm kiếm:', res.data)

        this.customers = res.data || []

        // Emit event để cập nhật tổng số
        this.$emit('customers-updated', this.customers.length)
      } catch (error) {
        console.error('Lỗi khi tìm kiếm khách hàng:', error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Lỗi khi tìm kiếm khách hàng'
        this.showError(errorMessage)
      }
    },
    setTaiKhoanFilter(filter) {
      this.taiKhoanFilter = filter
    },
  },
}
</script>
