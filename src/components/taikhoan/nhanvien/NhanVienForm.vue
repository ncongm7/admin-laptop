<template>
  <div class="nhanvien-form-wrapper">
    <form class="form-card" @submit.prevent="onSubmit">
      <!-- Avatar Upload Section -->
      <div class="form-avatar-section">
        <label class="section-label">
          <i class="bi bi-person-circle"></i>
          Ảnh đại diện
        </label>
        <div class="avatar-upload-container">
          <ImageUploader
            v-model="form.avatar"
            :upload-function="uploadAvatar"
            placeholder="Chọn ảnh đại diện"
            hint="JPG, PNG tối đa 5MB"
            aspect-ratio="1/1"
            @upload-success="handleUploadSuccess"
            @upload-error="handleUploadError"
          />
        </div>
      </div>
      <!-- Form Fields Section -->
      <div class="form-section">
        <label class="section-label">
          <i class="bi bi-info-circle"></i>
          Thông tin cơ bản
        </label>
        
        <div class="form-row">
          <div class="form-group">
            <label>Mã nhân viên</label>
          <div class="input-with-suggestions">
            <input
              v-model="form.maNhanVien"
              type="text"
              class="form-control"
              placeholder="Nhập mã hoặc chọn gợi ý"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
            />
            <div v-if="showSuggestions" class="suggestions-dropdown">
              <div class="suggestion-item" @mousedown.prevent="selectSuggestion('NV' + getNextNumber())">
                <i class="bi bi-lightbulb"></i>
                <span>NV{{ getNextNumber() }}</span>
                <small>Tự động tăng</small>
              </div>
            </div>
          </div>
        </div>
          <div class="form-group">
            <label>Tên nhân viên <span class="required">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="Nhập tên nhân viên"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Số điện thoại <span class="required">*</span></label>
          <input
            v-model="form.phone"
            type="text"
            class="form-control"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="Nhập email"
              required
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Giới tính</label>
          <div class="gender-group">
            <label><input type="radio" value="Nam" v-model="form.gender" /> Nam</label>
            <label><input type="radio" value="Nữ" v-model="form.gender" /> Nữ</label>
          </div>
        </div>
        <div class="form-group">
          <label>Trạng thái</label>
          <div class="gender-group">
            <label><input type="radio" :value="1" v-model="form.trangThai" /> Đang làm</label>
            <label><input type="radio" :value="0" v-model="form.trangThai" /> Đã nghỉ</label>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Chức vụ</label>
          <input
            type="text"
            class="form-control"
            value="Nhân viên"
            readonly
            style="background-color: #f8f9fa; cursor: not-allowed;"
          />
          <small class="text-muted">Chức vụ mặc định: Nhân viên (không thể thay đổi)</small>
        </div>
          <div class="form-group" style="flex: 2">
            <label>Địa chỉ chi tiết</label>
            <input
              v-model="form.diaChiChiTiet"
              type="text"
              class="form-control"
              placeholder="Nhập số nhà, tên đường..."
            />
          </div>
        </div>

        <!-- Dropdown địa chỉ: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã -->
        <div class="form-row">
          <div class="form-group">
            <label>Tỉnh/Thành phố</label>
            <div class="position-relative">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedProvinceName"
                  @input="handleProvinceSearch"
                  @focus="showProvinceDropdown = true"
                  @blur="handleProvinceBlur"
                  :disabled="loadingProvinces"
                  placeholder="Chọn tỉnh/thành phố"
                  autocomplete="off"
                />
                <span class="input-group-text bg-white border-start-0" style="cursor: pointer; pointer-events: none;">
                  <i class="bi" :class="showProvinceDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </span>
              </div>
              <div v-if="showProvinceDropdown && !loadingProvinces" class="dropdown-menu show w-100 position-absolute"
                style="max-height: 250px; overflow-y: auto; z-index: 9999; top: 100%; margin-top: 2px;">
                <div v-if="filteredProvinces.length === 0" class="dropdown-item text-muted">
                  Không tìm thấy tỉnh/thành phố
                </div>
                <a v-for="province in filteredProvinces" :key="province.id" class="dropdown-item"
                  href="javascript:void(0)" @mousedown.prevent="selectProvince(province)"
                  :class="{ active: form.tinhCode == province.id }">
                  {{ province.name }}
                </a>
              </div>
            </div>
            <div v-if="loadingProvinces" class="text-muted small mt-1">
              <i class="bi bi-hourglass-split"></i> Đang tải...
            </div>
          </div>

          <div class="form-group">
            <label>Quận/Huyện</label>
            <div class="position-relative">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedDistrictName"
                  @input="handleDistrictSearch"
                  @focus="showDistrictDropdown = true"
                  @blur="handleDistrictBlur"
                  :disabled="loadingDistricts || !form.tinhCode"
                  placeholder="Chọn quận/huyện"
                  autocomplete="off"
                />
                <span class="input-group-text bg-white border-start-0" style="cursor: pointer; pointer-events: none;">
                  <i class="bi" :class="showDistrictDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </span>
              </div>
              <div v-if="showDistrictDropdown && !loadingDistricts && form.tinhCode" class="dropdown-menu show w-100 position-absolute"
                style="max-height: 250px; overflow-y: auto; z-index: 9999; top: 100%; margin-top: 2px;">
                <div v-if="filteredDistricts.length === 0" class="dropdown-item text-muted">
                  Không tìm thấy quận/huyện
                </div>
                <a v-for="district in filteredDistricts" :key="district.id" class="dropdown-item"
                  href="javascript:void(0)" @mousedown.prevent="selectDistrict(district)"
                  :class="{ active: form.huyenCode == district.id }">
                  {{ district.name }}
                </a>
              </div>
            </div>
            <div v-if="loadingDistricts" class="text-muted small mt-1">
              <i class="bi bi-hourglass-split"></i> Đang tải...
            </div>
          </div>

          <div class="form-group">
            <label>Phường/Xã</label>
            <div class="position-relative">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="selectedWardName"
                  @input="handleWardSearch"
                  @focus="showWardDropdown = true"
                  @blur="handleWardBlur"
                  :disabled="loadingWards || !form.huyenCode"
                  placeholder="Chọn phường/xã"
                  autocomplete="off"
                />
                <span class="input-group-text bg-white border-start-0" style="cursor: pointer; pointer-events: none;">
                  <i class="bi" :class="showWardDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </span>
              </div>
              <div v-if="showWardDropdown && !loadingWards && form.huyenCode" class="dropdown-menu show w-100 position-absolute"
                style="max-height: 250px; overflow-y: auto; z-index: 9999; top: 100%; margin-top: 2px;">
                <div v-if="filteredWards.length === 0" class="dropdown-item text-muted">
                  Không tìm thấy phường/xã
                </div>
                <a v-for="ward in filteredWards" :key="ward.id" class="dropdown-item"
                  href="javascript:void(0)" @mousedown.prevent="selectWard(ward)"
                  :class="{ active: form.xaCode == ward.id }">
                  {{ ward.name }}
                </a>
              </div>
            </div>
            <div v-if="loadingWards" class="text-muted small mt-1">
              <i class="bi bi-hourglass-split"></i> Đang tải...
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group full-width">
            <label>Đánh giá / Ghi chú</label>
            <textarea
              v-model="form.danhGia"
              class="form-control"
              rows="4"
              placeholder="Ghi chú, đánh giá về nhân viên..."
            ></textarea>
          </div>
        </div>

        <!-- Checkbox tạo tài khoản -->
        <div class="form-row">
          <div class="form-group full-width">
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :id="'createTaiKhoan'"
                v-model="form.createTaiKhoan"
              />
              <label class="form-check-label" :for="'createTaiKhoan'">
                <strong>Tạo tài khoản cho nhân viên này</strong>
              </label>
            </div>
          </div>
        </div>

        <!-- Form tài khoản (hiển thị khi checkbox được checked) -->
        <div v-if="form.createTaiKhoan" class="form-section account-section">
          <label class="section-label">
            <i class="bi bi-person-lock"></i>
            Thông tin tài khoản
          </label>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tên đăng nhập <span class="required">*</span></label>
              <input
                v-model="form.tenDangNhap"
                type="text"
                class="form-control"
                placeholder="Nhập tên đăng nhập (mặc định: SĐT)"
              />
              <small class="text-muted">Để trống sẽ dùng số điện thoại làm tên đăng nhập</small>
            </div>
            <div class="form-group">
              <label>Mật khẩu <span class="required">*</span></label>
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
                  <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <small class="text-muted">Để trống sẽ dùng mật khẩu mặc định: 123456</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Email tài khoản</label>
              <input
                v-model="form.emailTaiKhoan"
                type="email"
                class="form-control"
                placeholder="Nhập email (mặc định: email nhân viên)"
              />
              <small class="text-muted">Để trống sẽ dùng email của nhân viên</small>
            </div>
            <div class="form-group">
              <label>Vai trò <span class="required">*</span></label>
              <select v-model="form.maVaiTro" class="form-control" required disabled>
                <option v-for="vaiTro in vaiTroList" :key="vaiTro.id" :value="vaiTro.id">
                  {{ vaiTro.tenVaiTro }}
                </option>
              </select>
              <small class="text-muted">Vai trò mặc định: Nhân viên (không thể thay đổi)</small>
            </div>
          </div>
        </div>
      </div>
      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="onCancel">
          <i class="bi bi-x-circle"></i>
          Hủy
        </button>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-circle"></i>
          Thêm nhân viên
        </button>
      </div>
    </form>
    
    <!-- Modal hiển thị thông tin đăng nhập -->
    <LoginInfoModal
      v-if="showLoginInfoModal && loginInfo && loginInfo.tenDangNhap"
      :login-info="loginInfo"
      @close="handleCloseLoginInfo"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { nhanVienApi } from '@/service/ApiNhanVien'
