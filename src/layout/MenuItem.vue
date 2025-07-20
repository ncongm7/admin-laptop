<template>
    <li 
        :class="['nav-item', { 'submenu': sub, 'open': open, 'hovered': isHovered }]" 
        @mouseenter="onMouseEnter" 
        @mouseleave="onMouseLeave"
    >
        <router-link v-if="to" :to="to" class="menu-item nav-link d-flex align-items-center" active-class="active" @click="handleSubmenuItemClick">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
        </router-link>
        <div v-else class="menu-item nav-link d-flex align-items-center" @click="toggleOpen">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
            <i class="bi ms-auto chevron-icon" :class="open ? 'bi-chevron-down' : 'bi-chevron-right'" v-if="$slots.default" />
        </div>
        <transition name="submenu">
            <ul v-if="$slots.default && (open || isHovered)" class="nav flex-column ms-3" @click="handleSubmenuClick">
                <slot />
            </ul>
        </transition>
    </li>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({
    icon: String,
    label: String,
    to: String,
    sub: Boolean
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
        // Nếu đang mở bằng click, tắt hover state
        if (open.value) {
            isHovered.value = false
        }
    }
}

// Hàm để chuyển từ hover sang click state
const switchToClickState = () => {
    if (isHovered.value && !open.value) {
        open.value = true
        isHovered.value = false
    }
}

// Xử lý click vào submenu item
const handleSubmenuItemClick = () => {
    if (props.sub) {
        // Emit event lên parent để chuyển sang click state
        emit('submenu-click')
    }
}

// Xử lý click trong submenu
const handleSubmenuClick = (event) => {
    // Kiểm tra xem có phải click vào submenu item không
    const target = event.target.closest('.menu-item')
    if (target) {
        // Nếu đang ở trạng thái hover, chuyển sang click state
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
            // Chỉ đóng hover nếu không đang mở bằng click
            if (!open.value) {
                isHovered.value = false
            }
        }, 150) // Delay để tránh đóng quá nhanh khi di chuyển chuột
    }
}
</script>

<style scoped>
.menu-item {
    border-radius: 14px;
    color: #fff;
    font-weight: 500;
    font-size: 1.08rem;
    background: transparent;
    transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
    cursor: pointer;
    box-shadow: none;
    position: relative;
    border: 1.5px solid transparent;
    padding: 13px 22px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.menu-item.active,
.menu-item.router-link-exact-active {
    background: rgba(255, 255, 255, 0.18);
    color: #ffe484;
    box-shadow: 0 2px 12px rgba(13, 110, 253, 0.13);
    transform: translateX(6px) scale(1.06);
    border: 1.5px solid #ffe484;
}

.menu-item:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffe484;
    transform: translateX(2px) scale(1.03);
    box-shadow: 0 2px 8px rgba(255, 228, 132, 0.13);
    border: 1.5px solid #ffe484;
}

.menu-item i {
    font-size: 1.35em;
    transition: color 0.18s, transform 0.18s;
    filter: drop-shadow(0 2px 4px rgba(13, 110, 253, 0.13));
}

.menu-item.active i,
.menu-item.router-link-exact-active i {
    color: #ffe484;
    transform: scale(1.18) rotate(-8deg);
}

.submenu>.menu-item {
    padding-left: 2.5rem;
    font-size: 0.99em;
    background: linear-gradient(90deg, #f4f8ff 60%, #e3f0ff 100%);
    color: #222;
}

ul.nav {
    margin-bottom: 0;
    background: transparent;
    border-left: 2px solid #e3f0ff;
    padding-left: 0.5rem;
    overflow: hidden;
}

.ms-auto {
    margin-left: auto !important;
}

.chevron-icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.9em;
    opacity: 0.7;
}

.nav-item.open .chevron-icon,
.nav-item.hovered .chevron-icon {
    transform: rotate(90deg);
}

/* Hover effects for parent menu items */
.nav-item:not(.submenu) .menu-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(3px) scale(1.02);
    box-shadow: 0 4px 12px rgba(255, 228, 132, 0.2);
}

.nav-item:not(.submenu) .menu-item:hover .chevron-icon {
    transform: rotate(90deg) scale(1.1);
    opacity: 1;
}

/* Submenu transition animations */
.submenu-enter-active,
.submenu-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.submenu-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    max-height: 0;
}

.submenu-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
    max-height: 0;
}

.submenu-enter-to,
.submenu-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
    max-height: 200px;
}

/* Enhanced submenu styling */
.submenu>.menu-item {
    padding-left: 2.5rem;
    font-size: 0.99em;
    background: linear-gradient(90deg, #f4f8ff 60%, #e3f0ff 100%);
    color: #222;
    border-left: 3px solid transparent;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu>.menu-item:hover {
    background: linear-gradient(90deg, #e8f4ff 60%, #d1e8ff 100%);
    transform: translateX(5px);
    border-left: 3px solid #007aff;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

.submenu>.menu-item.active,
.submenu>.menu-item.router-link-exact-active {
    background: linear-gradient(90deg, #e5f1fb 60%, #d1e8ff 100%);
    border-left: 3px solid #007aff;
    color: #007aff;
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}
</style>