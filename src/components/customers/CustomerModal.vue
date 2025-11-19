<template>
    <div class="modal fade show d-block" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">{{ isEditMode ? 'Cập nhật' : 'Tạo mới' }} khách hàng</h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="saveCustomer">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" v-model="form.name" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                                <input type="tel" class="form-control" v-model="form.phone" required>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="form.email">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Giới tính</label>
                                <select class="form-select" v-model="form.gender">
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Địa chỉ</label>
                                <div class="row g-2">
                                    <div class="col-md-3">
                                        <input type="text" class="form-control" placeholder="Số nhà"
                                            v-model="form.address.street">
                                    </div>
                                    <div class="col-md-3">
                                        <div class="position-relative">
                                            <input type="text" class="form-control" placeholder="Tỉnh/Thành phố"
                                                v-model="selectedProvinceName" @input="handleProvinceSearch"
                                                @focus="showProvinceDropdown = true" @blur="handleProvinceBlur"
                                                :disabled="loadingProvinces" autocomplete="off" />
                                            <div v-if="showProvinceDropdown && filteredProvinces.length > 0"
                                                class="dropdown-menu show position-absolute w-100"
                                                style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                                                <a v-for="province in filteredProvinces" :key="province.id"
                                                    class="dropdown-item" @mousedown.prevent="selectProvince(province)"
                                                    href="#">
                                                    {{ province.name }}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="position-relative">
                                            <input type="text" class="form-control" placeholder="Quận/Huyện"
                                                v-model="selectedDistrictName" @input="handleDistrictSearch"
                                                @focus="showDistrictDropdown = true" @blur="handleDistrictBlur"
                                                :disabled="!form.address.provinceCode || loadingDistricts"
                                                autocomplete="off" />
                                            <div v-if="showDistrictDropdown && filteredDistricts.length > 0"
                                                class="dropdown-menu show position-absolute w-100"
                                                style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                                                <a v-for="district in filteredDistricts" :key="district.id"
                                                    class="dropdown-item" @mousedown.prevent="selectDistrict(district)"
                                                    href="#">
                                                    {{ district.name }}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="position-relative">
                                            <input type="text" class="form-control" placeholder="Phường/Xã"
                                                v-model="selectedWardName" @input="handleWardSearch"
                                                @focus="showWardDropdown = true" @blur="handleWardBlur"
                                                :disabled="!form.address.districtCode || loadingWards"
                                                autocomplete="off" />
                                            <div v-if="showWardDropdown && filteredWards.length > 0"
                                                class="dropdown-menu show position-absolute w-100"
                                                style="max-height: 200px; overflow-y: auto; z-index: 1000;">
                                                <a v-for="ward in filteredWards" :key="ward.id" class="dropdown-item"
                                                    @mousedown.prevent="selectWard(ward)" href="#">
                                                    {{ ward.name }}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" v-model="form.isDefaultAddress">
                                    <label class="form-check-label">Đặt làm địa chỉ mặc định</label>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Hủy</button>
                    <button type="button" class="btn btn-primary" @click="saveCustomer">
                        <i class="bi bi-save me-2"></i>
                        {{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}
                    </button>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import VietnamAddressService from '@/service/taikhoan/vietnamAddressService'

const props = defineProps({
    customer: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'save'])

const isEditMode = ref(false)
const form = ref({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    address: {
        street: '',
        ward: '',
        district: '',
        city: '',
        provinceCode: '',
        districtCode: '',
        wardCode: '',
    },
    isDefaultAddress: false
})

// Address dropdown states
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const loadingProvinces = ref(false)
const loadingDistricts = ref(false)
const loadingWards = ref(false)
const showProvinceDropdown = ref(false)
const showDistrictDropdown = ref(false)
const showWardDropdown = ref(false)
const provinceSearchText = ref('')
const districtSearchText = ref('')
const wardSearchText = ref('')

// Computed properties
const filteredProvinces = computed(() => {
    if (!provinceSearchText.value.trim()) return provinces.value
    const search = provinceSearchText.value.toLowerCase().trim()
    return provinces.value.filter(p => p.name.toLowerCase().includes(search))
})

const filteredDistricts = computed(() => {
    if (!districtSearchText.value.trim()) return districts.value
    const search = districtSearchText.value.toLowerCase().trim()
    return districts.value.filter(d => d.name.toLowerCase().includes(search))
})

const filteredWards = computed(() => {
    if (!wardSearchText.value.trim()) return wards.value
    const search = wardSearchText.value.toLowerCase().trim()
    return wards.value.filter(w => w.name.toLowerCase().includes(search))
})

const selectedProvinceName = computed(() => {
    if (provinceSearchText.value) return provinceSearchText.value
    if (form.value.address.provinceCode) {
        const province = provinces.value.find(p => p.code === form.value.address.provinceCode)
        return province ? province.name : ''
    }
    return ''
})

const selectedDistrictName = computed(() => {
    if (districtSearchText.value) return districtSearchText.value
    if (form.value.address.districtCode) {
        const district = districts.value.find(d => d.code === form.value.address.districtCode)
        return district ? district.name : ''
    }
    return ''
})

const selectedWardName = computed(() => {
    if (wardSearchText.value) return wardSearchText.value
    if (form.value.address.wardCode) {
        const ward = wards.value.find(w => w.code === form.value.address.wardCode)
        return ward ? ward.name : ''
    }
    return ''
})

onMounted(async () => {
    if (props.customer) {
        isEditMode.value = true
        form.value = {
            ...props.customer,
            address: props.customer.address || {
                street: '',
                ward: '',
                district: '',
                city: '',
                provinceCode: '',
                districtCode: '',
                wardCode: '',
            }
        }
    }
    // Load provinces
    await fetchProvinces()
})

// Methods
const fetchProvinces = async () => {
    try {
        loadingProvinces.value = true
        provinces.value = await VietnamAddressService.getAllProvinces()
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error)
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
        if (form.value.address.provinceCode) {
            provinceSearchText.value = ''
        }
    }, 200)
}

