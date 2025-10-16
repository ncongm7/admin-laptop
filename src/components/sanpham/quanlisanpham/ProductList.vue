
<template>
  <div class="product-list">
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th width="40" class="text-center">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event)" />
            </th>
            <th width="60">STT</th>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Giá thấp nhất</th>
            <th>Giá cao nhất</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th width="140">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="11" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="products.length === 0">
            <td colspan="11" class="text-center py-5 text-muted">
              <i class="bi bi-box-seam display-5"></i>
              <p class="mt-3">Không có sản phẩm nào</p>
            </td>
          </tr>

          <!-- Product Rows -->
          <tr
            v-for="(product, index) in paginatedProducts"
            :key="product.id"
            @click="viewProduct(product)"
            class="product-row"
          >
            <td class="text-center" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(product.id)"
                @change="toggleOne(product.id, $event)"
              />
            </td>
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>
              <span class="text-muted">{{ product.maSanPham }}</span>
            </td>
            <td>
              <div class="d-flex align-items-center">
                <div class="product-thumbnail me-3">
                  <img
                    :src="product.anhDaiDien || '/placeholder-product.jpg'"
                    :alt="product.tenSanPham"
                  />
                </div>
                <div class="product-name">{{ product.tenSanPham }}</div>
              </div>
            </td>
            <td>
              <div class="product-price">
                <span
                  class="text-success fw-bold"
                  v-if="product.variants && product.variants.length > 0"
                >
                  {{ formatCurrency(getMinPrice(product.variants)) }}
                </span>
                <span class="text-muted" v-else>Chưa có giá</span>
              </div>
            </td>
            <td>
              <div class="product-price">
                <span
                  class="text-danger fw-bold"
                  v-if="product.variants && product.variants.length > 0"
                >
                  {{ formatCurrency(getMaxPrice(product.variants)) }}
                </span>
                <span class="text-muted" v-else>Chưa có giá</span>
              </div>
            </td>
            <td>
              <div class="stock-status">
                <span :class="stockStatusClass(product.soLuong)">
                  {{ product.soLuong }}
                </span>
              </div>
            </td>
            <td>
              <span :class="statusClass(product.trangThai)" class="badge">
                {{ product.trangThai == 1 ? 'Hoạt động' : 'Ẩn' }}
              </span>
            </td>
            <td>{{ formatDateSafe(product) }}</td>
            <td>{{ formatUpdateDateSafe(product) }}</td>
            <td @click.stop>
              <div class="btn-group btn-group-sm">
                <button
                  class="btn btn-outline-primary"
                  @click="handleView(product)"
                  title="Xem chi tiết"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-warning" @click="handleEdit(product)" title="Sửa">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger" @click="handleDelete(product)" title="Xóa">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="!loading && products.length > 0">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">
          Hiển thị {{ startItem }} - {{ endItem }} của {{ products.length }} sản phẩm
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)"> Trước </a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)"> Tiếp </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/helpers'
import { formatDate } from '@/utils/dateUtils'
import { ref, computed } from 'vue'



const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'view', 'delete', 'selection-change'])

// Pagination state
const itemsPerPage = 5 // Fixed to 5 products per page
const currentPage = ref(1)

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(props.products.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.products.slice(start, end)
})

const startItem = computed(() => {
  if (props.products.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage
  return end > props.products.length ? props.products.length : end
})

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// Selection state
const selectedIds = ref([])
const allSelected = computed(
  () =>
    paginatedProducts.value.length > 0 &&
    paginatedProducts.value.every((p) => selectedIds.value.includes(p.id)),
)
const isSelected = (id) => selectedIds.value.includes(id)
const toggleOne = (id, evt) => {
  const checked = evt.target.checked
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
  emit('selection-change', selectedIds.value)
}
const toggleSelectAll = (evt) => {
  const checked = evt.target.checked
  if (checked) {
    // Add all products on current page to selection
    const pageIds = paginatedProducts.value.map((p) => p.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
  } else {
    // Remove all products on current page from selection
    const pageIds = paginatedProducts.value.map((p) => p.id)
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  }
  emit('selection-change', selectedIds.value)
}

const getMinPrice = (variants) => {
  if (!variants || variants.length === 0) return 0
  return Math.min(...variants.map((v) => v.giaBan || v.gia || 0))
}

const getMaxPrice = (variants) => {
  if (!variants || variants.length === 0) return 0
  return Math.max(...variants.map((v) => v.giaBan || v.gia || 0))
}

const hasPriceRange = (variants) => {
  if (!variants || variants.length <= 1) return false
  return getMinPrice(variants) !== getMaxPrice(variants)
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'text-success'
  if (stock > 0) return 'text-warning'
  return 'text-danger'
}

const statusClass = (status) => {
  return status === 1 ? 'bg-success' : 'bg-secondary'
}

const viewProduct = (product) => {
  emit('view', product)
}

const handleView = (product) => {
  emit('view', product)
}

const handleEdit = (product) => {
  emit('edit', product)
}

const handleDelete = (product) => {
  emit('delete', product)
}

const formatDateSafe = (product) => {
  return formatDate(product.ngayTao || product.createdAt)
}

const formatUpdateDateSafe = (product) => {
  return formatDate(product.ngaySua || product.updatedAt)
}
</script>

<style scoped>
.product-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
input[type='checkbox'] {
  cursor: pointer;
}

.product-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-specs div {
  font-size: 13px;
  margin-bottom: 2px;
}

.product-specs strong {
  color: #64748b;
}

.pagination-wrapper {
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}

.product-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-row:hover {
  background-color: #f8fafc !important;
}

.product-row td {
  border-bottom: 1px solid #f1f5f9;
}

.table th {
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
}
</style>
