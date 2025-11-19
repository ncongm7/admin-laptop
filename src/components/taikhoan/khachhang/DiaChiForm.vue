<template>
  <div class="customer-detail">
    <!-- 🔸 Form Địa Chỉ -->
    <div class="card mb-2 border-0 shadow-sm">
      <div class="card-body p-2">
        <div class="row g-2 mb-1">
          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Mã khách hàng <span class="text-danger">*</span></label>
            <div class="input-group input-group-sm">
              <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.maKhachHang }"
                placeholder="Nhập mã khách hàng" v-model="form.maKhachHang" @blur="validateMaKhachHang"
                :readonly="!!maKhachHang" />
            </div>
            <div v-if="errors.maKhachHang" class="invalid-feedback d-block small">
              {{ errors.maKhachHang }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Họ và tên <span class="text-danger">*</span></label>
            <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.hoTen }"
              placeholder="Nhập họ và tên" v-model="form.hoTen" @blur="validateHoTen" />
            <div v-if="errors.hoTen" class="invalid-feedback d-block small">
              {{ errors.hoTen }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Số điện thoại <span class="text-danger">*</span></label>
            <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.sdt }"
              placeholder="Nhập số điện thoại" v-model="form.sdt" @blur="validateSDT" />
            <div v-if="errors.sdt" class="invalid-feedback d-block small">
              {{ errors.sdt }}
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Địa chỉ chi tiết</label>
            <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.diaChi }"
              placeholder="Nhập địa chỉ chi tiết" v-model="form.diaChi" />
            <div v-if="errors.diaChi" class="invalid-feedback d-block small">
              {{ errors.diaChi }}
            </div>
          </div>

          <!-- Dropdown Tỉnh/Thành phố với tìm kiếm - Lấy từ API backend -->
          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Tỉnh/Thành phố</label>
            <!-- Custom searchable dropdown cho tỉnh/thành phố -->
            <div class="position-relative">
              <!-- Input để hiển thị và tìm kiếm -->
              <div class="input-group input-group-sm">
                <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.tinh }"
                  :value="selectedProvinceName" @input="handleProvinceSearch" @focus="showProvinceDropdown = true"
                  @blur="handleProvinceBlur" :disabled="loadingProvinces" placeholder="Chọn tỉnh/thành phố"
                  autocomplete="off" />
                <!-- Icon dropdown -->
                <span class="input-group-text bg-white border-start-0"
                  style="cursor: pointer; pointer-events: none; font-size: 0.875rem">
                  <i class="fas fa-chevron-down" v-if="!showProvinceDropdown"></i>
                  <i class="fas fa-chevron-up" v-else></i>
                </span>
              </div>

              <!-- Dropdown list hiển thị kết quả tìm kiếm (mở xuống phía dưới) -->
              <div v-if="showProvinceDropdown && !loadingProvinces" class="dropdown-menu show w-100 position-absolute"
                style="
                  max-height: 250px;
                  overflow-y: auto;
                  z-index: 9999;
                  top: 100%;
                  margin-top: 2px;
                ">
                <!-- Hiển thị thông báo nếu không có kết quả -->
                <div v-if="filteredProvinces.length === 0" class="dropdown-item text-muted">
                  Không tìm thấy tỉnh/thành phố
                </div>
                <!-- Hiển thị danh sách tỉnh/thành phố đã lọc -->
                <a v-for="province in filteredProvinces" :key="province.id" class="dropdown-item"
                  href="javascript:void(0)" @mousedown.prevent="selectProvince(province)"
                  :class="{ active: form.tinhCode == province.id }">
                  {{ province.name }}
                </a>
              </div>
            </div>

            <!-- Hiển thị lỗi validation nếu có -->
            <div v-if="errors.tinh" class="invalid-feedback d-block small">
              {{ errors.tinh }}
            </div>
            <!-- Hiển thị loading khi đang tải danh sách tỉnh -->
            <div v-if="loadingProvinces" class="text-muted small mt-1" style="font-size: 0.75rem">
              <i class="fas fa-spinner fa-spin"></i> Đang tải...
            </div>
          </div>

          <!-- Dropdown Xã/Phường với tìm kiếm - Lấy từ API backend dựa trên tỉnh đã chọn -->
          <div class="col-12 col-md-6">
            <label class="form-label small mb-1">Xã/Phường</label>
            <!-- Custom searchable dropdown cho xã/phường -->
            <div class="position-relative">
              <!-- Input để hiển thị và tìm kiếm -->
              <div class="input-group input-group-sm">
                <input type="text" class="form-control form-control-sm" :class="{ 'is-invalid': errors.xa }"
                  :value="selectedWardName" @input="handleWardSearch" @focus="handleWardFocus" @blur="handleWardBlur"
                  :disabled="!form.tinhCode || loadingWards"
                  :placeholder="!form.tinhCode ? 'Chọn tỉnh trước' : 'Chọn xã/phường'" autocomplete="off" />
                <!-- Icon dropdown -->
                <span class="input-group-text bg-white border-start-0"
                  style="cursor: pointer; pointer-events: none; font-size: 0.875rem">
                  <i class="fas fa-chevron-down" v-if="!showWardDropdown"></i>
                  <i class="fas fa-chevron-up" v-else></i>
                </span>
              </div>

              <!-- Dropdown list hiển thị kết quả tìm kiếm (mở xuống phía dưới) -->
              <div v-if="showWardDropdown && !loadingWards && form.tinhCode"
                class="dropdown-menu show w-100 position-absolute" style="
                  max-height: 250px;
                  overflow-y: auto;
                  z-index: 9999;
                  top: 100%;
                  margin-top: 2px;
                ">
                <!-- Hiển thị thông báo nếu không có kết quả -->
                <div v-if="filteredWards.length === 0" class="dropdown-item text-muted">
                  Không tìm thấy xã/phường
                </div>
                <!-- Hiển thị danh sách xã/phường đã lọc -->
                <a v-for="ward in filteredWards" :key="ward.id" class="dropdown-item" href="javascript:void(0)"
                  @mousedown.prevent="selectWard(ward)" :class="{ active: form.xaCode == ward.name }">
                  {{ ward.name }}
                </a>
              </div>
            </div>

            <!-- Hiển thị lỗi validation nếu có -->
            <div v-if="errors.xa" class="invalid-feedback d-block small">
              {{ errors.xa }}
            </div>
            <!-- Hiển thị loading khi đang tải danh sách xã/phường -->
            <div v-if="loadingWards" class="text-muted small mt-1" style="font-size: 0.75rem">
              <i class="fas fa-spinner fa-spin"></i> Đang tải...
            </div>
            <!-- Thông báo hướng dẫn (không bắt buộc) -->
            <div v-if="!form.tinhCode && !loadingWards" class="text-muted small mt-1" style="font-size: 0.75rem">
              <i class="fas fa-info-circle"></i> Chọn tỉnh/thành phố trước
            </div>
          </div>

          <div class="col-md-12">
            <label class="form-label me-2 mb-1 d-block">Trạng thái</label>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="macDinh" :value="true" v-model="form.macDinh" />
              <label class="form-check-label" for="macDinh">Mặc Định</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="khongMacDinh" :value="false" v-model="form.macDinh" />
              <label class="form-check-label" for="khongMacDinh">Không Mặc Định</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-center align-items-center mb-2 py-2 gap-2">
      <button class="btn btn-primary btn-sm" @click="handleSave">
        <i class="fas fa-save me-1"></i> Lưu
      </button>
      <button class="btn btn-secondary btn-sm" @click="$emit('close')">
        <i class="fas fa-times me-1"></i> Đóng
      </button>
    </div>
  </div>
