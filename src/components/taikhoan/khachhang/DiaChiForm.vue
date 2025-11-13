<template>
  <div class="customer-detail">
    <!-- 🔸 Breadcrumb -->
    <div class="card mb-2">
      <div class="card-body py-2">
        <h6 class="fw-bold text-success mb-0">Thêm Địa Chỉ</h6>
      </div>
    </div>

    <!-- 🔸 Form Địa Chỉ -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label">Mã khách hàng <span class="text-danger">*</span></label>
            <div class="input-group">
              <input
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.maKhachHang }"
                placeholder="Nhập mã khách hàng"
                v-model="form.maKhachHang"
                @blur="handleMaKhachHangBlur"
                @input="handleMaKhachHangChange"
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
              class="form-control form-control-sm"
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
              class="form-control form-control-sm"
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
            <label class="form-label">Địa chỉ chi tiết</label>
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Nhập địa chỉ chi tiết"
              v-model="form.diaChi"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label">Tỉnh/Thành phố</label>
            <div class="position-relative">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Chọn hoặc tìm kiếm tỉnh/thành phố"
                v-model="searchTinh"
                @input="filterTinhList"
                @focus="showTinhDropdown = true"
                @blur="handleBlurTinh"
                autocomplete="off"
              />
              <ul
                v-if="showTinhDropdown && filteredTinhList.length > 0"
                class="list-group position-absolute w-100 mt-1"
                style="z-index: 1000; max-height: 200px; overflow-y: auto"
              >
                <li
                  v-for="tinh in filteredTinhList"
                  :key="tinh.id"
                  class="list-group-item list-group-item-action"
                  @click="selectTinh(tinh)"
                  style="cursor: pointer"
                >
                  {{ tinh.name }}
                </li>
              </ul>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Xã/Phường</label>
            <div class="position-relative">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Chọn hoặc tìm kiếm xã/phường"
                :disabled="!form.tinhId"
                v-model="searchXa"
                @input="filterXaList"
                @focus="showXaDropdown = true"
                @blur="handleBlurXa"
                autocomplete="off"
              />
              <ul
                v-if="showXaDropdown && filteredXaList.length > 0 && form.tinhId"
                class="list-group position-absolute w-100 mt-1"
                style="z-index: 1000; max-height: 200px; overflow-y: auto"
              >
                <li
                  v-for="xa in filteredXaList"
                  :key="xa.id"
                  class="list-group-item list-group-item-action"
                  @click="selectXa(xa)"
                  style="cursor: pointer"
                >
                  {{ xa.name }}
                </li>
              </ul>
              <div v-if="!form.tinhId" class="form-text text-muted">
                Vui lòng chọn tỉnh/thành phố trước
              </div>
            </div>
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
    <div class="d-flex justify-content-between align-items-center mb-2 py-2">
      <div class="d-flex justify-content-center gap-2 mx-auto">
        <button class="btn btn-primary btn-sm" @click="handleSave">
          <i class="fas fa-save me-1"></i> Lưu
        </button>
        <button class="btn btn-success btn-sm" @click="handleReset">
          <i class="fas fa-plus me-1"></i> Thêm mới
        </button>
        <button class="btn btn-secondary btn-sm" @click="$emit('close')">
          <i class="fas fa-times me-1"></i> Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DiaChiService from '@/service/taikhoan/diaChiService'
