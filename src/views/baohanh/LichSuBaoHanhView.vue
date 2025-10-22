<template>
  <main class="container">
    <h1>Lịch Sử Bảo Hành</h1>

    <div class="row mb-4">
      <!-- TÌM THEO NGÀY (FE) -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h4>Tìm theo ngày tiếp nhận</h4>
          </div>
          <div class="card-body">
            <div class="d-flex gap-2">
              <input type="date" class="form-control" v-model="searchDate" />
              <button class="btn btn-outline-secondary" @click="clearDateFilter" title="Xóa bộ lọc ngày">Xóa</button>
            </div>
          </div>
        </div>
      </div>

      <!-- THÔNG TIN PHIẾU BẢO HÀNH -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>Thông tin Phiếu Bảo Hành</h4>
          </div>

          <div class="card-body" v-if="phieuBaoHanh && phieuBaoHanh.id">
            <div class="row">
              <div class="col-md-6 mb-2">
                <strong>Tên khách:</strong> {{ phieuBaoHanh.hoTenKhachHang }}
              </div>
              <div class="col-md-6 mb-2">
                <strong>Số điện thoại:</strong> {{ phieuBaoHanh.sdt }}
              </div>

              <div class="col-md-6 mb-2">
                <strong>Tên sản phẩm:</strong> {{ phieuBaoHanh.tenSP }}
              </div>
              <div class="col-md-6 mb-2">
                <strong>Số serial:</strong> {{ phieuBaoHanh.soSerial }}
              </div>

              <div class="col-md-6 mb-2">
                <strong>Bắt đầu:</strong> {{ showDate(phieuBaoHanh.ngayBatDau, false) }}
              </div>
              <div class="col-md-6 mb-2">
                <strong>Kết thúc:</strong> {{ showDate(phieuBaoHanh.ngayKetThuc, false) }}
              </div>

              <div class="col-12">
                <strong>Trạng thái:</strong> {{ phieuBaoHanh.trangThai === 1 ? 'Hoạt động' : 'Ngưng' }}
              </div>
            </div>
          </div>

          <div class="card-body text-center text-muted" v-else>
            Đang tải hoặc không tìm thấy thông tin Phiếu Bảo Hành.
          </div>

          <div class="card-footer">
            <button type="button" class="btn btn-secondary" @click="back">Quay lại</button>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4" />

    <div>
      <h4>Lịch sử bảo hành (Serial: {{ phieuBaoHanh.soSerial || 'N/A' }})</h4>
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-success btn-sm" @click="toggleAddForm" :disabled="!phieuBaoHanh?.id">
            {{ showAddForm ? 'Đóng' : 'Thêm lịch sử bảo hành' }}
          </button>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-info" @click="toggleSort" :disabled="!list.length">
            Ngày tiếp nhận
            <i :class="{ 'bi-arrow-down': sortDirection === 'desc', 'bi-arrow-up': sortDirection === 'asc' }"></i>
          </button>

          <input v-model="q" class="form-control" placeholder="Tìm kiếm FE theo mô tả lỗi" style="max-width: 250px"
            :disabled="!list.length" />
        </div>
      </div>

      <!-- Form thêm nhanh (inline), ẩn/hiện theo nút -->
      <div v-if="showAddForm" class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-12">
              <label class="form-label">Mô tả lỗi *</label>
              <textarea class="form-control" rows="3" v-model.trim="addDesc"
                placeholder="Mô tả ngắn gọn sự cố..."></textarea>
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button class="btn btn-outline-secondary" @click="cancelAdd" :disabled="adding">Hủy</button>
              <button class="btn btn-primary" @click="submitAdd" :disabled="adding || !addDesc">
                {{ adding ? 'Đang lưu...' : 'Lưu' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Ngày tiếp nhận</th>
              <th>Ngày hoàn thành</th>
              <th>Mô tả lỗi</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in pagedApplied" :key="it.id">
              <td>{{ (pageApplied - 1) * pageSizeApplied + idx + 1 }}</td>
              <td>{{ showDate(it.ngayTiepNhan) }}</td>
              <td>{{ showDate(it.ngayHoanThanh) }}</td>
              <td>{{ it.moTaLoi }}</td>
              <td>{{ getLichSuTrangThai(it.trangThai) }}</td>
              <td class="d-flex gap-2">
                <button class="btn btn-danger" @click="remove(it.id)">Xóa</button>
                <button class="btn btn-warning" @click="edit(it.id)">Sửa</button>
              </td>
            </tr>
            <tr v-if="pagedApplied.length === 0">
              <td colspan="6" class="text-center text-muted">Không có lịch sử bảo hành nào cho phiếu này.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex align-items-center justify-content-between mt-2">
        <div>Tổng: {{ filtered.length }} bản ghi</div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary" :disabled="pageApplied <= 1" @click="prevPageApplied">
            « Trang trước
          </button>
          <span>Trang {{ pageApplied }} / {{ totalPagesApplied || 1 }}</span>
          <button class="btn btn-outline-secondary" :disabled="pageApplied >= totalPagesApplied"
            @click="nextPageApplied">
            Trang sau »
          </button>
        </div>
      </div>
    </div>

    <LichSuBaoHanhEditForm
      v-if="isEditFormVisible"
      :item-to-edit="selectedItem"
      @close="closeEditForm"
      @updated="handleUpdate"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Dịch vụ
import { LayLichSuBaoHanh, deleteLichSuBaoHanh, AddLichSuBaoHanh } from '@/service/baohanh/LichSuBaoHanhService'
import { getPhieuBaoHanhById } from '@/service/baohanh/PhieuBaoHanhService'
import LichSuBaoHanhEditForm from '@/components/baohanh/LichSuBaoHanhEditForm.vue'


const router = useRouter()
const route = useRoute()

// Data for the page
const list = ref([])
const phieuBaoHanh = ref({})
const id = route.params.id

// --- State cho bảng Lịch sử (Bảng Dưới) ---
const q = ref('') // Tìm kiếm FE theo Mô tả lỗi
const sortDirection = ref('desc') // Sắp xếp mặc định: mới nhất trước (theo Ngày tiếp nhận)
const searchDate = ref('') // Tìm kiếm FE theo Ngày tiếp nhận

// --- Pagination for APPLIED products table (bottom) ---
const pageApplied = ref(1)
const pageSizeApplied = ref(5)

// Nạp thông tin Chi tiết Phiếu Bảo Hành (PBH)
const fetchPhieuBaoHanhDetail = async (phieuId) => {
  if (!phieuId) return
  try {
    const dggRes = await getPhieuBaoHanhById(phieuId)
    phieuBaoHanh.value = dggRes?.data ?? dggRes ?? {}

    await fetchLichSu(phieuId)
  } catch (e) {
    console.error('Lỗi khi tải chi tiết Phiếu Bảo Hành:', e)
    phieuBaoHanh.value = {}
    list.value = []
  }
}

// Nạp Lịch sử Bảo Hành
const fetchLichSu = async (phieuId) => {
  if (!phieuId) return
  try {
    const productsRes = await LayLichSuBaoHanh(phieuId)
    list.value = productsRes?.data ?? productsRes ?? []
    pageApplied.value = 1
  } catch (e) {
    console.error('Lỗi khi tải lịch sử bảo hành:', e)
    list.value = []
  }
}

// --- Logic Lọc và Sắp xếp cho Bảng Lịch sử ---
const filtered = computed(() => {
  let filteredList = list.value.slice(0)

  // 1) Lọc theo mô tả lỗi (FE)
  const s = q.value.trim().toLowerCase()
  if (s) {
    filteredList = filteredList.filter((x) => (x.moTaLoi || '').toLowerCase().includes(s))
  }

  // 2) Lọc theo khoảng ngày tiếp nhận (FE, ±7 ngày)
  if (searchDate.value) {
    const centerDate = new Date(searchDate.value)
    centerDate.setHours(0, 0, 0, 0) // Bắt đầu ngày

    const sevenDays = 7 * 24 * 60 * 60 * 1000
    const startDate = new Date(centerDate.getTime() - sevenDays)
    const endDate = new Date(centerDate.getTime() + sevenDays)
    endDate.setHours(23, 59, 59, 999) // Kết thúc ngày

    filteredList = filteredList.filter((item) => {
      if (!item.ngayTiepNhan) return false
      const itemDate = new Date(item.ngayTiepNhan)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  // 3) Sắp xếp theo Ngày Tiếp Nhận
  filteredList.sort((a, b) => {
    const dateA = a.ngayTiepNhan ? new Date(a.ngayTiepNhan) : new Date(0)
    const dateB = b.ngayTiepNhan ? new Date(b.ngayTiepNhan) : new Date(0)
    return sortDirection.value === 'asc'
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime()
  })

  return filteredList
})

// Tính trang & cắt trang
const totalPagesApplied = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSizeApplied.value)))
const pagedApplied = computed(() => {
  const start = (pageApplied.value - 1) * pageSizeApplied.value
  return filtered.value.slice(start, start + pageSizeApplied.value)
})

// Chuyển trang
const prevPageApplied = () => {
  if (pageApplied.value > 1) pageApplied.value--
}
const nextPageApplied = () => {
  if (pageApplied.value < totalPagesApplied.value) pageApplied.value++
}

// Toggle Sort
const toggleSort = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  pageApplied.value = 1
}

// Xóa Lịch sử bảo hành
const remove = async (lichSuId) => {
  if (!phieuBaoHanh.value.id) return
  if (!confirm('Bạn có chắc muốn xóa lịch sử bảo hành này không?')) return
  try {
    await deleteLichSuBaoHanh(lichSuId)
    alert('Xóa thành công!')
    await fetchLichSu(phieuBaoHanh.value.id)
  } catch (e) {
    console.error('Lỗi khi xóa:', e)
  }
}
// ----- ADD FORM (inline) -----
const showAddForm = ref(false)
const addDesc = ref('')
const adding = ref(false)

const toggleAddForm = () => {
  // mở/đóng form
  showAddForm.value = !showAddForm.value
  if (showAddForm.value) addDesc.value = ''
}

const cancelAdd = () => {
  if (adding.value) return
  showAddForm.value = false
  addDesc.value = ''
}

const submitAdd = async () => {
  if (!phieuBaoHanh.value?.id) {
    alert('Chưa có thông tin phiếu bảo hành.');
    return;
  }
  if (!addDesc.value?.trim()) {
    alert('Vui lòng nhập mô tả lỗi.');
    return;
  }

  try {
    adding.value = true;

    // ✅ truyền ID phiếu + mô tả lỗi
    await AddLichSuBaoHanh(phieuBaoHanh.value.id, addDesc.value.trim());

    await fetchLichSu(phieuBaoHanh.value.id); // reload danh sách

    showAddForm.value = false;
    addDesc.value = '';
    alert('Thêm lịch sử thành công!');
  } catch (e) {
    console.error(e);
    alert('Lưu thất bại. Vui lòng thử lại.');
  } finally {
    adding.value = false;
  }
};

// ----- EDIT FORM (modal) -----
const isEditFormVisible = ref(false)
const selectedItem = ref(null)

const edit = (id) => {
  const item = list.value.find(item => item.id === id);
  if (item) {
    selectedItem.value = { ...item }; // Create a copy to avoid direct mutation
    isEditFormVisible.value = true;
  }
};

const closeEditForm = () => {
  isEditFormVisible.value = false;
  selectedItem.value = null;
};

const handleUpdate = async () => {
  await fetchLichSu(phieuBaoHanh.value.id);
  closeEditForm();
};



// Clear date filter
const clearDateFilter = () => {
  searchDate.value = ''
}

// Reset trang khi thay đổi bộ lọc
watch([q, searchDate], () => {
  pageApplied.value = 1
})

onMounted(() => {
  if (id) {
    fetchPhieuBaoHanhDetail(id)
  }
})

// Helpers hiển thị
const showDate = (v, showTime = true) => {
  if (!v) return ''
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (showTime) {
    return `${dateStr} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return dateStr
}

const getLichSuTrangThai = (trangThai) => {
  switch (trangThai) {
    case 0:
      return 'Hủy/Lỗi'
    case 1:
      return 'Đang xử lý'
    case 2:
      return 'Hoàn thành'
    default:
      return 'Không rõ'
  }
}

// Quay lại
const back = () => router.push('/quan-li-bao-hanh')
</script>
