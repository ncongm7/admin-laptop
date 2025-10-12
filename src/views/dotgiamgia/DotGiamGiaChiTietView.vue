<template>
  <main class="container">
    <h1>Chi Tiết Sản Phẩm Trong Đợt Giảm Giá</h1>

    <!-- PHẦN TRÊN: 2 CỘT -->
    <div class="row mb-4">
      <!-- Cột trái: Thông tin đợt giảm giá -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h4>Thông tin</h4>
          </div>
          <div class="card-body" v-if="dotGiamGia">
            <p><strong>Tên:</strong> {{ dotGiamGia.tenKm }}</p>
            <p><strong>Giá trị:</strong> {{ dotGiamGia.giaTri }} VND</p>
            <p><strong>Bắt đầu:</strong> {{ showDate(dotGiamGia.ngayBatDau) }}</p>
            <p><strong>Kết thúc:</strong> {{ showDate(dotGiamGia.ngayKetThuc) }}</p>
            <p><strong>Trạng thái:</strong> {{ dotGiamGia.trangThai === 1 ? 'Hoạt động' : 'Ngưng' }}</p>
            <p><strong>Mô tả:</strong> {{ dotGiamGia.moTa }}</p>
          </div>
          <div class="card-footer">
            <button type="button" class="btn btn-secondary" @click="back">Quay lại</button>
          </div>
        </div>
      </div>

      <!-- Cột phải: Danh sách CTSP có sẵn -->
      <div class="col-md-8">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h4>Danh sách CTSP có sẵn</h4>
          <select v-model="selectedSanPham" class="form-select" style="width: 300px;">
            <option :value="null" disabled>-- Chọn một sản phẩm --</option>
            <option v-for="sp in sanPhamComboboxList" :key="sp.id" :value="sp.id">
              {{ sp.ten }}
            </option>
          </select>
        </div>
        <div class="table-responsive" style="min-height: 285px; max-height: 400px; overflow-y: auto;">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Mã CTSP</th>
                <th>CPU</th>
                <th>Ổ cứng</th>
                <th>RAM</th>
                <th>GPU</th>
                <th>Màu sắc</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!selectedSanPham">
                <td colspan="7" class="text-center text-muted">Vui lòng chọn một sản phẩm để xem chi tiết.</td>
              </tr>
              <tr v-else-if="pagedAvailableCtsp.length === 0">
                <td colspan="7" class="text-center text-muted">Không có chi tiết sản phẩm nào có sẵn.</td>
              </tr>
              <tr v-for="ctsp in pagedAvailableCtsp" :key="ctsp.id">
                <td>{{ ctsp.ma }}</td>
                <td>{{ ctsp.tenCPU }}</td>
                <td>{{ ctsp.dungLuong }}</td>
                <td>{{ ctsp.tenRam }}</td>
                <td>{{ ctsp.tenGPU }}</td>
                <td>{{ ctsp.tenMau }}</td>
                <td>
                  <button class="btn btn-success btn-sm" @click="addCtspToCampaign(ctsp.id)">Thêm</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Phân trang cho bảng CTSP có sẵn -->
        <div class="d-flex align-items-center justify-content-between mt-2">
          <div>Tổng: {{ availableCtspList.length }} bản ghi</div>
          <button class="btn btn-success btn-sm" @click="addAllCTSP"
            :disabled="!selectedSanPham || availableCtspList.length === 0 || addingAll"
            title="Thêm toàn bộ chi tiết sản phẩm của sản phẩm đã chọn">
            <span v-if="addingAll" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            {{ addingAll ? 'Đang thêm...' : 'Thêm toàn bộ chi tiết sản phẩm' }}
          </button>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary btn-sm" :disabled="pageAvailable <= 1" @click="prevPageAvailable">
              «
            </button>
            <span>Trang {{ pageAvailable }} / {{ totalPagesAvailable || 1 }}</span>
            <button class="btn btn-outline-secondary btn-sm" :disabled="pageAvailable >= totalPagesAvailable"
              @click="nextPageAvailable">
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4">

    <!-- PHẦN DƯỚI: BẢNG FULL-WIDTH -->
    <div>
      <h4>Danh sách sản phẩm áp dụng</h4>
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Mã Chi tiết SP</th>
              <th>Giá ban đầu</th>
              <th>Giá sau giảm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in pagedApplied" :key="it.id">
              <td>{{ (pageApplied - 1) * pageSizeApplied + idx + 1 }}</td>
              <td>{{ it.idCtsp }}</td>
              <td>{{ it.giaBanDau }}</td>
              <td>{{ it.giaSauKhiGiam }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="remove(it.id)">Xóa</button>
              </td>
            </tr>
            <tr v-if="pagedApplied.length === 0">
              <td colspan="6" class="text-center text-muted">Không có sản phẩm nào trong đợt giảm giá này.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Phân trang cho bảng sản phẩm áp dụng -->
      <div class="d-flex align-items-center justify-content-between mt-2">
        <div>Tổng: {{ list.length }} bản ghi</div>
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
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findByDotGiamGiaId, deleteDotGiamGiaChiTiet, getSanPhamCombobox, getAvailableCtsp, addCtspToDotGiamGia } from '@/service/dotgiamgia/DotGiamGiaChiTietService'
import { getDotGiamGiaById } from '@/service/dotgiamgia/DotGiamGiaService'

