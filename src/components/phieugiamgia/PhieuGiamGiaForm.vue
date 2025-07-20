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
            <label class="form-label">Kiểu áp dụng</label>
            <div>
              <label class="form-check form-check-inline">
                <input class="form-check-input" type="radio" value="toan_bo" v-model="form.kieu" /> Toàn bộ
              </label>
              <label class="form-check form-check-inline">
                <input class="form-check-input" type="radio" value="ca_nhan" v-model="form.kieu" /> Gửi riêng
              </label>
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
  ma: '', ten: '', gia_tri: '', loai: '%', giam_toi_da: '', so_luong: '', dieu_kien: '', tu_ngay: '', den_ngay: '', kieu: 'toan_bo'
})
watch(() => props.voucher, (val) => {
  if (props.isEditMode && val) {
    form.value = { ...val }
  } else {
    form.value = { ma: '', ten: '', gia_tri: '', loai: '%', giam_toi_da: '', so_luong: '', dieu_kien: '', tu_ngay: '', den_ngay: '', kieu: 'toan_bo' }
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
.voucher-form-layout { min-height: 400px; }
.form-card { background: #fff; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.form-label { font-weight: 500; font-size: 14px; margin-bottom: 4px; }
input, select, .form-control, .form-select { font-size: 14px !important; height: 36px !important; padding: 4px 10px !important; border-radius: 6px !important; border: 1px solid #d0d7de !important; box-shadow: none !important; }
input[type="radio"] { accent-color: #1976d2; width: 16px; height: 16px; margin-right: 4px; }
.form-check-inline { margin-right: 18px; font-size: 14px; display: inline-flex; align-items: center; gap: 4px; }
.row.mb-3, .mb-3 { margin-bottom: 12px !important; }
.table { font-size: 14px; margin-bottom: 0; border-radius: 8px; overflow: hidden; }
.table th, .table td { vertical-align: middle; font-size: 14px; padding: 7px 8px; border-color: #e9ecef !important; }
.table th { background: #f8f9fa; font-weight: 600; }
.pagination .page-link { color: #1976d2; font-size: 14px; padding: 4px 10px; border-radius: 6px !important; }
.pagination .active .page-link { background: #1976d2; color: #fff; border-color: #1976d2; }
</style> 