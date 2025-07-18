<template>
    <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-receipt"></i> Hóa đơn chờ</span>
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('refresh')"><i
                    class="bi bi-arrow-clockwise"></i></button>
        </div>
        <div class="card-body p-2">
            <div v-if="orders.length === 0" class="text-muted text-center py-3">Không có hóa đơn chờ</div>
            <div v-for="order in orders" :key="order.id"
                class="d-flex align-items-center justify-content-between border-bottom py-2">
                <div>
                    <span class="fw-bold">{{ order.code }}</span>
                    <span class="badge bg-warning text-dark ms-2">Chờ xử lý</span>
                    <div class="small text-muted">{{ order.items }} sản phẩm</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" @click="$emit('remove', order)"><i
                        class="bi bi-trash"></i></button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    orders: {
        type: Array,
        default: () => [
            { id: 1, code: 'HD_1GN5WL', items: 0 },
            { id: 2, code: 'HD_2ABCD', items: 2 }
        ]
    }
})
// Emits: remove, refresh
</script>

<style scoped>
.card {
    border-radius: 10px;
    box-shadow: 0 2px 8px #0001;
}
</style>