const route = useRoute()
const router = useRouter()

// Data for the page
const list = ref([]) // List of products already in the campaign (bottom table)
const dotGiamGia = ref(null) // Details of the campaign (left panel)
const id = route.params.id // ID of the campaign from URL

// Data for the top-right panel
const sanPhamComboboxList = ref([])
const selectedSanPham = ref(null)
const availableCtspList = ref([])

// --- Pagination for AVAILABLE CTSP table (top-right) ---
const pageAvailable = ref(1)
const pageSizeAvailable = ref(5)
const totalPagesAvailable = computed(() => Math.max(1, Math.ceil(availableCtspList.value.length / pageSizeAvailable.value)))
const pagedAvailableCtsp = computed(() => {
  const start = (pageAvailable.value - 1) * pageSizeAvailable.value
  return availableCtspList.value.slice(start, start + pageSizeAvailable.value)
})
const prevPageAvailable = () => { if (pageAvailable.value > 1) pageAvailable.value-- }
const nextPageAvailable = () => { if (pageAvailable.value < totalPagesAvailable.value) pageAvailable.value++ }

// --- Pagination for APPLIED products table (bottom) ---
const pageApplied = ref(1)
const pageSizeApplied = ref(5)
const totalPagesApplied = computed(() => Math.max(1, Math.ceil(list.value.length / pageSizeApplied.value)))
const pagedApplied = computed(() => {
  const start = (pageApplied.value - 1) * pageSizeApplied.value
  return list.value.slice(start, start + pageSizeApplied.value)
})
const prevPageApplied = () => { if (pageApplied.value > 1) pageApplied.value-- }
const nextPageApplied = () => { if (pageApplied.value < totalPagesApplied.value) pageApplied.value++ }


// Fetch initial data for the whole page
const fetchDetails = async () => {
  if (!id) return;
  try {
    const dggRes = await getDotGiamGiaById(id);
    dotGiamGia.value = dggRes?.data ?? dggRes;

    const productsRes = await findByDotGiamGiaId(id)
    list.value = productsRes?.data ?? productsRes ?? []
    pageApplied.value = 1;

    const comboboxRes = await getSanPhamCombobox();
    sanPhamComboboxList.value = comboboxRes?.data ?? comboboxRes ?? [];

  } catch (e) {
    console.error('Lỗi khi tải chi tiết ban đầu:', e)
  }
}

onMounted(fetchDetails)

// Watch for changes in the product combobox
watch(selectedSanPham, async (newSanPhamId) => {
  if (!newSanPhamId) {
    availableCtspList.value = [];
    return;
  }
  try {
    const res = await getAvailableCtsp(id, newSanPhamId);
    availableCtspList.value = res?.data ?? res ?? [];
    pageAvailable.value = 1; // Reset page on new data
  } catch (e) {
    console.error(`Lỗi khi tải danh sách CTSP cho sản phẩm ${newSanPhamId}:`, e);
    availableCtspList.value = [];
  }
});