import vaiTroService from '@/service/vaiTroService'
import ImageUploader from '@/components/common/ImageUploader.vue'
import LoginInfoModal from './LoginInfoModal.vue'
import VietnamAddressService from '@/service/taikhoan/vietnamAddressService'

const router = useRouter()
const showSuggestions = ref(false)
const existingCodes = ref([])
const showLoginInfoModal = ref(false)
const showPassword = ref(false)
const vaiTroList = ref([])
const loginInfo = ref({
  tenDangNhap: '',
  matKhau: ''
})

const form = ref({
  maNhanVien: '',
  name: '',
  phone: '',
  email: '',
  gender: 'Nam',
  trangThai: 1,
  chucVu: 'Nhân viên', // Mặc định là "Nhân viên"
  diaChiChiTiet: '', // Địa chỉ chi tiết (số nhà, tên đường)
  tinhCode: '', // Mã tỉnh/thành phố
  tinh: '', // Tên tỉnh/thành phố
  huyenCode: '', // Mã quận/huyện
  huyen: '', // Tên quận/huyện
  xaCode: '', // Mã phường/xã
  xa: '', // Tên phường/xã
  diaChi: '', // Địa chỉ đầy đủ (sẽ được tạo từ các trường trên)
  danhGia: '',
  avatar: '',
  // Thông tin tài khoản
  createTaiKhoan: false,
  tenDangNhap: '',
  matKhau: '',
  emailTaiKhoan: '',
  maVaiTro: null,
})

