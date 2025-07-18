<template>
    <div class="modal fade" id="customerFormModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ isEdit ? 'Sửa khách hàng' : 'Thêm khách hàng mới' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent>
                        <div class="mb-3">
                            <label class="form-label">Họ và tên *</label>
                            <input type="text" class="form-control" v-model="customer.name" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Số điện thoại *</label>
                            <input type="tel" class="form-control" v-model="customer.phone" required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="customer.email" />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Địa chỉ</label>
                            <textarea class="form-control" v-model="customer.address" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Ghi chú</label>
                            <textarea class="form-control" v-model="customer.note" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="button" class="btn btn-primary" @click="$emit('save-customer', customer)">Lưu</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    isEdit: { type: Boolean, default: false }
})
const customer = ref({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: ''
})
// Emits: save-customer
</script>

<style scoped>
.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}
</style>