// FILE: src/components/phieugiamgia/ApplyPhieuGiamGia.vue
<template>
  <div class="apply-phieu-giam-gia">
    <div class="input-group mb-3">
      <input
        v-model="maPhieuGiamGia"
        type="text"
        class="form-control"
        placeholder="Nhập mã phiếu giảm giá"
        @keyup.enter="handleApply"
        :disabled="loading"
      />
      <button
        class="btn btn-primary"
        type="button"
        @click="handleApply"
        :disabled="loading || !maPhieuGiamGia.trim()"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        Áp dụng
      </button>
    </div>

    <div v-if="ketQuaKiemTra" class="alert" :class="ketQuaKiemTra.hopLe ? 'alert-success' : 'alert-danger'">
      <strong v-if="ketQuaKiemTra.hopLe">✓ {{ ketQuaKiemTra.thongBao }}</strong>
      <strong v-else>✗ {{ ketQuaKiemTra.thongBao }}</strong>
      <div v-if="ketQuaKiemTra.hopLe" class="mt-2">
        <p class="mb-1"><strong>Phiếu:</strong> {{ ketQuaKiemTra.tenPhieuGiamGia }}</p>
        <p class="mb-1"><strong>Tiền được giảm:</strong> {{ formatCurrency(ketQuaKiemTra.tienDuocGiam) }}</p>
        <p class="mb-0"><strong>Tổng tiền sau giảm:</strong> {{ formatCurrency(ketQuaKiemTra.tongTienSauGiam) }}</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePhieuGiamGiaStore } from '@/stores/phieuGiamGiaStore';

const props = defineProps({
  khachHangId: {
    type: String,
    required: true
  },
  tongTienHoaDon: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['phieuGiamGiaApplied']);

const phieuGiamGiaStore = usePhieuGiamGiaStore();
const maPhieuGiamGia = ref('');
const loading = computed(() => phieuGiamGiaStore.loading);
const ketQuaKiemTra = computed(() => phieuGiamGiaStore.ketQuaKiemTra);
const error = computed(() => phieuGiamGiaStore.error);

const formatCurrency = (amount) => {
  if (!amount) return '0 VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const handleApply = async () => {
  if (!maPhieuGiamGia.value.trim()) {
    return;
  }

  try {
    const ketQua = await phieuGiamGiaStore.kiemTraVaApDungPhieuGiamGia(
      maPhieuGiamGia.value.trim(),
      props.khachHangId,
      props.tongTienHoaDon
    );

    if (ketQua && ketQua.hopLe) {
      emit('phieuGiamGiaApplied', ketQua);
    }
  } catch (err) {
    console.error('Lỗi khi áp dụng phiếu giảm giá:', err);
  }
};
</script>

<style scoped>
.apply-phieu-giam-gia {
  max-width: 500px;
}
</style>

