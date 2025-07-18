<template>
    <div class="cart-actions p-3">
        <button class="btn btn-outline-danger me-2" @click="$emit('clear-cart')">Xóa giỏ</button>
        <button class="btn btn-outline-primary me-2" @click="$emit('update-cart')">Cập nhật số lượng</button>
        <button class="btn btn-outline-secondary" @click="$emit('select-imei')">Chọn IMEI</button>
    </div>
</template>

<script setup>
// Emits: clear-cart, update-cart, select-imei
</script>

<style scoped>
.cart-actions {
    background: #fff;
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #eee;
}
</style>