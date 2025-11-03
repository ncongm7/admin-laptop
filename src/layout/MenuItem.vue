<template>
    <li :class="['nav-item', { 'submenu': sub, 'open': open, 'hovered': isHovered }]" @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave">
        <router-link v-if="to" :to="to" class="menu-item nav-link d-flex align-items-center" active-class="active"
            @click="handleSubmenuItemClick">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
        </router-link>
        <div v-else class="menu-item nav-link d-flex align-items-center" @click="toggleOpen">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
            <i class="bi ms-auto chevron-icon" :class="open ? 'bi-chevron-down' : 'bi-chevron-right'"
                v-if="$slots.default" />
        </div>
        <transition name="submenu">
            <ul v-if="$slots.default && (open || isHovered)" class="nav flex-column submenu-list" @click="handleSubmenuClick">
                <slot />
            </ul>
        </transition>
    </li>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    icon: String,
    label: String,
    to: String,
    sub: Boolean,
    collapsed: Boolean
})
const emit = defineEmits(['submenu-click'])
const open = ref(false)
const isHovered = ref(false)
let hoverTimeout = null

// Expose properties for parent access
defineExpose({
    open,
    isHovered
})

const toggleOpen = () => {
    if (!props.to) {
        open.value = !open.value
        if (open.value) {
            isHovered.value = false
        }
    }
}

const switchToClickState = () => {
    if (isHovered.value && !open.value) {
        open.value = true
        isHovered.value = false
    }
}

const handleSubmenuItemClick = () => {
    if (props.sub) {
        emit('submenu-click')
    }
}

const handleSubmenuClick = (event) => {
    const target = event.target.closest('.menu-item')
    if (target) {
        if (isHovered.value && !open.value) {
            open.value = true
            isHovered.value = false
        }
    }
}

const onMouseEnter = () => {
    if (!props.to) {
        clearTimeout(hoverTimeout)
        isHovered.value = true
    }
}

const onMouseLeave = () => {
    if (!props.to) {
        hoverTimeout = setTimeout(() => {
            if (!open.value) {
                isHovered.value = false
            }
        }, 150)
    }
}
</script>

<style scoped>
.menu-item {
    border-radius: 10px;
    color: #495057;
    font-weight: 500;
    font-size: 0.9rem;
    background: transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: none;
    position: relative;
    border: 1px solid transparent;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.menu-item.active,
.menu-item.router-link-exact-active {
    background: linear-gradient(135deg, rgba(45, 116, 88, 0.1) 0%, rgba(57, 110, 124, 0.1) 100%);
    color: #2D7458;
    box-shadow: 0 2px 8px rgba(45, 116, 88, 0.15);
    border: 1px solid rgba(45, 116, 88, 0.2);
    font-weight: 600;
}

.menu-item:hover {
    background: rgba(45, 116, 88, 0.05);
    color: #2D7458;
    border: 1px solid rgba(45, 116, 88, 0.1);
}

.menu-item i {
    font-size: 1.1em;
    transition: all 0.2s ease;
}

.menu-item.active i,
.menu-item.router-link-exact-active i,
.menu-item:hover i {
    color: #2D7458;
}

.submenu .menu-item {
    padding-left: 2rem;
    font-size: 0.88rem;
    background: rgba(248, 250, 252, 0.5);
    color: #495057;
    min-height: 36px;
}

.submenu .menu-item:hover {
    background: rgba(45, 116, 88, 0.08);
    color: #2D7458;
}

.submenu .menu-item.active,
.submenu .menu-item.router-link-exact-active {
    background: rgba(45, 116, 88, 0.12);
    color: #2D7458;
    font-weight: 600;
}

ul.nav {
    margin-bottom: 0;
    background: transparent;
    border-left: 2px solid rgba(45, 116, 88, 0.2);
    padding-left: 0.75rem;
    overflow: hidden;
}

.ms-auto {
    margin-left: auto !important;
}

.chevron-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.9em;
    opacity: 0.6;
}

.nav-item.open .chevron-icon,
.nav-item.hovered .chevron-icon {
    transform: rotate(90deg);
    opacity: 1;
    color: #2D7458;
}

.submenu-list {
    padding-left: 0.75rem !important;
    gap: 2px;
}

.submenu-enter-active,
.submenu-leave-active {
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
    overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
    opacity: 0;
    max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
    opacity: 1;
    max-height: 400px;
}
</style>
