<template>
  <div class="customer-detail">
    <!-- 🔸 Breadcrumb -->
    <div class="card mb-3">
      <div class="card-body py-2">
        <h5 class="fw-bold text-success mb-1">Thêm Khách Hàng</h5>
        <nav style="--bs-breadcrumb-divider: '/'; font-size: 14px">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="$emit('back')">Trang chủ</a>
            </li>
            <li class="breadcrumb-item">Khách hàng</li>
            <li class="breadcrumb-item active">Form khách hàng</li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- 🔸 Form Khách Hàng -->
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
              />
              <button
                class="btn btn-outline-success"
                type="button"
                @click="generateCustomerCode"
                :disabled="isGeneratingCode"
              >
                <i class="fas fa-magic me-1" v-if="!isGeneratingCode"></i>
                <i class="fas fa-spinner fa-spin me-1" v-if="isGeneratingCode"></i>
                {{ isGeneratingCode ? 'Đang tạo...' : 'Gợi ý' }}
              </button>
            </div>
            <div v-if="errors.maKhachHang" class="invalid-feedback d-block">
              {{ errors.maKhachHang }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Tên khách hàng <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.hoTen }"
              placeholder="Nhập tên khách hàng"
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
              :class="{ 'is-invalid': errors.soDienThoai }"
              placeholder="Nhập số điện thoại"
              v-model="form.soDienThoai"
              @blur="validateSoDienThoai"
            />
            <div v-if="errors.soDienThoai" class="invalid-feedback d-block">
              {{ errors.soDienThoai }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Nhập email"
              v-model="form.email"
              @blur="validateEmail"
            />
            <div v-if="errors.email" class="invalid-feedback d-block">
              {{ errors.email }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input type="date" class="form-control" v-model="form.ngaySinh" />
          </div>

          <div class="col-md-12">
            <label class="form-label me-3">Giới tính</label>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="nam"
                :value="1"
                v-model="form.gioiTinh"
              />
              <label class="form-check-label" for="nam">Nam</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="nu"
                :value="0"
                v-model="form.gioiTinh"
              />
              <label class="form-check-label" for="nu">Nữ</label>
            </div>
          </div>
        </div>

        <!-- Checkbox tạo tài khoản -->
        <div class="row g-3 mb-3">
          <div class="col-md-12">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                id="createTaiKhoan"
                v-model="form.createTaiKhoan"
              />
              <label class="form-check-label" for="createTaiKhoan">
                <strong>Tạo tài khoản cho khách hàng này</strong>
              </label>
            </div>
          </div>
        </div>

        <!-- Form tài khoản (hiển thị khi checkbox được checked) -->
        <div v-if="form.createTaiKhoan" class="account-section">
          <h6 class="fw-bold mb-3">
            <i class="fas fa-user-lock me-1 text-success"></i>
            Thông tin tài khoản
          </h6>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label">Tên đăng nhập <span class="text-danger">*</span></label>
              <input
                v-model="form.tenDangNhap"
                type="text"
                class="form-control"
                placeholder="Nhập tên đăng nhập (mặc định: SĐT)"
              />
              <small class="text-muted">Để trống sẽ dùng số điện thoại làm tên đăng nhập</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
              <div class="input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.matKhau"
                  class="form-control"
                  placeholder="Nhập mật khẩu (mặc định: 123456)"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <small class="text-muted">Để trống sẽ dùng mật khẩu mặc định: 123456</small>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label">Email tài khoản</label>
              <input
                v-model="form.emailTaiKhoan"
                type="email"
                class="form-control"
                placeholder="Nhập email (mặc định: email khách hàng)"
              />
              <small class="text-muted">Để trống sẽ dùng email của khách hàng</small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Vai trò <span class="text-danger">*</span></label>
              <select v-model="form.maVaiTro" class="form-control" required disabled>
                <option v-for="vaiTro in vaiTroList" :key="vaiTro.id" :value="vaiTro.id">
                  {{ vaiTro.tenVaiTro }}
                </option>
              </select>
              <small class="text-muted">Vai trò mặc định: Khách hàng (không thể thay đổi)</small>
            </div>
          </div>
        </div>

        <!-- Ghi chú về trường bắt buộc -->
        <div class="mt-3">
          <small class="required-note">
            <i class="fas fa-info-circle me-1"></i>
            Các trường có dấu <span class="text-danger">*</span> là bắt buộc phải nhập
          </small>
        </div>
      </div>
    </div>

    <!--  Địa chỉ -->
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
                  <i class="fas fa-map-marker-alt me-2"></i>{{ address.diaChi }}
                </div>
                <div v-if="address.xa || address.tinh" class="text-muted small">
                  {{ [address.xa, address.tinh].filter(Boolean).join(', ') }}
                </div>
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-danger" @click="deleteAddress(address.id)">
                  <i class="fas fa-trash me-1"></i> Xóa
                </button>
              </div>
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
        <button class="btn btn-success" @click="handleSaveAndNew">
          <i class="fas fa-plus me-1"></i> Thêm mới
        </button>
        <button class="btn btn-secondary" @click="$emit('close')">
          <i class="fas fa-times me-1"></i> Đóng
        </button>
      </div>
    </div>

    <!-- Modal thêm địa chỉ -->
    <div
      class="modal fade"
      :class="{ 'show d-block': showAddressModal }"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm Địa Chỉ</h5>
            <button type="button" class="btn-close" @click="closeAddressModal"></button>
          </div>
          <div class="modal-body">
            <DiaChiForm
              :maKhachHang="form.maKhachHang"
              :customerInfo="savedCustomer"
              @close="closeAddressModal"
              @success="handleAddressSuccess"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal hiển thị thông tin đăng nhập -->
    <LoginInfoModal
      v-if="showLoginInfoModal && loginInfo && loginInfo.tenDangNhap"
      :login-info="loginInfo"
      @close="handleCloseLoginInfo"
    />
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

.text-danger {
  font-weight: bold;
  font-size: 1.1em;
}

.required-note {
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
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

/* Account section styling */
.account-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  border: 2px solid #e5e7eb;
}

.account-section h6 {
  color: #2d7458;
  margin-bottom: 16px;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.form-check:hover {
  border-color: #2d7458;
  background: #f0fdf4;
}

.form-check-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #2d7458;
}

.form-check-label {
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  margin: 0;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group .form-control {
  flex: 1;
}

.input-group .btn {
  padding: 12px 16px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  transition: all 0.2s ease;
}

.input-group .btn:hover {
  border-color: #2d7458;
  color: #2d7458;
  background: #f0fdf4;
}

.text-muted {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}
</style>
<script>
import khachHangService from '@/service/taikhoan/khachHangService'
import DiaChiService from '@/service/taikhoan/diaChiService'
import vaiTroService from '@/service/taikhoan/vaiTroService'
import DiaChiForm from './DiaChiForm.vue'
import LoginInfoModal from '../nhanvien/LoginInfoModal.vue'
import { useToast } from '@/composables/common/useToast'
import { useConfirm } from '@/composables/common/useConfirm'

export default {
  name: 'KhachHangForm',
  components: {
    DiaChiForm,
    LoginInfoModal,
  },
  data() {
    return {
      form: {
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        trangThai: 0,
        // Thông tin tài khoản
        createTaiKhoan: false,
        tenDangNhap: '',
        matKhau: '',
        emailTaiKhoan: '',
        maVaiTro: null,
      },
      isGeneratingCode: false,
      showAddressModal: false,
      showLoginInfoModal: false,
      showPassword: false,
      vaiTroList: [],
      loginInfo: {
        tenDangNhap: '',
        matKhau: '',
      },
      addressList: [],
      savedCustomer: null, // Lưu thông tin khách hàng đã được lưu vào DB
      errors: {
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
      },
    }
  },
  async created() {
    // Khởi tạo toast và confirm composables
    const { success: showSuccess, error: showError, warning: showWarning } = useToast()
    const { showConfirm } = useConfirm()

    // Lưu vào this để sử dụng trong methods
    this.showSuccess = showSuccess
    this.showError = showError
    this.showWarning = showWarning
    this.showConfirm = showConfirm

    // Load danh sách vai trò - chỉ lấy KHACH_HANG cho khách hàng
    try {
      const response = await vaiTroService.getAllVaiTro()
      const allVaiTro = response?.data || response || []
      // Chỉ lấy vai trò KHACH_HANG cho khách hàng
      const khachHangRole = allVaiTro.find((vt) => {
        const maVaiTro = vt.maVaiTro || vt.ma_vai_tro
        return maVaiTro === 'KHACH_HANG'
      })
      if (khachHangRole) {
        // Chỉ hiển thị vai trò KHACH_HANG
        this.vaiTroList = [khachHangRole]
        this.form.maVaiTro = khachHangRole.id
      } else {
        console.error('Không tìm thấy vai trò KHACH_HANG')
        this.vaiTroList = []
      }
    } catch (e) {
      console.error('Lỗi tải danh sách vai trò:', e)
      this.vaiTroList = []
    }
  },
  watch: {
    'form.maKhachHang'(newVal) {
      if (newVal && newVal.trim() !== '') {
        this.fetchAddresses()
      } else {
        this.addressList = []
      }
    },
    'form.createTaiKhoan'(isChecked) {
      // Kiểm tra component vẫn còn mounted
      if (!this || !this.$el) return

      if (isChecked && this.vaiTroList && this.vaiTroList.length > 0) {
        // Tự động set vai trò KHACH_HANG khi checkbox được check
        const khachHangRole = this.vaiTroList.find((vt) => {
          const maVaiTro = vt.maVaiTro || vt.ma_vai_tro
          return maVaiTro === 'KHACH_HANG'
        })
        if (khachHangRole && this.form && !this.form.maVaiTro) {
          this.form.maVaiTro = khachHangRole.id
        }
      }
    },
  },
  methods: {
    async handleSave() {
      // Validate form trước khi submit
      if (!this.validateForm()) {
        this.showWarning('Vui lòng kiểm tra lại thông tin đã nhập')
        return
      }

      try {
        // Validate thông tin tài khoản nếu có chọn tạo tài khoản
        if (this.form.createTaiKhoan) {
          // Nếu có nhập tên đăng nhập, validate
          if (this.form.tenDangNhap && this.form.tenDangNhap.trim().length < 3) {
            this.showWarning('Tên đăng nhập phải có ít nhất 3 ký tự')
            return
          }
          // Nếu có nhập mật khẩu, validate
          if (this.form.matKhau && this.form.matKhau.trim().length < 6) {
            this.showWarning('Mật khẩu phải có ít nhất 6 ký tự')
            return
          }
        }

        // Chuẩn hóa dữ liệu: convert empty string thành null cho các trường optional
        const payload = {
          maKhachHang: this.form.maKhachHang.trim(),
          hoTen: this.form.hoTen.trim(),
          soDienThoai: this.form.soDienThoai.trim(),
          email: this.form.email && this.form.email.trim() ? this.form.email.trim() : null,
          gioiTinh: this.form.gioiTinh,
          ngaySinh: this.form.ngaySinh && this.form.ngaySinh.trim() ? this.form.ngaySinh : null,
          trangThai: this.form.trangThai,
        }

        // Thêm thông tin tài khoản nếu có chọn tạo
        if (this.form.createTaiKhoan) {
          payload.createTaiKhoan = true
          if (this.form.tenDangNhap && this.form.tenDangNhap.trim()) {
            payload.tenDangNhap = this.form.tenDangNhap.trim()
          }
          if (this.form.matKhau && this.form.matKhau.trim()) {
            payload.matKhau = this.form.matKhau.trim()
          }
          // Email tài khoản: nếu có thì dùng, không thì dùng email khách hàng
          // Backend sẽ dùng email từ request cho tài khoản
          if (this.form.emailTaiKhoan && this.form.emailTaiKhoan.trim()) {
            // Không ghi đè email khách hàng, backend sẽ xử lý
            // Ta sẽ gửi email tài khoản riêng nếu cần
          }
          if (this.form.maVaiTro) {
            payload.maVaiTro = this.form.maVaiTro
          }
        } else {
          payload.createTaiKhoan = false
        }

        const response = await khachHangService.addKhachHang(payload)
        const responseData = response?.data || response

        // Backend có thể không trả về dữ liệu khách hàng, nên tạo object từ payload
        // Hoặc merge dữ liệu từ response nếu có
        const newCustomer = {
          ...payload,
          ...responseData,
          // Đảm bảo có đầy đủ các field cần thiết
          maKhachHang: responseData?.maKhachHang || payload.maKhachHang,
          hoTen: responseData?.hoTen || payload.hoTen,
          soDienThoai: responseData?.soDienThoai || payload.soDienThoai,
          email: responseData?.email || payload.email,
          diemTichLuy: responseData?.diemTichLuy || 0,
        }

        // Nếu response không có id, thử lấy lại thông tin khách hàng từ backend bằng maKhachHang
        if (!newCustomer.id && newCustomer.maKhachHang) {
          try {
            // Đợi một chút để đảm bảo transaction đã commit
            await new Promise((resolve) => setTimeout(resolve, 300))
            const customerInfo = await khachHangService.getByMaKhachHang(newCustomer.maKhachHang)
            const customerData = customerInfo?.data || customerInfo
            if (customerData) {
              // Merge thông tin từ backend vào newCustomer
              Object.assign(newCustomer, customerData)
            }
          } catch (error) {
            console.warn('Không thể lấy lại thông tin khách hàng từ backend:', error)
            // Vẫn tiếp tục với dữ liệu từ payload
          }
        }

        // Nếu có địa chỉ trong danh sách, thêm địa chỉ sau khi thêm khách hàng thành công
        if (this.addressList.length > 0) {
          // Đợi một chút để đảm bảo transaction đã commit
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Thêm từng địa chỉ
          for (const address of this.addressList) {
            try {
              await DiaChiService.addDiaChi({
                maKhachHang: newCustomer.maKhachHang || payload.maKhachHang,
                hoTen: address.hoTen || newCustomer.hoTen,
                sdt: address.sdt || newCustomer.soDienThoai,
                diaChi: address.diaChi || '',
                xa: address.xa || '',
                tinh: address.tinh || '',
                macDinh: address.macDinh || false,
              })
            } catch (error) {
              console.error('Lỗi khi thêm địa chỉ:', error)
              // Không dừng quá trình nếu thêm địa chỉ lỗi
            }
          }
        }

        // Lưu thông tin khách hàng đã được lưu
        this.savedCustomer = newCustomer

        // Kiểm tra xem response có chứa thông tin đăng nhập không
        // responseData đã được khai báo ở trên, chỉ kiểm tra login info
        if (responseData && responseData.tenDangNhap && responseData.matKhau) {
          this.loginInfo = {
            tenDangNhap: responseData.tenDangNhap,
            matKhau: responseData.matKhau,
          }
          this.showLoginInfoModal = true
        } else {
          this.showSuccess('Thêm khách hàng thành công!')
          this.$emit('success', newCustomer) // emit dữ liệu khách hàng mới
          this.$emit('close') // đóng form
        }
      } catch (error) {
        console.error(error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Lỗi khi thêm khách hàng'
        this.showError(errorMessage)
      }
    },
    async handleSaveAndNew() {
      // Validate form trước khi submit
      if (!this.validateForm()) {
        this.showWarning('Vui lòng kiểm tra lại thông tin đã nhập')
        return
      }

      try {
        // Validate thông tin tài khoản nếu có chọn tạo tài khoản
        if (this.form.createTaiKhoan) {
          // Nếu có nhập tên đăng nhập, validate
          if (this.form.tenDangNhap && this.form.tenDangNhap.trim().length < 3) {
            this.showWarning('Tên đăng nhập phải có ít nhất 3 ký tự')
            return
          }
          // Nếu có nhập mật khẩu, validate
          if (this.form.matKhau && this.form.matKhau.trim().length < 6) {
            this.showWarning('Mật khẩu phải có ít nhất 6 ký tự')
            return
          }
        }

        // Chuẩn hóa dữ liệu: convert empty string thành null cho các trường optional
        const payload = {
          maKhachHang: this.form.maKhachHang.trim(),
          hoTen: this.form.hoTen.trim(),
          soDienThoai: this.form.soDienThoai.trim(),
          email: this.form.email && this.form.email.trim() ? this.form.email.trim() : null,
          gioiTinh: this.form.gioiTinh,
          ngaySinh: this.form.ngaySinh && this.form.ngaySinh.trim() ? this.form.ngaySinh : null,
          trangThai: this.form.trangThai,
        }

        // Thêm thông tin tài khoản nếu có chọn tạo
        if (this.form.createTaiKhoan) {
          payload.createTaiKhoan = true
          if (this.form.tenDangNhap && this.form.tenDangNhap.trim()) {
            payload.tenDangNhap = this.form.tenDangNhap.trim()
          }
          if (this.form.matKhau && this.form.matKhau.trim()) {
            payload.matKhau = this.form.matKhau.trim()
          }
          // Email tài khoản: nếu có thì dùng, không thì dùng email khách hàng
          if (this.form.emailTaiKhoan && this.form.emailTaiKhoan.trim()) {
            // Không ghi đè email khách hàng, backend sẽ xử lý
          }
          if (this.form.maVaiTro) {
            payload.maVaiTro = this.form.maVaiTro
          }
        } else {
          payload.createTaiKhoan = false
        }

        const response = await khachHangService.addKhachHang(payload)
        const responseData = response?.data || response

        // Kiểm tra xem response có chứa thông tin đăng nhập không
        if (responseData && responseData.tenDangNhap && responseData.matKhau) {
          this.loginInfo = {
            tenDangNhap: responseData.tenDangNhap,
            matKhau: responseData.matKhau,
          }
          this.showLoginInfoModal = true
          // Không reset form khi có modal login info
        } else {
          const newCustomer = responseData
          this.showSuccess('Thêm khách hàng thành công!')
          this.$emit('success', newCustomer) // emit dữ liệu khách hàng mới
          this.resetForm()
        }
      } catch (error) {
        console.error(error)
        const errorMessage =
          error.response?.data?.message || error.message || 'Lỗi khi thêm khách hàng'
        this.showError(errorMessage)
      }
    },
    resetForm() {
      this.form = {
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
        gioiTinh: 0,
        ngaySinh: '',
        trangThai: 0,
        // Thông tin tài khoản
        createTaiKhoan: false,
        tenDangNhap: '',
        matKhau: '',
        emailTaiKhoan: '',
        maVaiTro: null,
      }
      // Clear all validation errors
      this.errors = {
        maKhachHang: '',
        hoTen: '',
        soDienThoai: '',
        email: '',
      }
      // Reset saved customer
      this.savedCustomer = null
      // Reset address list
      this.addressList = []
      // Reset login info modal
      this.showLoginInfoModal = false
      this.loginInfo = {
        tenDangNhap: '',
        matKhau: '',
      }
    },
    handleCloseLoginInfo() {
      this.showLoginInfoModal = false
      this.showSuccess('Thêm khách hàng thành công!')
      this.$emit('success', this.savedCustomer)
      this.$emit('close')
    },
    async generateCustomerCode() {
      try {
        this.isGeneratingCode = true
        const response = await khachHangService.generateCode()
        this.form.maKhachHang = response.data
        // Clear error khi tạo mã thành công
        this.errors.maKhachHang = ''
        // Hiển thị thông báo thành công
        this.showSuccess('Đã tạo mã khách hàng tự động!')
      } catch (error) {
        console.error('Lỗi khi tạo mã khách hàng:', error)
        this.showError('Lỗi khi tạo mã khách hàng')
      } finally {
        this.isGeneratingCode = false
      }
    },
    // Validation methods
    validateMaKhachHang() {
      if (!this.form.maKhachHang || this.form.maKhachHang.trim() === '') {
        this.errors.maKhachHang = 'Mã không để trống'
        return false
      }
      this.errors.maKhachHang = ''
      return true
    },
    validateHoTen() {
      if (!this.form.hoTen || this.form.hoTen.trim() === '') {
        this.errors.hoTen = 'Họ tên khách hàng không để trống'
        return false
      }
      this.errors.hoTen = ''
      return true
    },
    validateSoDienThoai() {
      if (!this.form.soDienThoai || this.form.soDienThoai.trim() === '') {
        this.errors.soDienThoai = 'Số điện thoại không để trống'
        return false
      }
      // Kiểm tra pattern: bắt đầu bằng 0 và có đúng 10 chữ số
      const phonePattern = /^0\d{9}$/
      if (!phonePattern.test(this.form.soDienThoai)) {
        this.errors.soDienThoai = 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số'
        return false
      }
      this.errors.soDienThoai = ''
      return true
    },
    validateEmail() {
      if (this.form.email && this.form.email.trim() !== '') {
        // Kiểm tra định dạng email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(this.form.email)) {
          this.errors.email =
            'Email không hợp lệ, vui lòng nhập đúng định dạng (ví dụ: ten@gmail.com)'
          return false
        }
      }
      this.errors.email = ''
      return true
    },
    validateForm() {
      const isValidMaKhachHang = this.validateMaKhachHang()
      const isValidHoTen = this.validateHoTen()
      const isValidSoDienThoai = this.validateSoDienThoai()
      const isValidEmail = this.validateEmail()

      return isValidMaKhachHang && isValidHoTen && isValidSoDienThoai && isValidEmail
    },
    async showAddAddressModal() {
      // Validate form khách hàng trước
      if (!this.validateForm()) {
        this.showWarning('Vui lòng điền đầy đủ thông tin khách hàng trước khi thêm địa chỉ')
        return
      }

      // Kiểm tra xem khách hàng đã được lưu vào DB chưa
      // Nếu chưa có savedCustomer hoặc mã khách hàng thay đổi, cần lưu khách hàng trước
      const needToSave =
        !this.savedCustomer || this.savedCustomer.maKhachHang !== this.form.maKhachHang

      if (needToSave) {
        try {
          // Chuẩn hóa dữ liệu
          const payload = {
            maKhachHang: this.form.maKhachHang.trim(),
            hoTen: this.form.hoTen.trim(),
            soDienThoai: this.form.soDienThoai.trim(),
            email: this.form.email && this.form.email.trim() ? this.form.email.trim() : null,
            gioiTinh: this.form.gioiTinh,
            ngaySinh: this.form.ngaySinh && this.form.ngaySinh.trim() ? this.form.ngaySinh : null,
            trangThai: this.form.trangThai,
          }

          const response = await khachHangService.addKhachHang(payload)
          const responseData = response?.data || response

          // Tạo object khách hàng đã lưu
          const newCustomer = {
            ...payload,
            ...responseData,
            maKhachHang: responseData?.maKhachHang || payload.maKhachHang,
            hoTen: responseData?.hoTen || payload.hoTen,
            soDienThoai: responseData?.soDienThoai || payload.soDienThoai,
            email: responseData?.email || payload.email,
            diemTichLuy: responseData?.diemTichLuy || 0,
          }

          // Nếu response không có id, thử lấy lại thông tin khách hàng từ backend
          if (!newCustomer.id && newCustomer.maKhachHang) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 300))
              const customerInfo = await khachHangService.getByMaKhachHang(newCustomer.maKhachHang)
              const customerData = customerInfo?.data || customerInfo
              if (customerData) {
                Object.assign(newCustomer, customerData)
              }
            } catch (error) {
              console.warn('Không thể lấy lại thông tin khách hàng từ backend:', error)
            }
          }

          // Lưu thông tin khách hàng đã được lưu
          this.savedCustomer = newCustomer

          // Hiển thị thông báo
          this.showSuccess('Đã lưu thông tin khách hàng!')

          // Mở modal thêm địa chỉ
          this.showAddressModal = true
        } catch (error) {
          console.error(error)
          const errorMessage =
            error.response?.data?.message || error.message || 'Lỗi khi lưu khách hàng'
          this.showError(errorMessage)
        }
      } else {
        // Khách hàng đã được lưu, mở modal luôn
        this.showAddressModal = true
      }
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
      // Sau khi lưu địa chỉ thành công, emit success với thông tin khách hàng để cập nhật vào hóa đơn
      // và đóng form khách hàng để quay lại màn hình bán hàng
      if (this.savedCustomer) {
        this.$emit('success', this.savedCustomer)
      }
      this.$emit('close')
    },
    async deleteAddress(addressId) {
      const confirmed = await this.showConfirm({
        title: 'Xác nhận xóa địa chỉ',
        message: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning',
      })

      if (!confirmed) {
        return
      }

      try {
        await DiaChiService.deleteDiaChi(addressId)
        this.fetchAddresses()
        this.showSuccess('Đã xóa địa chỉ thành công')
      } catch (error) {
        console.error('Error deleting address:', error)
        this.showError('Có lỗi xảy ra khi xóa địa chỉ')
      }
    },
  },
}
</script>
