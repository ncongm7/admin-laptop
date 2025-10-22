<template>
    <div class="bill-info card mb-3">
        <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">Thông tin hóa đơn</h5>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" rows="2" v-model="note"></textarea>
            </div>

            <div class="voucher-input mb-3">
                <label class="form-label">Mã giảm giá</label>
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Nhập mã voucher" v-model="voucherCode">
                    <button class="btn btn-primary" @click="applyVoucher">
                        Áp dụng
                    </button>
                </div>
                <div v-if="appliedVoucher" class="alert alert-success mt-2 py-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>
                            <i class="bi bi-tag-fill me-2"></i>
                            {{ appliedVoucher.name }} (-{{ formatPrice(discount) }})
                        </span>
                        <button class="btn btn-sm btn-outline-danger" @click="removeVoucher">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="price-summary">
                <div class="d-flex justify-content-between mb-2">
                    <span>Tạm tính:</span>
                    <span class="fw-bold">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Giảm giá:</span>
                    <span class="text-danger">-{{ formatPrice(discount) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Phí vận chuyển:</span>
                    <span>{{ formatPrice(shippingFee) }}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fw-bold fs-5">
                    <span>Tổng cộng:</span>
                    <span class="text-primary">{{ formatPrice(total) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatPrice } from '@/utils/helpers'

const props = defineProps({
    subtotal: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['apply-voucher'])

const note = ref('')
const voucherCode = ref('')
const appliedVoucher = ref(null)
const shippingFee = ref(0)

const total = computed(() => {
    return props.subtotal - props.discount + shippingFee.value
})

const applyVoucher = () => {
    if (voucherCode.value.trim()) {
        emit('apply-voucher', voucherCode.value.trim())
    }
}

const removeVoucher = () => {
    appliedVoucher.value = null
    emit('apply-voucher', null)
}
</script>

<style scoped>
.bill-info {
    position: sticky;
    top: 380px;
    z-index: 100;
}

.price-summary {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
}
</style>