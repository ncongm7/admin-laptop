<template>
    <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-info-circle"></i> Thông tin đơn</span>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="deliverySwitch" v-model="isDelivery">
                <label class="form-check-label" for="deliverySwitch">Bán giao hàng</label>
            </div>
        </div>
        <div class="card-body p-2">
            <div v-if="orderItems.length === 0" class="text-muted text-center py-3">
                <i class="bi bi-info-circle" style="font-size:2rem;"></i>
                <div>Chưa có sản phẩm trong đơn hàng</div>
            </div>
            <ul v-else class="list-group list-group-flush">
                <li v-for="item in orderItems" :key="item.id"
                    class="list-group-item d-flex justify-content-between align-items-center">
                    <span>{{ item.name }}</span>
                    <span class="badge bg-primary">x{{ item.quantity }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const isDelivery = ref(false)
const props = defineProps({
    orderItems: {
        type: Array,
        default: () => []
    }
})
</script>

<style scoped>
.card {
    border-radius: 10px;
    box-shadow: 0 2px 8px #0001;
}
</style>