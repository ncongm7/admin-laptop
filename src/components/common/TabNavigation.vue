<template>
    <div class="tab-navigation" :class="[variant, { 'compact': compact }]">
        <div class="tab-list" role="tablist">
            <button v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: modelValue === tab.value }]"
                :disabled="tab.disabled" role="tab" @click="handleTabClick(tab)">
                <i v-if="tab.icon" :class="['tab-icon', tab.icon]"></i>
                <span class="tab-label">{{ tab.label }}</span>
                <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number],
        required: true
    },
    tabs: {
        type: Array,
        required: true,
        validator: (tabs) => {
            return tabs.every(tab =>
                tab.value !== undefined &&
                tab.label !== undefined
            )
        }
    },
    variant: {
        type: String,
        default: 'default', // 'default', 'pills', 'underline', 'modern'
        validator: (value) => ['default', 'pills', 'underline', 'modern'].includes(value)
    },
    compact: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleTabClick = (tab) => {
    if (tab.disabled) return

    emit('update:modelValue', tab.value)
    emit('change', tab.value)
}
</script>

<style scoped>
.tab-navigation {
    margin-bottom: 24px;
}

/* Default variant - Modern, clean tabs */
.tab-navigation.default .tab-list {
    display: flex;
    gap: 4px;
    background: #f8f9fa;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid #e9ecef;
}

.tab-navigation.default .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    white-space: nowrap;
}

.tab-navigation.default .tab-item:hover:not(:disabled) {
    color: #2D7458;
    background: rgba(45, 116, 88, 0.08);
}

.tab-navigation.default .tab-item.active {
    background: #fff;
    color: #2D7458;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    font-weight: 600;
}

.tab-navigation.default .tab-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Pills variant */
.tab-navigation.pills .tab-list {
    display: flex;
    gap: 8px;
    background: transparent;
    padding: 0;
}

.tab-navigation.pills .tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 20px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 20px;
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-navigation.pills .tab-item:hover:not(:disabled) {
    background: #e9ecef;
    color: #2D7458;
    border-color: #2D7458;
}

.tab-navigation.pills .tab-item.active {
    background: #2D7458;
    color: #fff;
    border-color: #2D7458;
    box-shadow: 0 2px 8px rgba(45, 116, 88, 0.2);
}

/* Underline variant */
.tab-navigation.underline .tab-list {
    display: flex;
    gap: 0;
    background: transparent;
    border-bottom: 2px solid #e9ecef;
    padding: 0;
}

.tab-navigation.underline .tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -2px;
}

.tab-navigation.underline .tab-item:hover:not(:disabled) {
    color: #2D7458;
    background: rgba(45, 116, 88, 0.05);
}

.tab-navigation.underline .tab-item.active {
    color: #2D7458;
    border-bottom-color: #2D7458;
    font-weight: 600;
}

/* Modern variant - Like router tabs */
.tab-navigation.modern .tab-list {
    display: flex;
    gap: 2px;
    background: transparent;
    padding: 0;
    border-bottom: 1px solid #e9ecef;
}

.tab-navigation.modern .tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6c757d;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    margin-bottom: -1px;
}

.tab-navigation.modern .tab-item:hover:not(:disabled) {
    color: #2D7458;
    background: rgba(45, 116, 88, 0.04);
}

.tab-navigation.modern .tab-item.active {
    color: #2D7458;
    border-bottom-color: #2D7458;
    font-weight: 600;
    background: rgba(45, 116, 88, 0.02);
}

/* Compact variant */
.tab-navigation.compact .tab-item {
    padding: 6px 12px;
    font-size: 0.85rem;
}

.tab-navigation.compact .tab-icon {
    font-size: 0.9rem;
}

/* Tab icon */
.tab-icon {
    font-size: 1rem;
    line-height: 1;
}

/* Tab badge */
.tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    background: #dc3545;
    color: #fff;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: 4px;
}

.tab-item.active .tab-badge {
    background: #2D7458;
}

/* Responsive */
@media (max-width: 768px) {
    .tab-navigation .tab-list {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .tab-navigation .tab-list::-webkit-scrollbar {
        display: none;
    }

    .tab-navigation .tab-item {
        flex-shrink: 0;
        white-space: nowrap;
    }

    .tab-navigation.compact .tab-item {
        padding: 6px 10px;
        font-size: 0.8rem;
    }
}
</style>
