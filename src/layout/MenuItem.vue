<template>
    <li :class="['nav-item', { 'submenu': sub, 'open': open }]" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <router-link v-if="to" :to="to" class="menu-item nav-link d-flex align-items-center" active-class="active">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
        </router-link>
        <div v-else class="menu-item nav-link d-flex align-items-center" @click="toggleOpen">
            <i v-if="icon" :class="['bi', icon, 'me-2']" />
            <span>{{ label }}</span>
            <i class="bi ms-auto" :class="open ? 'bi-chevron-down' : 'bi-chevron-right'" v-if="$slots.default" />
        </div>
        <ul v-if="$slots.default" class="nav flex-column ms-3">
            <slot />
        </ul>
    </li>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    icon: String,
    label: String,
    to: String,
    sub: Boolean
})
const open = ref(false)

const toggleOpen = () => (open.value = !open.value)

const onMouseEnter = () => {
    if (!props.to) {
        open.value = true
    }
}

const onMouseLeave = () => {
    if (!props.to) {
        open.value = false
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
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 1000px;
    overflow: hidden;
}

.ms-auto {
    margin-left: auto !important;
}
</style>