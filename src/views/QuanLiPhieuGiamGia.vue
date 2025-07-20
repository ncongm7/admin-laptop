<template>
  <div class="voucher-management">
    <template v-if="!isDetailView">
      <!-- ========== BỘ LỌC ========== -->
      <div class="filter-card">
        <h5 class="filter-title">Bộ lọc</h5>
        <div class="filter-row">
          <div class="filter-col">
            <label class="filter-label">Mã</label>
            <input class="filter-input" v-model="filter.ma" placeholder="Nhập mã phiếu" />
          </div>
          <div class="filter-col">
            <label class="filter-label">Tên</label>
            <input class="filter-input" v-model="filter.ten" placeholder="Nhập tên phiếu" />
          </div>
          <div class="filter-col filter-date-col">
            <label class="filter-label">Từ ngày</label>
            <input class="filter-input" v-model="filter.tu_ngay" type="date" />
          </div>
          <div class="filter-col filter-date-col">
            <label class="filter-label">Đến ngày</label>
            <input class="filter-input" v-model="filter.den_ngay" type="date" />
          </div>
          <div class="filter-col">
            <label class="filter-label">Trạng thái</label>
            <select class="filter-input" v-model="filter.trang_thai">
              <option value="">Tất cả</option>
              <option value="Đang diễn ra">Đang diễn ra</option>
              <option value="Sắp diễn ra">Sắp diễn ra</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
          <div class="filter-action">
            <button class="filter-reset-btn" type="button" @click="resetFilter">
              <span>✕</span>
            </button>
          </div>
        </div>
      </div>
      <!-- ========== DANH SÁCH PHIẾU GIẢM GIÁ ========== -->
      <div class="voucher-list-card">
        <div class="voucher-list-header">
          <div>
            <h5 class="voucher-list-title">Danh sách phiếu giảm giá</h5>
          </div>
          <button class="add-btn" @click="openAddForm">
            <span>＋</span>
          </button>
        </div>
        <div class="voucher-table-wrapper">
          <table class="voucher-table">
            <thead>
              <tr>
                <th style="min-width:40px">#</th>
                <th style="min-width:90px">Mã</th>
                <th style="min-width:180px">Tên phiếu</th>
                <th style="min-width:120px">Loại</th>
                <th style="min-width:90px">Giá trị giảm</th>
                <th style="min-width:110px">Số tiền giảm tối đa</th>
                <th style="min-width:110px">Hóa đơn tối thiểu</th>
                <th style="min-width:80px">Số lượng dùng</th>
                <th style="min-width:120px">Bắt đầu</th>
                <th style="min-width:120px">Kết thúc</th>
                <th style="min-width:100px">Trạng thái</th>
                <th style="min-width:80px">Riêng tư</th>
                <th style="min-width:150px">Mô tả</th>
                <th style="min-width:100px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(voucher, idx) in filteredVouchers" :key="voucher.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ voucher.ma }}</td>
                <td>{{ voucher.ten_phieu_giam_gia }}</td>
                <td>{{ voucher.loai_phieu_giam_gia }}</td>
                <td>{{ voucher.gia_tri_giam_gia }}</td>
                <td>{{ voucher.so_tien_giam_toi_da }}</td>
                <td>{{ voucher.hoa_don_toi_thieu }}</td>
                <td>{{ voucher.so_luong_dung }}</td>
                <td>{{ voucher.ngay_bat_dau }}</td>
                <td>{{ voucher.ngay_ket_thuc }}</td>
                <td><span class="status-badge active">{{ voucher.trang_thai }}</span></td>
                <td>{{ voucher.rieng_tu ? 'Có' : 'Không' }}</td>
                <td>{{ voucher.mo_ta }}</td>
                <td>
                  <div class="action-btn-group">
                    <button class="action-btn" @click="openEditForm(voucher)"><span>✎</span></button>
                    <button class="action-btn" @click="openDetailModal(voucher)"><span>👁️</span></button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredVouchers.length === 0">
                <td colspan="14" style="text-align:center;color:#888;padding:24px;">Không có dữ liệu phù hợp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- ========== FORM ADD/EDIT PHIẾU GIẢM GIÁ ========== -->
      <div class="voucher-detail-layout">
        <PhieuGiamGiaForm
          :voucher="editingVoucher"
          :isEditMode="isEditMode"
          @close="backToList"
          @save="handleSave"
        />
        <button class="btn btn-outline-secondary mt-3" @click="backToList">Quay lại</button>
      </div>
    </template>
    <!-- ========== MODAL DETAIL ========== -->
    <PhieuGiamGiaDetail v-if="showDetail" :voucher="detailVoucher" @close="closeDetail" />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import PhieuGiamGiaForm from '../components/phieugiamgia/PhieuGiamGiaForm.vue'
