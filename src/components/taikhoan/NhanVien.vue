<template>
  <div class="nhanvien-wrapper">
    <!-- Header & Breadcrumb -->
    <div class="header-breadcrumb">
      <h1 class="main-title">Quản Lý Nhân Viên</h1>
      <div class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Trang chủ</router-link> /
        <span>Nhân viên</span>
      </div>
    </div>

    <!-- Bộ Lọc Tìm Kiếm -->
    <div class="filter-card">
      <div class="filter-row filter-row-top">
        <div class="filter-col search-col">
          <label class="form-label">Tìm kiếm</label>
          <input
            type="text"
            v-model="search"
            class="form-control"
            placeholder="Mã, tên, email, SDT..."
          />
        </div>
        <div class="filter-col status-col">
          <label class="form-label">Trạng thái</label>
          <div class="status-radio-group">
            <label><input type="radio" value="all" v-model="statusFilter" /> Tất cả</label>
            <label><input type="radio" value="active" v-model="statusFilter" /> Đang làm</label>
            <label><input type="radio" value="inactive" v-model="statusFilter" /> Đã nghỉ</label>
          </div>
        </div>
      </div>
      <div class="filter-row filter-row-bottom">
        <div class="total-label-form">
          Tổng số nhân viên: <span class="total-number">{{ filteredUsers.length }}</span>
        </div>
        <div class="btn-row-form">
          <button class="btn btn-outline" @click="resetFilter">Đặt lại bộ lọc</button>
          <button class="btn btn-success" @click="openAdd">Thêm Nhân Viên</button>
          <button class="btn btn-outline">Xuất Excel</button>
          <button class="btn btn-outline">Nhập từ Excel</button>
          <button class="btn btn-outline">Tải mẫu Excel</button>
        </div>
      </div>
    </div>

    <!-- Danh Sách Nhân Viên -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-header-row">
          <span class="table-total-label">{{ filteredUsers.length }} nhân viên</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Mã Nhân Viên</th>
                <th>Tên Nhân Viên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Địa Chỉ</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in paginatedUsers" :key="user.id">
                <td>{{ idx + 1 + (currentPage - 1) * pageSize }}</td>
                <td class="user-code">
                  <a href="#" class="user-code-link">{{ user.code }}</a>
                </td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>{{ user.address }}</td>
                <td>
                  <div class="status-toggle-group">
                    <span class="badge status-badge" :class="user.status ? 'active' : 'inactive'">
                      {{ user.status ? 'Đang làm' : 'Đã nghỉ' }}
                    </span>
                    <label class="switch">
                      <input type="checkbox" v-model="user.status" />
                      <span class="slider round"></span>
                    </label>
                  </div>
                </td>
                <td>
                  <div class="action-btn-group">
                    <button class="btn btn-action-edit" title="Sửa" @click="openEdit(user)">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-action-delete" title="Xóa" @click="deleteUser(user)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination & Hiển thị số lượng -->
        <div class="pagination-row">
          <div class="page-size-select">
            Hiển thị
            <select v-model="pageSize">
              <option v-for="size in [5, 10, 20]" :key="size" :value="size">{{ size }}</option>
            </select>
            mục / trang
          </div>
          <div class="pagination-controls">
            <button :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
            <span>{{ currentPage }}</span>
            <button :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
          </div>
          <div class="page-info">
            Hiển thị {{ (currentPage - 1) * pageSize + 1 }} -
            {{ Math.min(currentPage * pageSize, filteredUsers.length) }} /
            {{ filteredUsers.length }} mục
          </div>
        </div>
      </div>
    </div>
    <!-- Modal thêm/sửa nhân viên (giữ lại logic cũ) -->
    <!-- ĐÃ XOÁ PHẦN MODAL THÊM/SỬA NHÂN VIÊN VÌ ĐÃ DÙNG ROUTE RIÊNG -->
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const search = ref('')
const statusFilter = ref('all')
const pageSize = ref(5)
const currentPage = ref(1)
// Đã xoá các biến liên quan modal thêm/sửa

