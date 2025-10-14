<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content card">
      <div class="card-header">
        <h4>Cập nhật Lịch sử Bảo hành</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitUpdate">
          <div class="mb-3">
            <label class="form-label">Mô tả lỗi *</label>
            <textarea class="form-control" rows="3" v-model.trim="form.moTaLoi" required></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Ngày tiếp nhận</label>
            <input type="datetime-local" class="form-control" v-model="form.ngayTiepNhan" />
          </div>
          <div class="mb-3">
            <label class="form-label">Ngày hoàn thành</label>
            <input type="datetime-local" class="form-control" v-model="form.ngayHoanThanh" />
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary" @click="$emit('close')" :disabled="isSubmitting">Hủy</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !form.moTaLoi">
              {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { updateLichSuBaoHanh } from '@/service/baohanh/LichSuBaoHanhService';

const props = defineProps({
  itemToEdit: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'updated']);

const form = ref({
  id: null,
  moTaLoi: '',
  ngayTiepNhan: '',
  ngayHoanThanh: ''
});

const isSubmitting = ref(false);

// Helper functions for time conversion
function toInstantISOString(localStr) {
  if (!localStr) return null;
  const dtLocal = new Date(localStr);
  return dtLocal.toISOString();
}

function instantToLocalInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

watchEffect(() => {
  if (props.itemToEdit) {
    form.value = {
      id: props.itemToEdit.id,
      moTaLoi: props.itemToEdit.moTaLoi,
      ngayTiepNhan: instantToLocalInput(props.itemToEdit.ngayTiepNhan),
      ngayHoanThanh: instantToLocalInput(props.itemToEdit.ngayHoanThanh)
    };
  }
});

const submitUpdate = async () => {
  if (!form.value.moTaLoi) {
    alert('Vui lòng nhập mô tả lỗi.');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      moTaLoi: form.value.moTaLoi,
      ngayTiepNhan: toInstantISOString(form.value.ngayTiepNhan),
      ngayHoanThanh: toInstantISOString(form.value.ngayHoanThanh) // Backend field is ngauHoanThanh
    };
    await updateLichSuBaoHanh(payload, form.value.id);
    alert('Cập nhật thành công!');
    emit('updated');
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
    // Error alert is already handled in the service
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 8px;
}
</style>
