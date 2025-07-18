<template>
    <div class="sales-stepper d-flex align-items-center justify-content-center mb-3">
        <div v-for="(step, idx) in steps" :key="step.label" class="step-item d-flex align-items-center">
            <div :class="['step-circle', { active: idx + 1 === currentStep }]">
                <span class="step-icon">{{ step.icon }}</span>
            </div>
            <div class="step-label" :class="{ active: idx + 1 === currentStep }">{{ step.label }}</div>
            <div v-if="idx < steps.length - 1" class="step-line"></div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    currentStep: { type: Number, default: 1 }
})
const steps = [
    { icon: '🛒', label: 'Chọn SP' },
    { icon: '👤', label: 'Khách hàng' },
    { icon: '🎁', label: 'Voucher' },
    { icon: '💳', label: 'Thanh toán' }
]
</script>

<style scoped>
.sales-stepper {
    gap: 0.5rem;
    user-select: none;
}

.step-item {
    display: flex;
    align-items: center;
}

.step-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #e3e8ee;
    color: #1976d2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    font-weight: bold;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.step-circle.active {
    background: #1976d2;
    color: #fff;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.12);
}

.step-label {
    margin-left: 6px;
    margin-right: 10px;
    font-size: 1em;
    color: #888;
    font-weight: 500;
    transition: color 0.2s;
}

.step-label.active {
    color: #1976d2;
    font-weight: 700;
}

.step-line {
    width: 32px;
    height: 3px;
    background: #e3e8ee;
    border-radius: 2px;
    margin: 0 2px;
}
</style>