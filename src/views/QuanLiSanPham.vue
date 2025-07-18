<template>
    <div class="product-admin p-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold mb-0">Quản Lý Sản Phẩm</h2>
            <div class="d-flex gap-2">
                <button class="btn btn-primary" @click="openCreateModal">
                    <i class="bi bi-plus-circle me-1"></i> Thêm sản phẩm
                </button>
                <div class="dropdown" @mouseleave="showDropdown = false">
                    <button class="btn btn-outline-secondary d-flex align-items-center" @click="toggleDropdown">
                        <i class="bi bi-gear me-1"></i> Quản lý thuộc tính
                        <i class="bi ms-1" :class="showDropdown ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                    </button>
                    <ul v-if="showDropdown" class="dropdown-menu show mt-2" style="position: absolute;">
                        <li v-for="item in visibleAttributes" :key="item.key">
                            <a class="dropdown-item d-flex align-items-center" href="#"
                                @click.prevent="goToAttribute(item)">
                                <i :class="['bi', item.icon, 'me-2']"></i> {{ item.label }}
                            </a>
                        </li>
                        <li v-if="hasMoreAttributes" class="dropdown-divider"></li>
                        <li v-if="hasMoreAttributes">
                            <a class="dropdown-item d-flex align-items-center" href="#" @click.prevent="toggleMore">
                                <i class="bi bi-three-dots me-2"></i> Thêm...
                            </a>
                        </li>
                        <template v-if="showMore">
                            <li v-for="item in moreAttributes" :key="item.key">
                                <a class="dropdown-item d-flex align-items-center" href="#"
                                    @click.prevent="goToAttribute(item)">
                                    <i :class="['bi', item.icon, 'me-2']"></i> {{ item.label }}
                                </a>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
        <div class="tab-content p-4 bg-white rounded shadow-sm">
            <ProductsView :showCreateModal="showCreateModal" @close-create-modal="showCreateModal = false" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductsView from './sanpham/viewsanpham/ProductsView.vue'

const router = useRouter()
const showDropdown = ref(false)
const showMore = ref(false)
const showCreateModal = ref(false)

const allAttributes = [
    { key: 'cpu', label: 'CPU', icon: 'bi-cpu', route: '/san-pham/cpu' },
    { key: 'ram', label: 'RAM', icon: 'bi-memory', route: '/san-pham/ram' },
    { key: 'gpu', label: 'GPU', icon: 'bi-gpu-card', route: '/san-pham/gpu' },
    { key: 'color', label: 'Màu sắc', icon: 'bi-palette', route: '/san-pham/color' },
    { key: 'brand', label: 'Hãng', icon: 'bi-building', route: '/san-pham/brand' },
    { key: 'storage', label: 'Ổ cứng', icon: 'bi-hdd', route: '/san-pham/storage' },
    { key: 'screen-size', label: 'Kích thước màn hình', icon: 'bi-arrows-angle-expand', route: '/san-pham/screen-size' },
    { key: 'screen-type', label: 'Loại màn hình', icon: 'bi-display', route: '/san-pham/screen-type' },
    { key: 'os', label: 'Hệ điều hành', icon: 'bi-windows', route: '/san-pham/os' },
    { key: 'battery', label: 'Pin', icon: 'bi-battery-full', route: '/san-pham/battery' },
    { key: 'camera', label: 'Camera', icon: 'bi-camera', route: '/san-pham/camera' },
    { key: 'imei', label: 'IMEI', icon: 'bi-123', route: '/san-pham/imei' },
    { key: 'image', label: 'Ảnh sản phẩm', icon: 'bi-image', route: '/san-pham/image' },
]

const VISIBLE_COUNT = 6
const visibleAttributes = computed(() => showMore.value ? allAttributes : allAttributes.slice(0, VISIBLE_COUNT))
const moreAttributes = computed(() => allAttributes.slice(VISIBLE_COUNT))
const hasMoreAttributes = computed(() => allAttributes.length > VISIBLE_COUNT)

function toggleDropdown() {
    showDropdown.value = !showDropdown.value
    if (!showDropdown.value) showMore.value = false
}
function goToAttribute(item) {
    showDropdown.value = false
    showMore.value = false
    router.push(item.route)
}
function openCreateModal() {
    showCreateModal.value = true
}
function toggleMore(e) {
    showMore.value = !showMore.value
}
</script>

<style scoped>
.product-admin {
    min-height: 80vh;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    max-width: 1200px;
    margin: 0 auto;
}

.dropdown-menu.show {
    display: block;
    min-width: 220px;
    z-index: 1000;
}

.dropdown-item {
    cursor: pointer;
    font-size: 1rem;
    padding: 10px 18px;
    transition: background 0.15s, color 0.15s;
}

.dropdown-item:hover {
    background: #e5f1fb;
    color: #007aff;
}

.tab-content {
    min-height: 300px;
    background: #fff;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
    margin-top: -2px;
}

@media (max-width: 768px) {
    .product-admin {
        padding: 0.5rem;
        min-height: unset;
    }

    .tab-content {
        padding: 1rem 0.5rem;
    }
}

@media (max-width: 480px) {
    .product-admin {
        padding: 0.2rem;
        border-radius: 0;
        box-shadow: none;
    }

    .tab-content {
        padding: 0.5rem 0.2rem;
        border-radius: 0 0 8px 8px;
    }
}
</style>
