// FILE: src/views/AddPhieuGiamGia.vue
<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left Section: Form Thêm/Sửa Phiếu Giảm Giá -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ isEditMode ? 'Chỉnh Sửa Phiếu Giảm Giá' : 'Thêm Phiếu Giảm Giá' }}</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Mã Phiếu <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="voucherForm.ma"
                    placeholder="Nhập mã phiếu"
                    required
                    :disabled="isEditMode"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tên Phiếu <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="voucherForm.tenPhieuGiamGia"
                    placeholder="Nhập tên phiếu"
                    required
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Loại Giảm Giá <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="voucherForm.loaiPhieuGiamGia" required>
                    <option value="">Chọn loại</option>
                    <option :value="0">Phần trăm (%)</option>
                    <option :value="1">Tiền mặt (VND)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Giá Trị Giảm <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="voucherForm.giaTriGiamGia"
                      :min="0"
                      :max="voucherForm.loaiPhieuGiamGia === 0 ? 100 : undefined"
                      :step="voucherForm.loaiPhieuGiamGia === 0 ? 0.01 : 1000"
                      placeholder="0"
                      required
                    />
                    <span class="input-group-text">{{ voucherForm.loaiPhieuGiamGia === 0 ? '%' : 'VND' }}</span>
                  </div>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Số Tiền Giảm Tối Đa</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="voucherForm.soTienGiamToiDa"
                    :min="0"
                    step="1000"
                    placeholder="0"
                    :disabled="voucherForm.loaiPhieuGiamGia === 1"
                  />
                  <small class="text-muted" v-if="voucherForm.loaiPhieuGiamGia === 1">Tự động = Giá trị giảm</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Hóa Đơn Tối Thiểu</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="voucherForm.hoaDonToiThieu"
                    :min="0"
                    step="1000"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Số Lượng Sử Dụng</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model.number="voucherForm.soLuongDung"
                    :min="1"
                    placeholder="Không giới hạn"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Trạng Thái <span class="text-danger">*</span></label>
                  <select class="form-select" v-model.number="voucherForm.trangThai" required>
                    <option :value="1">Bật</option>
                    <option :value="0">Tắt</option>
                  </select>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Ngày Bắt Đầu <span class="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    v-model="voucherForm.ngayBatDau"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ngày Kết Thúc <span class="text-danger">*</span></label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    v-model="voucherForm.ngayKetThuc"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea
                  class="form-control"
                  v-model="voucherForm.moTa"
                  rows="3"
                  placeholder="Nhập mô tả"
                ></textarea>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="riengTuCheck"
                    v-model="voucherForm.riengTu"
                  />
                  <label class="form-check-label" for="riengTuCheck">
                    Phiếu giảm giá cá nhân (chỉ gán cho khách hàng cụ thể)
                  </label>
                </div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="quayVe" :disabled="loading">
                  Quay lại
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Right Section: Chọn Khách Hàng (chỉ hiển thị khi riengTu = true) -->
      <div class="col-md-5" v-if="voucherForm.riengTu">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Chọn Khách Hàng</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Tìm kiếm khách hàng</label>
              <input
                type="text"
                class="form-control"
                v-model="searchCustomer"
                placeholder="Tìm theo mã, tên, email, SĐT..."
              />
            </div>

            <div class="mb-3">
              <h6>Danh sách khách hàng</h6>
              <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 4px;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th width="30">
                        <input
                          type="checkbox"
                          :checked="allCustomersSelected"
                          @change="toggleSelectAllCustomers"
                        />
                      </th>
                      <th>Mã</th>
                      <th>Tên</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="customer in filteredCustomers"
                      :key="customer.id"
                      @click="toggleCustomer(customer)"
                      style="cursor: pointer"
                    >
                      <td>
                        <input
                          type="checkbox"
                          :checked="isCustomerSelected(customer)"
                          @click.stop="toggleCustomer(customer)"
                        />
                      </td>
                      <td>{{ customer.maKhachHang }}</td>
                      <td>{{ customer.hoTen }}</td>
                    </tr>
                    <tr v-if="filteredCustomers.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">
                        {{ loadingCustomers ? 'Đang tải...' : 'Không tìm thấy khách hàng' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="selectedCustomers.length > 0">
              <h6>Đã chọn ({{ selectedCustomers.length }})</h6>
              <div style="max-height: 150px; overflow-y: auto;">
                <div
                  v-for="customer in selectedCustomers"
                  :key="customer.id"
                  class="d-flex justify-content-between align-items-center p-2 border-bottom"
                >
                  <span>{{ customer.maKhachHang }} - {{ customer.hoTen }}</span>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeCustomer(customer)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { addVoucher, updateVoucher, getVoucherById } from '@/service/phieugiamgia/PhieuGiamGiaService'
import * as phieuGiamGiaKhachHangService from '@/service/phieugiamgia/PhieuGiamGiaKhachHangService'
import KhachHangService from '@/service/taikhoan/khachHangService'
import { useToast } from '@/composables/useToast'

const { success: showSuccess, error: showError } = useToast()
const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.params.id)
const loading = ref(false)
const loadingCustomers = ref(false)

const voucherForm = ref({
  ma: '',
  tenPhieuGiamGia: '',
  loaiPhieuGiamGia: null,
  giaTriGiamGia: null,
  soTienGiamToiDa: null,
  hoaDonToiThieu: null,
  soLuongDung: null,
  ngayBatDau: '',
  ngayKetThuc: '',
  moTa: '',
  riengTu: false,
  trangThai: 1
})

const searchCustomer = ref('')
const customers = ref([])
const selectedCustomers = ref([])

const filteredCustomers = computed(() => {
  if (!searchCustomer.value.trim()) return customers.value
  const search = searchCustomer.value.toLowerCase()
  return customers.value.filter(customer => {
    const ma = (customer.maKhachHang || '').toLowerCase()
    const ten = (customer.hoTen || '').toLowerCase()
    const email = (customer.email || '').toLowerCase()
    const sdt = (customer.soDienThoai || '').toLowerCase()
    return ma.includes(search) || ten.includes(search) || email.includes(search) || sdt.includes(search)
  })
})

const allCustomersSelected = computed(() => {
  return filteredCustomers.value.length > 0 &&
         filteredCustomers.value.every(c => isCustomerSelected(c))
})

const fetchCustomers = async () => {
  loadingCustomers.value = true
  try {
    const res = await KhachHangService.getAll()
    customers.value = res?.data?.data || res?.data || []
  } catch (e) {
    console.error('Lỗi khi tải danh sách khách hàng:', e)
    showError('Không thể tải danh sách khách hàng')
  } finally {
    loadingCustomers.value = false
  }
}

const fetchVoucherDetail = async () => {
  if (!isEditMode.value) return
  
  loading.value = true
  try {
    const res = await getVoucherById(route.params.id)
    const data = res?.data || res
    
    voucherForm.value = {
      ma: data.ma || '',
      tenPhieuGiamGia: data.tenPhieuGiamGia || '',
      loaiPhieuGiamGia: data.loaiPhieuGiamGia,
      giaTriGiamGia: data.giaTriGiamGia,
      soTienGiamToiDa: data.soTienGiamToiDa,
      hoaDonToiThieu: data.hoaDonToiThieu,
      soLuongDung: data.soLuongDung,
      ngayBatDau: formatDateTimeLocal(data.ngayBatDau),
      ngayKetThuc: formatDateTimeLocal(data.ngayKetThuc),
      moTa: data.moTa || '',
      riengTu: data.riengTu || false,
      trangThai: data.trangThai ?? 1
    }
    
    if (data.riengTu) {
      await loadKhachHangDaGan()
    }
  } catch (e) {
    console.error('Lỗi khi tải chi tiết voucher:', e)
    showError('Không thể tải chi tiết voucher')
  } finally {
    loading.value = false
  }
}

const loadKhachHangDaGan = async () => {
  if (!isEditMode.value) return
  try {
    const res = await phieuGiamGiaKhachHangService.getKhachHangCuaPhieuGiamGia(route.params.id)
    const data = res?.data || []
    selectedCustomers.value = data
  } catch (e) {
    console.error('Lỗi khi tải khách hàng đã gán:', e)
  }
}

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatToISO = (dateTimeLocal) => {
  if (!dateTimeLocal) return null
  return new Date(dateTimeLocal).toISOString()
}

const toggleCustomer = (customer) => {
  const index = selectedCustomers.value.findIndex(c => c.id === customer.id)
  if (index > -1) {
    selectedCustomers.value.splice(index, 1)
  } else {
    selectedCustomers.value.push(customer)
  }
}

const isCustomerSelected = (customer) => {
  return selectedCustomers.value.some(c => c.id === customer.id)
}

const removeCustomer = (customer) => {
  const index = selectedCustomers.value.findIndex(c => c.id === customer.id)
  if (index > -1) {
    selectedCustomers.value.splice(index, 1)
  }
}

const toggleSelectAllCustomers = (e) => {
  if (e.target.checked) {
    const toAdd = filteredCustomers.value.filter(c => !isCustomerSelected(c))
    selectedCustomers.value.push(...toAdd)
  } else {
    const toRemove = filteredCustomers.value.map(c => c.id)
    selectedCustomers.value = selectedCustomers.value.filter(c => !toRemove.includes(c.id))
  }
}

const handleSubmit = async () => {
  if (!voucherForm.value.ma?.trim()) {
    showError('Vui lòng nhập mã phiếu')
    return
  }
  if (!voucherForm.value.tenPhieuGiamGia?.trim()) {
    showError('Vui lòng nhập tên phiếu')
    return
  }
  if (voucherForm.value.loaiPhieuGiamGia === null) {
    showError('Vui lòng chọn loại giảm giá')
    return
  }
  if (!voucherForm.value.giaTriGiamGia && voucherForm.value.giaTriGiamGia !== 0) {
    showError('Vui lòng nhập giá trị giảm')
    return
  }
  if (voucherForm.value.loaiPhieuGiamGia === 0 && (voucherForm.value.giaTriGiamGia < 0 || voucherForm.value.giaTriGiamGia > 100)) {
    showError('Giá trị giảm (%) phải trong khoảng 0-100')
    return
  }
  if (voucherForm.value.riengTu && selectedCustomers.value.length === 0 && !isEditMode.value) {
    showError('Vui lòng chọn ít nhất một khách hàng cho phiếu cá nhân')
    return
  }

  loading.value = true
  try {
    const payload = {
      ma: voucherForm.value.ma.trim(),
      tenPhieuGiamGia: voucherForm.value.tenPhieuGiamGia.trim(),
      loaiPhieuGiamGia: voucherForm.value.loaiPhieuGiamGia,
      giaTriGiamGia: voucherForm.value.giaTriGiamGia,
      soTienGiamToiDa: voucherForm.value.soTienGiamToiDa || null,
      hoaDonToiThieu: voucherForm.value.hoaDonToiThieu || null,
      soLuongDung: voucherForm.value.soLuongDung || null,
      ngayBatDau: formatToISO(voucherForm.value.ngayBatDau),
      ngayKetThuc: formatToISO(voucherForm.value.ngayKetThuc),
      moTa: voucherForm.value.moTa || null,
      riengTu: voucherForm.value.riengTu,
      trangThai: voucherForm.value.trangThai
    }

    let voucherId
    if (isEditMode.value) {
      await updateVoucher(payload, route.params.id)
      voucherId = route.params.id
      showSuccess('Cập nhật phiếu giảm giá thành công')
    } else {
      const res = await addVoucher(payload)
      voucherId = res?.data?.id
      showSuccess('Thêm phiếu giảm giá thành công')
    }

    if (voucherId && voucherForm.value.riengTu && selectedCustomers.value.length > 0) {
      const khachHangIds = selectedCustomers.value.map(c => c.id)
      try {
        await phieuGiamGiaKhachHangService.ganPhieuGiamGiaChoKhachHang(voucherId, khachHangIds)
        showSuccess('Đã gán phiếu cho khách hàng thành công')
      } catch (e) {
        console.error('Lỗi khi gán khách hàng:', e)
        showError('Lỗi khi gán khách hàng: ' + (e?.message || 'Unknown error'))
      }
    } else if (isEditMode.value && voucherId && voucherForm.value.riengTu) {
      const khachHangIds = selectedCustomers.value.map(c => c.id)
      try {
        await phieuGiamGiaKhachHangService.capNhatKhachHangChoPhieuGiamGia(voucherId, khachHangIds)
        showSuccess('Đã cập nhật khách hàng cho phiếu thành công')
      } catch (e) {
        console.error('Lỗi khi cập nhật khách hàng:', e)
        showError('Lỗi khi cập nhật khách hàng: ' + (e?.message || 'Unknown error'))
      }
    }

    router.push('/quan-li-phieu-giam-gia')
  } catch (e) {
    console.error('Lỗi khi lưu voucher:', e)
    showError(e?.message || 'Có lỗi xảy ra khi lưu phiếu giảm giá')
  } finally {
    loading.value = false
  }
}

const quayVe = () => {
  router.push('/quan-li-phieu-giam-gia')
}

watch(() => voucherForm.value.loaiPhieuGiamGia, (newVal) => {
  if (newVal === 1 && voucherForm.value.giaTriGiamGia) {
    voucherForm.value.soTienGiamToiDa = voucherForm.value.giaTriGiamGia
  }
})

onMounted(async () => {
  await fetchCustomers()
  await fetchVoucherDetail()
})
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}
</style>
