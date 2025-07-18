<template>
  <div class="discount-management">
    <template v-if="!isDetailView">
      <!-- ========== BỘ LỌC ========== -->
      <div class="filter-card">
        <h5 class="filter-title">Bộ lọc</h5>
        <div class="filter-row">
          <div class="filter-col">
            <label class="filter-label">Mã</label>
            <input class="filter-input" v-model="filter.id" placeholder="Nhập mã giảm giá" />
          </div>
          <div class="filter-col">
            <label class="filter-label">Tên</label>
            <input class="filter-input" v-model="filter.ten_km" placeholder="Nhập tên chương trình" />
          </div>
          <div class="filter-col">
            <label class="filter-label">Giá trị</label>
            <input class="filter-input" v-model="filter.gia_tri" placeholder="% hoặc số tiền" />
          </div>
          <div class="filter-col">
            <label class="filter-label">Mô tả</label>
            <input class="filter-input" v-model="filter.mo_ta" placeholder="Nhập mô tả" />
          </div>
          <div class="filter-col filter-date-col">
            <label class="filter-label">Từ ngày</label>
            <input class="filter-input" v-model="filter.ngayBatDau" type="date" />
          </div>
          <div class="filter-col filter-date-col">
            <label class="filter-label">Đến ngày</label>
            <input class="filter-input" v-model="filter.ngayKetThuc" type="date" />
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
      <!-- ========== DANH SÁCH ĐỢT GIẢM GIÁ ========== -->
      <div class="discount-list-card">
        <div class="discount-list-header">
          <div>
            <h5 class="discount-list-title">Danh sách đợt giảm giá</h5>
            <div class="discount-list-desc">Hiển thị danh sách đợt giảm giá T-Shirts Two</div>
          </div>
          <button class="add-btn" @click="addNewDiscount">
            <span>＋</span>
          </button>
        </div>
        <div class="discount-table-wrapper">
          <table class="discount-table">
            <thead>
              <tr>
                <th style="min-width:40px">#</th>
                <th style="min-width:90px">Mã</th>
                <th style="min-width:180px">Tên</th>
                <th style="min-width:90px">Giá trị giảm</th>
                <th style="min-width:120px">Bắt đầu</th>
                <th style="min-width:120px">Kết thúc</th>
                <th style="min-width:120px">Trạng thái hiện tại</th>
                <th style="min-width:100px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dot, idx) in filteredDotGiamGiaList" :key="dot.id">
                <td data-label="#">{{ idx + 1 }}</td>
                <td data-label="Mã">{{ dot.id }}</td>
                <td data-label="Tên">{{ dot.ten_km }}</td>
                <td data-label="Giá trị giảm">{{ dot.gia_tri }} %</td>
                <td data-label="Bắt đầu">{{ dot.ngayBatDau }}</td>
                <td data-label="Kết thúc">{{ dot.ngayKetThuc }}</td>
                <td data-label="Trạng thái hiện tại"><span class="status-badge active">{{ dot.trang_thai }}</span></td>
                <td data-label="Hành động">
                  <div class="action-btn-group">
                    <button class="action-btn"><span>⇄</span></button>
                    <button class="action-btn" @click="showDetail(dot)"><span>👁️</span></button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredDotGiamGiaList.length === 0">
                <td colspan="8" style="text-align:center;color:#888;padding:24px;">Không có dữ liệu phù hợp</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- ========== TRANG CHI TIẾT ĐỢT GIẢM GIÁ (ADD/EDIT) ========== -->
      <div class="detail-layout">
        <div class="detail-left">
          <h4 style="margin-bottom: 18px;">% Thông tin đợt giảm giá</h4>
          <div class="detail-form">
            <div class="form-group">
              <label>Mã</label>
              <input class="form-control" v-model="formDot.id" :disabled="isEditMode" />
            </div>
            <div class="form-group">
              <label>Tên</label>
              <input class="form-control" v-model="formDot.ten_km" />
            </div>
            <div class="form-group">
              <label>Loại</label>
              <div style="display:flex;gap:16px;align-items:center;">
                <label><input type="radio" value="%" v-model="formDot.loai" /> %</label>
                <label><input type="radio" value="Tiền" v-model="formDot.loai" /> Tiền</label>
              </div>
            </div>
            <div class="form-group">
              <label>Giá trị</label>
              <input class="form-control" v-model="formDot.gia_tri" />
            </div>
            <div class="form-group">
              <label>Thời gian bắt đầu</label>
              <input class="form-control" v-model="formDot.ngayBatDau" type="date" />
            </div>
            <div class="form-group">
              <label>Thời gian kết thúc</label>
              <input class="form-control" v-model="formDot.ngayKetThuc" type="date" />
            </div>
            <div class="form-group">
              <label><input type="checkbox" v-model="formDot.hoat_dong" /> Hoạt động</label>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button class="btn btn-primary" @click="handleSaveDot">{{ isEditMode ? 'Cập nhật' : 'Tạo mới' }}</button>
              <button class="btn btn-outline-secondary" @click="backToList">Quay lại</button>
            </div>
          </div>
        </div>
        <div class="detail-right" v-if="isEditMode">
          <div class="detail-header">
            <div>
              <b>Sản phẩm áp dụng trong đợt</b>
              <span style="margin-left:12px;color:#888;font-size:13px;">Số lượng {{ chiTietList.length }}</span>
            </div>
            <button class="btn btn-link" @click="backToList" style="float:right">Quay lại</button>
          </div>
          <div class="detail-table-wrapper">
            <table class="detail-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Thông tin</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ct in chiTietList" :key="ct.id">
                  <td><div class="img-mock"></div></td>
                  <td>
                    <div><b>{{ ct.id_ctsp }}</b></div>
                    <div>Giá gốc: <span class="price-old">{{ formatMoney(ct.gia_ban_dau) }}</span></div>
                    <div>Giá giảm: <span class="price-discount">{{ formatMoney(ct.gia_giam_duoc) }}</span></div>
                    <div>Giá sau giảm: <span class="price-final">{{ formatMoney(ct.gia_sau_khi_giam) }}</span></div>
                    <div class="note">{{ ct.ghi_chu }}</div>
                  </td>
                  <td><button class="action-btn"><span>🗑️</span></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
