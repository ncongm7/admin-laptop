<template>
  <div class="delivery-section">
    <!-- Lựa chọn giao hàng -->
    <div class="mb-3">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="canGiaoHang" v-model="localFormData.canGiaoHang"
          :disabled="isProcessing" @change="handleGiaoHangChange" />
        <label class="form-check-label fw-semibold" for="canGiaoHang">
          <i class="bi bi-truck text-primary"></i> Cần giao hàng
        </label>
      </div>
    </div>

    <!-- Form thông tin giao hàng (hiện khi chọn giao hàng) -->
    <div v-if="localFormData.canGiaoHang" class="delivery-info-section p-3 bg-light rounded border">
      <h6 class="mb-3">
        <i class="bi bi-geo-alt text-success"></i> Thông tin giao hàng
      </h6>

      <!-- Chọn địa chỉ đã lưu -->
      <div class="mb-3" v-if="savedAddresses.length > 0">
        <label class="form-label fw-semibold">
          <i class="bi bi-bookmark-check me-1"></i> Chọn địa chỉ đã lưu
        </label>
        <select class="form-select" v-model="selectedSavedAddressId" @change="loadSavedAddress"
          :disabled="isProcessing">
          <option value="">-- Chọn địa chỉ đã lưu --</option>
          <option v-for="addr in savedAddresses" :key="addr.id" :value="addr.id">
            {{ formatAddressDisplay(addr) }}
          </option>
        </select>
      </div>

      <div class="row g-3">
        <!-- Tên người nhận -->
        <div class="col-md-6">
          <label class="form-label fw-semibold">
            Tên người nhận <span class="text-danger">*</span>
          </label>
          <input type="text" class="form-control" v-model="localFormData.tenNguoiNhan"
            placeholder="Nhập tên người nhận" :disabled="isProcessing" />
          <small class="text-muted">Để trống nếu người nhận là khách hàng</small>
        </div>

        <!-- Số điện thoại người nhận -->
        <div class="col-md-6">
          <label class="form-label fw-semibold">
            Số điện thoại người nhận <span class="text-danger">*</span>
          </label>
          <input type="text" class="form-control" v-model="localFormData.sdtNguoiNhan"
            placeholder="Nhập số điện thoại người nhận" :disabled="isProcessing" />
          <small class="text-muted">Để trống nếu người nhận là khách hàng</small>
        </div>
      </div>

      <hr class="my-3">

      <!-- Địa chỉ giao hàng -->
      <h6 class="mb-3">
        <i class="bi bi-geo-alt me-1"></i> Địa chỉ giao hàng
      </h6>

      <!-- Component DiaChiForm để nhập địa chỉ -->
      <div class="address-form-wrapper">
        <DiaChiForm :maKhachHang="hoaDon?.khachHang?.maKhachHang || ''" :customerInfo="customerInfoForAddress"
          :hideCustomerFields="true" :checkDuplicateFn="checkDuplicateAddress" @success="handleAddressSaved"
          ref="diaChiFormRef" />
      </div>

      <!-- Ghi chú giao hàng -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Ghi chú giao hàng</label>
        <textarea class="form-control" rows="2" v-model="localFormData.ghiChuGiaoHang"
          placeholder="Ghi chú về giao hàng (nếu có)" :disabled="isProcessing"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import DiaChiForm from '@/components/taikhoan/khachhang/DiaChiForm.vue'
import DiaChiService from '@/service/taikhoan/diaChiService'
import { useToast } from '@/composables/common/useToast'

