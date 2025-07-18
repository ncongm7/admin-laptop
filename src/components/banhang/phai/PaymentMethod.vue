<template>
    <div class="payment-method p-3 border-bottom">
        <h6 class="mb-3">Phương thức thanh toán</h6>
        <div class="mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="paymentMethods.cash" id="cash">
                <label class="form-check-label" for="cash">Tiền mặt</label>
            </div>
        </div>
        <div class="mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="paymentMethods.transfer" id="transfer">
                <label class="form-check-label" for="transfer">Chuyển khoản</label>
            </div>
        </div>
        <div class="mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="paymentMethods.card" id="card">
                <label class="form-check-label" for="card">Quẹt thẻ</label>
            </div>
        </div>
        <div class="mb-2">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="paymentMethods.cod" id="cod">
                <label class="form-check-label" for="cod">Thanh toán khi nhận hàng</label>
            </div>
        </div>
        <div v-if="paymentMethods.cash" class="mb-2">
            <input type="number" class="form-control" placeholder="Số tiền mặt..." v-model="cashAmount" />
        </div>
        <div v-if="paymentMethods.transfer" class="mb-2">
            <input type="number" class="form-control" placeholder="Số tiền chuyển khoản..." v-model="transferAmount" />
        </div>
        <div v-if="paymentMethods.card" class="mb-2">
            <input type="number" class="form-control" placeholder="Số tiền quẹt thẻ..." v-model="cardAmount" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const paymentMethods = ref({
    cash: false,
    transfer: false,
    card: false,
    cod: false
})
const cashAmount = ref(0)
const transferAmount = ref(0)
const cardAmount = ref(0)
// Emits: update-payment
</script>

<style scoped>
.payment-method {
    background: #fff;
}
</style>