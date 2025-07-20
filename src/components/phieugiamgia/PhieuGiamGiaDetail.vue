<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">Chi tiết phiếu giảm giá</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <b>Tên phiếu:</b> {{ voucher.ten }}
          </div>
          <div class="mb-3">
            <b>Mã phiếu:</b> {{ voucher.ma }}
          </div>
          <div class="mb-3">
            <b>Giá trị giảm:</b> {{ voucher.gia_tri }}
          </div>
          <div class="mb-3">
            <b>Trạng thái:</b> {{ voucher.trang_thai }}
          </div>
          <div class="mb-3">
            <b>Bắt đầu:</b> {{ voucher.tu_ngay }}
          </div>
          <div class="mb-3">
            <b>Kết thúc:</b> {{ voucher.den_ngay }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({ voucher: { type: Object, required: true } })
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
.btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
}
</style> 