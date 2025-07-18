<template>
    <div class="modal fade" id="confirmDialogModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
                        </div>
                        <div>
                            <p class="mb-0">{{ message }}</p>
                            <small class="text-muted">{{ description }}</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button type="button" class="btn btn-danger" @click="$emit('confirm')">Xác nhận</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: { type: String, default: 'Xác nhận' },
    message: { type: String, default: 'Bạn có chắc chắn muốn thực hiện thao tác này?' },
    description: { type: String, default: 'Thao tác này không thể hoàn tác.' }
})
// Emits: confirm
</script>

<style scoped>
.modal-body {
    padding: 1.5rem;
}
</style>