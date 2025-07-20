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
                                        <input type="text" class="form-control" placeholder="Phường/Xã"
                                            v-model="form.address.ward">
                                    </div>
                                    <div class="col-md-3">
                                        <input type="text" class="form-control" placeholder="Quận/Huyện"
                                            v-model="form.address.district">
                                    </div>
                                    <div class="col-md-3">
                                        <input type="text" class="form-control" placeholder="Tỉnh/Thành"
                                            v-model="form.address.city">
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
import { ref, onMounted } from 'vue'

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
    },
    isDefaultAddress: false
})

onMounted(() => {
    if (props.customer) {
        isEditMode.value = true
        form.value = {
            ...props.customer,
            address: props.customer.address || {
                street: '',
                ward: '',
                district: '',
                city: '',
            }
        }
    }
})

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