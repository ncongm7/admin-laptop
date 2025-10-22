<template>
    <div class="customer-info card mb-3">
        <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">Thông tin khách hàng</h5>
        </div>
        <div class="card-body">
            <div v-if="customer">
                <div class="d-flex justify-content-between mb-2">
                    <h6 class="mb-0">{{ customer.name }}</h6>
                    <button class="btn btn-sm btn-outline-secondary" @click="clearCustomer">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <p class="mb-1">
                    <i class="bi bi-telephone"></i> {{ customer.phone }}
                </p>
                <p class="mb-1">
                    <i class="bi bi-envelope"></i> {{ customer.email || 'Chưa có email' }}
                </p>
                <p class="mb-0">
                    <i class="bi bi-geo-alt"></i> {{ customer.address || 'Chưa có địa chỉ' }}
                </p>
            </div>
            <div v-else>
                <div class="input-group mb-2">
                    <input type="text" class="form-control" placeholder="SĐT hoặc tên KH" v-model="searchTerm"
                        @keyup.enter="searchCustomer">
                    <button class="btn btn-primary" @click="searchCustomer">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary" @click="createCustomer">
                        <i class="bi bi-plus-circle"></i> Tạo khách hàng mới
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    customer: {
        type: Object,
        default: null
    }
})

const emit = defineEmits([
    'update:customer',
    'search-customer',
    'create-customer'
])

const searchTerm = ref('')

const searchCustomer = () => {
    if (searchTerm.value.trim()) {
        emit('search-customer', searchTerm.value.trim())
    }
}

const createCustomer = () => {
    emit('create-customer')
}

const clearCustomer = () => {
    emit('update:customer', null)
}
</script>

<style scoped>
.customer-info {
    position: sticky;
    top: 20px;
    z-index: 101;
}
</style>