<template>
    <div class="return-date-picker">
        <div class="input-group">
            <span class="input-group-text">
                <i class="bi bi-calendar-range"></i>
            </span>
            <input type="date" class="form-control" v-model="startDate" @change="updateRange" :max="endDate || maxDate">
            <span class="input-group-text">→</span>
            <input type="date" class="form-control" v-model="endDate" @change="updateRange" :min="startDate"
                :max="maxDate">
            <button class="btn btn-outline-danger" type="button" @click="clearRange" title="Xóa lựa chọn"
                :disabled="!startDate && !endDate">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <div v-if="showQuickOptions" class="quick-options mt-2">
            <small class="text-muted me-2">Nhanh:</small>
            <button v-for="option in quickOptions" :key="option.value" class="btn btn-sm me-1"
                :class="option.active ? 'btn-primary' : 'btn-outline-secondary'" @click="selectQuickOption(option)">
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => [null, null]
    },
    showQuickOptions: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:modelValue'])

const today = new Date()
const maxDate = format(today, 'yyyy-MM-dd')

const startDate = ref(props.modelValue[0])
const endDate = ref(props.modelValue[1])

const quickOptions = computed(() => [
    {
        label: 'Hôm nay',
        value: [format(today, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')],
        active: isActiveOption([format(today, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')])
    },
    {
        label: 'Tuần này',
        value: [format(startOfWeek(today), 'yyyy-MM-dd'), format(endOfWeek(today), 'yyyy-MM-dd')],
        active: isActiveOption([format(startOfWeek(today), 'yyyy-MM-dd'), format(endOfWeek(today), 'yyyy-MM-dd')])
    },
    {
        label: 'Tháng này',
        value: [format(startOfMonth(today), 'yyyy-MM-dd'), format(endOfMonth(today), 'yyyy-MM-dd')],
        active: isActiveOption([format(startOfMonth(today), 'yyyy-MM-dd'), format(endOfMonth(today), 'yyyy-MM-dd')])
    },
    {
        label: '7 ngày',
        value: [format(subDays(today, 6), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')],
        active: isActiveOption([format(subDays(today, 6), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')])
    },
    {
        label: '30 ngày',
        value: [format(subDays(today, 29), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')],
        active: isActiveOption([format(subDays(today, 29), 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd')])
    }
])

const isActiveOption = (optionRange) => {
    return startDate.value === optionRange[0] && endDate.value === optionRange[1]
}

const updateRange = () => {
    emit('update:modelValue', [startDate.value, endDate.value])
}

const clearRange = () => {
    startDate.value = null
    endDate.value = null
    updateRange()
}

const selectQuickOption = (option) => {
    startDate.value = option.value[0]
    endDate.value = option.value[1]
    updateRange()
}

watch(() => props.modelValue, (newVal) => {
    startDate.value = newVal[0]
    endDate.value = newVal[1]
})
</script>

<style scoped>
.return-date-picker {
    width: 100%;
}

.input-group-text {
    background-color: #f8f9fa;
}

.quick-options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.quick-options button {
    padding: 0.15rem 0.5rem;
    font-size: 0.8rem;
    border-radius: 4px;
}

.btn-sm {
    line-height: 1.2;
}

.bi-calendar-range {
    font-size: 1rem;
}

.bi-x-lg {
    font-size: 0.9rem;
}
</style>