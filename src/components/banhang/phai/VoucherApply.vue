<template>
    <div class="voucher-apply p-3 border-bottom">
        <h6 class="mb-3">Mã giảm giá</h6>
        <div class="mb-2">
            <input type="text" class="form-control" placeholder="Nhập mã voucher..." v-model="voucherCode" />
        </div>
        <div class="mb-2">
            <select class="form-select" v-model="selectedVoucher">
                <option value="">Chọn voucher</option>
                <option v-for="voucher in vouchers" :key="voucher.id" :value="voucher.id">{{ voucher.name }} - Giảm {{
                    voucher.discount }}%</option>
            </select>
        </div>
        <div v-if="appliedVoucher" class="alert alert-success">
            <div class="d-flex justify-content-between">
                <span>{{ appliedVoucher.name }}</span>
                <span>-{{ appliedVoucher.discountAmount.toLocaleString() }}₫</span>
            </div>
        </div>
        <button class="btn btn-outline-primary btn-sm" @click="$emit('apply-voucher')">Áp dụng</button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const voucherCode = ref('')
const selectedVoucher = ref('')
const appliedVoucher = ref(null)
// Placeholder data
const vouchers = ref([
    { id: 1, name: 'Giảm 10%', discount: 10, discountAmount: 5000000 },
    { id: 2, name: 'Giảm 5%', discount: 5, discountAmount: 2500000 }
])
// Emits: apply-voucher
</script>

<style scoped>
.voucher-apply {
    background: #fff;
}
</style>