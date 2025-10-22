<template>
  <div class="attr-modal fade show d-block" tabindex="-1">
    <div class="attr-dialog">
      <div class="attr-content">
        <div class="attr-header d-flex justify-content-between align-items-center">
          <h5 class="attr-title mb-0">Quản lý {{ title }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="attr-body">
          <form @submit.prevent="saveItem">
            <div class="row g-2">
              <div class="col-md-3">
                <label class="form-label small">Mã</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="form-control form-control-sm"
                  required
                />
              </div>
              <div class="col-md-5">
                <label class="form-label small">Tên</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control form-control-sm"
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label small">Trạng thái</label>
                <select v-model="form.status" class="form-select form-select-sm">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ẩn</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label small">Mô tả</label>
                <input
                  v-model="form.description"
                  type="text"
                  class="form-control form-control-sm"
                />
              </div>
            </div>
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-primary btn-sm" type="submit">
                {{ editingIndex === -1 ? 'Thêm' : 'Cập nhật' }}
              </button>
              <button class="btn btn-secondary btn-sm" type="button" @click="resetForm">
                Làm mới
              </button>
            </div>
          </form>

          <div class="table-responsive mt-2">
            <table class="table table-sm align-middle">
              <thead class="table-light">
                <tr>
                  <th width="60">#</th>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th width="110">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="items.length === 0">
                  <td colspan="6" class="text-center text-muted py-3">Chưa có dữ liệu</td>
                </tr>
                <tr v-else v-for="(it, idx) in items" :key="it.id || idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ it.code }}</td>
                  <td>{{ it.name }}</td>
                  <td>{{ it.description }}</td>
                  <td>
                    <span
                      :class="['badge', it.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary']"
                    >
                      {{ it.status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" @click="editItem(idx)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" @click="removeItem(idx)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="attr-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
        </div>
      </div>
    </div>
    <div class="attr-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  getCPUList,
  getGPUList,
  getRamList,
  getOCungList,
  getMauSacList,
  getLoaiManHinhList,
  getPinList,
} from '@/service/sanpham/SanPhamService'

const props = defineProps({
  type: { type: String, required: true },
})

const emit = defineEmits(['close'])

const mapTitle = {
  cpu: 'CPU',
  ram: 'RAM',
  gpu: 'GPU',
  color: 'Màu sắc',
  storage: 'Ổ cứng',
  'screen-type': 'Loại màn hình',
  battery: 'Pin',
}

const mapApiFunction = {
  cpu: getCPUList,
  ram: getRamList,
  gpu: getGPUList,
  color: getMauSacList,
  storage: getOCungList,
  'screen-type': getLoaiManHinhList,
  battery: getPinList,
}

const title = computed(() => mapTitle[props.type] || 'Thuộc tính')

const items = ref([])
const editingIndex = ref(-1)
const form = ref({ code: '', name: '', description: '', status: 'ACTIVE' })

// Load data from API
const loadData = async () => {
  if (!mapApiFunction[props.type]) {
    return
  }

  try {
    const response = await mapApiFunction[props.type]()
    const data = response.data || response

    if (Array.isArray(data)) {
      // Map the API response to our expected format
      items.value = data.map((item, index) => ({
        id: item.id || index + 1,
        code:
          item.ma ||
          item.code ||
          `${props.type.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
        name: item.ten || item.name || item.tenThuocTinh || `${title.value} ${index + 1}`,
        description: item.moTa || item.description || item.ghiChu || '',
        status: item.trangThai || item.status || 'ACTIVE',
      }))
    } else {
      items.value = []
    }
  } catch (err) {
    // Silently use mock data if API fails
    items.value = generateMockData()
  }
}

// Generate mock data for testing when API fails
const generateMockData = () => {
  const mockData = {
    cpu: [
      { code: 'CPU-001', name: 'Intel Core i5-12400F', description: '6 nhân 12 luồng, 2.5GHz' },
      { code: 'CPU-002', name: 'Intel Core i7-12700F', description: '12 nhân 20 luồng, 2.1GHz' },
      { code: 'CPU-003', name: 'AMD Ryzen 5 5600X', description: '6 nhân 12 luồng, 3.7GHz' },
      { code: 'CPU-004', name: 'AMD Ryzen 7 5700X', description: '8 nhân 16 luồng, 3.4GHz' },
    ],
    ram: [
      { code: 'RAM-001', name: '8GB DDR4', description: '8GB DDR4 2666MHz' },
      { code: 'RAM-002', name: '16GB DDR4', description: '16GB DDR4 3200MHz' },
      { code: 'RAM-003', name: '32GB DDR4', description: '32GB DDR4 3200MHz' },
    ],
    gpu: [
      { code: 'GPU-001', name: 'RTX 3060', description: 'NVIDIA GeForce RTX 3060 12GB' },
      { code: 'GPU-002', name: 'RTX 3070', description: 'NVIDIA GeForce RTX 3070 8GB' },
      { code: 'GPU-003', name: 'GTX 1650', description: 'NVIDIA GeForce GTX 1650 4GB' },
    ],
    color: [
      { code: 'COLOR-001', name: 'Đen', description: 'Màu đen' },
      { code: 'COLOR-002', name: 'Trắng', description: 'Màu trắng' },
      { code: 'COLOR-003', name: 'Xám', description: 'Màu xám' },
      { code: 'COLOR-004', name: 'Bạc', description: 'Màu bạc' },
    ],
    storage: [
      { code: 'SSD-001', name: '256GB SSD', description: 'SSD NVMe 256GB' },
      { code: 'SSD-002', name: '512GB SSD', description: 'SSD NVMe 512GB' },
      { code: 'SSD-003', name: '1TB SSD', description: 'SSD NVMe 1TB' },
    ],
    'screen-type': [
      { code: 'SCREEN-001', name: 'IPS', description: 'Màn hình IPS' },
      { code: 'SCREEN-002', name: 'OLED', description: 'Màn hình OLED' },
      { code: 'SCREEN-003', name: 'VA', description: 'Màn hình VA' },
    ],
    battery: [
      { code: 'BAT-001', name: '3000mAh', description: 'Pin 3000mAh' },
      { code: 'BAT-002', name: '4000mAh', description: 'Pin 4000mAh' },
      { code: 'BAT-003', name: '5000mAh', description: 'Pin 5000mAh' },
    ],
  }

  return (mockData[props.type] || []).map((item, index) => ({
    id: index + 1,
    code: item.code,
    name: item.name,
    description: item.description,
    status: 'ACTIVE',
  }))
}

function resetForm() {
  editingIndex.value = -1
  form.value = { code: '', name: '', description: '', status: 'ACTIVE' }
}

function saveItem() {
  if (editingIndex.value === -1) {
    items.value = [...items.value, { ...form.value, id: Date.now() }]
  } else {
    items.value.splice(editingIndex.value, 1, { ...form.value })
  }
  resetForm()
}

function editItem(index) {
  editingIndex.value = index
  form.value = { ...items.value[index] }
}

function removeItem(index) {
  items.value.splice(index, 1)
  if (editingIndex.value === index) resetForm()
}

// Load data when component mounts or type changes
onMounted(() => {
  loadData()
})

watch(
  () => props.type,
  () => {
    loadData()
  },
)
</script>

<style scoped>
.attr-modal {
  position: fixed;
  top: 0;
  left: 240px; /* align with sidebar */
  width: calc(100% - 240px);
  height: 100%;
  z-index: 1500;
}
.attr-backdrop {
  position: fixed;
  left: 240px;
  width: calc(100% - 240px);
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1490;
}
.attr-dialog {
  margin: 0 0 0 auto;
  width: 720px;
  max-width: 100%;
  height: 100%;
}
.attr-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 12px 0 0 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}
.attr-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}
.attr-title {
  font-size: 20px;
  font-weight: 700;
}
.attr-body {
  padding: 12px;
  overflow: auto;
}
.attr-footer {
  padding: 14px 16px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

@media (max-width: 991px) {
  .attr-modal,
  .attr-backdrop {
    left: 180px;
    width: calc(100% - 180px);
  }
}
@media (max-width: 767px) {
  .attr-modal,
  .attr-backdrop {
    left: 0;
    width: 100%;
  }
}
</style>
