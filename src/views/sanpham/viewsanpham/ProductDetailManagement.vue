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
                      <strong>Hình ảnh sản phẩm ({{ allProductImages.length }}):</strong>
                      <div class="images-gallery">
                        <div 
                          v-if="allProductImages.length === 0" 
                          class="image-container"
                        >
                          <img
                            src=""
                            alt="No Image"
                            class="product-image"
                          />
                          <p class="text-muted text-center mt-2">Chưa có hình ảnh</p>
                        </div>
                        <div 
                          v-for="(image, index) in allProductImages" 
                          :key="index"
                          class="image-item"
                        >
                          <img
                            :src="image.url"
                            :alt="`Product Image ${index + 1}`"
                            class="product-image"
                          />
                          <div class="image-info" v-if="image.variantName">
                            <small class="text-muted">{{ image.variantName }}</small>
                          </div>
                        </div>
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
          <!-- Debug Info (remove in production) -->
          <div class="debug-info mb-2" v-if="showDebug">
            <small class="text-muted">
              Debug: CPUs({{ productStore.cpus.length }}), RAMs({{ productStore.rams.length }}), 
              GPUs({{ productStore.gpus.length }}), Colors({{ productStore.colors.length }}), 
              Storages({{ productStore.storages.length }}), Screens({{ productStore.screens.length }})
            </small>
          </div>

          <!-- Filter Section -->
          <div class="filter-card mb-4">
            <div class="filter-header">
              <h5 class="filter-title">Bộ lọc biến thể</h5>
              <a href="#" class="clear-filters-link" @click.prevent="clearFilters">
                <i class="bi bi-funnel"></i> Xóa toàn bộ bộ lọc
              </a>
            </div>
            <div class="filter-content">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">CPU</label>
                  <select class="form-select" v-model="filters.cpu">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.cpus.length === 0" disabled>Đang tải...</option>
                    <option v-for="c in productStore.cpus" :key="c.id" :value="c.tenCpu">{{ c.tenCpu }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">RAM</label>
                  <select class="form-select" v-model="filters.ram">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.rams.length === 0" disabled>Đang tải...</option>
                    <option v-for="r in productStore.rams" :key="r.id" :value="r.tenRam">{{ r.tenRam }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">GPU</label>
                  <select class="form-select" v-model="filters.gpu">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.gpus.length === 0" disabled>Đang tải...</option>
                    <option v-for="g in productStore.gpus" :key="g.id" :value="g.tenGpu">{{ g.tenGpu }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Màu sắc</label>
                  <select class="form-select" v-model="filters.color">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.colors.length === 0" disabled>Đang tải...</option>
                    <option v-for="c in productStore.colors" :key="c.id" :value="c.tenMau">
                      <span class="color-option">
                        {{ c.tenMau }} {{ c.hexCode ? `(${c.hexCode})` : '' }}
                      </span>
                    </option>
                  </select>
                </div>

                <div class="col-md-3">
                  <label class="form-label">Ổ cứng</label>
                  <select class="form-select" v-model="filters.storage">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.storages.length === 0" disabled>Đang tải...</option>
                    <option v-for="s in productStore.storages" :key="s.id" :value="s.dungLuong">{{ s.dungLuong }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Màn hình</label>
                  <select class="form-select" v-model="filters.screen">
                    <option value="">Tất cả</option>
                    <option v-if="productStore.screens.length === 0" disabled>Đang tải...</option>
                    <option v-for="sc in productStore.screens" :key="sc.id" :value="sc.kichThuoc">{{ sc.kichThuoc }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Giá từ</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    placeholder="Giá tối thiểu"
                    v-model.number="filters.minPrice"
                    :min="0"
                    :max="maxPrice || 100000000"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Giá đến</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    placeholder="Giá tối đa"
                    v-model.number="filters.maxPrice"
                    :min="filters.minPrice || 0"
                    :max="maxPrice || 100000000"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Variants List Section -->
          <div class="variants-list-section">
            <div class="list-header d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0">Danh sách biến thể</h5>
                <span class="badge bg-success">{{ productVariants.length }}</span>
              </div>
              <div class="search-box">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tìm theo sku, tên sản phẩm, CPU, RAM, GPU..."
                    v-model="searchQuery" 
                  />
                  <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Variants Table -->
            <div class="table-responsive">
              <table class="table table-hover align-middle variants-table">
                <thead class="table-light">
                  <tr>
                    <th width="25" class="text-center">
                      <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
                    </th>
                    <th width="30">STT</th>
                    <th width="60">ẢNH</th>
                    <th width="100">SKU</th>
                    <th width="60">MÀU</th>
                    <th width="80">CPU</th>
                    <th width="60">RAM</th>
                    <th width="70">GPU</th>
                    <th width="70">MÀN HÌNH</th>
                    <th width="50">PIN</th>
                    <th width="70">Ổ CỨNG</th>
                    <th width="75">GIÁ BÁN</th>
                    <th width="60">SỐ LƯỢNG TỒN</th>
                    <th width="65">TRẠNG THÁI</th>
                    <th width="70">NGÀY TẠO</th>
                    <th width="70">NGÀY CẬP NHẬT</th>
                    <th width="60">TÁC VỤ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="variantsLoading">
                    <td colspan="17" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="filteredVariants.length === 0">
                    <td colspan="17" class="text-center py-5 text-muted">
                      <i class="bi bi-box-seam display-5"></i>
                      <p class="mt-3">Không có biến thể nào</p>
                    </td>
                  </tr>
                  <tr v-for="(variant, index) in filteredVariants" :key="variant.id">
                    <td class="text-center">
                      <input type="checkbox" v-model="selectedVariants" :value="variant.id" />
                    </td>
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="variant-image-cell">
                        <img 
                          v-if="variant.images && variant.images.length > 0"
                          :src="getVariantImageUrl(variant)"
                          :alt="variant.maCtsp"
                          class="variant-thumbnail"
                          @error="handleImageError"
                        />
                        <div v-else class="no-image-placeholder">
                          <i class="bi bi-image"></i>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code class="sku-code">{{ variant.maCtsp }}</code>
                    </td>
                    <td>
                      <div class="color-display" v-if="variant.mauSac">
                        <div class="d-flex align-items-center">
                          <span 
                            class="color-preview me-2" 
                            :style="{ backgroundColor: getColorForVariant(variant.mauSac) }"
                            :title="variant.mauSac?.tenMau + ' (' + getColorForVariant(variant.mauSac) + ')'"
                          ></span>
                          <div class="color-info">
                            <div class="color-name">{{ variant.mauSac?.tenMau }}</div>
                            <div class="color-hex">{{ getColorForVariant(variant.mauSac) }}</div>
                          </div>
                        </div>
                      </div>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>{{ variant.tenCpu || 'N/A' }}</td>
                    <td>{{ variant.tenRam || 'N/A' }}</td>
                    <td>{{ variant.tenGpu || 'N/A' }}</td>
                    <td>{{ variant.kichThuocManHinh || 'N/A' }}</td>
                    <td>{{ variant.dungLuongPin || 'N/A' }}</td>
                    <td>{{ variant.dungLuongOCung || 'N/A' }}</td>
                    <td>
                      <span class="price-text">{{ formatCurrency(variant.giaBan) }}</span>
                    </td>
                    <td>
                      <div class="stock-info">
                        <span :class="stockStatusClass(variant.soLuongTon)">{{ variant.soLuongTon || 0 }}</span>
                        <small class="text-muted d-block">có sẵn</small>
                      </div>
                    </td>
                    <td>
                      <span :class="statusClass(variant.trangThai)" class="badge">
                        {{ variant.trangThai === 1 ? 'Hoạt động' : 'Ẩn' }}
                      </span>
                    </td>
                    <td>{{ formatDate(variant.createdAt) || 'N/A' }}</td>
                    <td>{{ formatDate(variant.updatedAt) || 'N/A' }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary btn-sm" @click="editVariant(variant)" title="Chỉnh sửa">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" @click="confirmDelete(variant.id)" title="Xóa">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bulk Actions -->
          <div v-if="selectedVariants.length > 0" class="bulk-actions mt-3 p-3 bg-light rounded">
            <div class="d-flex align-items-center gap-3">
              <span class="fw-semibold">{{ selectedVariants.length }} biến thể đã chọn</span>
              <button class="btn btn-outline-danger btn-sm" @click="bulkDelete">
                <i class="bi bi-trash"></i> Xóa hàng loạt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Variant Modal (Component) -->
  <VariantEditModal 
    ref="editModal"
    @updated="handleVariantUpdated"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import { useAttributeStore } from '@/stores/attributeStore'
import { formatCurrency } from '@/utils/formatters'
import { getCTSPBySanPham, getHinhAnhByCtspId } from '@/service/sanpham/SanPhamService'
import VariantEditModal from '@/components/sanpham/quanlisanpham/VariantEditModal.vue'

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

// Modal refs
const editModal = ref(null)

// Edit modal state (kept for backward compatibility, but will use VariantEditModal component)
const editLoading = ref(false)
const editErrors = ref({})
const editGeneralError = ref('')
const editForm = ref({
  id: '',
  maCtsp: '',
  tenSanPham: '',
  idCpu: '',
  idRam: '',
  idGpu: '',
  idMauSac: '',
  idOCung: '',
  idLoaiManHinh: '',
  idPin: '',
  giaBan: 0,
  soLuongTon: 0,
  trangThai: 1
})

// Audit logs state
const auditLogs = ref([])

// Filters state
const filters = ref({
  cpu: '',
  ram: '',
  gpu: '',
  color: '',
  storage: '',
  screen: '',
  minPrice: null,
  maxPrice: null,
})

const priceRange = ref(0)
const maxPrice = ref(100000000)
const searchQuery = ref('')
const selectedVariants = ref([])
const selectAll = ref(false)
const showDebug = ref(false) // Set to false in production
const variantsLoading = ref(false)
let filterDebounceTimer = null

// Fetch data khi component mounted
// ... existing code ...

// ... existing code ...

onMounted(async () => {
  loading.value = true
  try {
    // Check if productId is available
    if (!productId.value) {
      console.error('Product ID is not available')
      return
    }
    
    // Ensure variants array is initialized
    if (!productDetailStore.variants) {
      productDetailStore.variants = []
    }
    
    // Load attributes first
    await productStore.loadAttributes()
    
    // Fetch product details first
    await productStore.fetchProductByIdSP(productId.value)
    
    // Get the product from store
    const productFromStore = productStore.products.find((p) => p.id == productId.value)
    
    if (productFromStore) {
      // Update productDetailStore with the product data
      productDetailStore.productDetail = productFromStore
      
      // Fetch variants for this product using getCTSPBySanPham API
      await fetchProductVariants(productId.value)
      
      // Update product with image from first variant if product doesn't have one
      if (!productDetailStore.productDetail.anhDaiDien && productDetailStore.variants && productDetailStore.variants.length > 0) {
        for (const variant of productDetailStore.variants) {
          if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
            const firstImage = variant.images[0]
            let imageUrl = null
            
            if (typeof firstImage === 'string') {
              imageUrl = firstImage
            } else if (firstImage && firstImage.url) {
              imageUrl = firstImage.url
            } else if (firstImage && firstImage.uri) {
              imageUrl = firstImage.uri
            }
            
            if (imageUrl) {
              productDetailStore.productDetail = {
                ...productDetailStore.productDetail,
                anhDaiDien: imageUrl
              }
              break
            }
          }
        }
      }
      
      // Fetch audit logs
      await fetchAuditLogs()
      
      // Calculate and set max price after data is loaded
      nextTick(() => {
        maxPrice.value = calculateMaxPrice()
        if (!filters.value.maxPrice) {
          filters.value.maxPrice = maxPrice.value
        }
      })
    }
  } catch (error) {
    console.error('Error fetching product data:', error)
  } finally {
    loading.value = false
  }
})

// Fetch product variants using getCTSPBySanPham API
const fetchProductVariants = async (productId) => {
  variantsLoading.value = true
  try {
    const response = await getCTSPBySanPham(productId)
    const data = response.data || response
    
    if (Array.isArray(data)) {
      // Normalize the data structure and load images for each variant
      const variantsWithImages = await Promise.all(data.map(async (variant) => {
        let images = []
        
        // Load images for this variant
        try {
          const imagesResponse = await getHinhAnhByCtspId(variant.id)
          images = imagesResponse.data || []
          console.log(`Variant ${variant.id} (${variant.maCtsp}) - Loaded ${images.length} images:`, images)
        } catch (err) {
          console.warn(`Failed to load images for variant ${variant.id}`)
        }
        
        return {
          ...variant,
          images: images, // Add images array
          // Map flat fields to nested objects for consistency
          mauSac: variant.tenMauSac ? {
            tenMau: variant.tenMauSac,
            hexCode: variant.hexCodeMauSac || '#000000',
            id: variant.idMauSac
          } : null,
          cpu: variant.tenCpu ? { tenCpu: variant.tenCpu, id: variant.idCpu } : null,
          ram: variant.tenRam ? { tenRam: variant.tenRam, id: variant.idRam } : null,
          gpu: variant.tenGpu ? { tenGpu: variant.tenGpu, id: variant.idGpu } : null,
          oCung: variant.dungLuongOCung ? { dungLuong: variant.dungLuongOCung, id: variant.idOCung } : null,
          loaiManHinh: variant.kichThuocManHinh ? { kichThuoc: variant.kichThuocManHinh, id: variant.idLoaiManHinh } : null,
          pin: variant.dungLuongPin ? { dungLuongPin: variant.dungLuongPin, id: variant.idPin } : null,
        }
      }))
      
      productDetailStore.variants = variantsWithImages
    } else {
      productDetailStore.variants = []
    }
  } catch (error) {
    console.error('Error fetching product variants:', error)
    productDetailStore.variants = []
  } finally {
    variantsLoading.value = false
  }
}

// Calculate max price from variants
const calculateMaxPrice = () => {
  try {
    if (!productVariants.value || !productVariants.value.length) return 100000000
    const prices = productVariants.value
      .filter(v => v && v.trangThai === 1 && v.giaBan) // Only active variants with price
      .map(v => Number(v.giaBan))
      .filter(price => !isNaN(price) && price > 0) // Filter out invalid prices
    
    if (prices.length === 0) return 100000000
    const calculatedMax = Math.max(...prices)
    return Math.ceil(calculatedMax / 1000000) * 1000000 // Round up to nearest million
  } catch (error) {
    console.warn('Error calculating max price:', error)
    return 100000000
  }
}

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
    let product = productDetailStore.productDetail
    
    // Get first image from first variant if no product image
    if (!product.anhDaiDien && productVariants.value && productVariants.value.length > 0) {
      // Try to find first variant with image
      for (const variant of productVariants.value) {
        if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
          const firstImage = variant.images[0]
          let imageUrl = null
          
          // Handle both object with url property and direct string url
          if (typeof firstImage === 'string') {
            imageUrl = firstImage
          } else if (firstImage && firstImage.url) {
            imageUrl = firstImage.url
          } else if (firstImage && firstImage.uri) {
            imageUrl = firstImage.uri
          }
          
          if (imageUrl) {
            product = { ...product, anhDaiDien: imageUrl }
            break
          }
        }
      }
    }
    
    return product
  }
  // Fallback to productStore if available
  const product = productStore.products.find((p) => p.id == productId.value) || {}
  return product
})

const productVariants = computed(() => productDetailStore.variants)

// Get all images from all variants
const allProductImages = computed(() => {
  const images = []
  
  // Add product main image if exists
  if (selectedProduct.value?.anhDaiDien) {
    images.push({
      url: selectedProduct.value.anhDaiDien,
      source: 'product'
    })
  }
  
  // Add all images from all variants
  if (productVariants.value && Array.isArray(productVariants.value)) {
    productVariants.value.forEach(variant => {
      if (variant.images && Array.isArray(variant.images)) {
        variant.images.forEach(image => {
          const imageUrl = typeof image === 'string' ? image : (image.url || image.uri)
          if (imageUrl && !images.some(img => img.url === imageUrl)) {
            images.push({
              url: imageUrl,
              source: 'variant',
              variantId: variant.id,
              variantName: [
                variant.tenCpu,
                variant.tenRam,
                variant.tenGpu,
                variant.dungLuongOCung,
                variant.tenMauSac
              ].filter(Boolean).join(' - ')
            })
          }
        })
      }
    })
  }
  
  return images
})

// Computed property for filtered variants
const filteredVariants = computed(() => {
  if (!productVariants.value || !Array.isArray(productVariants.value)) {
    return []
  }
  
  return productVariants.value.filter((variant) => {
    // Filter by search query
    if (searchQuery.value) {
      const searchTerm = searchQuery.value.toLowerCase()
      const searchableText = [
        variant.maCtsp,
        variant.tenSanPham,
        variant.tenCpu,
        variant.tenRam,
        variant.tenGpu,
        variant.tenMauSac,
        variant.dungLuongOCung,
        variant.kichThuocManHinh
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Filter by CPU
    if (filters.value.cpu && variant.tenCpu !== filters.value.cpu) {
      return false
    }

    // Filter by RAM
    if (filters.value.ram && variant.tenRam !== filters.value.ram) {
      return false
    }

    // Filter by GPU
    if (filters.value.gpu && variant.tenGpu !== filters.value.gpu) {
      return false
    }

    // Filter by Color
    if (filters.value.color) {
      const variantColorName = variant.tenMauSac || variant.mauSac?.tenMau
      if (variantColorName !== filters.value.color) {
        return false
      }
    }

    // Filter by Storage
    if (filters.value.storage && variant.dungLuongOCung !== filters.value.storage) {
      return false
    }

    // Filter by Screen
    if (filters.value.screen && variant.kichThuocManHinh !== filters.value.screen) {
      return false
    }

    // Filter by price range
    if (filters.value.minPrice && variant.giaBan < filters.value.minPrice) {
      return false
    }
    
    if (filters.value.maxPrice && variant.giaBan > filters.value.maxPrice) {
      return false
    }

    return true
  })
})

// Helper functions
const getVariantImageUrl = (variant) => {
  console.log(`Getting image URL for variant ${variant.maCtsp}:`, {
    hasImages: !!variant.images,
    imagesLength: variant.images?.length || 0,
    firstImage: variant.images?.[0]
  })
  
  if (variant.images && variant.images.length > 0) {
    const firstImage = variant.images[0]
    // Handle both string URL and object with url property
    if (typeof firstImage === 'string') {
      console.log(`→ Returning string URL:`, firstImage)
      return firstImage
    } else if (firstImage && firstImage.url) {
      console.log(`→ Returning object.url:`, firstImage.url)
      return firstImage.url
    } else if (firstImage && firstImage.uri) {
      console.log(`→ Returning object.uri:`, firstImage.uri)
      return firstImage.uri
    }
  }
  console.log(`→ No image found, returning null`)
  return null
}

const handleImageError = (event) => {
  // Set placeholder image on error
  event.target.src = 'https://via.placeholder.com/50x50?text=No+Image'
}

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

const editVariant = async (variant) => {
  console.log('Edit variant:', variant)
  
  try {
    // Ensure attributes are loaded
    await productStore.loadAttributes()
    
    // Wait for next tick to ensure modal is rendered
    await nextTick()
    
    // Load variant data into modal
    if (editModal.value) {
      editModal.value.resetForm()
      editModal.value.loadVariantData(variant)
    }
    
    // Show modal
    const modalElement = document.getElementById('variantEditModal')
    if (modalElement) {
      // Create new modal instance each time to avoid issues
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        // Dispose any existing instance first
        const existingModal = bootstrap.Modal.getInstance(modalElement)
        if (existingModal) {
          existingModal.dispose()
        }
        
        // Create new instance and show
        const modal = new bootstrap.Modal(modalElement, {
          backdrop: true,
          keyboard: true,
          focus: true
        })
        
        // Remove aria-hidden after modal is shown
        modalElement.addEventListener('shown.bs.modal', () => {
          modalElement.removeAttribute('aria-hidden')
        }, { once: true })
        
        modal.show()
      } else {
        // Manual show as fallback
        modalElement.classList.add('show', 'd-block')
        modalElement.style.display = 'block'
        modalElement.removeAttribute('aria-hidden')
        modalElement.setAttribute('aria-modal', 'true')
        modalElement.setAttribute('role', 'dialog')
        document.body.classList.add('modal-open')
        
        // Add backdrop
        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'
        backdrop.id = 'modal-backdrop'
        document.body.appendChild(backdrop)
      }
    }
  } catch (error) {
    console.error('Error opening edit modal:', error)
    alert('Có lỗi khi mở form chỉnh sửa: ' + error.message)
  }
}

const handleVariantUpdated = async () => {
  console.log('ProductDetailManagement: Handling variant updated event')
  
  try {
    // Reload variants list after successful update
    await fetchProductVariants(productId.value)
    console.log('ProductDetailManagement: Variants list refreshed successfully')
  } catch (error) {
    console.error('ProductDetailManagement: Error refreshing variants list:', error)
  }
}

const confirmDelete = async (variantId) => {
  if (confirm('Bạn có chắc muốn xóa biến thể này?')) {
    try {
      await productDetailStore.deleteVariant(variantId)
    } catch (error) {
      console.error('Error in confirmDelete:', error)
      alert('Lỗi khi xóa biến thể: ' + (error.message || 'Lỗi không xác định'))
    }
  }
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = async (variantData) => {
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

// Color mapping function
const getColorByName = (colorName) => {
  console.log('=== getColorByName called ===')
  console.log('Input colorName:', colorName, 'type:', typeof colorName)
  
  if (!colorName) {
    console.log('No color name provided, returning default gray')
    return '#808080' // Default gray
  }
  
  // Convert to lowercase and trim for comparison
  const name = colorName.toString().toLowerCase().trim()
  console.log('Normalized name:', name)
  
  // Comprehensive color mapping with multiple variations
  const colorMap = {
    // Black variations
    'đen': '#000000',
    'den': '#000000', 
    'black': '#000000',
    'màu đen': '#000000',
    
    // White variations  
    'trắng': '#FFFFFF',
    'trang': '#FFFFFF',
    'white': '#FFFFFF',
    'màu trắng': '#FFFFFF',
    
    // Red variations
    'đỏ': '#FF0000',
    'do': '#FF0000',
    'red': '#FF0000',
    'màu đỏ': '#FF0000',
    'đỏ tươi': '#FF0000',
    'đỏ đậm': '#CC0000',
    
    // Blue variations
    'xanh dương': '#0066CC',
    'xanh duong': '#0066CC',
    'xanh': '#0066CC',
    'blue': '#0066CC',
    'màu xanh': '#0066CC',
    'xanh da trời': '#87CEEB',
    'xanh navy': '#000080',
    
    // Green variations
    'xanh lá': '#00AA00',
    'xanh la': '#00AA00',
    'green': '#00AA00',
    'màu xanh lá': '#00AA00',
    'xanh lá cây': '#228B22',
    
    // Yellow variations
    'vàng': '#FFD700',
    'vang': '#FFD700',
    'yellow': '#FFD700',
    'màu vàng': '#FFD700',
    'vàng gold': '#FFD700',
    
    // Purple variations
    'tím': '#800080',
    'tim': '#800080',
    'purple': '#800080',
    'màu tím': '#800080',
    'tím than': '#663399',
    
    // Pink variations
    'hồng': '#FF69B4',
    'hong': '#FF69B4',
    'pink': '#FF69B4',
    'màu hồng': '#FF69B4',
    'hồng nhạt': '#FFB6C1',
    
    // Orange variations
    'cam': '#FF8C00',
    'orange': '#FF8C00',
    'màu cam': '#FF8C00',
    'cam đậm': '#FF6600',
    
    // Brown variations
    'nâu': '#8B4513',
    'nau': '#8B4513',
    'brown': '#8B4513',
    'màu nâu': '#8B4513',
    'nâu đậm': '#654321',
    
    // Gray variations
    'xám': '#808080',
    'xam': '#808080',
    'gray': '#808080',
    'grey': '#808080',
    'màu xám': '#808080',
    'xám nhạt': '#D3D3D3',
    'xám đậm': '#696969',
    
    // Silver variations
    'bạc': '#C0C0C0',
    'bac': '#C0C0C0',
    'silver': '#C0C0C0',
    'màu bạc': '#C0C0C0',
    
    // Gold variations
    'vàng gold': '#FFD700',
    'gold': '#FFD700',
    'màu vàng kim': '#FFD700'
  }
  
  // Direct match first
  if (colorMap[name]) {
    console.log('✅ Direct match found:', name, '→', colorMap[name])
    return colorMap[name]
  }
  
  // Partial match - check if any key contains the name or vice versa
  for (const [key, value] of Object.entries(colorMap)) {
    if (name.includes(key) || key.includes(name)) {
      console.log('✅ Partial match found:', name, '→', key, '→', value)
      return value
    }
  }
  
  // Fallback for common color keywords
  if (name.includes('đỏ') || name.includes('do') || name.includes('red')) {
    console.log('✅ Fallback red match:', name, '→ #FF0000')
    return '#FF0000'
  }
  
  if (name.includes('đen') || name.includes('den') || name.includes('black')) {
    console.log('✅ Fallback black match:', name, '→ #000000')
    return '#000000'
  }
  
  if (name.includes('trắng') || name.includes('trang') || name.includes('white')) {
    console.log('✅ Fallback white match:', name, '→ #FFFFFF')
    return '#FFFFFF'
  }
  
  if (name.includes('xanh') || name.includes('blue')) {
    console.log('✅ Fallback blue match:', name, '→ #0066CC')
    return '#0066CC'
  }
  
  // Generate color from string if no match found
  console.log('❌ No match found, generating fallback color for:', name)
  return generateColorFromString(name)
}

// Generate color from string hash
const generateColorFromString = (str) => {
  // For unknown colors, return a neutral color instead of random
  console.log('Generating fallback color for unknown color name:', str)
  return '#6B7280' // Nice neutral gray
}

// Simple and direct color function
const getColorForVariant = (colorObj) => {
  if (!colorObj) return '#808080'
  
  // Direct color mapping based on name
  const colorName = colorObj.tenMau || colorObj.name || ''
  
  switch (colorName.toLowerCase().trim()) {
    case 'đen':
    case 'den':
    case 'black':
    case 'màu đen':
      return '#000000'
      
    case 'đỏ':
    case 'do':
    case 'red':
    case 'màu đỏ':
      return '#FF0000'
      
    case 'trắng':
    case 'trang':
    case 'white':
    case 'màu trắng':
      return '#FFFFFF'
      
    case 'xanh':
    case 'xanh dương':
    case 'xanh duong':
    case 'blue':
    case 'màu xanh':
      return '#0066CC'
      
    case 'xanh lá':
    case 'xanh la':
    case 'green':
    case 'màu xanh lá':
      return '#00AA00'
      
    case 'vàng':
    case 'vang':
    case 'yellow':
    case 'màu vàng':
      return '#FFD700'
      
    case 'tím':
    case 'tim':
    case 'purple':
    case 'màu tím':
      return '#800080'
      
    case 'hồng':
    case 'hong':
    case 'pink':
    case 'màu hồng':
      return '#FF69B4'
      
    case 'cam':
    case 'orange':
    case 'màu cam':
      return '#FF8C00'
      
    case 'nâu':
    case 'nau':
    case 'brown':
    case 'màu nâu':
      return '#8B4513'
      
    case 'xám':
    case 'xam':
    case 'gray':
    case 'grey':
    case 'màu xám':
      return '#808080'
      
    case 'bạc':
    case 'bac':
    case 'silver':
    case 'màu bạc':
      return '#C0C0C0'
      
    default:
      // If no match, try to use hexCode from object
      if (colorObj.hexCode) {
        const hex = colorObj.hexCode.trim()
        if (hex.match(/^#?[0-9A-Fa-f]{6}$/)) {
          return hex.startsWith('#') ? hex : '#' + hex
        }
      }
      
      // Final fallback - generate based on name
      if (colorName) {
        // Simple hash-based color generation
        let hash = 0
        for (let i = 0; i < colorName.length; i++) {
          hash = colorName.charCodeAt(i) + ((hash << 5) - hash)
        }
        const color = Math.abs(hash).toString(16).substring(0, 6).padEnd(6, '0')
        return '#' + color
      }
      
      return '#808080' // Default gray
  }
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
  // Reset all filters to show all variants
  filters.value = {
    cpu: '',
    ram: '',
    gpu: '',
    color: '',
    storage: '',
    screen: '',
    minPrice: null,
    maxPrice: null,
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    cpu: '',
    ram: '',
    gpu: '',
    color: '',
    storage: '',
    screen: '',
    minPrice: null,
    maxPrice: null,
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedVariants.value = filteredVariants.value.map((v) => v.id)
  } else {
    selectedVariants.value = []
  }
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'text-success'
  if (stock > 0) return 'text-warning'
  return 'text-danger'
}

const bulkDelete = async () => {
  if (selectedVariants.value.length === 0) {
    alert('Vui lòng chọn ít nhất một biến thể để xóa')
    return
  }
  
  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedVariants.value.length} biến thể đã chọn?`)) {
    try {
      loading.value = true
      
      // Delete each variant individually
      const deletePromises = selectedVariants.value.map(async (variantId) => {
        try {
          await productDetailStore.deleteVariant(variantId)
          return { success: true, variantId }
        } catch (err) {
          console.warn(`Failed to delete variant ${variantId}:`, err)
          return { success: false, variantId, error: err }
        }
      })
      
      const results = await Promise.allSettled(deletePromises)
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
      const failCount = selectedVariants.value.length - successCount
      
      if (failCount === 0) {
        alert('Xóa tất cả biến thể thành công!')
      } else if (successCount > 0) {
        alert(`Xóa thành công ${successCount} biến thể, ${failCount} biến thể không thể xóa.`)
      } else {
        alert('Không thể xóa biến thể nào!')
      }
      
      // Clear selection and reload the variants list
      selectedVariants.value = []
      selectAll.value = false
      await fetchProductVariants(productId.value)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert('Lỗi khi xóa biến thể: ' + (error.message || 'Lỗi không xác định'))
    } finally {
      loading.value = false
    }
  }
}

const getColorCode = (colorId) => {
  const color = attributeStore.getAttributeById('colors', colorId)
  return color?.maMau || color?.hexCode || '#000'
}

// Edit modal functions
const resetEditForm = () => {
  editForm.value = {
    id: '',
    maCtsp: '',
    tenSanPham: '',
    idCpu: '',
    idRam: '',
    idGpu: '',
    idMauSac: '',
    idOCung: '',
    idLoaiManHinh: '',
    idPin: '',
    giaBan: 0,
    soLuongTon: 0,
    trangThai: 1
  }
  editErrors.value = {}
  editGeneralError.value = ''
}

const loadVariantData = (variant) => {
  if (!variant || !variant.id) return
  
  editForm.value = {
    id: variant.id,
    maCtsp: variant.maCtsp || '',
    tenSanPham: variant.tenSanPham || selectedProduct.value?.tenSanPham || '',
    idCpu: variant.idCpu || findAttributeIdByName('cpus', variant.tenCpu) || '',
    idRam: variant.idRam || findAttributeIdByName('rams', variant.tenRam) || '',
    idGpu: variant.idGpu || findAttributeIdByName('gpus', variant.tenGpu) || '',
    idMauSac: variant.idMauSac || findAttributeIdByName('colors', variant.tenMauSac) || '',
    idOCung: variant.idOCung || findAttributeIdByName('storages', variant.dungLuongOCung) || '',
    idLoaiManHinh: variant.idLoaiManHinh || findAttributeIdByName('screens', variant.kichThuocManHinh) || '',
    idPin: variant.idPin || findAttributeIdByName('batteries', variant.dungLuongPin) || '',
    giaBan: variant.giaBan || 0,
    soLuongTon: variant.soLuongTon || 0,
    trangThai: variant.trangThai ?? 1
  }
}

const findAttributeIdByName = (attributeType, name) => {
  if (!name) return null
  
  const attributes = productStore[attributeType] || []
  const attribute = attributes.find(attr => {
    switch (attributeType) {
      case 'cpus': return attr.tenCpu === name
      case 'rams': return attr.tenRam === name
      case 'gpus': return attr.tenGpu === name
      case 'colors': return attr.tenMau === name
      case 'storages': return attr.dungLuong === name
      case 'screens': return attr.kichThuoc === name
      case 'batteries': return attr.dungLuongPin === name
      default: return false
    }
  })
  return attribute?.id || null
}

const validateEditForm = () => {
  const newErrors = {}
  
  // Validate required dropdowns
  if (!editForm.value.idCpu) newErrors.idCpu = 'Vui lòng chọn CPU'
  if (!editForm.value.idRam) newErrors.idRam = 'Vui lòng chọn RAM'
  if (!editForm.value.idGpu) newErrors.idGpu = 'Vui lòng chọn GPU'
  if (!editForm.value.idMauSac) newErrors.idMauSac = 'Vui lòng chọn màu sắc'
  if (!editForm.value.idOCung) newErrors.idOCung = 'Vui lòng chọn ổ cứng'
  if (!editForm.value.idLoaiManHinh) newErrors.idLoaiManHinh = 'Vui lòng chọn màn hình'
  if (!editForm.value.idPin) newErrors.idPin = 'Vui lòng chọn pin'
  
  // Validate price
  if (!editForm.value.giaBan || editForm.value.giaBan <= 0) {
    newErrors.giaBan = 'Giá bán phải lớn hơn 0'
  } else if (editForm.value.giaBan > 1000000000) { // 1 billion VND max
    newErrors.giaBan = 'Giá bán không được vượt quá 1 tỷ VND'
  }
  
  // Validate quantity
  if (editForm.value.soLuongTon === null || editForm.value.soLuongTon === undefined) {
    newErrors.soLuongTon = 'Vui lòng nhập số lượng tồn'
  } else if (editForm.value.soLuongTon < 0) {
    newErrors.soLuongTon = 'Số lượng tồn không được âm'
  } else if (!Number.isInteger(editForm.value.soLuongTon)) {
    newErrors.soLuongTon = 'Số lượng tồn phải là số nguyên'
  } else if (editForm.value.soLuongTon > 1000000) { // 1 million max
    newErrors.soLuongTon = 'Số lượng tồn không được vượt quá 1 triệu'
  }
  
  editErrors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleCloseModal = () => {
  if (confirm('Bạn có chắc chắn muốn đóng form chỉnh sửa không?')) {
    closeEditModal()
  }
}

const handleCancelEdit = () => {
  if (confirm('Bạn có chắc chắn muốn hủy chỉnh sửa không?')) {
    closeEditModal()
  }
}

const closeEditModal = () => {
  // Reset form first
  resetEditForm()
  
  // Close modal
  const modal = document.getElementById('variantEditModal')
  if (modal) {
    // Try Bootstrap 5 first
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      let bsModal = bootstrap.Modal.getInstance(modal)
      if (bsModal) {
        bsModal.hide()
        bsModal.dispose()
      }
    }
    
    // Always do manual cleanup to ensure everything is clean
    modal.classList.remove('show', 'd-block')
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
    modal.removeAttribute('aria-modal')
    modal.removeAttribute('role')
    
    // Clean up body and backdrop
    document.body.classList.remove('modal-open')
    
    // Remove all modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop')
    backdrops.forEach(backdrop => backdrop.remove())
    
    // Reset body styles that might be left over
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

const handleSubmitEdit = async () => {
  if (!validateEditForm()) return
  
  editLoading.value = true
  editGeneralError.value = ''
  
  try {
    // Call the API to update variant
    await productStore.updateVariant(editForm.value.id, {
      idCpu: editForm.value.idCpu,
      idRam: editForm.value.idRam,
      idGpu: editForm.value.idGpu,
      idMauSac: editForm.value.idMauSac,
      idOCung: editForm.value.idOCung,
      idLoaiManHinh: editForm.value.idLoaiManHinh,
      idPin: editForm.value.idPin,
      giaBan: editForm.value.giaBan,
      soLuongTon: editForm.value.soLuongTon,
      trangThai: editForm.value.trangThai
    })
    
    // Reload variants list
    await fetchProductVariants(productId.value)
    
    // Show success message
    alert('Cập nhật biến thể thành công!')
    
    // Close modal
    closeEditModal()
    
  } catch (error) {
    console.error('Error updating variant:', error)
    editGeneralError.value = error.message || 'Có lỗi xảy ra khi cập nhật biến thể'
  } finally {
    editLoading.value = false
  }
}

// Watch for changes in productStore.productDetail and sync with productDetailStore
watch(
  () => productStore.productDetail,
  (newProductDetail) => {
    if (newProductDetail && newProductDetail.id == productId.value) {
      productDetailStore.productDetail = newProductDetail
    }
  },
  { deep: true },
)

// Watch for changes in filters to trigger real-time filtering
watch([
  searchQuery, 
  () => filters.value.cpu, 
  () => filters.value.ram, 
  () => filters.value.gpu, 
  () => filters.value.color, 
  () => filters.value.storage, 
  () => filters.value.screen, 
  () => filters.value.minPrice,
  () => filters.value.maxPrice
], () => {
  // Debounce the filtering to avoid too many updates
  clearTimeout(filterDebounceTimer)
  filterDebounceTimer = setTimeout(() => {
    // Filter update
  }, 300)
})

// Watch variants to update max price
watch(productVariants, () => {
  const newMaxPrice = calculateMaxPrice()
  if (newMaxPrice !== maxPrice.value) {
    maxPrice.value = newMaxPrice
    if (!filters.value.maxPrice || filters.value.maxPrice > newMaxPrice) {
      filters.value.maxPrice = newMaxPrice
    }
  }
}, { deep: true })

// Watch for changes in productStore.products and sync the specific product
watch(
  () => productStore.products,
  (newProducts) => {
    const product = newProducts.find((p) => p.id == productId.value)
    if (product) {
      productDetailStore.productDetail = product
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

.images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.image-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.image-item .product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.image-info {
  text-align: center;
  width: 100%;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.image-info small {
  display: block;
  font-size: 0.75rem;
  line-height: 1.2;
  word-break: break-word;
}

.product-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.variant-image-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.variant-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;
}

.variant-thumbnail:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.no-image-placeholder {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #9ca3af;
  font-size: 1.25rem;
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

/* Additional styles from ProductVariantsView.vue */
.filter-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.clear-filters-link {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.clear-filters-link:hover {
  color: #16a34a;
}

.filter-content {
  padding: 20px;
}

.variants-list-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.search-box {
  width: 500px;
}

.search-box .form-control {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
}

.search-box .input-group .btn {
  border-left: none;
}

.search-box .form-control:focus + .btn {
  border-color: #86efac;
}

.variants-table {
  margin: 0;
  table-layout: fixed;
  width: 100%;
  font-size: 14px;
}

.variants-table th {
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.3px;
  padding: 8px 6px;
  border-bottom: 2px solid #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.variants-table td {
  vertical-align: middle;
  padding: 8px 6px;
  border-bottom: 1px solid #f8fafc;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.sku-code {
  background: #f1f5f9;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: #475569;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  display: inline-block;
  flex-shrink: 0;
  cursor: help;
}

.color-info {
  display: flex;
  flex-direction: column;
}

.color-name {
  font-weight: 500;
  font-size: 13px;
  color: #1f2937;
}

.color-hex {
  font-size: 11px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.stock-info {
  text-align: center;
}

.stock-info small {
  font-size: 11px;
  line-height: 1.2;
}

.bulk-actions {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.price-text {
  color: #000000 !important;
  font-weight: normal;
}

/* Debug info styling */
.debug-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: monospace;
}

/* Checkbox styling */
input[type='checkbox']:checked {
  background-color: #16a34a;
  border-color: #16a34a;
}

input[type='checkbox']:focus {
  border-color: #86efac;
  box-shadow: 0 0 0 0.2rem rgba(22, 163, 74, 0.25);
}

/* Edit Modal Styles */
#variantEditModal .modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

#variantEditModal .modal-title {
  color: #495057;
  font-weight: 600;
}

#variantEditModal .form-label {
  font-weight: 500;
  color: #374151;
}

#variantEditModal .text-danger {
  color: #dc3545 !important;
}

#variantEditModal .btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

#variantEditModal .btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

#variantEditModal .color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  display: inline-block;
}

#variantEditModal .is-invalid {
  border-color: #dc3545;
}

#variantEditModal .invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>
