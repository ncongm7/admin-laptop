<template>
  <div class="tai-khoan-form">
    <!-- 🔹 Thanh nút chức năng -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex justify-content-center gap-3 mx-auto" style="width: 400px">
        <button class="btn btn-primary" @click="handleSave">
          <i class="fas fa-save me-1"></i> {{ isEditMode ? 'Cập nhật' : 'Lưu' }}
        </button>
        <button class="btn btn-success" @click="handleSaveAndNew" v-if="!isEditMode">
          <i class="fas fa-plus me-1"></i> Lưu & thêm mới
        </button>
        <button class="btn btn-secondary" @click="handleCancel">
          <i class="fas fa-times me-1"></i> Hủy
        </button>
      </div>
    </div>

    <!-- Form thông tin Tài khoản -->
    <div class="row gy-2 gx-3 align-items-start">
      <!-- Cột trái -->
      <div class="col-md-6">
        <div class="mb-3">
          <label class="form-label">Vai trò <span class="text-danger">*</span></label>
          <select v-model="form.maVaiTro" class="form-select" required>
            <option value="">-- Chọn vai trò --</option>
            <option v-for="vaiTro in vaiTroList" :key="vaiTro.id" :value="vaiTro.id">
              {{ vaiTro.tenVaiTro }}
            </option>
          </select>
          <small class="text-muted" v-if="form.maVaiTro && getVaiTroByMa(form.maVaiTro)">
            Mã vai trò: {{ getVaiTroByMa(form.maVaiTro).maVaiTro }}
          </small>
        </div>

        <div class="mb-3">
          <label class="form-label">Tên đăng nhập <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control"
            placeholder="Nhập tên đăng nhập"
            v-model="form.tenDangNhap"
            required
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
          <div class="input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Nhập mật khẩu"
              v-model="form.matKhau"
              required
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <small class="text-muted">Mật khẩu mặc định: 123456 (nếu không nhập)</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" placeholder="Nhập email" v-model="form.email" />
        </div>
      </div>

      <!-- Cột phải -->
      <div class="col-md-6">
        <div class="mb-4">
          <label class="form-label">Trạng thái <span class="text-danger">*</span></label>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              :value="0"
              v-model="form.trangThai"
              id="status-inactive"
            />
            <label class="form-check-label" for="status-inactive">Không hoạt động</label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              :value="1"
              v-model="form.trangThai"
              id="status-active"
            />
            <label class="form-check-label" for="status-active">Hoạt động</label>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Ngày tạo</label>
          <input type="date" class="form-control" v-model="form.ngayTao" :disabled="!isEditMode" />
          <small class="text-muted">Tự động tạo khi thêm mới</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import vaiTroService from '@/service/vaiTroService.js'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'cancel', 'save-and-new'])

const { error: showError } = useToast()

const form = ref({
  id: null,
  maVaiTro: null,
  tenDangNhap: '',
  matKhau: '',
  email: '',
  trangThai: 1,
  ngayTao: null,
})

const vaiTroList = ref([])
const showPassword = ref(false)

// Methods
const getVaiTroByMa = (id) => {
  if (!id) return null
  return vaiTroList.value.find((vt) => vt.id === id)
}

// Methods
const fetchVaiTroList = async () => {
  try {
    const response = await vaiTroService.getAllVaiTro()
    // Xử lý response có thể là { data: [...] } hoặc trực tiếp là array
    const allVaiTro = response?.data || response || []

    // Chỉ lấy 3 vai trò: ADMIN, NHAN_VIEN, KHACH_HANG
    const allowedRoles = ['ADMIN', 'NHAN_VIEN', 'KHACH_HANG']
    vaiTroList.value = allVaiTro.filter((vt) => {
      const maVaiTro = vt.maVaiTro || vt.ma_vai_tro
      return allowedRoles.includes(maVaiTro)
    })

    // Nếu không tìm thấy từ API, sử dụng danh sách mặc định
    if (vaiTroList.value.length === 0) {
      vaiTroList.value = [
        { id: null, maVaiTro: 'ADMIN', tenVaiTro: 'Quản trị viên' },
        { id: null, maVaiTro: 'NHAN_VIEN', tenVaiTro: 'Nhân viên' },
        { id: null, maVaiTro: 'KHACH_HANG', tenVaiTro: 'Khách hàng' },
      ]
    }
  } catch (error) {
    console.error('Error fetching vai tro list:', error)
    showError('Không thể tải danh sách vai trò')
    // Fallback với danh sách vai trò mặc định
    vaiTroList.value = [
      { id: null, maVaiTro: 'ADMIN', tenVaiTro: 'Quản trị viên' },
      { id: null, maVaiTro: 'NHAN_VIEN', tenVaiTro: 'Nhân viên' },
      { id: null, maVaiTro: 'KHACH_HANG', tenVaiTro: 'Khách hàng' },
    ]
  }
}

const handleSave = async () => {
  // Validation
  if (!form.value.tenDangNhap) {
    showError('Vui lòng nhập tên đăng nhập')
    return
  }
  if (!form.value.matKhau && !props.isEditMode) {
    form.value.matKhau = '123456' // Mật khẩu mặc định
  }
  if (!form.value.maVaiTro) {
    showError('Vui lòng chọn vai trò')
    return
  }

  try {
    const userData = {
      ...form.value,
      // Đảm bảo matKhau có giá trị
      matKhau: form.value.matKhau || '123456',
    }

    emit('save', userData)
  } catch (error) {
    console.error('Error in handleSave:', error)
    showError('Có lỗi xảy ra khi lưu tài khoản')
  }
}

const handleSaveAndNew = async () => {
  await handleSave()
  emit('save-and-new')
}

const handleCancel = () => {
  emit('cancel')
}

// Watch props để cập nhật form khi user thay đổi
watch(
  () => props.user,
  (newUser) => {
    if (newUser && props.isEditMode) {
      form.value = {
        id: newUser.id,
        maVaiTro: newUser.maVaiTro?.id || newUser.maVaiTro || null,
        tenDangNhap: newUser.tenDangNhap || '',
        matKhau: newUser.matKhau || '',
        email: newUser.email || '',
        trangThai: newUser.trangThai !== undefined ? newUser.trangThai : 1,
        ngayTao: newUser.ngayTao || null,
      }
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(() => {
  fetchVaiTroList()

  // Nếu là chế độ chỉnh sửa, load dữ liệu user
  if (props.isEditMode && props.user) {
    form.value = {
      id: props.user.id,
      maVaiTro: props.user.maVaiTro?.id || props.user.maVaiTro || null,
      tenDangNhap: props.user.tenDangNhap || '',
      matKhau: props.user.matKhau || '',
      email: props.user.email || '',
      trangThai: props.user.trangThai !== undefined ? props.user.trangThai : 1,
      ngayTao: props.user.ngayTao || null,
    }
  } else if (!props.isEditMode) {
    // Reset form khi tạo mới
    form.value = {
      id: null,
      maVaiTro: null,
      tenDangNhap: '',
      matKhau: '',
      email: '',
      trangThai: 1,
      ngayTao: null,
    }
  }
})
</script>

<style scoped>
.form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.tai-khoan-form {
  padding: 20px;
}
</style>