// ================= DỮ LIỆU TẠM MOCKUP THEO ERD =================
// Sau này thay thế bằng API, chỉ cần thay đổi ở đây
import { ref, computed } from 'vue'
const dotGiamGiaList = [
  {
    id: 'DGG88187',
    ten_km: 'Khuyến mãi Dòng 1',
    gia_tri: 25,
    mo_ta: 'Giảm giá cho dòng sản phẩm 1',
    ngayBatDau: '06/05/2025 00:00',
    ngayKetThuc: '13/05/2025 00:00',
    trang_thai: 'Đang diễn ra',
  },
  {
    id: 'DGG91213',
    ten_km: 'Khuyến mãi kỳ nhập học mới',
    gia_tri: 10,
    mo_ta: 'Giảm giá cho sinh viên nhập học',
    ngayBatDau: '05/05/2025 04:00',
    ngayKetThuc: '05/06/2025 00:00',
    trang_thai: 'Đang diễn ra',
  },
  {
    id: 'DGG04495',
    ten_km: 'Giảm giá Chào Hè',
    gia_tri: 15,
    mo_ta: 'Chương trình giảm giá mùa hè',
    ngayBatDau: '05/05/2025 03:00',
    ngayKetThuc: '13/05/2025 00:00',
    trang_thai: 'Đang diễn ra',
  },
]

