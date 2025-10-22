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
    border-radius: 10px;
    color: #222;
    font-weight: 500;
    font-size: 0.93rem;
    background: transparent;
    transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
    cursor: pointer;
    box-shadow: none;
    position: relative;
    border: 1px solid transparent;
    padding: 7px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.menu-item.active,
.menu-item.router-link-exact-active {
    background: #e8fbe9;
    color: #22c55e;
    box-shadow: 0 2px 8px #22c55e11;
    border: 1px solid #22c55e;
}

.menu-item:hover {
    background: #f3fdf4;
    color: #22c55e;
    border: 1px solid #22c55e;
}

.menu-item i {
    font-size: 1.08em;
    transition: color 0.18s, transform 0.18s;
}

.menu-item.active i,
.menu-item.router-link-exact-active i,
.menu-item:hover i {
    color: #22c55e;
}

.submenu>.menu-item {
    padding-left: 1.7rem;
    font-size: 0.91em;
    background: #f8fafc;
    color: #222;
    min-height: 32px;
}

ul.nav {
    margin-bottom: 0;
    background: transparent;
    border-left: 2px solid #e5e7eb;
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

.submenu-enter-active,
.submenu-leave-active {
    transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s;
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