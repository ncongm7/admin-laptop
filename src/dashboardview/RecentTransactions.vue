<template>
    <div class="transactions-container">
        <div class="transactions-header">
            <h3 class="transactions-title">Giao dịch gần đây</h3>
            <router-link to="/transactions" class="view-all">Xem tất cả</router-link>
        </div>

        <div class="transactions-list">
            <div v-if="loading" class="loading-item" v-for="i in 5" :key="i">
                <div class="loading-avatar"></div>
                <div class="loading-content">
                    <div class="loading-line"></div>
                    <div class="loading-line short"></div>
                </div>
            </div>

            <div v-else v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
                <div class="transaction-avatar">
                    <i class="bi" :class="transactionIcon(transaction.type)"></i>
                </div>
                <div class="transaction-content">
                    <div class="transaction-info">
                        <div class="transaction-name">{{ transaction.customer }}</div>
                        <div class="transaction-date">{{ transaction.date }}</div>
                    </div>
                    <div class="transaction-amount" :class="amountClass(transaction.amount)">
                        {{ formatCurrency(transaction.amount) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/helpers'

const props = defineProps({
    transactions: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const transactionIcon = (type) => {
    const icons = {
        sale: 'bi-cart-check',
        refund: 'bi-arrow-counterclockwise',
        payment: 'bi-credit-card',
        other: 'bi-receipt'
    }
    return icons[type] || icons.other
}

const amountClass = (amount) => {
    return amount >= 0 ? 'positive' : 'negative'
}
</script>

<style scoped>
.transactions-container {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.transactions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.transactions-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.view-all {
    font-size: 13px;
    color: #3b82f6;
    text-decoration: none;
}

.view-all:hover {
    text-decoration: underline;
}

.transactions-list {
    flex: 1;
    overflow-y: auto;
}

.transaction-item,
.loading-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
}

.transaction-item:last-child {
    border-bottom: none;
}

.transaction-avatar,
.loading-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: #6366f1;
    font-size: 18px;
}

.transaction-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.transaction-info {
    flex: 1;
}

.transaction-name {
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 2px;
}

.transaction-date {
    font-size: 12px;
    color: #64748b;
}

.transaction-amount {
    font-size: 14px;
    font-weight: 600;
}

.transaction-amount.positive {
    color: #10b981;
}

.transaction-amount.negative {
    color: #ef4444;
}

.loading-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.loading-line {
    height: 14px;
    background: #e2e8f0;
    border-radius: 4px;
    animation: pulse 1.5s infinite;
}

.loading-line.short {
    width: 60%;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>