import XaPhuongService from '@/service/taikhoan/xaPhuongService'
import KhachHangService from '@/service/taikhoan/khachHangService'

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
        tinhId: null,
        xaId: null,
        macDinh: false,
      },
      errors: {},
      // Tỉnh/Thành phố
      tinhList: [],
      filteredTinhList: [],
      searchTinh: '',
      showTinhDropdown: false,
      selectedTinh: null,
      // Xã/Phường
      xaList: [],
      filteredXaList: [],
      searchXa: '',
      showXaDropdown: false,
      selectedXa: null,
    }
  },
  async mounted() {
    if (this.maKhachHang) {
      this.form.maKhachHang = this.maKhachHang
      // Tự động load thông tin khách hàng nếu đã có mã
      await this.loadCustomerInfo()
    }
    this.loadTinhList()
  },
  watch: {
    async maKhachHang(newVal) {
      if (newVal) {
        this.form.maKhachHang = newVal
        // Tự động load thông tin khách hàng khi props thay đổi
        await this.loadCustomerInfo()
      }
    },
  },
  methods: {
    async handleMaKhachHangChange() {
      // Reset thông tin khi mã khách hàng thay đổi
      if (!this.form.maKhachHang || this.form.maKhachHang.trim() === '') {
        this.form.hoTen = ''
        this.form.sdt = ''
      }
    },
    async handleMaKhachHangBlur() {
      // Validate mã khách hàng
      if (!this.validateMaKhachHang()) {
        return
      }

      // Tự động load thông tin khách hàng
      if (this.form.maKhachHang && this.form.maKhachHang.trim() !== '') {
        await this.loadCustomerInfo()
      }
    },
    /**
     * Load thông tin khách hàng theo mã khách hàng
     * Nếu tìm thấy: tự động điền thông tin họ tên và số điện thoại
     * Nếu không tìm thấy: hiển thị thông báo và cho phép người dùng nhập thủ công
     */
    async loadCustomerInfo() {
      try {
        // Gọi API để lấy thông tin khách hàng theo mã
        const response = await KhachHangService.getByMaKhachHang(this.form.maKhachHang)
        const customer = response.data

        // Kiểm tra nếu có dữ liệu khách hàng
        if (customer) {
          // Tự động điền thông tin khách hàng vào form (người dùng vẫn có thể sửa)
          this.form.hoTen = customer.hoTen || ''
          this.form.sdt = customer.soDienThoai || ''
          
          // Xóa lỗi mã khách hàng nếu có
          delete this.errors.maKhachHang
        }
      } catch (error) {
        // Xử lý lỗi khi không tìm thấy khách hàng
        console.error('Error loading customer info:', error)
        
        // Kiểm tra nếu lỗi là từ backend (NOT_FOUND)
        if (error.response && error.response.data) {
          const errorData = error.response.data
          
          // Nếu lỗi là "NOT_FOUND" (khách hàng không tồn tại)
          if (errorData.code === 'NOT_FOUND') {
            // Hiển thị thông báo lỗi cho người dùng
            this.errors.maKhachHang = errorData.message || 'Khách hàng không tồn tại. Vui lòng kiểm tra lại mã khách hàng hoặc nhập thông tin thủ công.'
            
            // Reset thông tin khách hàng để người dùng có thể nhập thủ công
            this.form.hoTen = ''
            this.form.sdt = ''
          } else {
            // Xử lý các lỗi khác
            this.errors.maKhachHang = errorData.message || 'Có lỗi xảy ra khi tải thông tin khách hàng'
          }
        } else {
          // Lỗi không có response (network error, etc.)
          console.log('Không tìm thấy khách hàng với mã:', this.form.maKhachHang)
          this.errors.maKhachHang = 'Không thể kết nối đến server. Vui lòng thử lại sau.'
        }
      }
    },
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
    validateTinh() {
      if (!this.form.tinhId) {
        this.errors.tinh = 'Vui lòng chọn tỉnh/thành phố'
        return false
      }
      delete this.errors.tinh
      return true
    },
    validateForm() {
      let isValid = true
      isValid = this.validateMaKhachHang() && isValid
      isValid = this.validateHoTen() && isValid
      isValid = this.validateSDT() && isValid
      // Địa chỉ chi tiết và Tỉnh/Thành phố không bắt buộc
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
        tinhId: null,
        xaId: null,
        macDinh: false,
      }
      this.errors = {}
      this.searchTinh = ''
      this.searchXa = ''
      this.selectedTinh = null
      this.selectedXa = null
      this.xaList = []
      this.filteredTinhList = this.tinhList
      this.filteredXaList = []
    },
    /**
     * Xử lý lưu địa chỉ mới
     * Validate form trước khi lưu
     * Hiển thị thông báo lỗi chi tiết nếu có
     */
    async handleSave() {
      // Validate form trước khi lưu
      if (!this.validateForm()) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      try {
        // Gọi API để thêm địa chỉ mới
        await DiaChiService.addDiaChi(this.form)

        // Hiển thị thông báo thành công
        alert('Thêm địa chỉ thành công!')
        
        // Reset form và emit event success để parent component cập nhật
        this.handleReset()
        this.$emit('success')
      } catch (error) {
        // Xử lý lỗi khi thêm địa chỉ
        console.error('Error adding dia chi:', error)
        
        // Kiểm tra nếu lỗi là từ backend
        if (error.response && error.response.data) {
          const errorData = error.response.data
          
          // Nếu lỗi là "NOT_FOUND" (khách hàng không tồn tại)
          if (errorData.code === 'NOT_FOUND') {
            // Hiển thị lỗi ở trường mã khách hàng
            this.errors.maKhachHang = errorData.message || 'Khách hàng không tồn tại'
            alert('Lỗi: ' + errorData.message)
          } else if (errorData.code === 'VALIDATION_ERROR') {
            // Xử lý lỗi validate
            alert('Lỗi validate: ' + JSON.stringify(errorData.errors))
          } else {
            // Xử lý các lỗi khác
            alert('Có lỗi xảy ra khi thêm địa chỉ: ' + (errorData.message || error.message))
          }
        } else {
          // Lỗi không có response (network error, etc.)
          alert('Có lỗi xảy ra khi thêm địa chỉ: ' + (error.message || 'Lỗi không xác định'))
        }
      }
    },
    // Load danh sách tỉnh/thành phố
    async loadTinhList() {
      try {
        const response = await XaPhuongService.getAllTinh()
        this.tinhList = response.data
        this.filteredTinhList = this.tinhList
      } catch (error) {
        console.error('Error loading tinh list:', error)
      }
    },
    // Filter tỉnh list khi search
    filterTinhList() {
      const searchTerm = this.searchTinh.toLowerCase()
      this.filteredTinhList = this.tinhList.filter((tinh) =>
        tinh.name.toLowerCase().includes(searchTerm),
      )
    },
    // Select tỉnh
    async selectTinh(tinh) {
      this.selectedTinh = tinh
      this.form.tinh = tinh.name
      this.form.tinhId = tinh.id
      this.searchTinh = tinh.name
      this.showTinhDropdown = false
      // Load danh sách xã/phường của tỉnh này
      await this.loadXaList(tinh.id)
      // Reset xã/phường
      this.form.xa = ''
      this.form.xaId = null
      this.searchXa = ''
      this.selectedXa = null
    },
    // Handle blur tỉnh
    handleBlurTinh() {
      setTimeout(() => {
        this.showTinhDropdown = false
      }, 200)
    },
    // Load danh sách xã/phường theo tỉnh
    async loadXaList(tinhId) {
      try {
        const response = await XaPhuongService.getXaPhuongByTinh(tinhId)
        this.xaList = response.data
        this.filteredXaList = this.xaList
      } catch (error) {
        console.error('Error loading xa list:', error)
        this.xaList = []
        this.filteredXaList = []
      }
    },
    // Filter xã list khi search
    filterXaList() {
      const searchTerm = this.searchXa.toLowerCase()
      this.filteredXaList = this.xaList.filter((xa) => xa.name.toLowerCase().includes(searchTerm))
    },
    // Select xã
    selectXa(xa) {
      this.selectedXa = xa
      this.form.xa = xa.name
      this.form.xaId = xa.id
      this.searchXa = xa.name
      this.showXaDropdown = false
    },
    // Handle blur xã
    handleBlurXa() {
      setTimeout(() => {
        this.showXaDropdown = false
      }, 200)
    },
  },
}
</script>

<style scoped>
.customer-detail {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  border-radius: 8px;
}

.form-label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}
</style>
