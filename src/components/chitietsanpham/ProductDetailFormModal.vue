<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        {{ variant.id ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới' }}
                    </h5>
                    <button type="button" class="btn-close" @click="close"></button>
                </div>

                <div class="modal-body">
                    <form @submit.prevent="submitForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Tên biến thể</label>
                                    <input v-model="formData.tenSP" type="text" class="form-control"
                                        placeholder="Ví dụ: MacBook Pro M1 16GB/512GB Space Gray">
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">RAM</label>
                                    <select v-model="formData.ram_id" class="form-select">
                                        <option value="">Chọn RAM ({{ rams.length }} items)</option>
                                        <option v-for="ram in rams" :key="ram.id" :value="ram.id">
                                            {{ ram.dungLuong }}
                                        </option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Ổ cứng</label>
                                    <select v-model="formData.o_cung_id" class="form-select">
                                        <option value="">Chọn ổ cứng ({{ oCungs.length }} items)</option>
                                        <option v-for="ocung in oCungs" :key="ocung.id" :value="ocung.id">
                                            {{ ocung.tenOCung }} ({{ ocung.loaiOCung }})
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Màu sắc</label>
                                    <select v-model="formData.mau_sac_id" class="form-select">
                                        <option value="">Chọn màu sắc ({{ mauSacs.length }} items)</option>
                                        <option v-for="mau in mauSacs" :key="mau.id" :value="mau.id">
                                            {{ mau.tenMau }}
                                        </option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Giá bán</label>
                                    <div class="input-group">
                                        <span class="input-group-text">₫</span>
                                        <input v-model="formData.giaBan" type="number" class="form-control"
                                            placeholder="Nhập giá bán" min="0">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Thời gian bảo hành (tháng)</label>
                                    <input v-model="formData.thoiGianBaoHanh" type="number" class="form-control"
                                        placeholder="12" min="0">
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Ảnh sản phẩm</label>
                            <ImageUploader :initial-images="initialImages" @update="handleImageUpdate" />
                        </div>
                    </form>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">
                        Hủy bỏ
                    </button>
                    <button type="button" class="btn btn-primary" @click="submitForm">
                        {{ variant.id ? 'Cập nhật' : 'Thêm mới' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal-backdrop fade show" @click="close"></div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import ImageUploader from '@/components/chitietsanpham/ImageUploader.vue'
import { useAttributeStore } from '@/stores/attributeStore'
import { getAllMauSac, getAllOCung, getAllRam } from '@/service/apiAttributeOfProduct'

const props = defineProps({
    variant: {
        type: Object,
        default: null
    },
    product: {
        type: Object,
        required: true
    },
    show: {
        type: Boolean,
        required: true
    }
})

// Debug props
console.log('ProductDetailFormModal props:', {
    variant: props.variant,
    product: props.product,
    show: props.show
})

const emit = defineEmits(['close', 'save'])

const attributeStore = useAttributeStore()
const formData = ref({
    tenSP: '',
    ram_id: null,
    o_cung_id: null,
    mau_sac_id: null,
    giaBan: 0,
    thoiGianBaoHanh: 12,
    images: []
})
const initialImages = ref([])

// Load các thuộc tính cần thiết
onMounted(async () => {
    await attributeStore.fetchAttributes()
    console.log('Rams:', rams.value)
    console.log('OCungs:', oCungs.value)
    console.log('MauSacs:', mauSacs.value)
})

// Khi prop variant thay đổi (edit mode)
watch(() => props.variant, (newVal) => {
    console.log('Variant changed:', newVal)
    console.log('Props variant:', props.variant)
    console.log('Show prop:', props.show)

    if (newVal && newVal.id) {
        console.log('Setting form data for edit mode')
        formData.value = {
            id: newVal.id,
            tenSP: newVal.tenSP || '',
            ram_id: newVal.ramId || newVal.ram_id || null,
            o_cung_id: newVal.oCungId || newVal.o_cung_id || null,
            mau_sac_id: newVal.mauSacId || newVal.mau_sac_id || null,
            giaBan: newVal.giaBan || 0,
            thoiGianBaoHanh: newVal.thoiGianBaoHanh || 12,
            images: []
        }
        console.log('Form data set to:', formData.value)

        if (newVal.anhSanPhams && newVal.anhSanPhams.length > 0) {
            initialImages.value = newVal.anhSanPhams.map(img => ({
                id: img.id,
                uri: img.uri,
                is_default: img.is_default
            }))
            console.log('Initial images set to:', initialImages.value)
        } else {
            initialImages.value = []
        }
    } else {
        console.log('Setting form data for add mode')
        // Reset form khi thêm mới
        formData.value = {
            tenSP: '',
            ram_id: null,
            o_cung_id: null,
            mau_sac_id: null,
            giaBan: 0,
            thoiGianBaoHanh: 12,
            images: []
        }
        initialImages.value = []
    }
}, { immediate: true, deep: true })

const rams = computed(() => attributeStore.getRams)
const oCungs = computed(() => attributeStore.getStorages)
const mauSacs = computed(() => attributeStore.getColors)

const close = () => {
    console.log('Closing modal')
    emit('close')
}

const handleImageUpdate = (images) => {
    formData.value.images = images
}

const submitForm = () => {
    console.log('Submitting form with data:', formData.value)
    emit('save', formData.value)
}
</script>

<style scoped>
.modal-backdrop {
    opacity: 0.5;
}
</style>