import PhieuGiamGiaDetail from '../components/phieugiamgia/PhieuGiamGiaDetail.vue'
// Mock data
const vouchers = ref([
  {
    id: 1,
    ma: 'PGG001',
    ten_phieu_giam_gia: 'Giảm 10%',
    loai_phieu_giam_gia: 'Phần trăm',
    gia_tri_giam_gia: '10%',
    so_tien_giam_toi_da: '100,000 VND',
    hoa_don_toi_thieu: '500,000 VND',
    so_luong_dung: 10,
    ngay_bat_dau: '2025-05-12',
    ngay_ket_thuc: '2025-06-08',
    trang_thai: 'Đang diễn ra',
    rieng_tu: false,
    mo_ta: 'Áp dụng cho đơn từ 500k'
  },
  {
    id: 2,
    ma: 'PGG002',
    ten_phieu_giam_gia: 'Giảm 200k',
    loai_phieu_giam_gia: 'Tiền mặt',
    gia_tri_giam_gia: '200,000 VND',
    so_tien_giam_toi_da: '200,000 VND',
    hoa_don_toi_thieu: '1,000,000 VND',
    so_luong_dung: 5,
    ngay_bat_dau: '2025-05-12',
    ngay_ket_thuc: '2025-06-08',
    trang_thai: 'Đang diễn ra',
    rieng_tu: true,
    mo_ta: 'Áp dụng cho đơn từ 1 triệu'
  },
  {
    id: 3,
    ma: 'PGG003',
    ten_phieu_giam_gia: 'Giảm 20%',
    loai_phieu_giam_gia: 'Phần trăm',
    gia_tri_giam_gia: '20%',
    so_tien_giam_toi_da: '150,000 VND',
    hoa_don_toi_thieu: '2,000,000 VND',
    so_luong_dung: 20,
    ngay_bat_dau: '2025-05-12',
    ngay_ket_thuc: '2025-06-08',
    trang_thai: 'Sắp diễn ra',
    rieng_tu: false,
    mo_ta: 'Áp dụng cho đơn từ 2 triệu'
  }
])
const filter = ref({ ma: '', ten: '', tu_ngay: '', den_ngay: '', trang_thai: '' })
const showDetail = ref(false)
const detailVoucher = ref(null)
const isDetailView = ref(false)
const isEditMode = ref(false)
const editingVoucher = ref(null)
const filteredVouchers = computed(() => {
  return vouchers.value.filter(v => {
    if (filter.value.ma && !v.ma.toLowerCase().includes(filter.value.ma.toLowerCase())) return false
    if (filter.value.ten && !v.ten_phieu_giam_gia.toLowerCase().includes(filter.value.ten.toLowerCase())) return false
    if (filter.value.tu_ngay && v.ngay_bat_dau < filter.value.tu_ngay) return false
    if (filter.value.den_ngay && v.ngay_ket_thuc > filter.value.den_ngay) return false
    if (filter.value.trang_thai && v.trang_thai !== filter.value.trang_thai) return false
    return true
  })
})
function resetFilter() {
  filter.value = { ma: '', ten: '', tu_ngay: '', den_ngay: '', trang_thai: '' }
}
function openDetailModal(voucher) {
  detailVoucher.value = { ...voucher }
  showDetail.value = true
}
function closeDetail() {
  showDetail.value = false
}
function openAddForm() {
  editingVoucher.value = null
  isEditMode.value = false
  isDetailView.value = true
}
function openEditForm(voucher) {
  editingVoucher.value = { ...voucher }
  isEditMode.value = true
  isDetailView.value = true
}
function backToList() {
  isDetailView.value = false
}
function handleSave(newVoucher) {
  if (isEditMode.value) {
    const index = vouchers.value.findIndex(v => v.id === editingVoucher.value.id)
    if (index !== -1) {
      vouchers.value[index] = newVoucher
    }
  } else {
    const newId = Math.max(...vouchers.value.map(v => v.id)) + 1
    vouchers.value.push({ ...newVoucher, id: newId })
  }
  isDetailView.value = false
}
</script>
<style scoped>
/* Style đồng bộ với QuanLiGiamGia.vue */
.voucher-management {
  padding: 24px;
  background: #fafbfc;
  min-height: 100vh;
}
.filter-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 20px 24px 12px 24px;
  margin-bottom: 24px;
}
.filter-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-col {
  display: flex;
  flex-direction: column;
  min-width: 120px;
  flex: 1;
}
.filter-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}
.filter-input {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  background: #f8f8fa;
}
.filter-date-col {
  min-width: 120px;
}
.filter-action {
  display: flex;
  align-items: center;
  min-width: 28px;
  margin-left: 0;
  height: 100%;
}
.filter-reset-btn {
  background: #ede7f6;
  border: none;
  border-radius: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0;
  box-shadow: none;
  padding: 0;
}
.filter-reset-btn:hover {
  background: #d1c4e9;
}
.voucher-list-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 16px 12px 16px 16px;
  margin-bottom: 0;
}
.voucher-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 0;
}
.voucher-list-title {
  font-size: 18px;
  font-weight: 600;
}
.add-btn {
  background: #ede7f6;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  margin: 0;
  padding: 0;
  box-shadow: none;
  outline: none;
}
.add-btn:hover, .add-btn:focus {
  background: #d1c4e9;
  box-shadow: 0 2px 8px rgba(80,80,180,0.08);
  outline: none;
}
.add-btn span {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #222;
  font-weight: 600;
  line-height: 1;
}
.voucher-table-wrapper {
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
  padding: 0;
}
.voucher-table {
  min-width: 700px;
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  table-layout: auto;
}
.voucher-table th, .voucher-table td {
  padding: 7px 8px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
}
.voucher-table th {
  background: #f5f5fa;
  font-weight: 600;
}
.status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background: #e8f5e9;
  color: #388e3c;
}
.status-badge.active {
  background: #e8f5e9;
  color: #388e3c;
}
.action-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.action-btn {
  background: #ede7f6;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0;
  padding: 0;
  box-shadow: none;
}
.action-btn:hover {
  background: #d1c4e9;
}
</style> 