// Address dropdown states
const showProvinceDropdown = ref(false)
const showDistrictDropdown = ref(false)
const showWardDropdown = ref(false)
const loadingProvinces = ref(false)
const loadingDistricts = ref(false)
const loadingWards = ref(false)
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const provinceSearchText = ref('')
const districtSearchText = ref('')
const wardSearchText = ref('')

// Computed properties for address dropdowns
const selectedProvinceName = computed(() => {
  return form.value.tinh || ''
})

const selectedDistrictName = computed(() => {
  return form.value.huyen || ''
})

const selectedWardName = computed(() => {
  return form.value.xa || ''
})

const filteredProvinces = computed(() => {
  if (!provinceSearchText.value.trim()) {
    return provinces.value
  }
  const search = provinceSearchText.value.toLowerCase()
  return provinces.value.filter(p => p.name.toLowerCase().includes(search))
})

const filteredDistricts = computed(() => {
  if (!districtSearchText.value.trim()) {
    return districts.value
  }
  const search = districtSearchText.value.toLowerCase()
  return districts.value.filter(d => d.name.toLowerCase().includes(search))
})

const filteredWards = computed(() => {
  if (!wardSearchText.value.trim()) {
    return wards.value
  }
  const search = wardSearchText.value.toLowerCase()
  return wards.value.filter(w => w.name.toLowerCase().includes(search))
})