const dotGiamGiaChiTietList = [
  {
    id: 1,
    id_km: 'DGG88187',
    id_ctsp: 'SPCT001',
    gia_ban_dau: 1000000,
    gia_giam_duoc: 250000,
    gia_sau_khi_giam: 750000,
    ghi_chu: 'Áp dụng cho sản phẩm A',
  },
  {
    id: 2,
    id_km: 'DGG88187',
    id_ctsp: 'SPCT002',
    gia_ban_dau: 2000000,
    gia_giam_duoc: 500000,
    gia_sau_khi_giam: 1500000,
    ghi_chu: 'Áp dụng cho sản phẩm B',
  },
  {
    id: 3,
    id_km: 'DGG91213',
    id_ctsp: 'SPCT003',
    gia_ban_dau: 1500000,
    gia_giam_duoc: 150000,
    gia_sau_khi_giam: 1350000,
    ghi_chu: 'Áp dụng cho sản phẩm C',
  },
]
// ================= HẾT DỮ LIỆU MOCKUP =================

const isDetailView = ref(false)
const isEditMode = ref(false)
const selectedDot = ref(null)
const formDot = ref({})
const chiTietList = computed(() => {
  if (!selectedDot.value) return []
  return dotGiamGiaChiTietList.filter(ct => ct.id_km === selectedDot.value.id)
})

const filter = ref({
  id: '',
  ten_km: '',
  gia_tri: '',
  mo_ta: '',
  ngayBatDau: '',
  ngayKetThuc: '',
  trang_thai: ''
})

const filteredDotGiamGiaList = computed(() => {
  return dotGiamGiaList.filter(dot => {
    // Lọc tương đối cho các trường text
    if (filter.value.id && !dot.id.toLowerCase().includes(filter.value.id.toLowerCase())) return false
    if (filter.value.ten_km && !dot.ten_km.toLowerCase().includes(filter.value.ten_km.toLowerCase())) return false
    if (filter.value.gia_tri && String(dot.gia_tri).toLowerCase().indexOf(filter.value.gia_tri.toLowerCase()) === -1) return false
    if (filter.value.mo_ta && (!dot.mo_ta || !dot.mo_ta.toLowerCase().includes(filter.value.mo_ta.toLowerCase()))) return false
    // Lọc ngày bắt đầu >= filter.ngayBatDau
    if (filter.value.ngayBatDau) {
      const filterDate = new Date(filter.value.ngayBatDau)
      const dotDate = new Date(dot.ngayBatDau)
      if (isNaN(filterDate.getTime()) || isNaN(dotDate.getTime()) || dotDate < filterDate) return false
    }
    // Lọc ngày kết thúc <= filter.ngayKetThuc
    if (filter.value.ngayKetThuc) {
      const filterDate = new Date(filter.value.ngayKetThuc)
      const dotDate = new Date(dot.ngayKetThuc)
      if (isNaN(filterDate.getTime()) || isNaN(dotDate.getTime()) || dotDate > filterDate) return false
    }
    if (filter.value.trang_thai && !dot.trang_thai.toLowerCase().includes(filter.value.trang_thai.toLowerCase())) return false
    return true
  })
})

function showDetail(dot) {
  selectedDot.value = dot
  isEditMode.value = true
  isDetailView.value = true
  formDot.value = { ...dot, loai: '%', hoat_dong: true }
}
function addNewDiscount() {
  selectedDot.value = null
  isEditMode.value = false
  isDetailView.value = true
  formDot.value = {
    id: '',
    ten_km: '',
    loai: '%',
    gia_tri: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    hoat_dong: true
  }
}
function backToList() {
  isDetailView.value = false
  selectedDot.value = null
  isEditMode.value = false
}
function handleSaveDot() {
  if (!formDot.value.ten_km || !formDot.value.gia_tri) {
    alert('Vui lòng nhập đầy đủ thông tin!')
    return
  }
  if (!isEditMode.value) {
    // Add mới
    dotGiamGiaList.push({
      ...formDot.value,
      trang_thai: 'Đang diễn ra',
    })
  } else {
    // Update (mock)
    const idx = dotGiamGiaList.findIndex(d => d.id === formDot.value.id)
    if (idx !== -1) dotGiamGiaList[idx] = { ...formDot.value }
  }
  backToList()
}
function formatMoney(val) {
  return val ? val.toLocaleString('vi-VN') + ' ₫' : ''
}
function resetFilter() {
  filter.value = {
    id: '',
    ten_km: '',
    gia_tri: '',
    mo_ta: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    trang_thai: ''
  }
}
</script>

