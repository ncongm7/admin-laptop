<template>
    <div class="cart-table p-3 border-bottom">
        <h6 class="mb-3">Giỏ hàng</h6>
        <table class="table table-sm align-middle">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Cấu hình</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in cart" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.config }}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm" style="width: 60px;"
                            v-model.number="item.quantity" min="1" @change="$emit('update-quantity', item)" />
                    </td>
                    <td>{{ item.price.toLocaleString() }}₫</td>
                    <td>
                        <button class="btn btn-sm btn-danger" @click="$emit('remove', item)">Xóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div v-if="cart.length === 0" class="text-muted">Chưa có sản phẩm nào trong giỏ.</div>
    </div>
</template>

<script setup>
const props = defineProps({
    cart: {
        type: Array,
        default: () => [
            { id: 1, name: 'MacBook Pro 14', config: 'RAM 16GB, SSD 1TB', quantity: 1, price: 40000000 },
            { id: 2, name: 'Dell XPS 13', config: 'RAM 8GB, SSD 512GB', quantity: 2, price: 25000000 }
        ]
    }
})
// Emits: update-quantity, remove
</script>

<style scoped>
.cart-table {
    background: #fff;
}
</style>