// Load existing codes to avoid duplicates
onMounted(async () => {
  try {
    const { data } = await nhanVienApi.listAll()
    existingCodes.value = data.map((nv) => nv.maNhanVien).filter(Boolean)
  } catch (e) {
    console.error('Lỗi tải danh sách mã:', e)
  }
  
  // Load danh sách tỉnh/thành phố
  await loadProvinces()
  
  // Load danh sách vai trò - chỉ lấy NHAN_VIEN cho nhân viên
  try {
    const response = await vaiTroService.getAllVaiTro()
    const allVaiTro = response?.data || response || []
    // Chỉ lấy vai trò NHAN_VIEN cho nhân viên
    const nhanVienRole = allVaiTro.find((vt) => {
      const maVaiTro = vt.maVaiTro || vt.ma_vai_tro
      return maVaiTro === 'NHAN_VIEN'
    })
    if (nhanVienRole) {
      // Chỉ hiển thị vai trò NHAN_VIEN
      vaiTroList.value = [nhanVienRole]
      form.value.maVaiTro = nhanVienRole.id
    } else {
      console.error('Không tìm thấy vai trò NHAN_VIEN')
      vaiTroList.value = []
    }
  } catch (e) {
    console.error('Lỗi tải danh sách vai trò:', e)
    vaiTroList.value = []
  }
  
  // Watch checkbox createTaiKhoan để tự động fill tài khoản/mật khẩu
  watch(() => form.value.createTaiKhoan, (isChecked) => {
    if (isChecked) {
      // Tự động fill tài khoản = SĐT và mật khẩu = 123456
      if (form.value.phone) {
        form.value.tenDangNhap = form.value.phone
      }
      form.value.matKhau = '123456'
      
      // Tự động set vai trò NHAN_VIEN khi checkbox được check
      if (vaiTroList.value && vaiTroList.value.length > 0) {
        const nhanVienRole = vaiTroList.value.find((vt) => {
          const maVaiTro = vt.maVaiTro || vt.ma_vai_tro
          return maVaiTro === 'NHAN_VIEN'
        })
        if (nhanVienRole && form.value && !form.value.maVaiTro) {
          form.value.maVaiTro = nhanVienRole.id
        }
      }
    } else {
      // Clear các field tài khoản khi uncheck
      form.value.tenDangNhap = ''
      form.value.matKhau = ''
    }
  })
  
  // Watch SĐT để tự động cập nhật tên đăng nhập nếu đang ở chế độ tự tạo tài khoản
  watch(() => form.value.phone, (newPhone) => {
    if (form.value.createTaiKhoan && newPhone) {
      // Chỉ cập nhật nếu tên đăng nhập đang là SĐT cũ (hoặc rỗng)
      if (!form.value.tenDangNhap || form.value.tenDangNhap === form.value.phone) {
        form.value.tenDangNhap = newPhone
      }
    }
  })
})

// Generate suggestions
function getNextNumber() {
  const nvCodes = existingCodes.value.filter((code) => code.startsWith('NV'))
  const numbers = nvCodes.map((code) => parseInt(code.replace('NV', ''))).filter((n) => !isNaN(n))
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0
  return String(maxNum + 1).padStart(3, '0')
}

function selectSuggestion(code) {
  form.value.maNhanVien = code
  showSuggestions.value = false
}

function hideSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Upload avatar function for ImageUploader component
const uploadAvatar = async (file) => {
  try {
    const response = await nhanVienApi.uploadAvatar(file)
    // Response từ axios: response.data chứa URL
    return response
  } catch (error) {
    console.error('❌ Upload avatar error:', error)
    throw error
  }
}

const handleUploadSuccess = (imageUrl) => {
  form.value.avatar = imageUrl
  console.log('✅ Upload thành công:', imageUrl)
}

const handleUploadError = (error) => {
  console.error('❌ Upload lỗi:', error)
}

// Address functions
const loadProvinces = async () => {
  loadingProvinces.value = true
  try {
    const data = await VietnamAddressService.getAllProvinces()
    provinces.value = data
  } catch (error) {
    console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error)
    provinces.value = []
  } finally {
    loadingProvinces.value = false
  }
}

const handleProvinceSearch = (event) => {
  provinceSearchText.value = event.target.value
  showProvinceDropdown.value = true
}

const handleProvinceBlur = () => {
  setTimeout(() => {
    showProvinceDropdown.value = false
  }, 200)
}

const selectProvince = async (province) => {
  form.value.tinhCode = province.id || province.code
  form.value.tinh = province.name
  provinceSearchText.value = ''
  showProvinceDropdown.value = false
  
  // Reset quận/huyện và phường/xã
  form.value.huyenCode = ''
  form.value.huyen = ''
  form.value.xaCode = ''
  form.value.xa = ''
  districts.value = []
  wards.value = []
  
  // Load quận/huyện
  if (form.value.tinhCode) {
    await loadDistricts(form.value.tinhCode)
  }
}

const loadDistricts = async (provinceCode) => {
  loadingDistricts.value = true
  try {
    const data = await VietnamAddressService.getDistrictsByProvince(provinceCode)
    districts.value = data
  } catch (error) {
    console.error('Lỗi khi tải danh sách quận/huyện:', error)
    districts.value = []
  } finally {
    loadingDistricts.value = false
  }
}