<style scoped>
.discount-management {
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
.discount-list-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 16px 12px 16px 16px;
  margin-bottom: 0;
}
.discount-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 0;
}
.discount-list-title {
  font-size: 18px;
  font-weight: 600;
}
.discount-list-desc {
  font-size: 13px;
  color: #888;
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
  transition: background 0.2s;
  margin: 0;
  padding: 0;
  box-shadow: none;
}
.add-btn:hover {
  background: #d1c4e9;
}
.discount-table-wrapper {
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
  padding: 0;
}
.discount-table {
  min-width: 700px;
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  table-layout: auto;
}
.discount-table th, .discount-table td {
  padding: 7px 8px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
}
.discount-table th {
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
/* ========== DETAIL ========== */
.detail-layout {
  display: flex;
  gap: 16px; /* giảm gap để tiết kiệm không gian */
  margin-top: 18px;
  align-items: flex-start;
}
.detail-left {
  flex: 1 1 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 20px 16px; /* giảm padding */
  min-width: 280px;
  max-width: 360px;
}
.detail-form .form-group {
  margin-bottom: 14px;
}
.detail-form label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}
.detail-form .form-control {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 7px 12px;
  font-size: 14px;
  background: #f8f8fa;
  margin-bottom: 2px;
}
.detail-right {
  flex: 2 1 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 20px 8px 20px 20px; /* giảm padding phải, tăng không gian bảng */
  min-width: 0;
  width: 100%;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.detail-table-wrapper {
  overflow-x: auto;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  table-layout: auto;
}
.detail-table th, .detail-table td {
  padding: 7px 8px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-size: 14px;
  white-space: nowrap;
}
.detail-table th {
  background: #f5f5fa;
  font-weight: 600;
}
.img-mock {
  width: 48px;
  height: 48px;
  background: #ffe0b2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.price-old {
  color: #1976d2;
  font-weight: 500;
}
.price-discount {
  color: #ff9800;
  font-weight: 500;
}
.price-final {
  color: #e53935;
  font-weight: 600;
}
.note {
  color: #888;
  font-size: 13px;
  margin-top: 2px;
}
@media (max-width: 1100px) {
  .discount-table th, .discount-table td {
    font-size: 13px;
    padding: 7px 6px;
  }
  .filter-row {
    gap: 8px;
  }
  .detail-layout {
    flex-direction: column;
    gap: 12px;
  }
  .detail-left, .detail-right {
    max-width: 100%;
    min-width: 0;
    padding: 16px 6px;
  }
}
@media (max-width: 900px) {
  .filter-row, .discount-list-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  .discount-table-wrapper {
    overflow-x: auto;
  }
}
@media (max-width: 700px) {
  .discount-table, .discount-table thead, .discount-table tbody, .discount-table tr, .discount-table th, .discount-table td {
    display: block;
    width: 100%;
  }
  .discount-table thead {
    display: none;
  }
  .discount-table tr {
    margin-bottom: 16px;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    padding: 8px 0;
  }
  .discount-table td {
    border: none;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    padding-left: 40%;
    min-height: 36px;
    white-space: normal;
    font-size: 14px;
  }
  .discount-table td:last-child {
    border-bottom: none;
  }
  .discount-table td:before {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: #888;
    content: attr(data-label);
    font-size: 13px;
    min-width: 120px;
    text-align: left;
    white-space: pre-line;
  }
  .action-btn-group {
    flex-direction: row;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