const selectProvince = async (province) => {
    form.value.address.provinceCode = province.code
    form.value.address.city = province.name
    provinceSearchText.value = ''
    showProvinceDropdown.value = false

    // Reset district and ward
    form.value.address.districtCode = ''
    form.value.address.district = ''
    form.value.address.wardCode = ''
    form.value.address.ward = ''
    districts.value = []
    wards.value = []

    // Load districts
    try {
        loadingDistricts.value = true
        districts.value = await VietnamAddressService.getDistrictsByProvince(province.code)
    } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', error)
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
        if (form.value.address.districtCode) {
            districtSearchText.value = ''
        }
    }, 200)
}

const selectDistrict = async (district) => {
    form.value.address.districtCode = district.code
    form.value.address.district = district.name
    districtSearchText.value = ''
    showDistrictDropdown.value = false

    // Reset ward
    form.value.address.wardCode = ''
    form.value.address.ward = ''
    wards.value = []

    // Load wards
    try {
        loadingWards.value = true
        wards.value = await VietnamAddressService.getWardsByDistrict(district.code)
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phường/xã:', error)
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
        if (form.value.address.wardCode) {
            wardSearchText.value = ''
        }
    }, 200)
}

const selectWard = (ward) => {
    form.value.address.wardCode = ward.code
    form.value.address.ward = ward.name
    wardSearchText.value = ''
    showWardDropdown.value = false
}

const close = () => {
    emit('close')
}

const saveCustomer = () => {
    // Validate form
    if (!form.value.name || !form.value.phone) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc')
        return
    }

    emit('save', {
        ...form.value,
        // Format address string
        address: `${form.value.address.street}, ${form.value.address.ward}, ${form.value.address.district}, ${form.value.address.city}`
    })
    close()
}
</script>

<style scoped>
.modal-content {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-body {
    overflow-y: auto;
}

.form-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
}
</style>