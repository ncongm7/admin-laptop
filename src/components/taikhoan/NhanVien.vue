<template>
    <div>
        <!-- Bộ lọc -->
        <div class="card mb-4 filter-card">
            <div class="card-body">
                <div class="filter-title">Bộ lọc</div>
                <div class="filter-row">
                    <div class="filter-col">
                        <label class="form-label">Tìm kiếm</label>
                        <input type="text" class="form-control" placeholder="Tìm kiếm tên, số điện thoại..." />
                    </div>
                    <div class="filter-col">
                        <label class="form-label">Ngày sinh</label>
                        <input type="date" class="form-control" />
                    </div>
                    <div class="filter-col">
                        <label class="form-label">Trạng thái</label>
                        <select class="form-select">
                            <option>Tất cả</option>
                            <option>Hoạt động</option>
                            <option>Chưa kích hoạt</option>
                        </select>
                    </div>
                    <div class="filter-col">
                        <label class="form-label">Khoảng lương</label>
                        <div class="slider-label-row">
                            <span class="salary-label">{{ salaryRange[0] }} triệu</span>
                            <Slider v-model="salaryRange" :min="0" :max="100" :step="1" class="salary-slider" />
                            <span class="salary-label">{{ salaryRange[1] }} triệu</span>
                        </div>
                    </div>
                </div>
                <div class="filter-action-row">
                    <button class="btn btn-primary d-flex align-items-center">
                        <i class="bi bi-search me-1"></i> Tìm kiếm
                    </button>
                    <button class="btn btn-primary d-flex align-items-center" @click="openAdd()">
                        <i class="bi bi-plus-circle me-1"></i> Thêm mới
                    </button>
                    <button class="btn btn-outline-primary d-flex align-items-center">
                        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới bộ lọc
                    </button>
                    <button class="btn btn-outline-primary d-flex align-items-center">
                        <i class="bi bi-file-earmark-excel me-1"></i> Xuất Excel
                    </button>
                    <button class="btn btn-outline-secondary d-flex align-items-center">
                        <i class="bi bi-upload me-1"></i> Import Excel
                    </button>
                </div>
            </div>
        </div>
        <!-- Bảng danh sách nhân viên -->
        <div class="card">
            <div class="card-body p-0">
                <h5 class="staff-list-title px-4 pt-3 pb-2 mb-0">Danh sách nhân viên</h5>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>STT</th>
                                <th>Ảnh</th>
                                <th>Họ và tên</th>
                                <th>CCCD</th>
                                <th>Số điện thoại</th>
                                <th>Ngày sinh</th>
                                <th>Email</th>
                                <th>Trạng Thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, idx) in users" :key="user.id">
                                <td>{{ idx + 1 }}</td>
                                <td>
                                    <div class="avatar-circle">
                                        <span>{{ getInitials(user.name) }}</span>
                                    </div>
                                </td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.cccd }}</td>
                                <td>{{ user.phone }}</td>
                                <td>{{ user.birthday }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <span class="badge status-badge" :class="user.status ? 'active' : 'inactive'">
                                        {{ user.status ? 'Hoạt động' : 'Chưa kích hoạt' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-btn-group">
                                        <button class="btn btn-action-view me-1" title="Xem" @click="openDetail(user)">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        <button class="btn btn-action-edit me-1" title="Sửa" @click="openEdit(user)">
                                            <i class="bi bi-pencil-square"></i>
                                        </button>
                                        <button class="btn btn-action-delete" title="Xóa">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- Modal chi tiết nhân viên -->
        <template v-if="showDetailModal">
            <div class="modal-overlay" @click.self="closeDetail">
                <div class="modal-detail">
                    <button class="modal-close" @click="closeDetail" title="Đóng">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="modal-avatar">
                        <div class="avatar-circle modal-avatar-circle">
                            <span>{{ getInitials(selectedUser.name) }}</span>
                        </div>
                    </div>
                    <div class="modal-info">
                        <h2 class="modal-name">{{ selectedUser.name }}</h2>
                        <div class="modal-row">
                            <span class="modal-label">CCCD:</span> {{ selectedUser.cccd }}
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Số điện thoại:</span> {{ selectedUser.phone }}
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Email:</span> {{ selectedUser.email }}
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Ngày sinh:</span> {{ selectedUser.birthday }}
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Trạng thái:</span>
                            <span class="badge status-badge" :class="selectedUser.status ? 'active' : 'inactive'">
                                {{ selectedUser.status ? 'Hoạt động' : 'Chưa kích hoạt' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <!-- Modal sửa nhân viên -->
        <template v-if="showEditModal">
            <div class="modal-overlay" @click.self="closeEdit">
                <form class="modal-detail modal-edit-form" @submit.prevent="saveEdit">
                    <button class="modal-close" @click="closeEdit" title="Đóng">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="modal-avatar">
                        <label class="avatar-upload-label">
                            <div class="avatar-circle modal-avatar-circle avatar-upload-preview">
                                <template v-if="editUser.avatar">
                                    <img :src="editUser.avatar" alt="avatar" class="avatar-img" />
                                </template>
                                <template v-else>
                                    <span>{{ getInitials(editUser.name || '') }}</span>
                                </template>
                            </div>
                            <input type="file" accept="image/*" class="avatar-upload-input"
                                @change="(e) => onAvatarChange(e, editUser)" />
                            <span class="avatar-upload-text">Chọn ảnh</span>
                        </label>
                    </div>
                    <div class="modal-info">
                        <h2 class="modal-name">Sửa nhân viên</h2>
                        <div class="modal-row">
                            <span class="modal-label">Họ và tên:</span>
                            <input v-model="editUser.name" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">CCCD:</span>
                            <input v-model="editUser.cccd" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Số điện thoại:</span>
                            <input v-model="editUser.phone" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Email:</span>
                            <input v-model="editUser.email" type="email" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Ngày sinh:</span>
                            <input v-model="editUser.birthday" type="date" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Trạng thái:</span>
                            <select v-model="editUser.status" class="modal-input">
                                <option :value="true">Hoạt động</option>
                                <option :value="false">Chưa kích hoạt</option>
                            </select>
                        </div>
                        <div class="modal-edit-actions">
                            <button type="submit" class="btn btn-primary">Lưu</button>
                            <button type="button" class="btn btn-outline-secondary" @click="closeEdit">Đóng</button>
                        </div>
                    </div>
                </form>
            </div>
        </template>
        <!-- Modal thêm nhân viên -->
        <template v-if="showAddModal">
            <div class="modal-overlay" @click.self="closeAdd">
                <form class="modal-detail modal-edit-form" @submit.prevent="saveAdd">
                    <button class="modal-close" @click="closeAdd" title="Đóng">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="modal-avatar">
                        <label class="avatar-upload-label">
                            <div class="avatar-circle modal-avatar-circle avatar-upload-preview">
                                <template v-if="addUser.avatar">
                                    <img :src="addUser.avatar" alt="avatar" class="avatar-img" />
                                </template>
                                <template v-else>
                                    <span>{{ getInitials(addUser.name || '') }}</span>
                                </template>
                            </div>
                            <input type="file" accept="image/*" class="avatar-upload-input"
                                @change="(e) => onAvatarChange(e, addUser)" />
                            <span class="avatar-upload-text">Chọn ảnh</span>
                        </label>
                    </div>
                    <div class="modal-info">
                        <h2 class="modal-name">Thêm nhân viên</h2>
                        <div class="modal-row">
                            <span class="modal-label">Họ và tên:</span>
                            <input v-model="addUser.name" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">CCCD:</span>
                            <input v-model="addUser.cccd" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Số điện thoại:</span>
                            <input v-model="addUser.phone" type="text" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Email:</span>
                            <input v-model="addUser.email" type="email" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Ngày sinh:</span>
                            <input v-model="addUser.birthday" type="date" class="modal-input" required />
                        </div>
                        <div class="modal-row">
                            <span class="modal-label">Trạng thái:</span>
                            <select v-model="addUser.status" class="modal-input">
                                <option :value="true">Hoạt động</option>
                                <option :value="false">Chưa kích hoạt</option>
                            </select>
                        </div>
                        <div class="modal-edit-actions">
                            <button type="submit" class="btn btn-primary">Lưu</button>
                            <button type="button" class="btn btn-outline-secondary" @click="closeAdd">Đóng</button>
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Slider from '@vueform/slider'
import '@vueform/slider/themes/default.css'
const salaryRange = ref([10, 80])
const showDetailModal = ref(false)
const selectedUser = ref(null)
const showEditModal = ref(false)
const editUser = reactive({})
const showAddModal = ref(false)
const addUser = reactive({
    name: '',
    cccd: '',
    phone: '',
    birthday: '',
    email: '',
    status: true,
    avatar: '',
})
const users = reactive([
    {
        id: 1,
        name: 'Lê Văn C',
        cccd: '023456789012',
        phone: '0909090909',
        birthday: '01/01/1985',
        email: 'vanlc@example.com',
        status: true,
        avatar: '',
    },
    {
        id: 2,
        name: 'Trần Thị B',
        cccd: '098765432109',
        phone: '0987654321',
        birthday: '15/08/1990',
        email: 'thib@example.com',
        status: true,
        avatar: '',
    },
    {
        id: 3,
        name: 'Nguyễn Văn A',
        cccd: '012345678901',
        phone: '0912345678',
        birthday: '09/04/1985',
        email: 'vana@example.com',
        status: true,
        avatar: '',
    },
    {
        id: 4,
        name: 'Trần Thị C',
        cccd: '098764411111',
        phone: '0987641111',
        birthday: '13/04/2000',
        email: 'thic@example.com',
        status: false,
        avatar: '',
    },
])
function getInitials(name) {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
function openDetail(user) {
    selectedUser.value = user
    showDetailModal.value = true
}
function closeDetail() {
    showDetailModal.value = false
    selectedUser.value = null
}
function openEdit(user) {
    Object.assign(editUser, user)
    showEditModal.value = true
}
function closeEdit() {
    showEditModal.value = false
    Object.keys(editUser).forEach((k) => delete editUser[k])
}
function saveEdit() {
    const idx = users.findIndex((u) => u.id === editUser.id)
    if (idx !== -1) {
        users[idx] = { ...editUser }
    }
    closeEdit()
}
function openAdd() {
    Object.assign(addUser, {
        name: '',
        cccd: '',
        phone: '',
        birthday: '',
        email: '',
        status: true,
        avatar: '',
    })
    showAddModal.value = true
}
function closeAdd() {
    showAddModal.value = false
    Object.assign(addUser, {
        name: '',
        cccd: '',
        phone: '',
        birthday: '',
        email: '',
        status: true,
        avatar: '',
    })
}
function saveAdd() {
    const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
    users.push({ id: newId, ...addUser })
    closeAdd()
}
function onAvatarChange(e, target) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        target.avatar = ev.target.result
    }
    reader.readAsDataURL(file)
}
</script>

<style scoped>
body {
    font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    background: #f4f6fb;
    color: #222;
    margin: 0;
    padding: 0;
}

html,
body {
    padding: 0;
    margin: 0;
}

.staff-management {
    /* background: #f4f6fb; */
    /* min-height: 100vh; */
    /* width: 100vw; */
    /* max-width: 100vw; */
    /* margin: 0; */
    /* padding: 24px 0 32px 0; */
    /* padding-left: 0 !important; */
    /* margin-left: 0 !important; */
}

h2 {
    color: #1a237e;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 32px;
    text-align: center;
}

.card,
.filter-card {
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(60, 72, 88, 0.08);
    background: #fff;
    border: none;
    margin-bottom: 32px;
    /* width: 100vw; */
    /* max-width: 100vw; */
    /* margin-left: 0 !important; */
    /* margin-right: 0; */
    /* left: 50%; */
    /* transform: translateX(-50%); */
    /* position: relative; */
}

.filter-card .card-body {
    padding-left: 16px;
    padding-right: 16px;
}

.filter-card .form-label {
    font-size: 1em;
    font-weight: 500;
    color: #1976d2;
    margin-bottom: 6px;
}

input.form-control,
select.form-select {
    border-radius: 10px;
    border: 1.5px solid #e3eafc;
    font-size: 1em;
    padding: 8px 12px;
    background: #f8fafc;
    transition: border 0.2s;
}

input.form-control:focus,
select.form-select:focus {
    border-color: #1976d2;
    outline: none;
}

.salary-label {
    font-size: 0.97em;
    color: #1976d2;
    font-weight: 600;
}

.avatar-circle {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #42a5f5 60%, #1976d2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.15rem;
    box-shadow: 0 2px 8px #42a5f522;
    border: 2.5px solid #e3f2fd;
    margin: 0 auto;
}

.status-badge {
    font-size: 1em;
    padding: 6px 18px;
    border-radius: 18px;
    font-weight: 700;
    background: #e3fbe8;
    color: #2e7d32;
    border: 1.5px solid #b2dfdb;
    letter-spacing: 0.5px;
    box-shadow: 0 1px 4px #b2dfdb33;
}

.status-badge.inactive {
    background: #fff3e0;
    color: #ff9800;
    border: 1.5px solid #ffe0b2;
}

.table {
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    margin-bottom: 0;
}

.table thead {
    background: #f4f6fb;
}

.table th,
.table td {
    vertical-align: middle;
    text-align: center;
    padding: 14px 8px;
    font-size: 1em;
}

.table th {
    color: #1976d2;
    font-weight: 700;
    background: #f4f6fb;
    border-bottom: 2px solid #e3eafc;
}

.table-hover tbody tr:hover {
    background: #e3f2fd44;
}

.btn {
    border-radius: 10px;
    font-weight: 600;
    font-size: 1em;
    padding: 8px 18px;
    transition: all 0.18s;
    box-shadow: 0 1px 4px #1976d211;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-primary {
    background: linear-gradient(90deg, #1976d2 60%, #42a5f5 100%) !important;
    color: #fff !important;
    border: none;
}

.btn-primary:hover {
    background: linear-gradient(90deg, #1565c0 60%, #1976d2 100%) !important;
    color: #fff !important;
}

.btn-outline-primary {
    color: #1976d2 !important;
    border: 1.5px solid #1976d2 !important;
    background: #fff !important;
}

.btn-outline-primary:hover {
    background: #1976d2 !important;
    color: #fff !important;
}

.btn-outline-secondary {
    color: #616161 !important;
    border: 1.5px solid #bdbdbd !important;
    background: #fff !important;
}

.btn-outline-secondary:hover {
    background: #bdbdbd !important;
    color: #fff !important;
}

.btn-action-view {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 1.1em;
    transition:
        background 0.18s,
        color 0.18s;
    border: none;
}

.btn-action-view:hover {
    background: #1976d2;
    color: #fff;
}

.btn-action-edit {
    background: #fffde7;
    color: #fbc02d;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 1.1em;
    transition:
        background 0.18s,
        color 0.18s;
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
    transition:
        background 0.18s,
        color 0.18s;
    border: none;
}

.btn-action-delete:hover {
    background: #e53935;
    color: #fff;
}

.filter-card .d-flex.flex-wrap {
    flex-wrap: wrap !important;
    gap: 10px;
}

.filter-card .btn {
    margin-bottom: 4px;
}

.filter-action-row {
    width: 100%;
}

.filter-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1a237e;
    margin-bottom: 18px;
    margin-left: 0;
    letter-spacing: 0.2px;
}

.filter-row {
    display: flex;
    flex-direction: row;
    gap: 24px;
    width: 100%;
    margin-bottom: 18px;
    padding: 0;
}

.filter-col {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.filter-action-row {
    display: flex;
    flex-direction: row;
    gap: 14px;
    flex-wrap: nowrap;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
}

.action-btn-group {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.staff-list-title {
    font-size: 2rem;
    font-weight: 800;
    color: #1976d2;
    letter-spacing: 0.5px;
    margin-bottom: 18px;
    margin-top: 0;
    text-transform: capitalize;
    text-align: left;
    padding-left: 0;
}

/* Responsive */
@media (max-width: 1024px) {
    .card-body {
        padding-left: 0;
        padding-right: 0;
    }

    .filter-row {
        gap: 12px;
    }

    .staff-management {
        /* max-width: 100vw; */
        /* padding: 12px 0 24px 0; */
    }
}

@media (max-width: 768px) {
    .staff-management {
        /* padding: 4px 0 12px 0; */
        /* max-width: 100vw; */
        /* width: 100vw; */
    }

    .card-body {
        padding-left: 0;
        padding-right: 0;
    }

    .card,
    .filter-card {
        /* width: 100vw; */
        /* max-width: 100vw; */
        /* margin-left: 0; */
        /* margin-right: 0; */
    }

    .table th,
    .table td {
        font-size: 0.95em;
        padding: 8px 4px;
    }

    .avatar-circle {
        width: 36px;
        height: 36px;
        font-size: 1em;
    }

    .filter-row {
        flex-direction: column;
        gap: 8px;
    }

    .filter-action-row {
        flex-wrap: wrap;
        gap: 8px;
    }
}

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
    color: #1976d2;
}

.modal-avatar {
    display: flex;
    justify-content: center;
    margin-bottom: 18px;
}

.modal-avatar-circle {
    width: 64px;
    height: 64px;
    font-size: 2rem;
    border-width: 3px;
}

.modal-info {
    text-align: center;
}

.modal-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1976d2;
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

.modal-edit-form .modal-name {
    color: #ff9800;
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
    border-color: #1976d2;
    outline: none;
}

.modal-edit-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 18px;
}

@media (max-width: 480px) {
    .modal-input {
        font-size: 0.98em;
        padding: 7px 8px;
    }

    .modal-edit-actions {
        flex-direction: column;
        gap: 8px;
    }
}

.avatar-upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
}

.avatar-upload-input {
    display: none;
}

.avatar-upload-preview {
    overflow: hidden;
    position: relative;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
}

.avatar-upload-text {
    font-size: 0.95em;
    color: #1976d2;
    margin-top: 6px;
    text-decoration: underline;
    cursor: pointer;
}

.slider-label-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.salary-slider {
    flex: 1 1 0;
    margin: 0 8px;
}

.salary-label {
    min-width: 54px;
    text-align: center;
}
</style>