</template>

<script>
// Import service để gọi API địa chỉ, tỉnh/thành phố và xã/phường
import DiaChiService from '@/service/taikhoan/diaChiService'
// Import service API miễn phí cho địa chỉ Việt Nam
import VietnamAddressService from '@/service/taikhoan/vietnamAddressService'
// Import service để gọi API khách hàng
import KhachHangService from '@/service/taikhoan/khachHangService'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

export default {
  // Tên component
  name: 'DiaChiForm',
  // Props: nhận mã khách hàng và thông tin khách hàng từ component cha
  props: {
    maKhachHang: {
      type: String,
      default: '',
    },
    customerInfo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      // Form data chứa thông tin địa chỉ
      form: {
        maKhachHang: '',
        hoTen: '',
        sdt: '',
        diaChi: '',
        xa: '', // Tên xã/phường (lưu vào database)
        tinh: '', // Tên tỉnh/thành phố (lưu vào database)
        tinhCode: '', // Mã tỉnh/thành phố (dùng để gọi API lấy xã/phường)
        xaCode: '', // Tên xã/phường đã chọn (dùng để gán vào form.xa)
        macDinh: false,
      },
      // Object chứa các lỗi validation
      errors: {},
      // Danh sách tỉnh/thành phố từ API
      provinces: [],
      // Danh sách xã/phường từ API (dựa trên tỉnh đã chọn)
      wards: [],
      // Trạng thái loading khi tải danh sách tỉnh/thành phố
      loadingProvinces: false,
      // Trạng thái loading khi tải danh sách xã/phường
      loadingWards: false,
      // Trạng thái hiển thị dropdown tỉnh/thành phố
      showProvinceDropdown: false,
      // Trạng thái hiển thị dropdown xã/phường
      showWardDropdown: false,
      // Text tìm kiếm tỉnh/thành phố
      provinceSearchText: '',
      // Text tìm kiếm xã/phường
      wardSearchText: '',
    }
  },
  // Computed properties: tính toán các giá trị dựa trên data
  computed: {
    /**
     * Lọc danh sách tỉnh/thành phố dựa trên text tìm kiếm
     * Tìm kiếm không phân biệt hoa thường
     * @returns {Array} Danh sách tỉnh/thành phố đã lọc
     */
    filteredProvinces() {
      // Nếu không có text tìm kiếm, trả về tất cả tỉnh/thành phố
      if (!this.provinceSearchText.trim()) {
        return this.provinces
      }
      // Lọc tỉnh/thành phố theo text tìm kiếm (không phân biệt hoa thường)
      const searchText = this.provinceSearchText.toLowerCase().trim()
      return this.provinces.filter((province) => province.name.toLowerCase().includes(searchText))
    },

    /**
     * Lọc danh sách xã/phường dựa trên text tìm kiếm
     * Tìm kiếm không phân biệt hoa thường
     * @returns {Array} Danh sách xã/phường đã lọc
     */
    filteredWards() {
      // Nếu không có text tìm kiếm, trả về tất cả xã/phường
      if (!this.wardSearchText.trim()) {
        return this.wards
      }
      // Lọc xã/phường theo text tìm kiếm (không phân biệt hoa thường)
      const searchText = this.wardSearchText.toLowerCase().trim()
      return this.wards.filter((ward) => ward.name.toLowerCase().includes(searchText))
    },

    /**
     * Lấy tên tỉnh/thành phố đã chọn để hiển thị trong input
     * @returns {String} Tên tỉnh/thành phố đã chọn hoặc text tìm kiếm
     */
    selectedProvinceName() {
      // Nếu đang tìm kiếm, hiển thị text tìm kiếm
      if (this.provinceSearchText && this.showProvinceDropdown) {
        return this.provinceSearchText
      }
      // Nếu đã chọn tỉnh, tìm và hiển thị tên tỉnh
      if (this.form.tinhCode) {
        const selected = this.provinces.find((p) => p.id === parseInt(this.form.tinhCode))
        return selected ? selected.name : ''
      }
      return ''
    },

    /**
     * Lấy tên xã/phường đã chọn để hiển thị trong input
     * @returns {String} Tên xã/phường đã chọn hoặc text tìm kiếm
     */
    selectedWardName() {
      // Nếu đang tìm kiếm, hiển thị text tìm kiếm
      if (this.wardSearchText && this.showWardDropdown) {
        return this.wardSearchText
      }
      // Nếu đã chọn xã/phường, hiển thị tên xã/phường
      if (this.form.xaCode) {
        return this.form.xaCode
      }
      return ''
    },
  },
  // Hook được gọi khi component được tạo
  created() {
    // Khởi tạo toast và confirm composables
    const {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    } = useToast()
    const { showConfirm } = useConfirm()

    // Lưu vào this để sử dụng trong methods
    this.showSuccess = showSuccess
    this.showError = showError
    this.showWarning = showWarning
    this.showInfo = showInfo
    this.showConfirm = showConfirm
  },
  // Hook được gọi sau khi component được mount (render lần đầu)
  mounted() {
    // Gán mã khách hàng từ props vào form nếu có
    if (this.maKhachHang) {
      this.form.maKhachHang = this.maKhachHang
    }
    
    // Nếu có thông tin khách hàng từ props, tự động điền vào form
    if (this.customerInfo) {
      this.fillCustomerInfo()
    } else if (this.maKhachHang) {
      // Nếu không có customerInfo nhưng có maKhachHang, thử lấy từ API
      this.fetchCustomerInfo()
    }
    
    // Gọi API để lấy danh sách tỉnh/thành phố khi component được mount
    this.fetchProvinces()
  },
  // Watch: theo dõi sự thay đổi của props maKhachHang và customerInfo
  watch: {
    /**
     * Theo dõi sự thay đổi của prop maKhachHang
     * Khi prop thay đổi, cập nhật vào form và lấy thông tin khách hàng
     */
    maKhachHang(newVal) {
      if (newVal) {
        this.form.maKhachHang = newVal
        // Nếu có customerInfo, ưu tiên dùng customerInfo
        if (this.customerInfo) {
          this.fillCustomerInfo()
        } else {
          // Gọi API để lấy thông tin khách hàng và tự động điền họ tên, số điện thoại
          this.fetchCustomerInfo()
        }
      }
    },
    /**
     * Theo dõi sự thay đổi của prop customerInfo
     * Khi có thông tin khách hàng mới, tự động điền vào form
     */
    customerInfo(newVal) {
      if (newVal) {
        this.fillCustomerInfo()
      }
    },
  },
  // Methods: các phương thức xử lý logic của component
  methods: {
    /**
     * Validate mã khách hàng
     * Kiểm tra mã khách hàng không được để trống
     * @returns {boolean} true nếu hợp lệ, false nếu không hợp lệ
     */
    validateMaKhachHang() {
      if (!this.form.maKhachHang || this.form.maKhachHang.trim() === '') {
        this.errors.maKhachHang = 'Mã khách hàng không được để trống'
        return false
      }
      delete this.errors.maKhachHang
      return true
    },

    /**
     * Validate họ và tên
     * Kiểm tra họ và tên không được để trống
     * @returns {boolean} true nếu hợp lệ, false nếu không hợp lệ
     */
    validateHoTen() {
      if (!this.form.hoTen || this.form.hoTen.trim() === '') {
        this.errors.hoTen = 'Họ và tên không được để trống'
        return false
      }
      delete this.errors.hoTen
      return true
    },

    /**
     * Validate số điện thoại
     * Kiểm tra số điện thoại không được để trống và phải có 10-11 chữ số
     * @returns {boolean} true nếu hợp lệ, false nếu không hợp lệ
     */
    validateSDT() {
      if (!this.form.sdt || this.form.sdt.trim() === '') {
        this.errors.sdt = 'Số điện thoại không được để trống'
        return false
      }
      // Kiểm tra định dạng số điện thoại: 10-11 chữ số
      if (!/^[0-9]{10,11}$/.test(this.form.sdt)) {
        this.errors.sdt = 'Số điện thoại không hợp lệ'
        return false
      }
      delete this.errors.sdt
      return true
    },

    /**
     * Validate địa chỉ chi tiết
     * Trường này không bắt buộc, nên luôn trả về true
     * @returns {boolean} true (luôn hợp lệ vì không bắt buộc)
     */
    validateDiaChi() {
      // Xóa lỗi nếu có (không bắt buộc nên không có lỗi)
      delete this.errors.diaChi
      return true
    },

    /**
     * Validate toàn bộ form
     * Chỉ validate các trường bắt buộc: mã khách hàng, họ tên, số điện thoại
     * @returns {boolean} true nếu tất cả trường bắt buộc đều hợp lệ, false nếu có lỗi
     */
    validateForm() {
      let isValid = true
      // Chỉ validate các trường bắt buộc
      isValid = this.validateMaKhachHang() && isValid
      isValid = this.validateHoTen() && isValid
      isValid = this.validateSDT() && isValid
      // Địa chỉ chi tiết, tỉnh/thành phố, xã/phường không bắt buộc nên không validate
      return isValid
    },
    /**
     * Điền thông tin khách hàng từ props customerInfo vào form
     * Method này được gọi khi có customerInfo từ props
     */
    fillCustomerInfo() {
      if (!this.customerInfo) {
        return
      }
      
      // Tự động điền mã khách hàng
      if (this.customerInfo.maKhachHang) {
        this.form.maKhachHang = this.customerInfo.maKhachHang
      }
      
      // Tự động điền họ tên (ưu tiên từ customerInfo, nếu form chưa có)
      if (this.customerInfo.hoTen && !this.form.hoTen) {
        this.form.hoTen = this.customerInfo.hoTen
      }
      
      // Tự động điền số điện thoại (ưu tiên từ customerInfo, nếu form chưa có)
      if (this.customerInfo.soDienThoai && !this.form.sdt) {
        this.form.sdt = this.customerInfo.soDienThoai
      }
    },

    /**
     * Lấy thông tin khách hàng theo mã khách hàng từ API backend
     * Tự động điền họ tên và số điện thoại vào form
     * Method này được gọi khi component mount hoặc khi maKhachHang thay đổi
     */
    async fetchCustomerInfo() {
      // Kiểm tra nếu không có mã khách hàng thì không làm gì
      if (!this.form.maKhachHang || !this.form.maKhachHang.trim()) {
        return
      }

      try {
        // Retry logic: thử lại 3 lần với delay giữa các lần thử
        // Điều này giúp xử lý trường hợp khách hàng vừa được tạo nhưng backend chưa commit transaction
        let retries = 3
        let delay = 500 // 500ms delay giữa các lần thử

        while (retries > 0) {
          try {
            // Gọi API để lấy thông tin khách hàng theo mã
            // Response từ API: {id, maKhachHang, hoTen, soDienThoai, email, gioiTinh, ngaySinh, trangThai}
            const response = await KhachHangService.getByMaKhachHang(this.form.maKhachHang)

            // Lấy dữ liệu từ response (response.data nếu là axios response, hoặc response nếu là data trực tiếp)
            const customerData = response.data || response

            // Nếu tìm thấy thông tin khách hàng, tự động điền vào form
            if (customerData) {
              // Tự động điền họ tên vào form (chỉ nếu form chưa có)
              if (customerData.hoTen && !this.form.hoTen) {
                this.form.hoTen = customerData.hoTen
              }
              // Tự động điền số điện thoại vào form (chỉ nếu form chưa có)
              if (customerData.soDienThoai && !this.form.sdt) {
                this.form.sdt = customerData.soDienThoai
              }
              // Tìm thấy rồi, không cần retry nữa
              return
            }
          } catch (err) {
            retries--
            if (retries > 0) {
              // Đợi một chút trước khi thử lại
              await new Promise((resolve) => setTimeout(resolve, delay))
              delay *= 2 // Tăng delay mỗi lần retry
            } else {
              // Hết số lần thử, log lỗi nhưng không hiển thị alert
              console.warn(
                'Không tìm thấy khách hàng với mã:',
                this.form.maKhachHang,
                '- Có thể khách hàng vừa được tạo, bạn có thể nhập thông tin thủ công',
                err,
              )
            }
          }
        }
      } catch (error) {
        // Xử lý lỗi khi gọi API (có thể khách hàng không tồn tại)
        console.error('Lỗi khi lấy thông tin khách hàng:', error)
        // Không hiển thị alert vì có thể khách hàng chưa tồn tại (khi tạo mới)
        // Chỉ log lỗi để debug
      }
    },

    /**
     * Lấy danh sách tất cả tỉnh/thành phố từ API miễn phí
     * Method này được gọi khi component mount để load danh sách tỉnh
     */
    async fetchProvinces() {
      try {
        // Bật trạng thái loading
        this.loadingProvinces = true

        // Gọi API miễn phí để lấy danh sách tỉnh/thành phố
        // Response: Array of {id: String, code: String, name: String}
        const provinces = await VietnamAddressService.getAllProvinces()

        // Gán dữ liệu vào mảng provinces
        this.provinces = provinces || []
      } catch (error) {
        // Xử lý lỗi khi gọi API
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error)
        this.showError('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.')
        // Khởi tạo mảng rỗng nếu có lỗi
        this.provinces = []
      } finally {
        // Tắt trạng thái loading dù thành công hay thất bại
        this.loadingProvinces = false
      }
    },

    /**
     * Xử lý khi người dùng nhập text để tìm kiếm tỉnh/thành phố
     * @param {Event} event - Event object từ input
     */
    handleProvinceSearch(event) {
      // Lấy giá trị text từ input
      this.provinceSearchText = event.target.value
      // Hiển thị dropdown khi đang tìm kiếm
      this.showProvinceDropdown = true
    },

    /**
     * Xử lý khi blur khỏi input tỉnh/thành phố
     * Đợi một chút để xử lý click vào dropdown item trước
     */
    handleProvinceBlur() {
      // Đợi 200ms để xử lý click vào dropdown item (vì blur xảy ra trước mousedown)
      setTimeout(() => {
        this.showProvinceDropdown = false
        // Nếu đã chọn tỉnh, reset search text và hiển thị tên tỉnh đã chọn
        if (this.form.tinhCode) {
          this.provinceSearchText = ''
        }
      }, 200)
    },

    /**
     * Xử lý khi người dùng chọn tỉnh/thành phố từ dropdown
     * @param {Object} province - Object tỉnh/thành phố được chọn {id, name, code}
     */
    async selectProvince(province) {
      // Gán mã tỉnh vào form
      this.form.tinhCode = province.id
      // Gán tên tỉnh vào form (để lưu vào database)
      this.form.tinh = province.name
      // Reset search text
      this.provinceSearchText = ''
      // Đóng dropdown
      this.showProvinceDropdown = false

      // Reset xã/phường khi đổi tỉnh (xóa lựa chọn xã cũ)
      this.form.xaCode = ''
      this.form.xa = ''
      this.wards = []
      this.wardSearchText = ''

      // Gọi API miễn phí để lấy danh sách xã/phường theo mã tỉnh đã chọn
      try {
        // Bật trạng thái loading
        this.loadingWards = true

        // Sử dụng mã tỉnh (có thể là String hoặc Number)
        const provinceCode = this.form.tinhCode

        // Gọi API miễn phí để lấy danh sách xã/phường
        // Response: Array of {id: String, code: String, name: String, districtCode: String}
        const wards = await VietnamAddressService.getWardsByProvince(provinceCode)

        // Gán dữ liệu vào mảng wards
        this.wards = wards || []
      } catch (error) {
        // Xử lý lỗi khi gọi API
        console.error('Lỗi khi lấy danh sách xã/phường:', error)
        this.showError('Không thể tải danh sách xã/phường. Vui lòng thử lại sau.')
        // Khởi tạo mảng rỗng nếu có lỗi
        this.wards = []
      } finally {
        // Tắt trạng thái loading dù thành công hay thất bại
        this.loadingWards = false
      }
    },

    /**
     * Xử lý khi người dùng nhập text để tìm kiếm xã/phường
     * @param {Event} event - Event object từ input
     */
    handleWardSearch(event) {
      // Lấy giá trị text từ input
      this.wardSearchText = event.target.value
      // Hiển thị dropdown khi đang tìm kiếm
      this.showWardDropdown = true
    },

    /**
     * Xử lý khi focus vào input xã/phường
     */
    handleWardFocus() {
      // Chỉ hiển thị dropdown nếu đã chọn tỉnh
      if (this.form.tinhCode && !this.loadingWards) {
        this.showWardDropdown = true
      }
    },

    /**
     * Xử lý khi blur khỏi input xã/phường
     * Đợi một chút để xử lý click vào dropdown item trước
     */
    handleWardBlur() {
      // Đợi 200ms để xử lý click vào dropdown item (vì blur xảy ra trước mousedown)
      setTimeout(() => {
        this.showWardDropdown = false
        // Nếu đã chọn xã/phường, reset search text và hiển thị tên xã đã chọn
        if (this.form.xaCode) {
          this.wardSearchText = ''
        }
      }, 200)
    },

    /**
     * Xử lý khi người dùng chọn xã/phường từ dropdown
     * @param {Object} ward - Object xã/phường được chọn {id, name, ...}
     */
    selectWard(ward) {
      // Gán tên xã/phường vào form.xaCode
      this.form.xaCode = ward.name
      // Gán tên xã/phường vào form.xa (để lưu vào database)
      this.form.xa = ward.name
      // Reset search text
      this.wardSearchText = ''
      // Đóng dropdown
      this.showWardDropdown = false
    },

    /**
     * Reset form về trạng thái ban đầu (không có confirm)
     * Method này được dùng nội bộ để reset form
     */
    resetForm() {
      // Reset form về giá trị mặc định
      this.form = {
        maKhachHang: this.maKhachHang || '', // Giữ lại mã khách hàng từ props nếu có
        hoTen: '',
        sdt: '',
        diaChi: '',
        xa: '',
        tinh: '',
        tinhCode: '', // Reset mã tỉnh
        xaCode: '', // Reset mã xã
        macDinh: false,
      }
      // Reset danh sách xã/phường (vì đã reset tỉnh)
      this.wards = []
      // Reset search text
      this.provinceSearchText = ''
      this.wardSearchText = ''
      // Đóng dropdown
      this.showProvinceDropdown = false
      this.showWardDropdown = false
      // Xóa tất cả lỗi validation
      this.errors = {}

      // Nếu có customerInfo từ props, ưu tiên dùng customerInfo
      if (this.customerInfo) {
        this.fillCustomerInfo()
      } else if (this.form.maKhachHang) {
        // Nếu không có customerInfo, thử lấy từ API
        this.fetchCustomerInfo()
      }
    },

    /**
     * Xóa form - Reset form về trạng thái ban đầu (có xác nhận)
     * Xóa tất cả dữ liệu và lỗi validation
     * Nếu có mã khách hàng, sẽ tự động load lại thông tin khách hàng
     */
    async handleReset() {
      // Xác nhận trước khi xóa
      const confirmed = await this.showConfirm({
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa tất cả thông tin đã nhập?',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        type: 'warning',
      })

      if (!confirmed) {
        return
      }

      // Gọi method reset form
      this.resetForm()
    },

    /**
     * Thiết lập địa chỉ này làm địa chỉ mặc định
     * Set trạng thái macDinh = true
     */
    handleSetDefault() {
      // Set địa chỉ này làm mặc định
      this.form.macDinh = true
      // Hiển thị thông báo
      this.showInfo('Đã thiết lập địa chỉ này làm địa chỉ mặc định. Nhấn "Lưu" để lưu thay đổi.')
    },
    /**
     * Xử lý lưu địa chỉ
     * Validate form, sau đó gọi API để thêm địa chỉ mới
     */
    async handleSave() {
      // Validate form trước khi lưu
      if (!this.validateForm()) {
        this.showWarning('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      try {
        // Retry logic: thử lại 3 lần với delay giữa các lần thử
        // Điều này giúp xử lý trường hợp khách hàng vừa được tạo nhưng backend chưa commit transaction
        let retries = 3
        let delay = 500 // 500ms delay giữa các lần thử
        let lastError = null

        while (retries > 0) {
          try {
            // Gọi API để thêm địa chỉ mới
            // Form data sẽ được gửi lên backend: {maKhachHang, hoTen, sdt, diaChi, xa, tinh, macDinh}
            await DiaChiService.addDiaChi(this.form)

            // Hiển thị thông báo thành công
            this.showSuccess('Thêm địa chỉ thành công!')

            // Reset form về trạng thái ban đầu (không cần confirm)
            this.resetForm()

            // Emit event 'success' để component cha biết đã lưu thành công
            this.$emit('success')

            // Thành công, không cần retry nữa
            return
          } catch (error) {
            lastError = error
            const errorMessage = error.response?.data?.message || error.message || ''

            // Nếu lỗi là "Không tìm thấy khách hàng", thử lại
            if (errorMessage.includes('Không tìm thấy khách hàng') && retries > 1) {
              retries--
              // Đợi một chút trước khi thử lại
              await new Promise((resolve) => setTimeout(resolve, delay))
              delay *= 2 // Tăng delay mỗi lần retry
              console.log(`Retry thêm địa chỉ... (còn ${retries} lần thử)`)
            } else {
              // Lỗi khác hoặc hết số lần thử, throw error
              throw error
            }
          }
        }

        // Nếu đến đây, nghĩa là đã hết số lần thử, throw error cuối cùng
        throw lastError
      } catch (error) {
        // Xử lý lỗi khi gọi API
        console.error('Lỗi khi thêm địa chỉ:', error)
        // Hiển thị thông báo lỗi cho người dùng
        const errorMessage =
          error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm địa chỉ'
        this.showError('Có lỗi xảy ra khi thêm địa chỉ: ' + errorMessage)
      }
    },
  },
}
</script>

<style scoped>
.customer-detail {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.5rem 1rem;
}

/* Style cho dropdown tìm kiếm */
.position-relative {
  position: relative;
}

/* Dropdown menu style - đảm bảo dropdown mở xuống phía dưới */
.dropdown-menu {
  display: block;
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  background-color: #fff;
  margin-top: 2px;
}

/* Style cho dropdown item */
.dropdown-item {
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  color: #212529;
  text-decoration: none;
  display: block;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #16181b;
}

.dropdown-item.active {
  background-color: #0d6efd;
  color: #fff;
}

.dropdown-item.active:hover {
  background-color: #0b5ed7;
  color: #fff;
}

/* Scrollbar cho dropdown khi danh sách quá dài */
.dropdown-menu {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 0.875rem;
}

/* Custom scrollbar cho dropdown (WebKit browsers) */
.dropdown-menu::-webkit-scrollbar {
  width: 8px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Đảm bảo input group không bị overlap */
.input-group {
  position: relative;
}

/* Style cho input khi disabled */
.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
  cursor: not-allowed;
}
</style>