const users = reactive([
  {
    id: 1,
    code: 'NV000001',
    name: 'Nguyễn Đức Minh',
    email: 'ducminh2212345@gmail.com',
    phone: '0986221206',
    address: 'vô gia cư, Phường Trúc Bạch, Quận Ba Đình, Thành phố Hà Nội',
    status: false,
  },
  {
    id: 2,
    code: 'NV000002',
    name: 'Nguyễn Việt Khoa',
    email: 'KhoaNV212@gmail.com',
    phone: '0988193939',
    address: 'Mai Dịch, Cầu Giấy, Hà Nội',
    status: false,
  },
  {
    id: 3,
    code: 'NV000003',
    name: 'Đinh Mạnh Phước',
    email: 'PhuocDM912@gmail.com',
    phone: '0986880912',
    address: 'Mai Dịch, Cầu Giấy, Hà Nội',
    status: false,
  },
  {
    id: 4,
    code: 'NV000004',
    name: 'Nguyễn Hữu Huân',
    email: 'huanek2006@gmail.com',
    phone: '0986912296',
    address: 'Ngọc Thụy, Long Biên, Hà Nội',
    status: false,
  },
  {
    id: 5,
    code: 'NV000005',
    name: 'Lê Quang Phúc',
    email: 'PhucLQ890@gmail.com',
    phone: '0986872711',
    address: 'Yên Hoà, Cầu Giấy, Hà Nội',
    status: false,
  },
  {
    id: 6,
    code: 'NV000006',
    name: 'Nguyễn Văn A',
    email: 'vana@example.com',
    phone: '0912345678',
    address: 'Mai Dịch, Cầu Giấy, Hà Nội',
    status: true,
  },
  {
    id: 7,
    code: 'NV000007',
    name: 'Trần Thị B',
    email: 'thib@example.com',
    phone: '0987654321',
    address: 'Mai Dịch, Cầu Giấy, Hà Nội',
    status: true,
  },
])

