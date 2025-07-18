<template>
    <div class="product-variant-card card h-100">
        <div class="card-img-top variant-image">
            <img :src="getPrimaryImage(variant)" alt="Variant image" class="img-fluid">
            <div class="badges">
                <span v-if="variant.giaBan" class="badge bg-success">
                    {{ formatCurrency(variant.giaBan) }}
                </span>
            </div>
        </div>

        <div class="card-body">
            <h5 class="card-title">{{ variant.tenSP || 'Biến thể sản phẩm' }}</h5>

            <div class="variant-specs mb-3">
                <div v-if="variant.ram_id" class="spec-item">
                    <i class="bi bi-memory me-1"></i>
                    {{ variant.ram?.dungLuong || 'N/A' }}
                </div>
                <div v-if="variant.o_cung_id" class="spec-item">
                    <i class="bi bi-device-hdd me-1"></i>
                    {{ variant.oCung?.tenOCung || 'N/A' }}
                </div>
                <div v-if="variant.mau_sac_id" class="spec-item">
                    <i class="bi bi-palette me-1"></i>
                    {{ variant.mauSac?.tenMau || 'N/A' }}
                </div>
            </div>

            <div class="inventory-info mb-3">
                <span class="badge bg-info">
                    {{ variant.imeiCount }} sản phẩm trong kho
                </span>
            </div>
        </div>

        <div class="card-footer bg-transparent border-top-0">
            <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-primary" @click="$emit('view', variant)">
                    <i class="bi bi-eye"></i>
                </button>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-2" @click="$emit('edit', variant)">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', variant)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters'

defineProps({
    variant: {
        type: Object,
        required: true
    }
})

defineEmits(['edit', 'view', 'delete'])

const getPrimaryImage = (variant) => {
    if (variant.anhSanPhams && variant.anhSanPhams.length > 0) {
        const primaryImage = variant.anhSanPhams.find(img => img.is_default)
        return primaryImage ? primaryImage.uri : variant.anhSanPhams[0].uri
    }
    return 'https://via.placeholder.com/300x200?text=No+Image'
}
</script>

<style scoped>
.product-variant-card {
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-variant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.variant-image {
    height: 180px;
    overflow: hidden;
    position: relative;
}

.variant-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.badges {
    position: absolute;
    top: 10px;
    right: 10px;
}

.variant-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.spec-item {
    font-size: 0.85rem;
    color: #6c757d;
}
</style>