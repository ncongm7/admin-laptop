<template>
    <div class="customer-select p-3 border-bottom">
        <h6 class="mb-3">Khách hàng</h6>
        <div class="mb-2">
            <input type="text" class="form-control" placeholder="Tìm kiếm khách hàng..." v-model="searchQuery" />
        </div>
        <div class="mb-2">
            <select class="form-select" v-model="selectedCustomer">
                <option value="">Chọn khách hàng</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.name }} - {{
                    customer.phone }}</option>
                <option value="guest">Khách vãng lai</option>
            </select>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="$emit('add-customer')">Thêm mới</button>
            <button class="btn btn-outline-secondary btn-sm" @click="$emit('select-guest')">Khách vãng lai</button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
const selectedCustomer = ref('')
// Placeholder data
const customers = ref([
    { id: 1, name: 'Nguyễn Văn A', phone: '0123456789' },
    { id: 2, name: 'Trần Thị B', phone: '0987654321' }
])
// Emits: add-customer, select-guest
</script>

<style scoped>
.customer-select {
    background: #fff;
    border-radius: 8px 8px 0 0;
}
</style>