const props = defineProps({
  modelValue: { // formData
    type: Object,
    required: true
  },
  hoaDon: {
    type: Object,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const localFormData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const { success: showSuccess, error: showError, warning: showWarning } = useToast()

const diaChiFormRef = ref(null)
const savedAddresses = ref([])
const selectedSavedAddressId = ref('')
const isLoadingAddresses = ref(false)

const customerInfoForAddress = computed(() => {
  if (!props.hoaDon?.khachHang) return null
  return {
    maKhachHang: props.hoaDon.khachHang.maKhachHang,
    hoTen: props.hoaDon.khachHang.hoTen,
    soDienThoai: props.hoaDon.khachHang.soDienThoai
  }
})

// ==================== LOGIC GIAO HANG ====================
const formatAddressDisplay = (address) => {
  const parts = []
  if (address.diaChi) parts.push(address.diaChi)
  if (address.xa) parts.push(address.xa)
  if (address.tinh) parts.push(address.tinh)
  return parts.join(', ') || 'Địa chỉ'
}

const ensureCustomerReadyForDelivery = () => {
  const customer = props.hoaDon?.khachHang
  const name = (customer?.hoTen || props.hoaDon?.tenKhachHang || '').trim()
  const phone = (customer?.soDienThoai || props.hoaDon?.soDienThoai || props.hoaDon?.sdt || '').trim()

  return {
    canProceed: true,
    customer: customer || {},
    name,
    phone,
    maKhachHang: customer?.maKhachHang || null,
  }
}

const pickPreferredAddress = (addresses = []) => {
  if (!Array.isArray(addresses) || addresses.length === 0) return null
  return addresses.find((addr) => addr?.macDinh) || addresses[0]
}

const ensureDiaChiFormBaseline = async (customerBasics) => {
  await nextTick()
  if (!diaChiFormRef.value) return
  if (typeof diaChiFormRef.value.resetForm === 'function') diaChiFormRef.value.resetForm()
  const form = diaChiFormRef.value.form
  if (form) {
    form.hoTen = customerBasics?.name || form.hoTen || ''
    form.sdt = customerBasics?.phone || form.sdt || ''
    form.maKhachHang = props.hoaDon?.khachHang?.maKhachHang || form.maKhachHang || ''
  }
}

const hydrateDiaChiFormFromAddress = async (address, customerBasics) => {
  if (!address) return

  const receiverName = address.hoTen || customerBasics?.name || ''
  const receiverPhone = address.sdt || customerBasics?.phone || ''

  // Update local formData
  localFormData.value.tenNguoiNhan = receiverName
  localFormData.value.sdtNguoiNhan = receiverPhone
  localFormData.value.diaChiChiTiet = address.diaChi || ''
  localFormData.value.tinh = address.tinh || ''
  localFormData.value.xa = address.xa || ''
  localFormData.value.diaChiGiaoHang = formatAddressDisplay(address)
  selectedSavedAddressId.value = address.id || ''

  await nextTick()
  const diaChiForm = diaChiFormRef.value
  if (!diaChiForm) return

  if (typeof diaChiForm.fetchProvinces === 'function' && (!diaChiForm.provinces || diaChiForm.provinces.length === 0)) {
    await diaChiForm.fetchProvinces()
  }

  const form = diaChiForm.form
  if (form) {
    form.diaChi = address.diaChi || ''
    form.hoTen = receiverName || form.hoTen || ''
    form.sdt = receiverPhone || form.sdt || ''
  }

  // Set selected province/ward
  // Simplified logic, assume child form handles selection if we match names
  if (address.tinh && diaChiForm.provinces) {
    const matchedProvince = diaChiForm.provinces.find(p => p.name === address.tinh)
    if (matchedProvince && typeof diaChiForm.selectProvince === 'function') {
      await diaChiForm.selectProvince(matchedProvince)
    } else if (form) {
      form.tinh = address.tinh
    }
  }

  await nextTick()
  if (address.xa && diaChiForm.wards) {
    const matchedWard = diaChiForm.wards.find(w => w.name === address.xa)
    if (matchedWard && typeof diaChiForm.selectWard === 'function') {
      diaChiForm.selectWard(matchedWard)
    } else if (form) {
      form.xa = address.xa
      form.xaCode = address.xa
    }
  }
}

const loadSavedAddresses = async ({ notifyOnMissing = false } = {}) => {
  const maKhachHang = props.hoaDon?.khachHang?.maKhachHang
  if (!maKhachHang) {
    savedAddresses.value = []
    if (notifyOnMissing) showWarning('Khách hàng thiếu thông tin địa chỉ.')
    return []
  }

  try {
    isLoadingAddresses.value = true
    const response = await DiaChiService.findByMaKhachHang(maKhachHang)
    savedAddresses.value = Array.isArray(response) ? response : (response?.data || [])
    if (notifyOnMissing && savedAddresses.value.length === 0) {
      showWarning('Khách hàng chưa có địa chỉ lưu.')
    }
    return savedAddresses.value
  } catch (error) {
    console.error('Error loading addresses:', error)
    savedAddresses.value = []
    return []
  } finally {
    isLoadingAddresses.value = false
  }
}

const handleGiaoHangChange = async () => {
  if (!localFormData.value.canGiaoHang) {
    resetDeliveryState()
    return
  }

  const readiness = ensureCustomerReadyForDelivery()
  if (!readiness.canProceed) {
    localFormData.value.canGiaoHang = false
    return
  }

  localFormData.value.tenNguoiNhan = readiness.name
  localFormData.value.sdtNguoiNhan = readiness.phone

  await nextTick()
  const addresses = await loadSavedAddresses({ notifyOnMissing: true })
  if (!addresses || addresses.length === 0) {
    await ensureDiaChiFormBaseline(readiness)
    return
  }
  const preferred = pickPreferredAddress(addresses)
  await hydrateDiaChiFormFromAddress(preferred, readiness)
}

const resetDeliveryState = () => {
  localFormData.value.tenNguoiNhan = ''
  localFormData.value.sdtNguoiNhan = ''
  localFormData.value.diaChiChiTiet = ''
  localFormData.value.tinhCode = ''
  localFormData.value.tinh = ''
  localFormData.value.xaCode = ''
  localFormData.value.xa = ''
  localFormData.value.diaChiGiaoHang = ''
  localFormData.value.ghiChuGiaoHang = ''
  selectedSavedAddressId.value = ''
  if (diaChiFormRef.value?.resetForm) diaChiFormRef.value.resetForm()
}

const loadSavedAddress = async () => {
  if (!selectedSavedAddressId.value) return
  const address = savedAddresses.value.find(a => a.id === selectedSavedAddressId.value)
  if (!address) return
  const readiness = ensureCustomerReadyForDelivery()
  await hydrateDiaChiFormFromAddress(address, readiness)
}

const handleAddressSaved = async () => {
  const addresses = await loadSavedAddresses({ notifyOnMissing: false })
  if (localFormData.value.canGiaoHang && addresses.length > 0) {
    const readiness = ensureCustomerReadyForDelivery()
    const preferred = pickPreferredAddress(addresses)
    await hydrateDiaChiFormFromAddress(preferred, readiness)
  }
  showSuccess('Đã lưu địa chỉ thành công!')
}

const checkDuplicateAddress = async (formDataToCheck) => {
  if (!formDataToCheck || !savedAddresses.value.length) return false
  const normalize = (str) => (str || '').trim().toLowerCase()
  const current = {
    diaChi: normalize(formDataToCheck.diaChi),
    tinh: normalize(formDataToCheck.tinh),
    xa: normalize(formDataToCheck.xa)
  }
  const duplicate = savedAddresses.value.find(addr => {
    return normalize(addr.diaChi) === current.diaChi &&
           normalize(addr.tinh) === current.tinh &&
           normalize(addr.xa) === current.xa
  })
  if (duplicate) {
    selectedSavedAddressId.value = duplicate.id
    return true
  }
  return false
}

// Watchers
watch(() => props.hoaDon?.khachHang?.maKhachHang, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal && localFormData.value.canGiaoHang) {
    await handleGiaoHangChange()
  }
})

// Expose diaChiForm for validation in parent
defineExpose({
  diaChiFormRef
})
</script>

<style scoped>
.delivery-section {
    width: 100%;
}
</style>
