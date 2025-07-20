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
  currentStep: { type: Number, default: 1 },
})
const steps = [
  { icon: '🛒', label: 'Chọn SP' },
  { icon: '👤', label: 'Khách hàng' },
  { icon: '🎁', label: 'Voucher' },
  { icon: '💳', label: 'Thanh toán' },
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e3e8ee;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  font-weight: 600;
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.step-circle.active {
  background: #43a047;
  color: #fff;
  box-shadow: 0 2px 8px rgba(67, 160, 71, 0.12);
}

.step-label {
  margin-left: 6px;
  margin-right: 10px;
  font-size: 0.95em;
  color: #555;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
}

.step-label.active {
  color: #43a047;
  font-weight: 700;
}

.step-line {
  width: 24px;
  height: 2px;
  background: #b2dfdb;
  border-radius: 2px;
  margin: 0 2px;
}
</style>
