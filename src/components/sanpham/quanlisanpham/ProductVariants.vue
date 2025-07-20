<template>
    <div class="product-variants">
        <div class="variants-header">
            <h4 class="variants-title">Quản lý biến thể sản phẩm</h4>
            <button class="btn btn-sm btn-primary" @click="addVariant">
                <i class="bi bi-plus-lg"></i> Thêm biến thể
            </button>
        </div>

        <div class="variants-list">
            <div v-for="(variant, index) in variants" :key="variant.id || index" class="variant-card">
                <div class="variant-header">
                    <span class="variant-number">Biến thể #{{ index + 1 }}</span>
                    <button class="btn btn-sm btn-link text-danger" @click="removeVariant(index)"
                        v-if="variants.length > 1">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div class="variant-content">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">RAM</label>
                            <select class="form-select" v-model="variant.ram_id">
                                <option value="">Chọn RAM</option>
                                <option v-for="ram in rams" :value="ram.id">{{ ram.dungLuong }}</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Ổ cứng</label>
                            <select class="form-select" v-model="variant.o_cung_id">
                                <option value="">Chọn ổ cứng</option>
                                <option v-for="storage in storages" :value="storage.id">{{ storage.tenOCung }}</option>
                            </select>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Màu sắc</label>
                            <select class="form-select" v-model="variant.mau_sac_id">
                                <option value="">Chọn màu</option>
                                <option v-for="color in colors" :value="color.id">{{ color.tenMau }}</option>
                            </select>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Giá bán (VND)</label>
                            <input type="number" class="form-control" v-model.number="variant.giaBan" min="0">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Số lượng</label>
                            <input type="number" class="form-control" v-model.number="variant.soLuong" min="0">
                        </div>

                        <div class="col-md-12" v-if="variant.id">
                            <label class="form-label">IMEI ({{ variant.imeis.length }})</label>
                            <div class="imei-badges">
                                <span v-for="imei in variant.imeis.slice(0, 3)" :key="imei.id"
                                    class="badge bg-light text-dark me-2 mb-2">
                                    {{ imei.soImei }}
                                </span>
                                <span v-if="variant.imeis.length > 3" class="badge bg-secondary me-2 mb-2">
                                    +{{ variant.imeis.length - 3 }} more
                                </span>
                                <button class="btn btn-sm btn-outline-primary mb-2">
                                    <i class="bi bi-upc-scan"></i> Quản lý
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    variants: {
        type: Array,
        default: () => []
    },
    rams: {
        type: Array,
        default: () => []
    },
    storages: {
        type: Array,
        default: () => []
    },
    colors: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:variants'])

const variants = ref([...props.variants])

const addVariant = () => {
    variants.value.push({
        ram_id: null,
        o_cung_id: null,
        mau_sac_id: null,
        giaBan: 0,
        soLuong: 0,
        imeis: []
    })
    emitUpdate()
}

const removeVariant = (index) => {
    if (variants.value.length > 1) {
        variants.value.splice(index, 1)
        emitUpdate()
    }
}

const emitUpdate = () => {
    emit('update:variants', variants.value)
}

// Watch for changes in variants and emit update
watch(variants, () => {
    emitUpdate()
}, { deep: true })
</script>

<style scoped>
.product-variants {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.variants-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.variants-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.variants-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.variant-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
}

.variant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #e2e8f0;
}

.variant-number {
    font-weight: 500;
    color: #64748b;
}

.imei-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
}
</style>