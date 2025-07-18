<template>
    <div class="banhang-right-modern p-3">
        <section class="banhang-right-section banhang-right-customer mb-4">
            <h6 class="section-title"><i class="lucide lucide-user"></i> Khách hàng</h6>
            <CustomerSelect @add-customer="handleAddCustomer" @select-guest="handleSelectGuest" />
            <OrderInfo v-if="orderItems.length" :order-items="orderItems" />
        </section>
        <section class="banhang-right-section banhang-right-voucher mb-4">
            <h6 class="section-title"><i class="lucide lucide-percent"></i> Mã giảm giá</h6>
            <VoucherApply @apply-voucher="handleApplyVoucher" />
        </section>
        <section class="banhang-right-section banhang-right-payment mb-4">
            <h6 class="section-title"><i class="lucide lucide-credit-card"></i> Thanh toán</h6>
            <PaymentMethod @update-payment="handleUpdatePayment" />
            <OrderSummary :subtotal="subtotal" :discount="discount" :shipping="shipping" :total="total"
                @confirm-payment="handleConfirmPayment" @print-receipt="handlePrintReceipt" />
        </section>
        <!-- Modals -->
        <ProductDetailModal @add-to-cart="handleAddToCartFromModal" />
        <CustomerFormModal @save-customer="handleSaveCustomer" />
        <ConfirmDialog :title="confirmDialog.title" :message="confirmDialog.message"
            :description="confirmDialog.description" @confirm="handleConfirmAction" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomerSelect from '@/components/banhang/phai/CustomerSelect.vue'
import VoucherApply from '@/components/banhang/phai/VoucherApply.vue'
import PaymentMethod from '@/components/banhang/phai/PaymentMethod.vue'
import OrderSummary from '@/components/banhang/phai/OrderSummary.vue'
import OrderInfo from '@/components/banhang/phai/OrderInfo.vue'
import ConfirmDialog from '@/components/banhang/phai/ConfirmDialog.vue'
import CustomerFormModal from '@/components/banhang/phai/CustomerFormModal.vue'
import ProductDetailModal from '@/components/banhang/phai/ProductDetailModal.vue'

const orderItems = ref([])
const subtotal = ref(0)
const discount = ref(0)
const shipping = ref(50000)
const total = computed(() => subtotal.value - discount.value + shipping.value)
const confirmDialog = ref({ title: '', message: '', description: '', action: null })

const handleAddCustomer = () => { }
const handleSelectGuest = () => { }
const handleApplyVoucher = () => { }
const handleUpdatePayment = () => { }
const handleConfirmPayment = () => { }
const handlePrintReceipt = () => { }
const handleAddToCartFromModal = (data) => { }
const handleSaveCustomer = (customer) => { }
const handleConfirmAction = () => { if (confirmDialog.value.action) confirmDialog.value.action() }
</script>

<style scoped>
.banhang-right-modern {
    background: #fff;
    border-radius: 18px;
    min-height: 100vh;
    box-shadow: 0 4px 24px 0 rgba(13, 110, 253, 0.07);
    padding: 2rem 1.2rem 1.2rem 1.2rem;
}

.banhang-right-section {
    background: #f8f9fa;
    border-radius: 14px;
    box-shadow: 0 2px 8px #0d6efd11;
    padding: 1.2rem 1rem;
    margin-bottom: 1.2rem;
}

.section-title {
    font-size: 1.08rem;
    font-weight: 600;
    color: #0d6efd;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

@media (max-width: 991px) {
    .banhang-right-modern {
        padding: 1rem 0.3rem;
        border-radius: 10px;
    }

    .banhang-right-section {
        padding: 0.7rem 0.2rem;
        border-radius: 8px;
    }
}

@media (max-width: 600px) {
    .banhang-right-modern {
        padding: 0.3rem 0.1rem;
        border-radius: 6px;
    }

    .banhang-right-section {
        padding: 0.4rem 0.1rem;
        border-radius: 4px;
    }
}
</style>