<template>
  <div class="voucher-form-layout row g-0">
    <div :class="['col-lg-6', form.kieu==='ca_nhan' ? 'pe-lg-3' : 'mx-auto']">
      <div class="form-card p-4 mb-3">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label class="form-label">Mã phiếu giảm giá</label>
            <input class="form-control" v-model="form.ma" placeholder="Có thể nhập hoặc không" />
          </div>
          <div class="mb-3">
            <label class="form-label">Tên phiếu giảm giá</label>
            <input class="form-control" v-model="form.ten" required />
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label">Giá trị</label>
              <div class="input-group">
                <input class="form-control" v-model="form.gia_tri" type="number" min="0" required />
                <select class="form-select" v-model="form.loai">
                  <option value="%">%</option>
                  <option value="VND">VND</option>
                </select>
              </div>
            </div>
            <div class="col-6">
              <label class="form-label">Giá trị giảm tối đa</label>
              <input class="form-control" v-model="form.giam_toi_da" type="number" min="0" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label">Số lượng</label>
              <input class="form-control" v-model="form.so_luong" type="number" min="0" />
            </div>
            <div class="col-6">
              <label class="form-label">Điều kiện (giá trị đơn tối thiểu)</label>
              <input class="form-control" v-model="form.dieu_kien" type="number" min="0" />
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label">Từ ngày</label>
              <input class="form-control" v-model="form.tu_ngay" type="date" required />
            </div>
            <div class="col-6">
              <label class="form-label">Đến ngày</label>
              <input class="form-control" v-model="form.den_ngay" type="date" required />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Riêng tư</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" v-model="form.riengTu" id="riengTuCheckbox">
              <label class="form-check-label" for="riengTuCheckbox">Riêng tư</label>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-4">
            <button type="button" class="btn btn-secondary me-2" @click="$emit('close')">Hủy</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="form.kieu==='ca_nhan'" class="col-lg-6 ps-lg-3 mt-4 mt-lg-0">
      <div class="form-card p-4 mb-3">
        <div class="d-flex align-items-center mb-3">
          <input class="form-control me-2" placeholder="Tìm kiếm khách hàng" v-model="search" />
          <span class="text-muted">({{ filteredCustomers.length }} khách hàng)</span>
        </div>
        <table class="table table-bordered table-hover align-middle mb-0">
          <thead>
            <tr>
              <th style="width:36px"><input type="checkbox" v-model="allChecked" @change="toggleAll" /></th>
              <th>Tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Chi tiêu</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in pagedCustomers" :key="c.id">
              <td><input type="checkbox" v-model="selected" :value="c.id" /></td>
              <td>{{ c.ten }}</td>
              <td>{{ c.sdt }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.chi_tieu }}</td>
            </tr>
            <tr v-if="!pagedCustomers.length">
              <td colspan="5" class="text-center text-muted">Không có khách hàng</td>
            </tr>
          </tbody>
        </table>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div>
            Xem
            <select v-model="pageSize" class="form-select d-inline-block w-auto mx-1" style="min-width:60px">
              <option v-for="n in [5,10,20]" :key="n" :value="n">{{ n }}</option>
            </select>
            khách hàng
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{disabled: page===1}">
                <button class="page-link" @click="page=page-1" :disabled="page===1">&lt;</button>
              </li>
              <li class="page-item" v-for="p in totalPages" :key="p" :class="{active: page===p}">
                <button class="page-link" @click="page=p">{{ p }}</button>
              </li>
              <li class="page-item" :class="{disabled: page===totalPages}">
                <button class="page-link" @click="page=page+1" :disabled="page===totalPages">&gt;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
  isEditMode: { type: Boolean, default: false },
  voucher: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])
