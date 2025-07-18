<template>
    <div class="stat-card" :class="`stat-card--${color}`">
        <div class="stat-card__content">
            <div class="stat-card__icon">
                <i class="bi" :class="icon"></i>
            </div>
            <div class="stat-card__info">
                <h3 class="stat-card__title">{{ title }}</h3>
                <div v-if="!loading" class="stat-card__value">
                    {{ formattedValue }}<span v-if="suffix">{{ suffix }}</span>
                </div>
                <div v-else class="stat-card__value--loading">
                    <div class="placeholder"></div>
                </div>
            </div>
        </div>
        <div v-if="!loading" class="stat-card__footer" :class="change >= 0 ? 'text-success' : 'text-danger'">
            <i class="bi" :class="change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"></i>
            {{ Math.abs(change) }}% so với kỳ trước
        </div>
        <div v-else class="stat-card__footer--loading">
            <div class="placeholder"></div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/helpers'

const props = defineProps({
    title: String,
    value: [Number, String],
    icon: String,
    color: {
        type: String,
        default: 'primary'
    },
    change: {
        type: Number,
        default: 0
    },
    suffix: {
        type: String,
        default: ''
    },
    loading: Boolean
})

const formattedValue = computed(() => {
    if (typeof props.value === 'number') {
        if (props.suffix === '%') {
            return props.value.toFixed(1)
        }
        return formatCurrency(props.value)
    }
    return props.value
})
</script>

<style scoped>
.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    height: 100%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.stat-card__content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-card--primary .stat-card__icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card--success .stat-card__icon {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.stat-card--info .stat-card__icon {
    background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.stat-card--warning .stat-card__icon {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}

.stat-card__info {
    flex: 1;
}

.stat-card__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #718096;
    margin-bottom: 0.5rem;
}

.stat-card__value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2d3748;
    line-height: 1;
}

.stat-card__footer {
    margin-top: 1rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.stat-card__value--loading .placeholder,
.stat-card__footer--loading .placeholder {
    background: #e2e8f0;
    border-radius: 4px;
    height: 24px;
    animation: pulse 1.5s infinite;
}

.stat-card__value--loading .placeholder {
    width: 120px;
    height: 32px;
}

.stat-card__footer--loading .placeholder {
    width: 150px;
    height: 16px;
    margin-top: 1rem;
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