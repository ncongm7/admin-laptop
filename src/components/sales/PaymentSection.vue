<template>
    <div class="payment-section card">
        <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">Thanh toán</h5>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Phương thức thanh toán</label>
                <select class="form-select" v-model="selectedPaymentMethod">
                    <option v-for="method in paymentMethods" :value="method.id">
                        {{ method.name }}
                    </option>
                </select>
            </div>

            <div v-if="selectedPaymentMethod === 2" class="mb-3">
                <label class="form-label">Số tiền khách đưa</label>
                <input type="number" class="form-control" v-model.number="cashReceived" min="0"
                    :step="total >= 1000000 ? 100000 : 10000">
                <div v-if="cashReceived > 0" class="mt-2">
                    <span>Tiền thừa:</span>
                    <span class="fw-bold ms-2 text-success">
                        {{ formatPrice(cashReceived - total) }}
                    </span>
                </div>
            </div>

            <div class="d-grid">
                <button class="btn btn-success btn-lg" :disabled="total <= 0" @click="completePayment">
                    <i class="bi bi-credit-card me-2"></i>
                    Hoàn tất thanh toán ({{ formatPrice(total) }})
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatPrice } from '@/utils/helpers'

const props = defineProps({
    total: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['complete-payment'])

const paymentMethods = ref([
    { id: 1, name: 'Chuyển khoản' },
    { id: 2, name: 'Tiền mặt' },
    { id: 3, name: 'Thẻ tín dụng' }
])

const selectedPaymentMethod = ref(2)
const cashReceived = ref(0)

const completePayment = () => {
    const paymentData = {
        method: selectedPaymentMethod.value,
        amount: props.total,
        cashReceived: selectedPaymentMethod.value === 2 ? cashReceived.value : null,
        change: selectedPaymentMethod.value === 2 ? (cashReceived.value - props.total) : 0
    }

    emit('complete-payment', paymentData)
}
</script>

<style scoped>
.payment-section {
    position: sticky;
    top: 680px;
    z-index: 99;
}
</style>