<template>
  <div class="customer-detail">
    <!-- 🔸 Breadcrumb -->
    <div class="card mb-3">
      <div class="card-body py-2">
        <h5 class="fw-bold text-success mb-1">Thêm Địa Chỉ</h5>
      </div>
    </div>

    <!-- 🔸 Form Địa Chỉ -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label class="form-label">Mã khách hàng <span class="text-danger">*</span></label>
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.maKhachHang }"
                placeholder="Nhập mã khách hàng"
                v-model="form.maKhachHang"
                @blur="validateMaKhachHang"
                :readonly="!!maKhachHang"
              />
            </div>
            <div v-if="errors.maKhachHang" class="invalid-feedback d-block">
              {{ errors.maKhachHang }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.hoTen }"
              placeholder="Nhập họ và tên"
              v-model="form.hoTen"
              @blur="validateHoTen"
            />
            <div v-if="errors.hoTen" class="invalid-feedback d-block">
              {{ errors.hoTen }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.sdt }"
              placeholder="Nhập số điện thoại"
              v-model="form.sdt"
              @blur="validateSDT"
            />
            <div v-if="errors.sdt" class="invalid-feedback d-block">
              {{ errors.sdt }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Địa chỉ chi tiết <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.diaChi }"
              placeholder="Nhập địa chỉ chi tiết"
              v-model="form.diaChi"
              @blur="validateDiaChi"
            />
            <div v-if="errors.diaChi" class="invalid-feedback d-block">
              {{ errors.diaChi }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Xã/Phường</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nhập xã/phường"
              v-model="form.xa"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label">Tỉnh/Thành phố</label>
            <input
              type="text"
              class="form-control"
              placeholder="Nhập tỉnh/thành phố"
              v-model="form.tinh"
            />
          </div>

          <div class="col-md-12">
            <label class="form-label me-3">Trạng thái</label>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="macDinh"
                :value="true"
                v-model="form.macDinh"
              />
              <label class="form-check-label" for="macDinh">Mặc Định</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="khongMacDinh"
                :value="false"
                v-model="form.macDinh"
              />
              <label class="form-check-label" for="khongMacDinh">Không Mặc Định</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-between align-items-center mb-4 py-3">
      <div class="d-flex justify-content-center gap-3 mx-auto" style="width: 300px">
        <button class="btn btn-primary" @click="handleSave">
          <i class="fas fa-save me-1"></i> Lưu
        </button>
        <button class="btn btn-success" @click="handleReset">
          <i class="fas fa-plus me-1"></i> Thêm mới
        </button>
        <button class="btn btn-secondary" @click="$emit('close')">
          <i class="fas fa-times me-1"></i> Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DiaChiService from '@/service/taikhoan/diaChiService'

export default {
  name: 'DiaChiForm',
  props: {
    maKhachHang: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        maKhachHang: '',
        hoTen: '',
        sdt: '',
        diaChi: '',
        xa: '',
        tinh: '',
        macDinh: false,
      },
      errors: {},
    }
  },
  mounted() {
    if (this.maKhachHang) {
      this.form.maKhachHang = this.maKhachHang
    }
  },
  watch: {
    maKhachHang(newVal) {
      if (newVal) {
        this.form.maKhachHang = newVal
      }
    },
  },
  methods: {
    validateMaKhachHang() {
      if (!this.form.maKhachHang || this.form.maKhachHang.trim() === '') {
        this.errors.maKhachHang = 'Mã khách hàng không được để trống'
        return false
      }
      delete this.errors.maKhachHang
      return true
    },
    validateHoTen() {
      if (!this.form.hoTen || this.form.hoTen.trim() === '') {
        this.errors.hoTen = 'Họ và tên không được để trống'
        return false
      }
      delete this.errors.hoTen
      return true
    },
    validateSDT() {
      if (!this.form.sdt || this.form.sdt.trim() === '') {
        this.errors.sdt = 'Số điện thoại không được để trống'
        return false
      }
      if (!/^[0-9]{10,11}$/.test(this.form.sdt)) {
        this.errors.sdt = 'Số điện thoại không hợp lệ'
        return false
      }
      delete this.errors.sdt
      return true
    },
    validateDiaChi() {
      if (!this.form.diaChi || this.form.diaChi.trim() === '') {
        this.errors.diaChi = 'Địa chỉ không được để trống'
        return false
      }
      delete this.errors.diaChi
      return true
    },
    validateForm() {
      let isValid = true
      isValid = this.validateMaKhachHang() && isValid
      isValid = this.validateHoTen() && isValid
      isValid = this.validateSDT() && isValid
      isValid = this.validateDiaChi() && isValid
      return isValid
    },
    handleReset() {
      this.form = {
        maKhachHang: '',
        hoTen: '',
        sdt: '',
        diaChi: '',
        xa: '',
        tinh: '',
        macDinh: false,
      }
      this.errors = {}
    },
    async handleSave() {
      if (!this.validateForm()) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      try {
        await DiaChiService.addDiaChi(this.form)

        alert('Thêm địa chỉ thành công!')
        this.handleReset()
        this.$emit('success')
      } catch (error) {
        console.error('Error adding dia chi:', error)
        alert('Có lỗi xảy ra khi thêm địa chỉ: ' + (error.response?.data?.message || error.message))
      }
    },
  },
}
</script>

<style scoped>
.customer-detail {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