// Placeholder function to add a CTSP to the campaign
const refreshTables = async () => {
  // 1. Refresh bảng áp dụng (dưới)
  const productsRes = await findByDotGiamGiaId(id)
  list.value = productsRes?.data ?? productsRes ?? []
  pageApplied.value = 1

  // 2. Refresh bảng có sẵn (trên) nếu đã chọn sản phẩm
  if (selectedSanPham.value) {
    const res = await getAvailableCtsp(id, selectedSanPham.value)
    availableCtspList.value = res?.data ?? res ?? []
    pageAvailable.value = 1
  }
}
const addCtspToCampaign = async (ctspId) => {
  if (!id || !ctspId) return // Đảm bảo có ID đợt giảm giá và ID chi tiết

  try {
    // 1. Gọi API Service với ID đợt giảm giá và ID chi tiết sản phẩm
    await addCtspToDotGiamGia({
      dotGiamGiaId: id,
      ctspIds: [ctspId] // Gửi ID đơn lẻ dưới dạng mảng (List)
    });

    alert('Thêm chi tiết sản phẩm thành công')
    // 2. Cập nhật lại dữ liệu cho cả hai bảng
    await refreshTables();

  } catch (e) {
    // alert lỗi đã được xử lý trong hàm handleResponse của Service
    console.error('Lỗi khi thêm CTSP vào đợt giảm giá:', e)
  }
}
// ... các import & state cũ giữ nguyên ...
const addingAll = ref(false)

// Thêm toàn bộ CTSP khả dụng của sản phẩm đang chọn vào đợt
const addAllCTSP = async () => {
  if (!id || !selectedSanPham.value) return
  if (!availableCtspList.value || availableCtspList.value.length === 0) return

  // gom tất cả id CTSP đang "có sẵn"
  const allIds = availableCtspList.value.map(x => x.id).filter(Boolean)
  if (allIds.length === 0) return

  // nếu BE đã hỗ trợ add nhiều một lần, có thể gửi 1 phát:
  // await addCtspToDotGiamGia({ dotGiamGiaId: id, ctspIds: allIds })

  // để an toàn khi danh sách lớn -> chia lô (batch) 100 item/lần
  const CHUNK_SIZE = 100
  addingAll.value = true
  try {
    for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
      const chunk = allIds.slice(i, i + CHUNK_SIZE)
      await addCtspToDotGiamGia({
        dotGiamGiaId: id,
        ctspIds: chunk,
      })
    }
    alert('Đã thêm toàn bộ chi tiết sản phẩm vào đợt giảm giá')
    await refreshTables()
  } catch (e) {
    console.error('Lỗi khi thêm toàn bộ CTSP:', e)
    alert('Có lỗi khi thêm toàn bộ CTSP. Vui lòng thử lại.')
  } finally {
    addingAll.value = false
  }
}

// Remove a product from the campaign (bottom table)
const remove = async (chiTietId) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi đợt giảm giá không?')) return
  try {
    await deleteDotGiamGiaChiTiet(chiTietId)
    alert('Xóa thành công!')

    // Refresh data for both tables
    const productsRes = await findByDotGiamGiaId(id)
    list.value = productsRes?.data ?? productsRes ?? []
    pageApplied.value = 1;

    if (selectedSanPham.value) {
      const res = await getAvailableCtsp(id, selectedSanPham.value);
      availableCtspList.value = res?.data ?? res ?? [];
      pageAvailable.value = 1;
    }

  } catch (e) {
    console.error('Lỗi khi xóa:', e)
  }
}

const showDate = (v) => {
  if (!v) return ''
  const d = new Date(String(v))
  if (isNaN(d)) return String(v)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const back = () => router.push('/quan-li-giam-gia')
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 24px;
}

.card-body p {
  margin-bottom: 0.5rem;
}
</style>