const handleDistrictSearch = (event) => {
  districtSearchText.value = event.target.value
  showDistrictDropdown.value = true
}

const handleDistrictBlur = () => {
  setTimeout(() => {
    showDistrictDropdown.value = false
  }, 200)
}

const selectDistrict = async (district) => {
  form.value.huyenCode = district.id || district.code
  form.value.huyen = district.name
  districtSearchText.value = ''
  showDistrictDropdown.value = false
  
  // Reset phường/xã
  form.value.xaCode = ''
  form.value.xa = ''
  wards.value = []
  
  // Load phường/xã
  if (form.value.huyenCode) {
    await loadWards(form.value.huyenCode)
  }
}

const loadWards = async (districtCode) => {
  loadingWards.value = true
  try {
    const data = await VietnamAddressService.getWardsByDistrict(districtCode)
    wards.value = data
  } catch (error) {
    console.error('Lỗi khi tải danh sách phường/xã:', error)
    wards.value = []
  } finally {
    loadingWards.value = false
  }
}

const handleWardSearch = (event) => {
  wardSearchText.value = event.target.value
  showWardDropdown.value = true
}

const handleWardBlur = () => {
  setTimeout(() => {
    showWardDropdown.value = false
  }, 200)
}

const selectWard = (ward) => {
  form.value.xaCode = ward.id || ward.code
  form.value.xa = ward.name
  wardSearchText.value = ''
  showWardDropdown.value = false
}

function onCancel() {
  router.push('/nhan-vien')
}
function onSubmit() {
  // Normalize & validate
  form.value.name = (form.value.name || '').trim()
  form.value.phone = (form.value.phone || '').trim()
  form.value.email = (form.value.email || '').trim().toLowerCase()

  if (!form.value.name || !form.value.phone || !form.value.email) {
    alert('Vui lòng nhập Tên, Số điện thoại và Email')
    return
  }
  
  // Validate thông tin tài khoản nếu có chọn tạo tài khoản
  if (form.value.createTaiKhoan) {
    // Nếu có nhập tên đăng nhập, validate
    if (form.value.tenDangNhap && form.value.tenDangNhap.trim().length < 3) {
      alert('Tên đăng nhập phải có ít nhất 3 ký tự')
      return
    }
    // Nếu có nhập mật khẩu, validate
    if (form.value.matKhau && form.value.matKhau.trim().length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
  }
  
  // Tạo địa chỉ đầy đủ từ các trường
  const diaChiParts = []
  if (form.value.diaChiChiTiet) diaChiParts.push(form.value.diaChiChiTiet)
  if (form.value.xa) diaChiParts.push(form.value.xa)
  if (form.value.huyen) diaChiParts.push(form.value.huyen)
  if (form.value.tinh) diaChiParts.push(form.value.tinh)
  const diaChiFull = diaChiParts.join(', ') || ''
  
  const payload = {
    maNhanVien: form.value.maNhanVien || `NV${Date.now().toString().slice(-6)}`,
    hoTen: form.value.name,
    soDienThoai: form.value.phone,
    email: form.value.email,
    gioiTinh: form.value.gender === 'Nam' ? 1 : 0,
    anhNhanVien: form.value.avatar ? form.value.avatar : null,
    chucVu: form.value.chucVu || 'Nhân viên', // Mặc định là "Nhân viên"
    diaChi: diaChiFull, // Địa chỉ đầy đủ
    danhGia: form.value.danhGia || '',
    trangThai: Number(form.value.trangThai),
  }
  
  // Thêm thông tin tài khoản nếu có chọn tạo
  if (form.value.createTaiKhoan) {
    payload.createTaiKhoan = true
    if (form.value.tenDangNhap && form.value.tenDangNhap.trim()) {
      payload.tenDangNhap = form.value.tenDangNhap.trim()
    }
    if (form.value.matKhau && form.value.matKhau.trim()) {
      payload.matKhau = form.value.matKhau.trim()
    }
    // Email tài khoản: nếu có thì dùng, không thì dùng email nhân viên
    // Backend sẽ dùng email từ request (email nhân viên) cho tài khoản
    // Nếu muốn email tài khoản khác email nhân viên, có thể thêm field riêng sau
    if (form.value.maVaiTro) {
      payload.maVaiTro = form.value.maVaiTro
    }
  } else {
    payload.createTaiKhoan = false
  }
  
  nhanVienApi
    .add(payload)
    .then((response) => {
      // Kiểm tra xem response có chứa thông tin đăng nhập không
      if (response?.data && response.data.tenDangNhap && response.data.matKhau) {
        loginInfo.value = {
          tenDangNhap: response.data.tenDangNhap,
          matKhau: response.data.matKhau
        }
        showLoginInfoModal.value = true
      } else {
        // Nếu không có thông tin đăng nhập, chuyển về trang danh sách
        router.push('/nhan-vien')
      }
    })
    .catch((e) => {
      const data = e?.response?.data
      const fallback = 'Thêm nhân viên thất bại.'
      const msg =
        typeof data === 'string' ? data : data?.message || (data ? JSON.stringify(data) : fallback)
      console.error('Add nhân viên lỗi:', e)
      alert(msg)
    })
}

function handleCloseLoginInfo() {
  showLoginInfoModal.value = false
  router.push('/nhan-vien')
}
</script>

<style scoped>
.nhanvien-form-wrapper {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 24px;
}

.form-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #e9ecef;
}

