<template>
  <table class="table table-hover align-middle voucher-table mb-0">
    <thead>
      <tr>
        <th>STT</th>
        <th>Mã</th>
        <th>Tên</th>
        <th>Kiểu</th>
        <th>Loại</th>
        <th>Số lượng</th>
        <th>Ngày bắt đầu</th>
        <th>Ngày kết thúc</th>
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(v, idx) in data" :key="v.id">
        <td>{{ idx + 1 }}</td>
        <td>{{ v.ma }}</td>
        <td>{{ v.ten }}</td>
        <td><span class="badge bg-info bg-opacity-15 text-info">{{ v.kieu }}</span></td>
        <td>{{ v.loai }}</td>
        <td>{{ v.so_luong }}</td>
        <td>{{ formatDateTime(v.ngay_bat_dau) }}</td>
        <td>{{ formatDateTime(v.ngay_ket_thuc) }}</td>
        <td>
          <span :class="statusClass(v.trang_thai)">{{ v.trang_thai }}</span>
        </td>
        <td>
          <button class="btn btn-link p-0 me-2" title="Sửa" @click="$emit('edit', v.id)"><i class="bi bi-pencil fs-5"></i></button>
          <button class="btn btn-link p-0" title="Đổi trạng thái"><i class="bi bi-arrow-repeat fs-5"></i></button>
        </td>
      </tr>
      <tr v-if="!data.length">
        <td colspan="10" class="text-center text-muted">Không có dữ liệu</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup>
import { computed } from 'vue'
function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`
}
function statusClass(status) {
  if (status === 'Đang diễn ra') return 'badge bg-success bg-opacity-15 text-success'
  if (status === 'Sắp diễn ra') return 'badge bg-warning bg-opacity-15 text-warning'
  if (status === 'Đã kết thúc') return 'badge bg-secondary bg-opacity-15 text-secondary'
  return 'badge bg-light text-dark'
}
const props = defineProps({ data: { type: Array, default: () => [] } })
</script>
<style scoped>
.voucher-table th, .voucher-table td {
  vertical-align: middle;
  color: #222;
  font-size: 14px;
  padding: 7px 8px;
}
.badge {
  font-size: 13px;
  padding: 0.35em 0.8em;
  border-radius: 1em;
  font-weight: 500;
}
.bg-opacity-15 {
  opacity: 1 !important;
}
.badge.text-info {
  color: #0d6efd !important;
  background: #e3f0ff !important;
}
.badge.text-success {
  color: #198754 !important;
  background: #e6f4ea !important;
}
.badge.text-warning {
  color: #f59e42 !important;
  background: #fff4e3 !important;
}
.badge.text-secondary {
  color: #6c757d !important;
  background: #f0f0f0 !important;
}
.badge.text-dark {
  color: #222 !important;
  background: #e9ecef !important;
}
.btn-link i {
  color: #1976d2;
  font-size: 1.1em;
}
.btn-link:hover i {
  color: #0d6efd;
}
</style> 