<template >
  <div class="customer-detail">
    <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <!-- nút chức năng -->
       <div class="d-flex justify-content-center gap-3 mx-auto" style="width: 300px;">
        <button class="btn btn-primary" @click="handleUpdate">
          <i class="fas fa-save me-1"></i> Cập nhật
        </button>
        <button class="btn btn-success" @click="handleSaveAndNew">
          <i class="fas fa-plus me-1"></i> Lưu & thêm mới
        </button>
      </div>
       <!-- Bên phải: Tổng chi tiêu -->
      <div class="text-end mx-auto" style="width: 250px;">
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
          <label class="form-label">Họ tên</label>
          <input type="text" class="form-control" placeholder="Họ tên" v-model="form.name" />
        </div>

        <div class="mb-3">
          <label class="form-label">Số điện thoại</label>
          <input type="text" class="form-control" placeholder="Số điện thoại" v-model="form.phone" />
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" placeholder="name@example.com" v-model="form.email" />
        </div>

        <div class="mb-3">
          <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0">
            <i class="fas fa-map-marker-alt me-1 text-success"></i> Quản lý địa chỉ
            <span class="badge bg-light text-dark ms-2">0 địa chỉ</span>
          </h6>
          <button class="btn btn-success btn-sm">Thêm địa chỉ</button>
        </div>
        <div class="border rounded p-4 text-center text-muted" style="border-style: dashed;">
          <i class="fas fa-map-marker-alt fa-2x mb-2"></i>
          <p class="mb-2">Chưa có địa chỉ nào</p>
          <button class="btn btn-success btn-sm">Thêm địa chỉ ngay</button>
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
            <input class="form-check-input" type="radio" name="trangThai" id="statusRetail" v-model="form.status.retail" />
            <label class="form-check-label" for="statusRetail">Khách lẻ</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio"  name="trangThai" id="statusLoyal" v-model="form.status.loyal" />
            <label class="form-check-label" for="statusLoyal">Khách quen</label>
          </div>
        </div>

       <div class="mb-4">
  <label class="form-label">Giới tính</label>
  <div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="radio" id="genderMale" value="Nam" name="gioiTinh" v-model="form.gender" />
      <label class="form-check-label" for="genderMale">Nam</label>
    </div>
    <div class="form-check form-check-inline">
      <input class="form-check-input" type="radio" id="genderFemale" value="Nữ" name="gioiTinh" v-model="form.gender" />
      <label class="form-check-label" for="genderFemale">Nữ</label>
    </div>
  </div>
</div>
<div class="mb-3">
          <label class="form-label">Ngày Sinh</label>
          <input type="date" class="form-control" placeholder="Số điện thoại" v-model="form.phone" />
        </div>

          <div class="mb-3">
          <label class="form-label">Ghi chú</label>
          <textarea class="form-control" rows="2" v-model="form.note"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KhachHangForrm',
   props: ['data'],


  data() {
    return {
      form: {
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        gender: 'Nữ',
        totalSpent: 0,
        status: {
          retail: false,
          loyal: false
        }
      }
    }
  },
    mounted() {
    // Clone dữ liệu để tránh sửa trực tiếp prop
    this.form = { ...this.data }
  },
  methods: {
    handleUpdate() {
      // Gửi dữ liệu lên server hoặc emit event
      console.log('Cập nhật khách hàng:', this.form)
      alert('Đã cập nhật thông tin khách hàng!')
    },
    handleSaveAndNew() {
      console.log('Lưu khách hàng:', this.form)
      alert('Đã lưu và chuẩn bị thêm mới!')
      // Reset form về rỗng
      this.form = {
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        gender: 'Nữ',
        totalSpent: 0,
        status: {
          retail: false,
          loyal: false
        }
      }
    }
  }

}

</script>

<style scoped>
.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}
</style>