/* Section Labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D7458;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e9ecef;
}

.section-label i {
  font-size: 1.3rem;
  color: #396E7C;
}

/* Avatar Section */
.form-avatar-section {
  margin-bottom: 32px;
}

.avatar-upload-container {
  max-width: 200px;
  margin: 0 auto;
}

/* Form Sections */
.form-section {
  margin-bottom: 32px;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  flex: 1 1 100%;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

.form-control {
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  font-size: 1rem;
  padding: 12px 16px;
  background: #fff;
  transition: all 0.2s ease;
  color: #111827;
}

.form-control:focus {
  border-color: #2D7458;
  outline: none;
  box-shadow: 0 0 0 3px rgba(45, 116, 88, 0.1);
  background: #fff;
}

.form-control::placeholder {
  color: #9ca3af;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Suggestions dropdown */
.input-with-suggestions {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  margin-top: 6px;
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%);
  border-left: 3px solid #2D7458;
}

.suggestion-item i {
  color: #2D7458;
  font-size: 1.2em;
}

.suggestion-item span {
  font-weight: 600;
  color: #111827;
  font-size: 1em;
}

.suggestion-item small {
  color: #6b7280;
  font-size: 0.85em;
  margin-left: auto;
  font-style: italic;
}

/* Select dropdown styling */
select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D7458' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  padding-right: 40px;
  cursor: pointer;
}

select.form-control:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D7458' d='M6 3L11 8H1z'/%3E%3C/svg%3E");
}
.gender-group {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 4px;
}

.gender-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  padding: 10px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s ease;
  background: #fff;
  flex: 1;
  justify-content: center;
  position: relative;
}

.gender-group label:hover {
  border-color: #2D7458;
  color: #2D7458;
  background: #f0fdf4;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(45, 116, 88, 0.1);
}

.gender-group input[type="radio"] {
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #2D7458;
}

.gender-group input[type="radio"]:checked + span,
.gender-group label:has(input[type="radio"]:checked) {
  border-color: #2D7458;
  color: #2D7458;
  background: linear-gradient(135deg, #f0fdf4 0%, #e7f9ef 100%);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(45, 116, 88, 0.15);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 24px;
  border: none;
  outline: none;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #2D7458 0%, #396E7C 100%);
  color: #fff;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #25634d 0%, #2d5a6b 100%);
}

.btn-primary i {
  font-size: 1.1rem;
}

.btn-cancel {
  background: #fff;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.btn-cancel i {
  font-size: 1.1rem;
}
/* Responsive */
@media (max-width: 1024px) {
  .form-card {
    padding: 24px;
  }
  
  .form-row {
    gap: 16px;
  }
  
  .avatar-upload-container {
    max-width: 180px;
  }
}

@media (max-width: 768px) {
  .nhanvien-form-wrapper {
    padding: 16px;
  }
  
  .form-card {
    padding: 20px;
    border-radius: 12px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group.full-width {
    flex: 1 1 100%;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 12px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .avatar-upload-container {
    max-width: 160px;
  }
  
  .section-label {
    font-size: 1rem;
  }
}

/* Account section styling */
.account-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 2px solid #e5e7eb;
}

.account-section .section-label {
  color: #2D7458;
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
  border-color: #2D7458;
  background: #f0fdf4;
}

.form-check-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #2D7458;
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
  border-color: #2D7458;
  color: #2D7458;
  background: #f0fdf4;
}

.text-muted {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}
</style>
