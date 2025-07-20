<template>
    <div class="date-range-picker">
        <div class="input-group">
            <span class="input-group-text">
                <i class="bi bi-calendar"></i>
            </span>
            <input type="date" class="form-control" v-model="startDate" @change="updateRange">
            <span class="input-group-text">đến</span>
            <input type="date" class="form-control" v-model="endDate" @change="updateRange" :min="startDate">
            <button class="btn btn-outline-secondary" type="button" @click="clearRange" title="Xóa lựa chọn">
                <i class="bi bi-x"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [null, null]
    }
})

const emit = defineEmits(['update:modelValue'])

const startDate = ref(props.modelValue[0])
const endDate = ref(props.modelValue[1])

const updateRange = () => {
    emit('update:modelValue', [startDate.value, endDate.value])
}

const clearRange = () => {
    startDate.value = null
    endDate.value = null
    updateRange()
}

watch(() => props.modelValue, (newVal) => {
    startDate.value = newVal[0]
    endDate.value = newVal[1]
})
</script>

<style scoped>
.date-range-picker {
    width: 100%;
}

.input-group-text {
    background-color: #f8f9fa;
}

.form-control {
    padding: 8px 12px;
    border-radius: 4px;
}

.btn-outline-secondary {
    border-color: #dee2e6;
}

.btn-outline-secondary:hover {
    background-color: #f8f9fa;
}

.bi-calendar {
    font-size: 1rem;
}

.bi-x {
    font-size: 1.2rem;
    line-height: 1;
}
</style>