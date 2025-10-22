<template>
    <div class="cart-sidebar card mb-3">
        <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">Giỏ hàng</h5>
        </div>
        <div class="card-body p-0">
            <div v-if="items.length === 0" class="p-3 text-center text-muted">
                <i class="bi bi-cart-x" style="font-size: 2rem;"></i>
                <p class="mt-2 mb-0">Chưa có sản phẩm nào</p>
            </div>
            <ul v-else class="list-group list-group-flush">
                <li v-for="item in items" :key="item.id" class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">{{ item.name }}</h6>
                            <small v-if="item.imei" class="text-muted d-block">
                                IMEI: {{ item.imei }}
                            </small>
                            <div class="input-group input-group-sm mt-1" style="width: 120px;">
                                <button class="btn btn-outline-secondary"
                                    @click="updateQuantity(item.id, item.quantity - 1)">
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="number" class="form-control text-center" min="1"
                                    v-model.number="item.quantity" @change="updateQuantity(item.id, item.quantity)">
                                <button class="btn btn-outline-secondary"
                                    @click="updateQuantity(item.id, item.quantity + 1)">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold">{{ formatPrice(item.price * item.quantity) }}</div>
                            <small class="text-muted">{{ formatPrice(item.price) }}/cái</small>
                            <button class="btn btn-sm btn-outline-danger d-block mt-1 ms-auto"
                                @click="removeItem(item.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { formatPrice } from '@/utils/helpers'

const props = defineProps({
    items: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['update-quantity', 'remove-item'])

const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
        emit('update-quantity', itemId, newQuantity)
    }
}

const removeItem = (itemId) => {
    emit('remove-item', itemId)
}
</script>

<style scoped>
.cart-sidebar {
    max-height: 400px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.card-body {
    overflow-y: auto;
    flex: 1;
}

.list-group-item {
    padding: 1rem;
}

.input-group {
    flex-wrap: nowrap;
}
</style>