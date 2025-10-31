<template>
  <div class="customer-detail">
    <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- nút chức năng -->
      <div class="d-flex justify-content-center gap-3 mx-auto" style="width: 300px">
        <button class="btn btn-primary" @click="handleUpdate">
          <i class="fas fa-save me-1"></i> Cập nhật
        </button>
        <button class="btn btn-success" @click="handleSaveAndNew">
          <i class="fas fa-plus me-1"></i> Lưu & thêm mới
        </button>
      </div>
      <!-- Bên phải: Tổng chi tiêu -->
      <div class="text-end mx-auto" style="width: 250px">
        <label class="form-label mb-1 fw-bold">Tổng chi tiêu:</label>
        <div class="fs-3 fw-bold text-danger">
          <!-- {{ formatCurrency(form.totalSpent) }} -->
          900000
        </div>
      </div>
    </div>

    <!-- 🔸 Form thông tin khách hàng -->
    <div class="row gy-2 gx-3 align-items-start">
      <!-- Cột trái -->
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">MÃ Khách Hàng</label>
          <input type="text" class="form-control" placeholder="Họ tên" v-model="form.maKhachHang" />
        </div>
        <div class="mb-3">
          <label class="form-label">Họ tên</label>
          <input type="text" class="form-control" placeholder="Họ tên" v-model="form.hoTen" />
        </div>

        <div class="mb-3">
          <label class="form-label">Số điện thoại</label>
          <input
            type="text"
            class="form-control"
            placeholder="Số điện thoại"
            v-model="form.soDienThoai"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" placeholder="Email" v-model="form.email" />
        </div>
        <!-- Modal thêm địa chỉ -->
        <div
          class="modal fade"
          :class="{ 'show d-block': showAddressModal }"
          tabindex="-1"
          style="background-color: rgba(0, 0, 0, 0.5)"
        >
          <div
            class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable modal-wide"
          >
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Thêm Địa Chỉ</h5>
                <button type="button" class="btn-close" @click="closeAddressModal"></button>
              </div>
              <div class="modal-body">
                <DiaChiForm
                  :maKhachHang="form.maKhachHang"
                  @close="closeAddressModal"
                  @success="handleAddressSuccess"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải -->
      <div class="col-md-6">
        <div class="mb-4">
          <label class="form-label">Trạng thái</label>
          <div class="form-check">
            <input class="form-check-input" type="radio" :value="0" v-model="form.trangThai" />
            <label class="form-check-label">Không hoạt động</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" :value="1" v-model="form.trangThai" />
            <label class="form-check-label">Hoạt động</label>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label">Giới tính</label>
          <div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" :value="1" v-model="form.gioiTinh" />
              <label class="form-check-label">Nam</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" :value="0" v-model="form.gioiTinh" />
              <label class="form-check-label">Nữ</label>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày sinh</label>
          <input type="date" class="form-control" v-model="form.ngaySinh" />
        </div>

        <!-- <div class="mb-3">
          <label class="form-label">Ghi chú</label>
          <textarea class="form-control" rows="2" v-model="form.note"></textarea>
        </div> -->
      </div>

      <!-- Quản lý địa chỉ - full width dưới 2 cột -->
      <div class="col-12 mt-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">
                <i class="fas fa-map-marker-alt me-1 text-success"></i> Quản lý địa chỉ
                <span class="badge bg-light text-dark ms-2">{{ addressList.length }} địa chỉ</span>
              </h6>
              <button class="btn btn-success btn-sm" @click="showAddAddressModal">
                <i class="fas fa-plus me-1"></i> Thêm địa chỉ
              </button>
            </div>
            <!-- Danh sách địa chỉ -->
            <div
              v-if="addressList.length === 0"
              class="border rounded p-4 text-center text-muted"
              style="border-style: dashed"
            >
              <i class="fas fa-map-marker-alt fa-2x mb-2"></i>
              <p class="mb-2">Chưa có địa chỉ nào</p>
              <button class="btn btn-success btn-sm" @click="showAddAddressModal">
                Thêm địa chỉ ngay
              </button>
            </div>

            <!-- Hiển thị danh sách địa chỉ -->
            <div v-else class="list-group">
              <div v-for="address in addressList" :key="address.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <div class="fw-bold mb-1">
                      <i class="fas fa-user me-2"></i>{{ address.hoTen }}
                      <span v-if="address.macDinh" class="badge bg-success ms-2">Mặc định</span>
                    </div>
                    <div class="mb-1"><i class="fas fa-phone me-2"></i>{{ address.sdt }}</div>
                    <div class="mb-1">
                      <i class="fas fa-map-marker-alt me-2"></i>
                      {{ [address.diaChi, address.xa, address.tinh].filter(Boolean).join(', ') }}
                    </div>
                  </div>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="setDefaultAddress(address.id)">
                      <i class="fas fa-star">Để mặc định</i>
                    </button>
                    <button class="btn btn-outline-danger" @click="deleteAddress(address.id)">
                      <i class="fas fa-trash">Xoá</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import khachHangService from '@/service/taikhoan/khachHangService'
