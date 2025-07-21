<template>

<div class="customer-detail">


    <!-- 🔸 Form thông tin khách hàng -->

  <div>
    <!-- Breadcrumb -->
    <div class="card mb-3">
      <div class="card-body py-2">
        <h5 class="fw-bold text-success mb-1">Thêm Khách Hàng</h5>
        <nav style="--bs-breadcrumb-divider: '/'; font-size: 14px;">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="#" @click.prevent="$emit('back')">Trang chủ</a></li>
            <li class="breadcrumb-item">Khách hàng</li>
            <li class="breadcrumb-item active">Form khách hàng</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Form Khách Hàng -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">Tên khách hàng</label>
            <input type="text" class="form-control" placeholder="Nhập tên khách hàng" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input type="text" class="form-control" placeholder="Nhập số điện thoại" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" placeholder="Nhập email" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" class="form-control" />
          </div>
          <div class="col-md-12">
            <label class="form-label me-3">Giới tính</label>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="gender" id="nam" value="Nam" />
              <label class="form-check-label" for="nam">Nam</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="gender" id="nu" value="Nữ" />
              <label class="form-check-label" for="nu">Nữ</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Địa chỉ -->
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

      <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-between align-items-center mb-4 py-3">
      <!-- nút chức năng -->
       <div class="d-flex justify-content-center gap-3 mx-auto" style="width: 300px;">
        <button class="btn btn-primary" @click="handleUpdate">
          <i class="fas fa-save me-1"></i> Lưu
        </button>
        <button class="btn btn-success" @click="handleSaveAndNew">
          <i class="fas fa-plus me-1"></i> Thêm mới
        </button>
         <button class="btn btn-secondary" @click="$emit('close')">
    <i class="fas fa-times me-1"></i> Đóng
  </button>
      </div>



    </div>
  </div>
</template>


<style scoped>
.card {
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(60, 72, 88, 0.08);
}
.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}
</style>
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



