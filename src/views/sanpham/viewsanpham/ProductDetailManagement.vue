<template>
  <div class="product-detail-management">
    <div class="container-fluid">
      <!-- Header Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="product-header">
              <h1 class="mb-0">Chi tiết sản phẩm</h1>
              <p class="text-muted mb-0">Mã sản phẩm: {{ selectedProduct?.maSanPham }}</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-outline-secondary" @click="goBack">
                <i class="bi bi-arrow-left"></i> Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="row mb-4">
        <div class="col-12">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#basic-info"
                type="button"
                role="tab"
                aria-controls="basic-info"
                aria-selected="true"
              >
                <i class="bi bi-info-circle me-1"></i> Thông tin sản phẩm
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#variants"
                type="button"
                role="tab"
                aria-controls="variants"
                aria-selected="false"
              >
                <i class="bi bi-list-task me-1"></i> Biến thể sản phẩm
                <span class="badge bg-primary ms-1">{{ productVariants.length }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Basic Info Tab -->
        <div class="tab-pane fade show active" id="basic-info" role="tabpanel">
          <div class="row g-4">
            <!-- Left Column - Basic Information -->
            <div class="col-lg-6">
              <div class="card">
                <div class="card-body">
                  <div class="info-section">
                    <div class="section-title">
                      <i class="bi bi-info-circle me-1"></i> Thông tin cơ bản
                    </div>
                    <div class="info-row">
                      <strong>Mã sản phẩm:</strong>
                      <span class="info-value">{{ selectedProduct?.maSanPham }}</span>
                    </div>
                    <div class="info-row">
                      <strong>Tên sản phẩm:</strong>
                      <span class="info-value">{{ selectedProduct?.tenSanPham }}</span>
                    </div>
                    <div class="info-row">
                      <strong>Mô tả:</strong>
                      <span class="info-value">{{ getProductDescription(selectedProduct) }}</span>
                    </div>
                    <div class="info-row">
                      <strong>Ngày ra mắt:</strong>
                      <span class="info-value">{{ formatDate(selectedProduct?.ngayTao) }}</span>
                    </div>
                    <div class="info-row">
                      <strong>Trạng thái:</strong>
                      <span :class="statusClass(selectedProduct?.trangThai)">
                        {{ selectedProduct?.trangThai === 1 ? 'Hoạt động' : 'Ẩn' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Classification & Images -->
            <div class="col-lg-6">
              <div class="card">
                <div class="card-body">
                  <div class="info-section">
                    <div class="section-title"><i class="bi bi-tags me-1"></i> Hình ảnh</div>

                    <div class="info-row">
                      <strong>Hình ảnh sản phẩm:</strong>
                      <div class="image-container">
                        <img
                          :src="selectedProduct?.anhDaiDien || '/placeholder-product.jpg'"
                          alt="Product Image"
                          class="product-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Variants Tab -->
        <div class="tab-pane fade" id="variants" role="tabpanel">
          <!-- Filter Section -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Bộ lọc biến thể</h5>
                  <button class="btn btn-outline-secondary btn-sm" @click="clearAllFilters">
                    <i class="bi bi-filter-circle"></i> Xóa toàn bộ bộ lọc
                  </button>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <!-- CPU Filter -->
                    <div class="col-md-3">
                      <label class="form-label">CPU</label>
                      <select class="form-select" v-model="filters.cpu">
                        <option value="">Chọn CPU</option>
                        <option v-for="cpu in attributeStore.attributes.cpus" :value="cpu.id">
                          {{ cpu.tenCpu }}
                        </option>
                      </select>
                    </div>

                    <!-- RAM Filter -->
                    <div class="col-md-3">
                      <label class="form-label">RAM</label>
                      <select class="form-select" v-model="filters.ram">
                        <option value="">Chọn RAM</option>
                        <option v-for="ram in attributeStore.attributes.rams" :value="ram.id">
                          {{ ram.tenRam }}
                        </option>
                      </select>
                    </div>

                    <!-- GPU Filter -->
                    <div class="col-md-3">
                      <label class="form-label">GPU</label>
                      <select class="form-select" v-model="filters.gpu">
                        <option value="">Chọn GPU</option>
                        <option v-for="gpu in attributeStore.attributes.gpus" :value="gpu.id">
                          {{ gpu.tenGpu }}
                        </option>
                      </select>
                    </div>

                    <!-- Color Filter -->
                    <div class="col-md-3">
                      <label class="form-label">Màu sắc</label>
                      <select class="form-select" v-model="filters.color">
                        <option value="">Chọn màu sắc</option>
                        <option v-for="color in attributeStore.attributes.colors" :value="color.id">
                          {{ color.tenMau }}
                        </option>
                      </select>
                    </div>

                    <!-- Memory Filter -->
                    <div class="col-md-3">
                      <label class="form-label">Bộ nhớ</label>
                      <select class="form-select" v-model="filters.memory">
                        <option value="">Chọn bộ nhớ</option>
                        <option
                          v-for="memory in attributeStore.attributes.memories"
                          :value="memory.id"
                        >
                          {{ memory.tenBoNho }}
                        </option>
                      </select>
                    </div>

                    <!-- Screen Filter -->
                    <div class="col-md-3">
                      <label class="form-label">Màn hình</label>
                      <select class="form-select" v-model="filters.screen">
                        <option value="">Chọn màn hình</option>
                        <option
                          v-for="screen in attributeStore.attributes.screens"
                          :value="screen.id"
                        >
                          {{ screen.kichThuocManHinh }}
                        </option>
                      </select>
                    </div>

                    <!-- Price Range Filter -->
                    <div class="col-md-6">
                      <label class="form-label">Khoảng giá</label>
                      <div class="d-flex flex-column align-items-center">
                        <input
                          type="range"
                          class="form-range w-100"
                          v-model="priceRange"
                          min="0"
                          :max="maxPrice"
                          step="100000"
                        />
                        <div class="d-flex justify-content-between w-100 mt-2">
                          <span class="text-muted">0 đ</span>
                          <span class="text-muted">{{ formatCurrency(maxPrice) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Input -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                  Danh sách biến thể
                  <span class="badge bg-success ms-1">{{ filteredVariants.length }}</span>
                </h5>
                <div class="search-container">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Tìm kiếm biến thể..."
                      v-model="searchQuery"
                    />
                    <button class="btn btn-outline-secondary" @click="clearSearch">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Variants Table -->
          <div class="row g-4">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th><input type="checkbox" v-model="selectAll" /></th>
                          <th>SKU</th>
                          <th>MÀU</th>
                          <th>CPU</th>
                          <th>RAM</th>
                          <th>GPU</th>
                          <th>MÀN HÌNH</th>
                          <th>PIN</th>
                          <th>Ổ CỨNG</th>
                          <th>GIÁ BÁN</th>
                          <th>SỐ LƯỢNG TỒN</th>
                          <th>TRẠNG THÁI</th>
                          <th>NGÀY TẠO</th>
                          <th>NGÀY CẬP NHẬT</th>
                          <th>TÁC VỤ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="variant in filteredVariants" :key="variant.id">
                          <td>
                            <input type="checkbox" v-model="selectedVariants" :value="variant.id" />
                          </td>
                          <td>{{ variant.maCtsp }}</td>
                          <td>
                            <div
                              class="color-dot"
                              :style="{ backgroundColor: getColorCode(variant.maMauSac) }"
                            ></div>
                          </td>
                          <td>{{ getAttributeName('cpus', variant.maCpu) }}</td>
                          <td>{{ getAttributeName('rams', variant.maRam) }}</td>
                          <td>{{ getAttributeName('gpus', variant.maGpu) }}</td>
                          <td>{{ getAttributeName('screens', variant.maLoaiManHinh) }}</td>
                          <td>{{ variant.maPin }}</td>
                          <td>{{ getAttributeName('storages', variant.maOCung) }}</td>
                          <td>{{ formatCurrency(variant.giaBan) }}</td>
                          <td>{{ variant.imeiCount || 0 }} có sẵn</td>
                          <td>
                            <span class="badge bg-success" v-if="variant.trangThai === 1"
                              >Hoạt động</span
                            >
                            <span class="badge bg-secondary" v-else>Ẩn</span>
                          </td>
                          <td>{{ formatDate(variant.ngayTao) }}</td>
                          <td>{{ formatDate(variant.ngaySua) }}</td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button class="btn btn-outline-primary" @click="editVariant(variant)">
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button
                                class="btn btn-outline-danger"
                                @click="confirmDelete(variant.id)"
                              >
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.2)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ mode === 'add' ? 'Thêm biến thể' : 'Sửa biến thể' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="form-container">
              <div class="form-group">
                <label for="name">Tên biến thể</label>
                <input type="text" id="name" v-model="currentVariant.tenSP" class="form-control" />
              </div>
              <div class="form-group">
                <label for="ram">RAM</label>
                <select id="ram" v-model="currentVariant.ram_id" class="form-select">
                  <option value="">Chọn RAM</option>
                  <option v-for="ram in attributeStore.attributes.rams" :value="ram.id">
                    {{ ram.tenRam }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="storage">Ổ cứng</label>
                <select id="storage" v-model="currentVariant.o_cung_id" class="form-select">
                  <option value="">Chọn ổ cứng</option>
                  <option v-for="storage in attributeStore.attributes.storages" :value="storage.id">
                    {{ storage.dungLuong }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="color">Màu sắc</label>
                <select id="color" v-model="currentVariant.mau_sac_id" class="form-select">
                  <option value="">Chọn màu sắc</option>
                  <option v-for="color in attributeStore.attributes.colors" :value="color.id">
                    {{ color.tenMau }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label for="price">Giá bán</label>
                <input
                  type="number"
                  id="price"
                  v-model="currentVariant.giaBan"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="warranty">Thời gian bảo hành</label>
                <input
                  type="number"
                  id="warranty"
                  v-model="currentVariant.thoiGianBaoHanh"
                  class="form-control"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="handleSave(currentVariant)">
              Lưu
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" @click="closeModal"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import { useAttributeStore } from '@/stores/attributeStore'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const productDetailStore = useProductDetailStore()
const attributeStore = useAttributeStore()

const productId = ref(route.params.productId)
const showModal = ref(false)
const currentVariant = ref({})
const mode = ref('add')
const viewMode = ref('grid') // 'grid' or 'list'
const loading = ref(false)

// Audit logs state
const auditLogs = ref([])

// Filters state
const filters = ref({
  cpu: '',
  ram: '',
  gpu: '',
  color: '',
  memory: '',
  screen: '',
})

const priceRange = ref(0)
const maxPrice = ref(100000000)
const searchQuery = ref('')
const selectedVariants = ref([])
const selectAll = ref(false)

// Fetch data khi component mounted
// ... existing code ...

// ... existing code ...

onMounted(async () => {
  loading.value = true
  try {
    console.log('Fetching product data for ID:', productId.value)
    
    // Check if productId is available
    if (!productId.value) {
      console.error('Product ID is not available')
      return
    }
    
    // Ensure variants array is initialized
    if (!productDetailStore.variants) {
      productDetailStore.variants = []
    }
    
    // Fetch product details first
    await productStore.fetchProductByIdSP(productId.value)
    
    // Get the product from store
    const productFromStore = productStore.products.find((p) => p.id == productId.value)
    
    if (productFromStore) {
      // Update productDetailStore with the product data
      productDetailStore.productDetail = productFromStore
      
      // Fetch variants for this product
      await productDetailStore.fetchProductVariants(productId.value)
      
      // Fetch attributes for filtering
      await attributeStore.fetchAttributes()
      
      // Fetch audit logs
      await fetchAuditLogs()
      
      // Debug: Check if variants are loaded
      console.log('Product variants after fetching:', productDetailStore.variants)
    }
  } catch (error) {
    console.error('Error fetching product data:', error)
  } finally {
    loading.value = false
  }
})

// ... existing code ...

const fetchAuditLogs = async () => {
  try {
    // This would be a real API call to fetch audit logs
    // For now, we'll simulate some data
    auditLogs.value = [
      {
        ngayTao: new Date().toISOString(),
        thaoTac: 'Cập nhật thông tin sản phẩm',
        tenNguoiDung: 'Admin',
      },
      {
        ngayTao: new Date(Date.now() - 86400000).toISOString(),
        thaoTac: 'Thêm biến thể mới',
        tenNguoiDung: 'Admin',
      },
    ]
  } catch (error) {
    console.error('Error fetching audit logs:', error)
  }
}

// Helper function to get product description
const getProductDescription = (product) => {
  if (!product) return 'Không có mô tả'

  // Try different possible field names for description
  return (
    product.ghiChu ||
    product.moTa ||
    product.description ||
    product.desc ||
    product.productDescription ||
    'Không có mô tả'
  )
}

// Computed property to get the selected product from the store
const selectedProduct = computed(() => {
  // First try to get from productDetailStore
  if (productDetailStore.productDetail && productDetailStore.productDetail.id == productId.value) {
    console.log('Product from productDetailStore:', productDetailStore.productDetail)
    return productDetailStore.productDetail
  }
  // Fallback to productStore if available
  const product = productStore.products.find((p) => p.id == productId.value) || {}
  console.log('Product from productStore:', product)
  console.log('Available fields:', Object.keys(product))
  return product
})

const productVariants = computed(() => productDetailStore.variants)

// Computed property for filtered variants
const filteredVariants = computed(() => {
  return productVariants.value.filter((variant) => {
    // Filter by search query
    if (
      searchQuery.value &&
      !variant.tenSP.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      return false
    }

    // Filter by CPU
    if (filters.value.cpu && variant.cpu_id !== parseInt(filters.value.cpu)) {
      return false
    }

    // Filter by RAM
    if (filters.value.ram && variant.ram_id !== parseInt(filters.value.ram)) {
      return false
    }

    // Filter by GPU
    if (filters.value.gpu && variant.gpu_id !== parseInt(filters.value.gpu)) {
      return false
    }

    // Filter by Color
    if (filters.value.color && variant.mau_sac_id !== parseInt(filters.value.color)) {
      return false
    }

    // Filter by Memory
    if (filters.value.o_cung_id && variant.bo_nho_id !== parseInt(filters.value.o_cung_id)) {
      return false
    }

    // Filter by Screen
    if (filters.value.screen && variant.man_hinh_id !== parseInt(filters.value.screen)) {
      return false
    }

    // Filter by price range
    if (variant.giaBan > priceRange.value) {
      return false
    }

    return true
  })
})

// Helper functions
const getVariantImage = (variant) => {
  if (variant.anhSanPhams && variant.anhSanPhams.length > 0) {
    const primaryImage = variant.anhSanPhams.find((img) => img.is_default)
    return primaryImage ? primaryImage.uri : variant.anhSanPhams[0].uri
  }
  return 'https://via.placeholder.com/50x50?text=No+Image'
}

const getAttributeName = (type, id) => {
  if (!id) return 'N/A'
  const attribute = attributeStore.getAttributeById(type, id)
  return attribute?.ten || attribute?.tenThuocTinh || 'N/A'
}

const showAddForm = () => {
  mode.value = 'add'
  currentVariant.value = {
    tenSP: '',
    ram_id: null,
    o_cung_id: null,
    mau_sac_id: null,
    giaBan: 0,
    thoiGianBaoHanh: 12,
    anhSanPhams: [],
  }
  showModal.value = true
}

const editVariant = (variant) => {
  mode.value = 'edit'
  currentVariant.value = { ...variant }
  showModal.value = true
}

const confirmDelete = (variantId) => {
  if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
    productDetailStore.deleteVariant(variantId)
  }
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = async (variantData) => {
  console.log('handleSave called with mode:', mode.value)
  console.log('productId.value:', productId.value)

  if (mode.value === 'add') {
    await productDetailStore.addVariant({
      ...variantData,
      san_pham_id: productId.value,
    })
  } else {
    // Đảm bảo productIdGlobal được set trước khi update
    productDetailStore.productIdGlobal = productId.value
    await productDetailStore.updateVariant(variantData)
  }
  closeModal()
}

const goBack = () => {
  router.push('/quan-li-san-pham')
}

const refreshData = async () => {
  try {
    loading.value = true
    await Promise.all([
      productStore.fetchProductByIdSP(productId.value),
      productDetailStore.fetchProductVariants(productId.value),
      attributeStore.fetchAttributes(),
      fetchAuditLogs(),
    ])
  } finally {
    loading.value = false
  }
}

const editProduct = () => {
  // Handle edit product functionality
  alert('Edit product functionality not implemented yet')
}

const statusClass = (status) => {
  return status === 1 ? 'bg-success' : 'bg-secondary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const clearSearch = () => {
  searchQuery.value = ''
}

const clearAllFilters = () => {
  filters.value = {
    cpu: '',
    ram: '',
    gpu: '',
    color: '',
    memory: '',
    screen: '',
  }
  priceRange.value = 0
  searchQuery.value = ''
}

const getColorCode = (colorId) => {
  const color = attributeStore.getAttributeById('colors', colorId)
  return color?.maMau || '#000'
}

// Watch for changes in productStore.productDetail and sync with productDetailStore
watch(
  () => productStore.productDetail,
  (newProductDetail) => {
    if (newProductDetail && newProductDetail.id == productId.value) {
      productDetailStore.productDetail = newProductDetail
      console.log(
        'Synced productDetailStore.productDetail with productStore.productDetail:',
        newProductDetail,
      )
    }
  },
  { deep: true },
)

// Watch for changes in productStore.products and sync the specific product
watch(
  () => productStore.products,
  (newProducts) => {
    const product = newProducts.find((p) => p.id == productId.value)
    if (product) {
      productDetailStore.productDetail = product
      console.log(
        'Synced productDetailStore.productDetail with product from products array:',
        product,
      )
    }
  },
  { deep: true },
)
</script>

<style scoped>
.product-detail-management {
  padding: 32px 0;
  background: linear-gradient(120deg, #f8fafc 60%, #f1f5f9 100%);
  min-height: 100vh;
}

.card {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(80, 80, 180, 0.08);
  border: none;
  background: #fff;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.13);
}

.card-header {
  background: linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%);
  border-bottom: 1px solid #e0e7ff;
  border-radius: 18px 18px 0 0;
  padding: 1.25rem 2rem;
}

.header-controls .btn-primary {
  background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
  border: none;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.12);
  transition:
    background 0.2s,
    box-shadow 0.2s;
}

.header-controls .btn-primary:hover {
  background: linear-gradient(90deg, #4f46e5 60%, #818cf8 100%);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.18);
}

.info-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: center;
}

.info-row strong {
  width: 150px;
  font-weight: 500;
  color: #6b7280;
  margin-right: 1rem;
}

.info-value {
  flex: 1;
  color: #374151;
}

.image-container {
  margin-top: 1rem;
}

.product-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.variant-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.variant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.variant-image {
  height: 120px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.variant-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.variant-details {
  padding: 1rem;
  background: #fff;
}

.variant-specs {
  margin-bottom: 1rem;
}

.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.spec-item i {
  margin-right: 0.5rem;
  color: #6b7280;
}

.variant-price {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.variant-stock {
  margin-bottom: 1rem;
}

.variant-actions {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.btn-group {
  gap: 0.5rem;
}

.tab-content {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

.timeline-item {
  position: relative;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-badge {
  position: absolute;
  left: 0;
  top: 0;
  width: 12px;
  height: 12px;
  background: #6366f1;
  border-radius: 50%;
  z-index: 1;
}

.timeline-content {
  padding-left: 2rem;
}

.timeline-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.timeline-action {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.timeline-user {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Custom styles for tab navigation */
.nav-tabs .nav-link {
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: #6b7280;
  background-color: transparent;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link.active {
  color: #16a34a;
  background-color: #f8fafc;
  border-color: #16a34a;
  font-weight: 600;
}

.nav-tabs .nav-link:hover {
  color: #16a34a;
  background-color: #f8fafc;
  border-color: #16a34a;
}

.nav-tabs .nav-link:focus {
  outline: none;
  box-shadow: none;
}

/* Custom styles for add variant button */
.btn-success {
  background-color: #16a34a;
  border-color: #16a34a;
  color: white;
  font-weight: 500;
}

.btn-success:hover {
  background-color: #15803d;
  border-color: #15803d;
}

/* Custom styles for variants header controls */
.header-controls .btn-outline-primary {
  border-color: #16a34a;
  color: #16a34a;
}

.header-controls .btn-outline-primary:hover {
  background-color: #16a34a;
  color: white;
  border-color: #16a34a;
}

/* Custom styles for variant card borders */
.variant-card {
  border-color: #16a34a;
}

.variant-card:hover {
  border-color: #15803d;
}

/* Custom styles for variant buttons */
.btn-outline-primary {
  border-color: #16a34a;
  color: #16a34a;
}

.btn-outline-primary:hover {
  background-color: #16a34a;
  color: white;
  border-color: #16a34a;
}

/* Custom styles for variant delete button */
.btn-outline-danger {
  border-color: #dc2626;
  color: #dc2626;
}

.btn-outline-danger:hover {
  background-color: #dc2626;
  color: white;
  border-color: #dc2626;
}

@media (max-width: 768px) {
  .product-detail-management {
    padding: 12px 0;
  }

  .card-header {
    padding: 1rem 1rem;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row strong {
    width: auto;
    margin-bottom: 0.5rem;
    margin-right: 0;
  }

  .product-image {
    max-width: 150px;
  }
}

/* Additional styles for the new components */
.search-container {
  display: flex;
  align-items: center;
}

.search-container .input-group {
  width: 300px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.table th,
.table td {
  vertical-align: middle;
  padding: 0.75rem;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.table tbody tr:hover {
  background-color: #f8fafc;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.input-group .form-control {
  border-radius: 0.375rem;
}

.input-group .btn {
  border-radius: 0.375rem;
}

.form-range {
  width: 100%;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #16a34a;
  cursor: pointer;
}
</style>