import DiaChiService from '@/service/taikhoan/diaChiService'
import DiaChiForm from './DiaChiForm.vue'

export default {
  name: 'KhachHangForm',
  components: {
    DiaChiForm,
  },
  props: ['data', 'customerId'],
  data() {
    return {
      form: {
        id: null,
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        trangThai: 0,
        totalSpent: 0,
        note: '',
      },
      showAddressModal: false,
      addressList: [],
    }
  },
  mounted() {
    if (this.data) {
      this.form = { ...this.data }
      this.fetchAddresses()
    } else if (this.customerId) {
      this.fetchCustomer(this.customerId)
    }
  },
  watch: {
    data(newData) {
      if (newData) {
        console.log('Props data thay đổi:', newData)
        this.form = { ...newData }
        this.fetchAddresses()
      }
    },
    maKhachHang() {
      if (this.form.maKhachHang) {
        this.fetchAddresses()
      }
    },
    customerId(newId) {
      if (newId) this.fetchCustomer(newId)
    },
  },
  methods: {
    async fetchCustomer(id) {
      try {
        console.log('fetchCustomer: Đang gọi API lấy chi tiết khách hàng ID:', id)
        const res = await khachHangService.getOne(id)
        console.log('fetchCustomer: API response:', res)

        const data = res && res.data ? res.data : res
        this.form = { ...this.form, ...data }
        console.log('fetchCustomer: Dữ liệu đã cập nhật vào form:', this.form)
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết khách hàng', error)
        alert('Lỗi khi tải thông tin khách hàng')
      }
    },
    async handleUpdate() {
      try {
        if (this.form.id) {
          //  Gọi API update
          await khachHangService.updateKhachHang(this.form.id, this.form)
          alert(' Cập nhật khách hàng thành công!')
          // Emit event để thông báo cho parent component
          this.$emit('update-success')
        } else {
          //  Gọi API thêm mới
          const res = await khachHangService.addKhachHang(this.form)
          this.form.id = res.data.id
          alert(' Thêm mới khách hàng thành công!')
          // Emit event để thông báo cho parent component
          this.$emit('update-success')
        }
      } catch (error) {
        console.error(error)
        alert(' Lỗi khi lưu khách hàng!')
      }
    },
    async handleSaveAndNew() {
      try {
        await khachHangService.addKhachHang(this.form)
        alert('Lưu khách hàng thành công!')
        this.resetForm()
      } catch (error) {
        console.error(error)
        alert('Lỗi khi lưu khách hàng')
      }
    },
    resetForm() {
      this.form = {
        id: null,
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        trangThai: 0,
        totalSpent: 0,
        note: '',
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
        value || 0,
      )
    },
    showAddAddressModal() {
      if (!this.form.maKhachHang) {
        alert('Vui lòng nhập mã khách hàng trước!')
        return
      }
      this.showAddressModal = true
    },
    closeAddressModal() {
      this.showAddressModal = false
    },
    async fetchAddresses() {
      if (!this.form.maKhachHang) {
        this.addressList = []
        return
      }
      try {
        const res = await DiaChiService.findByMaKhachHang(this.form.maKhachHang)
        this.addressList = res.data || []
      } catch (error) {
        console.error('Error fetching addresses:', error)
        this.addressList = []
      }
    },
    handleAddressSuccess() {
      this.fetchAddresses()
      this.closeAddressModal()
    },
    async setDefaultAddress(addressId) {
      try {
        const address = this.addressList.find((addr) => addr.id === addressId)
        if (!address) return

        await DiaChiService.updateDiaChi(addressId, {
          maKhachHang: this.form.maKhachHang,
          hoTen: address.hoTen,
          sdt: address.sdt,
          diaChi: address.diaChi,
          xa: address.xa,
          tinh: address.tinh,
          macDinh: true,
        })

        this.fetchAddresses()
        alert('Đã đặt làm địa chỉ mặc định')
      } catch (error) {
        console.error('Error setting default address:', error)
        alert('Có lỗi xảy ra')
      }
    },
    async deleteAddress(addressId) {
      if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
        return
      }

      try {
        await DiaChiService.deleteDiaChi(addressId)
        this.fetchAddresses()
        alert('Đã xóa địa chỉ thành công')
      } catch (error) {
        console.error('Error deleting address:', error)
        alert('Có lỗi xảy ra')
      }
    },
  },
}
</script>

<style scoped>
.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.list-group-item {
  transition: all 0.3s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.modal {
  z-index: 1050;
}

/* Mở rộng modal gần bằng form cha */
.modal-wide {
  max-width: 95vw;
  width: 95vw;
}

.modal-wide .modal-content {
  width: 100%;
}
</style>
