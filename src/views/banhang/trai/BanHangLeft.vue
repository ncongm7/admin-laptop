<template>
    <div class="ban-hang-left-container container">
        <div class="row">
            <div class="col-12 ban-hang-left-block mt-3">
                <PendingOrders @orderSelected="(order) => $emit('orderSelected', order)" />
            </div>
            <div class="col-12 ban-hang-left-block mt-3">
                <ProductList @productSelected="(product) => $emit('productSelected', product)" />
            </div>
            <div class="col-12 ban-hang-left-block mt-3">
                <CartTable @cartUpdated="(cart) => $emit('cartUpdated', cart)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import CartTable from '@/components/banhang/trai/CartTable.vue';
import PendingOrders from '@/components/banhang/trai/PendingOrders.vue';
import ProductList from '@/views/sanpham/ProductList.vue';

</script>
<style scoped>
.ban-hang-left-container {
    background: #f6f8fa;
    border-radius: 18px;
    box-shadow: 0 4px 24px 0 rgba(13, 110, 253, 0.07);
    padding: 1.5rem 1rem;
    margin-bottom: 1.5rem;
}

.ban-hang-left-block {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 8px #0d6efd11;
    padding: 1.2rem 1rem;
    margin-bottom: 1.2rem;
    transition: box-shadow 0.18s, transform 0.18s;
}

.ban-hang-left-block:hover {
    box-shadow: 0 6px 24px #0d6efd22;
    transform: translateY(-2px) scale(1.01);
}

@media (max-width: 768px) {
    .ban-hang-left-container {
        padding: 0.7rem 0.2rem;
        border-radius: 10px;
    }

    .ban-hang-left-block {
        padding: 0.7rem 0.2rem;
        border-radius: 8px;
    }
}
</style>