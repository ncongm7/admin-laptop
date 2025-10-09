<template>
    <div class="transaction-panel card shadow-sm">
        <!-- Tabs -->
        <ul class="nav nav-tabs nav-fill" id="transactionTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="cart-tab" data-bs-toggle="tab" data-bs-target="#cart-panel"
                    type="button" role="tab" aria-controls="cart-panel" aria-selected="true">
                    <i class="bi bi-cart3 me-1"></i> Giỏ hàng ({{ salesStore.cartItemCount }})
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="customer-tab" data-bs-toggle="tab" data-bs-target="#customer-panel"
                    type="button" role="tab" aria-controls="customer-panel" aria-selected="false">
                    <i class="bi bi-person me-1"></i> Khách hàng
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="payment-tab" data-bs-toggle="tab" data-bs-target="#payment-panel"
                    type="button" role="tab" aria-controls="payment-panel" aria-selected="false">
                    <i class="bi bi-credit-card me-1"></i> Thanh toán
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content flex-grow-1 p-3" id="transactionTabContent">
            <!-- Cart Panel -->
            <div class="tab-pane fade show active" id="cart-panel" role="tabpanel" aria-labelledby="cart-tab">
                <CartSidebar :items="salesStore.cartItems" @update-quantity="updateQuantity"
                    @remove-item="removeFromCart" />
            </div>

            <!-- Customer Panel -->
            <div class="tab-pane fade" id="customer-panel" role="tabpanel" aria-labelledby="customer-tab">
                <CustomerInfo v-model:customer="salesStore.currentBill.customer" @search-customer="searchCustomer"
                    @create-customer="emit('create-customer')" />
            </div>

            <!-- Payment Panel -->
            <div class="tab-pane fade" id="payment-panel" role="tabpanel" aria-labelledby="payment-tab">
                <BillInfo :subtotal="salesStore.subtotal" :discount="salesStore.currentBill.discount"
                    :total="salesStore.total" @apply-voucher="code => emit('apply-voucher', code)" />
                <hr class="my-3" />
                <PaymentSection :total="salesStore.total" @complete-payment="() => emit('complete-payment')" />
            </div>
        </div>

        <!-- Summary & Actions -->
        <div class="transaction-footer p-3 pt-2">
            <!-- Summary -->
            <div class="summary-section mb-3">
                <div class="summary-item">
                    <span>Tổng tiền hàng</span>
                    <span class="fw-bold">{{ formatCurrency(salesStore.subtotal) }}</span>
                </div>
                <div class="summary-item" v-if="salesStore.currentBill.discount > 0">
                    <span>Giảm giá <span v-if="salesStore.currentBill.voucher" class="badge bg-info text-dark ms-1">
                            {{ salesStore.currentBill.voucher.maVoucher }}
                        </span>
                    </span>
                    <span class="fw-bold text-danger">-{{ formatCurrency(salesStore.currentBill.discount) }}</span>
                </div>
                <div class="summary-item total">
                    <span class="fw-bold fs-6">Khách phải trả</span>
                    <span class="fw-bold fs-5 text-primary">{{ formatCurrency(salesStore.total) }}</span>
                </div>
            </div>

            <!-- Actions -->
            <div class="action-section">
                <div class="d-flex gap-2 mb-2">
                    <button class="btn btn-outline-secondary w-100" @click="() => emit('save-pending')">
                        <i class="bi bi-clock"></i> Lưu chờ
                    </button>
                    <button class="btn btn-outline-danger w-100" @click="() => emit('cancel-bill')">
                        <i class="bi bi-x-circle"></i> Hủy
                    </button>
                </div>
                <button class="btn btn-success btn-lg w-100" @click="() => emit('complete-payment')"
                    :disabled="!salesStore.canCheckout">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    THANH TOÁN
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useSalesStore } from '@/stores/salesStore'
import CustomerInfo from '@/components/sales/CustomerInfo.vue'
import CartSidebar from '@/components/sales/CartSidebar.vue'
import BillInfo from '@/components/sales/BillInfo.vue'
import PaymentSection from '@/components/sales/PaymentSection.vue'

const salesStore = useSalesStore()

const emit = defineEmits(['create-customer', 'apply-voucher', 'complete-payment', 'save-pending', 'cancel-bill'])

const updateQuantity = (itemIndex, newQuantity) => {
    salesStore.updateCartItemQuantity(itemIndex, newQuantity)
}

const removeFromCart = (itemIndex) => {
    salesStore.removeFromCart(itemIndex)
}

const searchCustomer = async (query) => {
    // Implement customer search logic
    console.log('Searching customer:', query)
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0)
}
</script>

<style scoped>
.transaction-panel {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 110px);
    /* Full height minus header/padding */
    overflow: hidden;
}

.nav-tabs {
    border-bottom: 1px solid #dee2e6;
    flex-shrink: 0;
}

.nav-link {
    color: #495057;
    font-weight: 500;
    border: none;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease-in-out;
}

.nav-link.active {
    color: var(--primary-color);
    font-weight: 600;
    border-bottom-color: var(--primary-color);
    background-color: transparent;
}

.nav-link:hover {
    color: var(--primary-color);
}

.tab-content {
    overflow-y: auto;
    flex-grow: 1;
}

/* Custom scrollbar for tab content */
.tab-content::-webkit-scrollbar {
    width: 6px;
}

.tab-content::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.tab-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 6px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
    background: #aaa;
}

.transaction-footer {
    border-top: 1px solid #e9ecef;
    background-color: #fdfdff;
    flex-shrink: 0;
}

.summary-section .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    font-size: 0.9rem;
}

.summary-section .summary-item.total {
    padding-top: 6px;
    margin-top: 4px;
    border-top: 1px solid #e9ecef;
}

.action-section .btn-lg {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.75rem;
}

.action-section .btn:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
}
</style>