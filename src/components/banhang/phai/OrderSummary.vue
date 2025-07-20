<template>
  <div class="order-summary p-3">
    <h6 class="mb-3">Tổng đơn hàng</h6>
    <div class="summary-item d-flex justify-content-between mb-2">
      <span>Tổng tiền hàng:</span>
      <span>{{ subtotal.toLocaleString() }}₫</span>
    </div>
    <div class="summary-item d-flex justify-content-between mb-2">
      <span>Giảm giá:</span>
      <span class="text-danger">-{{ discount.toLocaleString() }}₫</span>
    </div>
    <div class="summary-item d-flex justify-content-between mb-2">
      <span>Phí vận chuyển:</span>
      <span>{{ shipping.toLocaleString() }}₫</span>
    </div>
    <hr>
    <div class="summary-item d-flex justify-content-between mb-3">
      <strong>Tổng cộng:</strong>
      <strong>{{ total.toLocaleString() }}₫</strong>
    </div>
    <div class="mb-3">
      <input type="number" class="form-control" placeholder="Tiền khách trả..." v-model="customerPaid" />
    </div>
    <div v-if="customerPaid > 0" class="summary-item d-flex justify-content-between mb-3">
      <span>Tiền thừa:</span>
      <span class="text-success">{{ (customerPaid - total).toLocaleString() }}₫</span>
    </div>
    <button class="btn btn-success w-100 mb-2" @click="$emit('confirm-payment')">Xác nhận thanh toán</button>
    <button class="btn btn-outline-secondary w-100" @click="$emit('print-receipt')">In hóa đơn</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  subtotal: { type: Number, default: 50000000 },
  discount: { type: Number, default: 5000000 },
  shipping: { type: Number, default: 50000 },
  total: { type: Number, default: 45050000 }
})
const customerPaid = ref(0)
// Emits: confirm-payment, print-receipt
</script>

<style scoped>
.order-summary {
  background: #fff;
  border-radius: 0 0 8px 8px;
}
.summary-item {
  font-size: 0.9rem;
}
</style> 