const form = ref({
  ma: '', ten: '', gia_tri: '', loai: '%', giam_toi_da: '', so_luong: '', dieu_kien: '', tu_ngay: '', den_ngay: '', riengTu: false
})
watch(() => props.voucher, (val) => {
  if (props.isEditMode && val) {
    form.value = { riengTu: false, ...val }
    if (val.riengTu !== undefined) form.value.riengTu = val.riengTu
  } else {
    form.value = { ma: '', ten: '', gia_tri: '', loai: '%', giam_toi_da: '', so_luong: '', dieu_kien: '', tu_ngay: '', den_ngay: '', riengTu: false }
  }
}, { immediate: true })
function handleSubmit() {
  emit('save', { ...form.value, selectedCustomers: form.value.kieu==='ca_nhan' ? selected.value : [] })
}
// Khách hàng mock
const search = ref('')
const selected = ref([])
const page = ref(1)
const pageSize = ref(5)
const customers = ref([
  { id: 1, ten: 'Lý Tiến Duy', sdt: '0961886385', email: 'duyhanoi14022004@gmail.com', chi_tieu: '11.178.000 VND' },
  { id: 2, ten: 'Nguyễn Hoàng Long', sdt: '0965126211', email: 'long123@gmail.com', chi_tieu: '3.771.000 VND' },
  { id: 3, ten: 'Vũ Phương Nhi', sdt: '0356556564', email: 'nhi123@gmail.com', chi_tieu: '461.000 VND' },
  { id: 4, ten: 'Trần Thị B', sdt: '0987654321', email: 'customer2@example.com', chi_tieu: '0 VND' },
  { id: 5, ten: 'Lê Văn C', sdt: '0912345678', email: 'customer3@example.com', chi_tieu: '0 VND' },
  { id: 6, ten: 'Nguyễn Văn D', sdt: '0911111111', email: 'customer4@example.com', chi_tieu: '0 VND' },
  { id: 7, ten: 'Nguyễn Văn E', sdt: '0912222222', email: 'customer5@example.com', chi_tieu: '0 VND' }
])
const filteredCustomers = computed(() => {
  if (!search.value) return customers.value
  const s = search.value.toLowerCase()
  return customers.value.filter(c => c.ten.toLowerCase().includes(s) || c.sdt.includes(s) || c.email.toLowerCase().includes(s))
})
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value) || 1)
const pagedCustomers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredCustomers.value.slice(start, start + pageSize.value)
})
const allChecked = computed({
  get() {
    return pagedCustomers.value.length && pagedCustomers.value.every(c => selected.value.includes(c.id))
  },
  set(val) {
    if (val) {
      selected.value = Array.from(new Set([...selected.value, ...pagedCustomers.value.map(c => c.id)]))
    } else {
      selected.value = selected.value.filter(id => !pagedCustomers.value.some(c => c.id === id))
    }
  }
})
function toggleAll() { allChecked.value = !allChecked.value }
</script>
<style scoped>
.voucher-form-page {
  padding: 24px;
  background: #fafbfc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
.form-container {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}
.voucher-form-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}
.header-icon {
  font-size: 18px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.form-content {
  padding: 20px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.form-group {
  flex: 1;
}
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}
.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #4caf50;
}
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}
.input-suffix {
  position: absolute;
  right: 12px;
  color: #666;
  font-size: 14px;
  pointer-events: none;
}
.date-input-wrapper {
  position: relative;
}
.calendar-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
  pointer-events: none;
}
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  resize: vertical;
  min-height: 80px;
}
.form-textarea:focus {
  outline: none;
  border-color: #4caf50;
}
.checkbox-group {
  margin-bottom: 20px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.checkbox-text {
  font-size: 14px;
  color: #333;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: #4caf50;
  color: white;
}
.btn-primary:hover {
  background: #45a049;
}
.btn-secondary {
  background: #f8f9fa;
  color: #555;
  border: 1px solid #ddd;
}
.btn-secondary:hover {
  background: #e9ecef;
}
@media (max-width: 1200px) {
  .form-container {
    flex-direction: column;
  }
  .form-row {
    flex-direction: column;
    gap: 12px;
  }
}
@media (max-width: 768px) {
  .voucher-form-page {
    padding: 16px;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 