const filteredUsers = computed(() => {
  let result = users.filter((u) => {
    const s = search.value.toLowerCase()
    return (
      u.code.toLowerCase().includes(s) ||
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.phone.includes(s)
    )
  })
  if (statusFilter.value === 'active') result = result.filter((u) => u.status)
  if (statusFilter.value === 'inactive') result = result.filter((u) => !u.status)
  return result
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

function resetFilter() {
  search.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
}
// Thay openAdd bằng chuyển route
function openAdd() {
  router.push('/nhan-vien/them')
}
function openEdit() {
  // Nếu muốn sửa, có thể chuyển sang trang sửa riêng hoặc mở modal sửa
  // Hiện tại chỉ giữ lại logic xóa
}
function deleteUser(user) {
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx !== -1) users.splice(idx, 1)
}
</script>

<style scoped>
.nhanvien-wrapper {
  background: #f4f6fb;
  min-height: 100vh;
  padding: 24px 0 32px 0;
}
.header-breadcrumb {
  margin-bottom: 18px;
}
.main-title {
  color: #1aaf5d;
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 2px;
}
.breadcrumb {
  font-size: 1.1rem;
  color: #1aaf5d;
  margin-bottom: 12px;
}
.breadcrumb-link {
  color: #1aaf5d;
  text-decoration: underline;
  cursor: pointer;
}
.filter-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px #1976d211;
  padding: 18px 18px 10px 18px;
  margin-bottom: 18px;
}
.filter-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 18px;
  align-items: flex-end;
}
.filter-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.search-col {
  flex: 2;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  justify-content: flex-end;
}
.total-label-fixed {
  font-size: 1.15em;
  color: #1aaf5d;
  font-weight: 800;
  margin-top: 8px;
  margin-bottom: 0;
}
.status-col {
  flex: 1.2;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.btn-col-fixed {
  flex: 3;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  align-items: flex-end;
  flex-wrap: nowrap;
}
.filter-col status-col {
  flex: 1.2;
}
.total-col {
  flex: 1;
}
.btn-col {
  flex: 2.5;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-radio-group {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 2px;
}
.total-label {
  font-size: 1.1em;
  color: #1aaf5d;
  font-weight: 700;
}
.total-number {
  font-size: 1.1em;
  color: #1aaf5d;
  font-weight: 800;
}
.btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 1em;
  padding: 7px 16px;
  border: none;
  outline: none;
  transition: all 0.18s;
  cursor: pointer;
}
.btn-success {
  background: #1aaf5d;
  color: #fff;
}
.btn-success:hover {
  background: #178f4a;
}
.btn-outline {
  background: #fff;
  color: #1aaf5d;
  border: 1.5px solid #1aaf5d;
}
.btn-outline:hover {
  background: #1aaf5d;
  color: #fff;
}
.card {
  border-radius: 14px;
  box-shadow: 0 2px 12px #1976d211;
  background: #fff;
  border: none;
  margin-bottom: 18px;
}
.table {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 0;
}
.table th,
.table td {
  vertical-align: middle;
  text-align: center;
  padding: 12px 6px;
  font-size: 1em;
}
.table th {
  color: #1aaf5d;
  font-weight: 700;
  background: #f4f6fb;
  border-bottom: 2px solid #e3eafc;
}
.table-hover tbody tr:hover {
  background: #e3f2fd44;
}
.user-code {
  color: #1aaf5d;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
.status-toggle-group {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.status-badge {
  font-size: 1em;
  padding: 6px 18px;
  border-radius: 18px;
  font-weight: 700;
  background: #ffeaea;
  color: #e53935;
  border: 1.5px solid #ffcdd2;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 4px #ffcdd233;
}
.status-badge.active {
  background: #e3fbe8;
  color: #1aaf5d;
  border: 1.5px solid #b2dfdb;
}
.status-badge.inactive {
  background: #ffeaea;
  color: #e53935;
  border: 1.5px solid #ffcdd2;
}
.switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
}
.switch input {
  display: none;
}
.slider.round {
  border-radius: 22px;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 22px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
.switch input:checked + .slider {
  background-color: #1aaf5d;
}
.switch input:checked + .slider:before {
  transform: translateX(16px);
}
.action-btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.btn-action-edit {
  background: #fffde7;
  color: #fbc02d;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1.1em;
  border: none;
}
.btn-action-edit:hover {
  background: #fbc02d;
  color: #fff;
}
.btn-action-delete {
  background: #ffebee;
  color: #e53935;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1.1em;
  border: none;
}
.btn-action-delete:hover {
  background: #e53935;
  color: #fff;
}
.pagination-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #fff;
  border-radius: 0 0 14px 14px;
  border-top: 1px solid #e3eafc;
  font-size: 1em;
}
.page-size-select select {
  border-radius: 6px;
  border: 1px solid #e3eafc;
  padding: 2px 8px;
  margin: 0 4px;
}
.pagination-controls button {
  border: none;
  background: #1aaf5d;
  color: #fff;
  border-radius: 6px;
  padding: 2px 10px;
  margin: 0 2px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.18s;
}
.pagination-controls button:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
.page-info {
  color: #888;
  font-size: 0.98em;
}
/* Modal giữ lại style cũ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 41, 59, 0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.modal-detail {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(33, 150, 243, 0.18);
  padding: 36px 32px 28px 32px;
  min-width: 340px;
  max-width: 96vw;
  width: 400px;
  position: relative;
  animation: modalPop 0.22s cubic-bezier(0.4, 2, 0.6, 1);
}
@keyframes modalPop {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  color: #888;
  cursor: pointer;
  transition: color 0.18s;
  z-index: 2;
}
.modal-close:hover {
  color: #1aaf5d;
}
.modal-info {
  text-align: center;
}
.modal-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1aaf5d;
  margin-bottom: 18px;
  margin-top: 0;
}
.modal-row {
  font-size: 1.08rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.modal-label {
  font-weight: 600;
  color: #555;
  min-width: 110px;
  text-align: right;
}
.modal-input {
  flex: 1 1 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #e3eafc;
  font-size: 1em;
  background: #f8fafc;
  margin-left: 8px;
  transition: border 0.2s;
}
.modal-input:focus {
  border-color: #1aaf5d;
  outline: none;
}
.modal-edit-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
}
.btn-col-horizontal {
  flex: 3;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}
.btn-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  justify-content: flex-end;
}
.btn-row-block {
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  justify-content: flex-end;
  margin-top: 16px;
}
.filter-row-top {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-end;
  margin-bottom: 0;
}
.filter-row-bottom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
}
.total-label-form {
  font-size: 1.1em;
  color: #1aaf5d;
  font-weight: 800;
  margin-left: 2px;
  margin-bottom: 0;
}
.btn-row-form {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-end;
  flex: 1;
}
.table-header-row {
  padding: 16px 24px 0 24px;
  font-size: 1.08em;
  font-weight: 600;
  color: #222;
}
.table-total-label {
  color: #888;
  font-size: 1em;
  font-weight: 500;
}
.custom-table {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 0;
  width: 100%;
}
.custom-table th,
.custom-table td {
  vertical-align: middle;
  text-align: center;
  padding: 14px 8px;
  font-size: 1em;
  border-bottom: 1.5px solid #e3eafc;
}
.custom-table th {
  color: #222;
  font-weight: 700;
  background: #f4f6fb;
  border-bottom: 2px solid #e3eafc;
}
.user-code-link {
  color: #1aaf5d;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
@media (max-width: 1024px) {
  .filter-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .filter-row-top,
  .filter-row-bottom {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  .btn-row {
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
  }
  .btn-row-block {
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
  }
  .pagination-row {
    flex-direction: column;
    gap: 8px;
  }
}
@media (max-width: 768px) {
  .nhanvien-wrapper {
    padding: 8px 0 12px 0;
  }
  .main-title {
    font-size: 1.3rem;
  }
  .filter-card {
    padding: 8px;
  }
  .table th,
  .table td {
    font-size: 0.95em;
    padding: 8px 2px;
  }
  .pagination-row {
    font-size: 0.95em;
  }
  .btn-row-block {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}
</style>
