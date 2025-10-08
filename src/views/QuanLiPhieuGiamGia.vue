<template>
  <main class="container">
    <h1>Quản lý Phiếu Giảm Giá</h1>

    <!-- Thanh công cụ -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div class="d-flex gap-2">
        <input
          v-model="q"
          class="form-control"
          placeholder="Tìm theo mã / tên…"
          style="max-width: 280px"
        />
      </div>
      <button class="btn btn-success" @click="goToAdd">+ Thêm mới</button>
    </div>

    <!-- Bảng danh sách -->
    <table class="table table-bordered table-hover">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Mã</th>
          <th>Tên phiếu</th>
          <th>Loại</th>
          <th>Giá trị</th>
          <th>Giảm tối đa</th>
          <th>HĐ tối thiểu</th>
          <th>Số lượng</th>
          <th>Bắt đầu</th>
          <th>Kết thúc</th>
          <th>Riêng tư</th>
          <th>Trạng thái</th>
          <th style="width: 220px">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(it, idx) in filtered" :key="it.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ it.ma }}</td>
          <td>{{ it.tenPhieuGiamGia }}</td>
          <td>{{ showLoai(it.loaiPhieuGiamGia) }}</td>
          <td>{{ it.giaTriGiamGia }}</td>
          <td>{{ it.soTienGiamToiDa }}</td>
          <td>{{ it.hoaDonToiThieu }}</td>
          <td>{{ it.soLuongDung }}</td>
          <td>{{ showDate(it.ngayBatDau) }}</td>
          <td>{{ showDate(it.ngayKetThuc) }}</td>
          <td>{{ it.riengTu ? 'Có' : 'Không' }}</td>
          <td>{{ it.trangThai === 1 ? 'Hoạt động' : 'Ngưng' }}</td>
          <td class="d-flex gap-2">
            <button class="btn btn-info" @click="viewDetail(it.id)">Chi tiết</button>
            <button class="btn btn-warning" @click="edit(it.id)">Sửa</button>
            <button class="btn btn-danger" @click="remove(it.id)">Xóa</button>
          </td>
        </tr>
        <tr v-if="filtered.length === 0">
          <td colspan="13" class="text-center text-muted">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVouchers, deleteVoucher } from '@/service/phieugiamgia/PhieuGiamGiaService'

const router = useRouter()
const list = ref([])
const q = ref('')

// Nạp danh sách
const fetchList = async () => {
  try {
    const res = await getVouchers()
    list.value = res?.data ?? res ?? []   // ưu tiên res.data, nếu không có thì dùng res
  } catch (e) {
    // service đã alert khi lỗi, ở đây chỉ log cho dev
    console.error(e)
  }
}


const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return list.value
  return list.value.filter(
    x =>
      (x.ma || '').toLowerCase().includes(s) ||
      (x.tenPhieuGiamGia || '').toLowerCase().includes(s)
  )
})

// Điều hướng
const goToAdd = () => router.push('/phieu-giam-gia2/add')
const viewDetail = (id) => router.push(`/phieu-giam-gia2/detail/${id}`)
const edit = (id) => router.push(`/phieu-giam-gia2/edit/${id}`)

// Xóa
const remove = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa không?')) return
  try {
    const resp = await deleteVoucher(id)       // lỗi -> service alert + throw
    alert(resp?.message || 'Xóa thành công!')
    fetchList()
  } catch (e) {
    console.error(e) // đã alert ở service rồi, không cần alert lại
  }
}


// Helpers hiển thị
const showLoai = (n) => (n === 0 ? '%' : n === 1 ? 'VND' : n)
const showDate = (v) => {
  if (!v) return '';
  const d = new Date(String(v)); // nhận ISO có 'Z' hoặc không
  if (isNaN(d)) return String(v); // fallback
  const pad = (n) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day} ${hh}:${mm}`;
};


onMounted(fetchList)
</script>

<style scoped>
h1 { text-align: center; margin-bottom: 16px; }
</style>
