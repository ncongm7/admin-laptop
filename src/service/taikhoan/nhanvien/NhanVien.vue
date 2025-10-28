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
          <button class="btn btn-outline" @click="exportCsv">Xuất Excel</button>
          <button class="btn btn-outline" @click="triggerImport">Nhập từ Excel</button>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.xlsx,.xls"
            @change="handleFile"
            style="display: none"
          />
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
                <th>Ảnh</th>
                <th>Mã Nhân Viên</th>
                <th>Tên Nhân Viên</th>
                <th>Email</th>
                <th>Số Điện Thoại</th>
                <th>Địa Chỉ</th>
                <th>Giới Tính</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, idx) in paginatedUsers"
                :key="user.id"
                @click="showUserDetail(user)"
                class="table-row-clickable"
              >
                <td>{{ idx + 1 + (currentPage - 1) * pageSize }}</td>
                <td>
                  <div class="avatar-circle">
                    <img
                      v-if="user.avatar"
                      :src="getAvatarUrl(user.avatar)"
                      alt="avatar"
                      class="avatar-img"
                    />
                    <i
                      v-else
                      class="bi bi-person-circle"
                      style="font-size: 2rem; color: #bdbdbd"
                    ></i>
                  </div>
                </td>
                <td class="user-code">
                  <a href="#" class="user-code-link">{{ user.code }}</a>
                </td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>{{ user.address }}</td>
                <td>
                  <span
                    class="badge"
                    :class="
                      user.gender === 1
                        ? 'bg-primary'
                        : user.gender === 0
                          ? 'bg-info'
                          : 'bg-secondary'
                    "
                  >
                    {{ user.gender === 1 ? 'Nam' : user.gender === 0 ? 'Nữ' : 'Không xác định' }}
                  </span>
                </td>
                <td>
                  <div class="status-toggle-group">
                    <span class="badge status-badge" :class="user.status ? 'active' : 'inactive'">
                      {{ user.status ? 'Đang làm' : 'Đã nghỉ' }}
                    </span>
                    <label class="switch">
                      <input type="checkbox" v-model="user.status" @change="onToggleStatus(user)" />
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
  </div>

  <!-- Modal chi tiết nhân viên -->
  <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Chi tiết nhân viên</h3>
        <button class="close-btn" @click="closeDetailModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="modal-body" v-if="selectedUser">
        <div class="detail-avatar-section">
          <div class="detail-avatar-circle">
            <img
              v-if="selectedUser.avatar"
              :src="getAvatarUrl(selectedUser.avatar)"
              alt="avatar"
              class="detail-avatar-img"
            />
            <i v-else class="bi bi-person-circle" style="font-size: 4rem; color: #bdbdbd"></i>
          </div>
        </div>
        <div class="detail-info-grid">
          <div class="detail-item">
            <label>Mã nhân viên:</label>
            <span>{{ selectedUser.code }}</span>
          </div>
          <div class="detail-item">
            <label>Họ và tên:</label>
            <span>{{ selectedUser.name }}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>{{ selectedUser.email }}</span>
          </div>
          <div class="detail-item">
            <label>Số điện thoại:</label>
            <span>{{ selectedUser.phone }}</span>
          </div>
          <div class="detail-item">
            <label>Giới tính:</label>
            <span
              class="badge"
              :class="
                selectedUser.gender === 1
                  ? 'bg-primary'
                  : selectedUser.gender === 0
                    ? 'bg-info'
                    : 'bg-secondary'
              "
            >
              {{
                selectedUser.gender === 1
                  ? 'Nam'
                  : selectedUser.gender === 0
                    ? 'Nữ'
                    : 'Không xác định'
              }}
            </span>
          </div>
          <div class="detail-item">
            <label>Chức vụ:</label>
            <span>{{ selectedUser.chucVu || 'Chưa cập nhật' }}</span>
          </div>
          <div class="detail-item">
            <label>Địa chỉ:</label>
            <span>{{ selectedUser.address || 'Chưa cập nhật' }}</span>
          </div>
          <div class="detail-item">
            <label>Trạng thái:</label>
            <span class="badge" :class="selectedUser.status ? 'bg-success' : 'bg-danger'">
              {{ selectedUser.status ? 'Đang làm việc' : 'Đã nghỉ việc' }}
            </span>
          </div>
          <div class="detail-item full-width" v-if="selectedUser.danhGia">
            <label>Đánh giá:</label>
            <div class="detail-textarea">{{ selectedUser.danhGia }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { nhanVienApi, mapDtoToUi, mapEntityToRequest } from '@/service/ApiNhanVien'

const router = useRouter()

const search = ref('')
const statusFilter = ref('all')
const pageSize = ref(5)
const currentPage = ref(1)
const fileInput = ref(null)
const showDetailModal = ref(false)
const selectedUser = ref(null)

const users = reactive([])

async function loadUsers() {
  try {
    const { data } = await nhanVienApi.listAll()
    users.splice(0, users.length, ...data.map(mapDtoToUi))
    console.log('Dữ liệu nhân viên từ backend:', data.slice(0, 2)) // Log 2 nhân viên đầu để debug
    console.log('Dữ liệu sau map:', users.value.slice(0, 2)) // Log 2 nhân viên đầu sau map
  } catch (e) {
    console.error('Lỗi tải nhân viên:', e)
  }
}

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

function openAdd() {
  router.push('/nhan-vien/them')
}

function openEdit(user) {
  router.push(`/nhan-vien/sua/${user.id}`)
}

function deleteUser(user) {
  nhanVienApi
    .remove(user.id)
    .then(() => {
      const idx = users.findIndex((u) => u.id === user.id)
      if (idx !== -1) users.splice(idx, 1)
    })
    .catch((e) => {
      console.error('Xóa nhân viên lỗi:', e)
      alert('Xóa thất bại')
    })
}

onMounted(() => {
  loadUsers()
})

function getAvatarUrl(avatar) {
  if (!avatar) return ''
  // Nếu là base64, trả về trực tiếp
  if (avatar.startsWith('data:')) return avatar
  // Nếu là URL từ server, thêm base URL
  if (avatar.startsWith('/uploads/')) return `http://localhost:8080${avatar}`
  return avatar
}

function showUserDetail(user) {
  selectedUser.value = user
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedUser.value = null
}

async function onToggleStatus(user) {
  try {
    const { data } = await nhanVienApi.getOne(user.id)
    const payload = mapEntityToRequest(data)
    payload.trangThai = user.status ? 1 : 0
    await nhanVienApi.update(user.id, payload)
  } catch (e) {
    console.error('Cập nhật trạng thái lỗi:', e)
    alert('Cập nhật trạng thái thất bại')
  }
}

function exportCsv() {
  const now = new Date()
  const timestamp = now.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Tạo HTML table với border đầy đủ
  const createExcelHTML = () => {
    const rows = filteredUsers.value.map((u, idx) => ({
      STT: idx + 1,
      'Mã Nhân Viên': u.code ?? '',
      'Họ và Tên': u.name ?? '',
      Email: u.email ?? '',
      'Số Điện Thoại': u.phone ?? '',
      'Địa Chỉ': u.address ?? '',
      'Giới Tính': u.gender === 1 ? 'Nam' : u.gender === 0 ? 'Nữ' : 'Không xác định',
      'Trạng Thái': u.status ? 'Đang làm việc' : 'Đã nghỉ việc',
    }))

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <meta name="ExcelFormat" content="1">
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #000000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #4472C4;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          .header-row {
            background-color: #D9E2F3;
            font-weight: bold;
            text-align: center;
          }
          .company-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            background-color: #4472C4;
            color: white;
            padding: 15px;
          }
          .report-title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            background-color: #D9E2F3;
            padding: 10px;
          }
          .info-row {
            background-color: #F2F2F2;
            padding: 5px;
            text-align: center;
          }
          .data-row:nth-child(even) {
            background-color: #F8F9FA;
          }
          .data-row:hover {
            background-color: #E7F3FF;
          }
          .notes {
            background-color: #FFF2CC;
            padding: 10px;
            border: 1px solid #D6B656;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <table>
                  <tr>
                    <td colspan="8" class="company-title">CÔNG TY TNHH VIETLAPTOP</td>
                  </tr>
                  <tr>
                    <td colspan="8" class="report-title">BÁO CÁO DANH SÁCH NHÂN VIÊN</td>
                  </tr>
                  <tr>
                    <td colspan="8" class="info-row">Ngày xuất: ${timestamp} | Tổng số nhân viên: ${filteredUsers.value.length}</td>
                  </tr>
          <tr>
            <td colspan="8" style="height: 10px;"></td>
          </tr>
          <tr class="header-row">
            <td style="width: 60px;">STT</td>
            <td style="width: 120px;">Mã Nhân Viên</td>
            <td style="width: 200px;">Họ và Tên</td>
            <td style="width: 250px;">Email</td>
            <td style="width: 120px;">Số Điện Thoại</td>
            <td style="width: 300px;">Địa Chỉ</td>
            <td style="width: 100px;">Giới Tính</td>
            <td style="width: 120px;">Trạng Thái</td>
          </tr>
          ${rows
            .map(
              (row, idx) => `
            <tr class="data-row">
              <td style="text-align: center;">${String(idx + 1).padStart(3, '0')}</td>
              <td>${row['Mã Nhân Viên']}</td>
              <td>${row['Họ và Tên']}</td>
              <td>${row.Email}</td>
              <td>${row['Số Điện Thoại']}</td>
              <td>${row['Địa Chỉ']}</td>
              <td style="text-align: center;">${row['Giới Tính']}</td>
              <td style="text-align: center;">${row['Trạng Thái']}</td>
            </tr>
          `,
            )
            .join('')}
          <tr>
            <td colspan="8" style="height: 20px;"></td>
          </tr>
          <tr>
            <td colspan="8" class="notes">
              <strong>Ghi chú:</strong><br>
              • Trạng thái "Đang làm việc": Nhân viên đang hoạt động<br>
              • Trạng thái "Đã nghỉ việc": Nhân viên đã ngừng hoạt động<br>
              • File được xuất tự động từ hệ thống quản lý
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  const htmlContent = createExcelHTML()
  const blob = new Blob([htmlContent], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Danh_sach_nhan_vien_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerImport() {
  if (fileInput.value) fileInput.value.click()
}

async function handleFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return

  try {
    let rows = []

    // Kiểm tra loại file
    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      try {
        // Dynamic import XLSX
        const XLSX = await import('xlsx')

        // Đọc file Excel
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Tìm dòng header (dòng có "STT" hoặc "Mã Nhân Viên")
        let headerRowIndex = -1
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (
            row &&
            row.some(
              (cell) =>
                cell &&
                (cell.toString().includes('STT') || cell.toString().includes('Mã Nhân Viên')),
            )
          ) {
            headerRowIndex = i
            break
          }
        }

        if (headerRowIndex === -1) {
          alert('Không tìm thấy header trong file Excel. Vui lòng kiểm tra định dạng.')
          return
        }

        // Lấy header và dữ liệu
        const headers = jsonData[headerRowIndex]
        const dataRows = jsonData.slice(headerRowIndex + 1)

        // Map dữ liệu theo header
        rows = dataRows
          .map((row) => {
            const mappedRow = {}
            headers.forEach((header, index) => {
              if (header) {
                const key = header.toString().trim()
                mappedRow[key] = row[index] || ''
              }
            })
            return mappedRow
          })
          .filter((row) => Object.keys(row).length > 0)
      } catch (xlsxError) {
        console.error('Lỗi đọc file Excel:', xlsxError)
        alert('Không thể đọc file Excel. Vui lòng thử file CSV hoặc kiểm tra định dạng.')
        return
      }
    } else {
      // Đọc file CSV
      const text = await file.text()
      rows = parseCsv(text)
    }

    if (!rows.length) {
      alert('File trống hoặc không có dữ liệu hợp lệ.')
      return
    }

    console.log('Dữ liệu đọc được:', rows)

    const created = []
    const errors = []
    const chunkSize = 5 // Giảm chunk size để tránh lỗi

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      await Promise.all(
        chunk.map(async (r) => {
          try {
            const payload = {
              maNhanVien:
                String(r['Mã Nhân Viên'] || r.MaNhanVien || '').trim() ||
                `NV${Date.now().toString().slice(-6)}`,
              hoTen: String(r['Họ và Tên'] || r.HoTen || '').trim(),
              soDienThoai: String(r['Số Điện Thoại'] || r.SoDienThoai || '').trim(),
              email: String(r.Email || '')
                .trim()
                .toLowerCase(),
              gioiTinh: String(r['Giới Tính'] || r.GioiTinh || '').includes('Nam')
                ? 1
                : String(r['Giới Tính'] || r.GioiTinh || '').includes('Nữ')
                  ? 0
                  : null,
              anhNhanVien: '',
              chucVu: '',
              diaChi: String(r['Địa Chỉ'] || r.DiaChi || '').trim(),
              danhGia: '',
              trangThai: String(r['Trạng Thái'] || r.TrangThai || '').includes('Đang') ? 1 : 0,
            }
            if (!payload.hoTen || !payload.soDienThoai || !payload.email) {
              throw new Error('Thiếu Họ tên/Email/SĐT')
            }
            await nhanVienApi.add(payload)
            created.push(payload.maNhanVien)
          } catch (err) {
            console.error('Lỗi thêm nhân viên:', err)
            errors.push({
              row: r,
              message: err?.response?.data || err?.message || 'Lỗi không xác định',
            })
          }
        }),
      )
    }

    await loadUsers()
    console.log('Kết quả import:', {
      thành_công: created.length,
      lỗi: errors.length,
      chi_tiết_lỗi: errors.map((e) => ({
        mã_nhân_viên: e.row['Mã Nhân Viên'] || e.row.MaNhanVien,
        họ_tên: e.row['Họ và Tên'] || e.row.HoTen,
        lỗi: e.message,
      })),
    })
    alert(`Tạo thành công: ${created.length} nhân viên`)
  } catch (err) {
    console.error('Lỗi đọc file:', err)
    alert('Không thể đọc file. Vui lòng kiểm tra định dạng file Excel/CSV.')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length)
  if (!lines.length) return []
  const header = splitCsvLine(lines[0])
  const idx = {
    STT: header.indexOf('STT'),
    MaNhanVien: header.indexOf('MaNhanVien'),
    HoTen: header.indexOf('HoTen'),
    Email: header.indexOf('Email'),
    SoDienThoai: header.indexOf('SoDienThoai'),
    DiaChi: header.indexOf('DiaChi'),
    TrangThai: header.indexOf('TrangThai'),
  }
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    if (!cols.length) continue
    rows.push({
      STT: idx.STT >= 0 ? cols[idx.STT] : '',
      MaNhanVien: idx.MaNhanVien >= 0 ? cols[idx.MaNhanVien] : '',
      HoTen: idx.HoTen >= 0 ? cols[idx.HoTen] : '',
      Email: idx.Email >= 0 ? cols[idx.Email] : '',
      SoDienThoai: idx.SoDienThoai >= 0 ? cols[idx.SoDienThoai] : '',
      DiaChi: idx.DiaChi >= 0 ? cols[idx.DiaChi] : '',
      TrangThai: idx.TrangThai >= 0 ? cols[idx.TrangThai] : '',
    })
  }
  return rows
}

function splitCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current)
  return result
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
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 2px;
  background: linear-gradient(90deg, #1aaf5d, #22c55e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  background: #ffffffcc;
  backdrop-filter: blur(6px);
  border-radius: 14px;
  box-shadow: 0 8px 24px #1976d222;
  padding: 18px 18px 12px 18px;
  margin-bottom: 18px;
  border: 1px solid #e8f5e9;
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
.status-col {
  flex: 1.2;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.98em;
  padding: 9px 18px;
  border: none;
  outline: none;
  transition:
    transform 0.12s ease,
    box-shadow 0.2s ease,
    background 0.18s ease,
    color 0.18s ease;
  cursor: pointer;
}
.btn:active {
  transform: translateY(1px);
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
  color: #16a34a;
  border: 1.5px solid #16a34a;
  box-shadow: 0 2px 6px #16a34a22;
}
.btn-outline:hover {
  background: #16a34a;
  color: #fff;
}
.card {
  border-radius: 16px;
  box-shadow: 0 10px 28px #00000014;
  background: #fff;
  border: 1px solid #eef7f1;
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
  color: #16a34a;
  font-weight: 700;
  background: #f4f6fb;
  border-bottom: 2px solid #e3eafc;
}
.table-hover tbody tr:hover {
  background: #ecfdf5;
}
.custom-table tbody tr:nth-child(even) {
  background: #fafafa;
}
.user-code {
  color: #1aaf5d;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}
/* Avatar styles */
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Table row clickable */
.table-row-clickable {
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row-clickable:hover {
  background-color: #f8f9fa !important;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 175, 93, 0.1), rgba(0, 0, 0, 0.3));
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 60px rgba(26, 175, 93, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(26, 175, 93, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, #1aaf5d 0%, #178f4a 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-radius: 20px 20px 0 0;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1aaf5d, #178f4a, #1aaf5d);
}

.modal-header h3 {
  margin: 0;
  font-weight: 700;
  font-size: 1.4rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.3rem;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
  background: #fafbfc;
}

.detail-avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
}

.detail-avatar-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 4px solid #1aaf5d;
  box-shadow: 0 8px 25px rgba(26, 175, 93, 0.2);
  position: relative;
}

.detail-avatar-circle::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(45deg, #1aaf5d, #178f4a, #1aaf5d);
  z-index: -1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.detail-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.detail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(26, 175, 93, 0.1);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 700;
  color: #1aaf5d;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 500;
}

.detail-textarea {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  min-height: 100px;
  white-space: pre-wrap;
  font-size: 1rem;
  line-height: 1.6;
  color: #2c3e50;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .detail-info-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
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
  background: #e7f9ef;
  color: #16a34a;
  border: 1.5px solid #bfe7d2;
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
  background: #fffef2;
  color: #d97706;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 1.05em;
  border: 1px solid #fde68a;
  box-shadow: 0 2px 6px #f59e0b22;
}
.btn-action-edit:hover {
  background: #f59e0b;
  color: #fff;
}
.btn-action-delete {
  background: #fff5f5;
  color: #dc2626;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 1.05em;
  border: 1px solid #fecaca;
  box-shadow: 0 2px 6px #ef444422;
}
.btn-action-delete:hover {
  background: #ef4444;
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
}
</style>
