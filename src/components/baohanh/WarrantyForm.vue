<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">{{ isEditMode ? 'Chỉnh sửa bảo hành' : 'Tạo bảo hành mới' }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Số IMEI <span class="text-danger">*</span></label>
                                <div class="input-group">
                                    <input v-model="formData.imei_id" type="text" class="form-control" required
                                        :disabled="isEditMode">
                                    <button class="btn btn-outline-secondary" type="button" @click="searchImei"
                                        v-if="!isEditMode">
                                        <i class="bi bi-search"></i>
                                    </button>
                                </div>
                                <small class="text-muted" v-if="productInfo">
                                    Sản phẩm: {{ productInfo.name }} ({{ productInfo.sku }})
                                </small>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Khách hàng <span class="text-danger">*</span></label>
                                <select v-model="formData.khach_hang_id" class="form-select" required>
                                    <option value="">Chọn khách hàng</option>
                                    <option v-for="customer in customers" :value="customer.id">
                                        {{ customer.name }} ({{ customer.phone }})
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
                                <input v-model="formData.ngayBatDau" type="date" class="form-control" required
                                    :max="formData.ngayKetThuc">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
                                <input v-model="formData.ngayKetThuc" type="date" class="form-control" required
                                    :min="formData.ngayBatDau">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Thời gian bảo hành</label>
                                <div class="input-group">
                                    <input v-model="warrantyPeriod" type="number" class="form-control" min="1"
                                        @change="updateEndDate">
                                    <span class="input-group-text">tháng</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="formData.trangThai" class="form-select">
                                    <option value="ACTIVE">Đang bảo hành</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Mô tả</label>
                            <textarea v-model="formData.moTa" class="form-control" rows="3"></textarea>
                        </div>

                        <div class="mb-3" v-if="isEditMode">
                            <label class="form-label">Ghi chú thay đổi</label>
                            <input v-model="formData.ghiChu" type="text" class="form-control"
                                placeholder="Lý do thay đổi thông tin...">
                        </div>

                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" @click="$emit('close')">
                                Hủy bỏ
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                {{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWarrantyStore } from '@/stores/warrantyStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useProductStore } from '@/stores/productStore'
import { formatDateInput, addMonthsToDate } from '@/utils/dateUtils'

const props = defineProps({
    warranty: {
        type: Object,
        default: () => ({})
    },
    isEditMode: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['save', 'close'])

const warrantyStore = useWarrantyStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()

// State
const formData = ref({
    imei_id: '',
    khach_hang_id: '',
    ngayBatDau: formatDateInput(new Date()),
    ngayKetThuc: formatDateInput(addMonthsToDate(new Date(), 12)),
    moTa: '',
    trangThai: 'ACTIVE',
    ghiChu: ''
})

const warrantyPeriod = ref(12)
const loading = ref(false)
const customers = ref([])
const productInfo = ref(null)

// Computed
const remainingDays = computed(() => {
    const endDate = new Date(formData.value.ngayKetThuc)
    const today = new Date()
    return Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
})

// Methods
const fetchCustomers = async () => {
    try {
        await customerStore.fetchAllCustomers()
        customers.value = customerStore.customers
    } catch (error) {
        console.error('Error fetching customers:', error)
    }
}

const searchImei = async () => {
    if (!formData.value.imei_id) return

    try {
        const product = await productStore.getProductByImei(formData.value.imei_id)
        if (product) {
            productInfo.value = {
                name: product.ten,
                sku: product.sku
            }
        } else {
            productInfo.value = null
            alert('Không tìm thấy sản phẩm với IMEI này')
        }
    } catch (error) {
        console.error('Error searching IMEI:', error)
        productInfo.value = null
    }
}

const updateEndDate = () => {
    if (warrantyPeriod.value > 0) {
        formData.value.ngayKetThuc = formatDateInput(
            addMonthsToDate(new Date(formData.value.ngayBatDau), warrantyPeriod.value)
        )
    }
}

const handleSubmit = async () => {
    try {
        loading.value = true

        if (props.isEditMode) {
            await warrantyStore.updateWarranty(props.warranty.id, formData.value)
        } else {
            await warrantyStore.createWarranty(formData.value)
        }

        emit('save')
        emit('close')
    } catch (error) {
        console.error('Error saving warranty:', error)
    } finally {
        loading.value = false
    }
}

// Lifecycle
onMounted(() => {
    fetchCustomers()

    if (props.isEditMode) {
        formData.value = { ...props.warranty }
        // Calculate warranty period in months
        const start = new Date(props.warranty.ngayBatDau)
        const end = new Date(props.warranty.ngayKetThuc)
        warrantyPeriod.value = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30))
    }
})

// Watch for date changes
watch(() => formData.value.ngayBatDau, (newVal) => {
    if (newVal > formData.value.ngayKetThuc) {
        formData.value.ngayKetThuc = newVal
    }
    updateEndDate()
})
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
}

.modal-header {
    padding: 15px 20px;
}

.modal-title {
    font-weight: 600;
}

.modal-body {
    padding: 20px;
}

.form-label {
    font-weight: 500;
    margin-bottom: 5px;
}

.form-control,
.form-select {
    border-radius: 8px;
    padding: 10px 15px;
}

.btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
}

.btn:disabled {
    opacity: 0.65;
}

.input-group-text {
    background-color: #f8f9fa;
}
</style>