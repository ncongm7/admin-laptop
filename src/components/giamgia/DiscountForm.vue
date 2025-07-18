<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">{{ isEditMode ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới' }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit">
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label class="form-label">Tên chương trình <span class="text-danger">*</span></label>
                                <input v-model="formData.tenDotGiamGia" type="text" class="form-control" required>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label class="form-label">Mô tả</label>
                                <textarea v-model="formData.moTa" class="form-control" rows="3"></textarea>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Thời gian bắt đầu <span class="text-danger">*</span></label>
                                <input v-model="formData.thoiGianBatDau" type="datetime-local" class="form-control"
                                    required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Thời gian kết thúc <span class="text-danger">*</span></label>
                                <input v-model="formData.thoiGianKetThuc" type="datetime-local" class="form-control"
                                    required>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Mục tiêu doanh thu (VND)</label>
                                <input v-model="formData.mucTieuDoanhThu" type="number" class="form-control">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Người tạo</label>
                                <input type="text" class="form-control" :value="currentUser.name" disabled>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end mt-4">
                            <button type="button" class="btn btn-secondary me-2" @click="$emit('close')">Hủy</button>
                            <button type="submit" class="btn btn-primary">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                {{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDiscountStore } from '@/stores/discountStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDateTimeForInput } from '@/utils/dateUtils.js'

const props = defineProps({
    discount: {
        type: Object,
        default: () => ({})
    },
    isEditMode: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['save', 'close'])

const discountStore = useDiscountStore()
const authStore = useAuthStore()
const loading = ref(false)

const currentUser = computed(() => authStore.user)

const formData = ref({
    tenDotGiamGia: '',
    moTa: '',
    thoiGianBatDau: formatDateTimeForInput(new Date()),
    thoiGianKetThuc: formatDateTimeForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    mucTieuDoanhThu: 0,
    created_by: currentUser.value.id
})

watch(() => props.discount, (newVal) => {
    if (newVal && props.isEditMode) {
        formData.value = {
            ...newVal,
            thoiGianBatDau: formatDateTimeForInput(new Date(newVal.thoiGianBatDau)),
            thoiGianKetThuc: formatDateTimeForInput(new Date(newVal.thoiGianKetThuc))
        }
    }
}, { immediate: true })

const handleSubmit = async () => {
    loading.value = true
    try {
        const data = {
            ...formData.value,
            thoiGianBatDau: new Date(formData.value.thoiGianBatDau),
            thoiGianKetThuc: new Date(formData.value.thoiGianKetThuc),
            created_by: currentUser.value.id
        }

        if (props.isEditMode) {
            await discountStore.updateDiscount(props.discount.id, data)
        } else {
            await discountStore.createDiscount(data)
        }

        emit('save')
    } catch (error) {
        console.error('Error saving discount:', error)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
    overflow: hidden;
}

.modal-header {
    padding: 15px 20px;
}

.modal-title {
    font-weight: 600;
}

.modal-body {
    padding: 20px;
}

.form-label {
    font-weight: 500;
    margin-bottom: 5px;
}

.form-control {
    border-radius: 8px;
    padding: 10px 15px;
}

.btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
}
</style>