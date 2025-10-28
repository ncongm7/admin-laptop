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
          <th>Địa chỉ</th>
          <th>Giới tính</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(customer, index) in customers"
          :key="customer.id"
          @dblclick="openDetail(customer)"
        >
          <th><input type="checkbox" v-model="selected" :value="customer.id" /></th>
          <td>{{ index + 1 }}</td>
          <td>{{ customer.maKhachHang }}</td>
          <td>{{ customer.hoTen }}</td>
          <td>{{ customer.soDienThoai }}</td>
          <td>{{ customer.email }}</td>
          <td>{{ formatDate(customer.ngaySinh) }}</td>
          <td>{{ customer.diaChi }}</td>
          <td>{{ customer.gioiTinh === 1 ? 'Nam' : 'Nữ' }}</td>
          <td>
            <span class="badge" :class="customer.trangThai === 1 ? 'bg-success' : 'bg-secondary'">
              {{ customer.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <!-- Bên trái: Email + SMS -->
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-success">Email</button>
        <button type="button" class="btn btn-success">SMS</button>
      </div>

      <!-- Bên phải: Pagination + Select + Icon -->
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary">&lt;</button>
        <button class="btn btn-sm btn-outline-secondary">&gt;</button>

        <select class="form-select form-select-sm" style="width: 140px">
          <option value="10">Hiển thị 10 kết</option>
          <option value="20" selected>Hiển thị 20 kết</option>
          <option value="50">Hiển thị 50 kết</option>
        </select>

        <button class="btn btn-sm btn-outline-warning" title="Sinh nhật khách hàng">
          <img
            src="https://cdn-icons-png.flaticon.com/128/1244/1244336.png"
            alt="Birthday Icon"
            width="16"
            height="16"
          />
        </button>
      </div>
    </div>

    <!-- 🟡 Modal chi tiết khách hàng -->
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
      pageSize: 20,
      loading: false,
    }
  },
  mounted() {
    this.fetchCustomers()
  },
  // Expose dữ liệu cho parent component
  expose: ['customers', 'fetchCustomers', 'searchCustomers'],
  methods: {
    async fetchCustomers() {
      try {
        const res = await KhachHangService.getPhanTrang(this.pageOne, this.pageSize)
        console.log('Dữ liệu customers từ API:', res.data)

        // API trả về trực tiếp danh sách, không có wrapper
        this.customers = res.data || []

        // Log từng customer để kiểm tra cấu trúc
        if (this.customers && this.customers.length > 0) {
          console.log('Customer đầu tiên:', this.customers[0])
          console.log('Keys của customer:', Object.keys(this.customers[0]))
          console.log('ID của customer đầu tiên:', this.customers[0].id)
          console.log(
            'Toàn bộ dữ liệu customer đầu tiên:',
            JSON.stringify(this.customers[0], null, 2),
          )
        }

        // Emit event để thông báo cho parent component về số lượng khách hàng
        this.$emit('customers-updated', this.customers.length)
      } catch (err) {
        console.error(' Lỗi khi load khách hàng:', err)
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
          alert('Không tìm thấy thông tin khách hàng')
          this.showModal = false
          return
        }

        // Kiểm tra xem có UUID không
        if (customer.id) {
          console.log('Có UUID, gọi API để lấy chi tiết:', customer.id)
          try {
            const res = await KhachHangService.getOne(customer.id)
            console.log('API response:', res)
            const data = res.data || res
            this.selectedCustomer = data
            console.log('Dữ liệu khách hàng từ API:', data)
          } catch (apiError) {
            console.warn('API lỗi, sử dụng dữ liệu từ table:', apiError)
            this.selectedCustomer = customer
            console.log('Sử dụng dữ liệu từ table:', customer)
          }
        } else {
          console.log('Không có UUID, sử dụng dữ liệu từ table')
          this.selectedCustomer = customer
          console.log('Dữ liệu khách hàng từ table:', customer)
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết khách hàng:', error)
        alert('Lỗi khi tải thông tin khách hàng: ' + error.message)
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
      this.pageOne++
      this.fetchCustomers()
    },
    prevPage() {
      if (this.pageOne > 0) {
        this.pageOne--
        this.fetchCustomers()
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN')
    },
    async searchCustomers(searchParams) {
      try {
        console.log('Tìm kiếm khách hàng với params:', searchParams)

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
        alert('Lỗi khi tìm kiếm khách hàng')
      }
    },
  },
}
</script>
