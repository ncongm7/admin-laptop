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
          <!-- Variants List Section -->
          <div class="variants-list-section">
            <div class="list-header d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-3">
                <h5 class="mb-0">Danh sách biến thể</h5>
                <span class="badge bg-success">{{ productVariants.length }}</span>
              </div>
            </div>

            <!-- Variants Table -->
            <div class="table-responsive">
              <table class="table table-hover align-middle variants-table">
                <thead class="table-light">
                  <tr>
                    <th width="30">STT</th>
                    <th width="100">SKU</th>
                    <th width="60">MÀU</th>
                    <th width="80">CPU</th>
                    <th width="60">RAM</th>
                    <th width="70">GPU</th>
                    <th width="70">Ổ CỨNG</th>
                    <th width="70">PIN</th>
                    <th width="70">MÀN HÌNH</th>
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
                    <td colspan="12" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="productVariants.length === 0">
                    <td colspan="12" class="text-center py-5 text-muted">
                      <i class="bi bi-box-seam display-5"></i>
                      <p class="mt-3">Không có biến thể nào</p>
                    </td>
                  </tr>
                  <tr v-for="(variant, index) in productVariants" :key="variant.id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <code class="sku-code">{{ variant.maCtsp }}</code>
                    </td>
                    <td>{{ variant.tenMauSac || 'N/A' }}</td>
                    <td>{{ variant.tenCpu || 'N/A' }}</td>
                    <td>{{ variant.tenRam || 'N/A' }}</td>
                    <td>{{ variant.tenGpu || 'N/A' }}</td>
                    <td>{{ variant.dungLuongOCung || 'N/A' }}</td>
                    <td>{{ variant.dungLuongPin || 'N/A' }}</td>
                    <td>{{ variant.kichThuocManHinh || 'N/A' }}</td>
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
                    <td class="text-center actions-column">
                      <div class="btn-group btn-group-sm" role="group">
                        <button
                          type="button"
                          class="btn btn-outline-info btn-sm"
                          @click="openSerialModal(variant)"
                          title="Quản lý serial"
                        >
                          <i class="bi bi-list-ol"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-secondary btn-sm"
                          @click="editVariant(variant)"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm"
                          @click="confirmDelete(variant.id)"
                          title="Xóa biến thể"
                        hidden>
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

  <!-- Edit Variant Modal (Component) -->
  <VariantEditModal
    ref="editModal"
    @updated="handleVariantUpdated"
  />

  <!-- Serial Management Modal -->
  <SerialManagementModal
    v-model="showSerialModal"
    :variant="currentVariantForSerial"
    @save="handleSerialSaved"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductDetailStore } from '@/stores/sanpham/productDetailStore'
import { useProductStore } from '@/stores/sanpham/productStore'
import { formatCurrency } from '@/utils/formatters'
import { getCTSPBySanPham, getHinhAnhByCtspId, deleteCTSPWithCascade, getSanPhamById } from '@/service/sanpham/SanPhamService'
import VariantEditModal from '@/components/sanpham/quanlisanpham/VariantEditModal.vue'
import SerialManagementModal from '@/components/sanpham/quanlisanpham/SerialManagementModal.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const productDetailStore = useProductDetailStore()

const productId = ref(route.params.productId)
const loading = ref(false)
const variantsLoading = ref(false)

// Serial modal state
const showSerialModal = ref(false)
const currentVariantForSerial = ref(null)

// Modal refs
const editModal = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    if (!productId.value) {
      console.error('Product ID is not available')
      return
    }

    // Đảm bảo mảng variants đã được khởi tạo
    if (!productDetailStore.variants) {
      productDetailStore.variants = []
    }

    // Luôn load lại attributes (CPU, RAM, v.v.) từ backend
    await productStore.loadAttributes()

    // Gọi API lấy chi tiết sản phẩm trực tiếp từ backend theo productId
    const response = await getSanPhamById(productId.value)
    const detail = response.data || response

    if (detail) {
      // Lưu chi tiết sản phẩm vào productDetailStore để dùng cho computed selectedProduct
      productDetailStore.productDetail = detail
    } else {
      console.warn('No product detail found for id:', productId.value)
    }

    // Luôn tải danh sách biến thể từ backend dựa trên productId (không phụ thuộc vào store tạm)
    await fetchProductVariants(productId.value)
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
        } catch (err) {
          console.warn(`Failed to load images for variant ${variant.id}`)
        }

        return {
          ...variant,
          images: images,
          // Map flat fields to nested objects for consistency
          mauSac: variant.tenMauSac ? {
            tenMau: variant.tenMauSac,
            hexCode: variant.hexCodeMauSac || '#000000',
            id: variant.idMauSac
          } : null,
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

// Computed property: luôn lấy thông tin sản phẩm từ productDetailStore
// (đã được load trực tiếp từ backend trong onMounted),
// tránh phụ thuộc vào productStore.products vì store này bị reset sau F5
const selectedProduct = computed(() => {
  return productDetailStore.productDetail || {}
})

const productVariants = computed(() => productDetailStore.variants || [])

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

// Serial Management Functions
const openSerialModal = async (variant) => {
  console.log('🔵 Opening serial modal for variant:', variant)
  console.log('🔵 Setting currentVariantForSerial to:', variant)
  currentVariantForSerial.value = variant
  showSerialModal.value = true

  // Debug: Check if variant is properly set
  setTimeout(() => {
    console.log('🔵 After setting - currentVariantForSerial.value:', currentVariantForSerial.value)
    console.log('🔵 After setting - showSerialModal.value:', showSerialModal.value)
  }, 100)
}

const handleSerialSaved = async ({ variantId, serials }) => {
  console.log('🔵 handleSerialSaved called:', { variantId, serials })
  console.log('🔵 Received serials array:', serials)
  console.log('🔵 Serials length:', serials?.length || 0)
  console.log('🔵 First few serials:', serials?.slice(0, 3))
  console.log('🔵 This will close modal and reset currentVariantForSerial')

  // Count only active serials (trangThai = 1)
  const activeSerialCount = (serials || []).filter(s => s.trangThai === 1).length
  console.log('Serials saved for variant:', variantId, 'Total:', serials?.length || 0, 'Active:', activeSerialCount)

  // Update the specific variant's stock count immediately for better UX
  if (variantId && productDetailStore.variants) {
    const variantIndex = productDetailStore.variants.findIndex(v => v.id === variantId)
    if (variantIndex !== -1) {
      productDetailStore.variants[variantIndex].soLuongTon = activeSerialCount
      console.log('✅ Updated variant stock count locally:', variantId, 'New stock:', activeSerialCount)
    }
  }

  showSerialModal.value = false
  currentVariantForSerial.value = null

  // Reload variants to reflect updated stock count from backend
  await fetchProductVariants(productId.value)
}

// Edit variant function
const editVariant = (variant) => {
  if (editModal.value) {
    editModal.value.openModal(variant)
  }
}

const handleVariantUpdated = async () => {
  // Reload variants after update
  await fetchProductVariants(productId.value)
}

// Delete variant function
const confirmDelete = async (variantId) => {
  console.log('confirmDelete called with variantId:', variantId)

  // Find the variant to get its details for confirmation
  const variant = productVariants.value.find(v => v.id === variantId)
  if (!variant) {
    alert('Không tìm thấy biến thể để xóa')
    return
  }

  // Enhanced confirmation message with variant details
  const confirmMessage = `Bạn có chắc muốn xóa biến thể này?\n\nMã biến thể: ${variant.maCtsp}\nCấu hình: ${getVariantSpecs(variant)}\n\nLưu ý: Tất cả serial và dữ liệu liên quan sẽ bị xóa vĩnh viễn!`

  if (confirm(confirmMessage)) {
    try {
      loading.value = true
      console.log('Deleting variant:', variantId)

      // Call API to delete variant with cascade (this will delete serials and images first)
      await deleteCTSPWithCascade(variantId)

      // Remove from local state immediately for better UX
      const variantIndex = productVariants.value.findIndex(v => v.id === variantId)
      if (variantIndex !== -1) {
        productDetailStore.variants.splice(variantIndex, 1)
      }

      // Refresh data from server to ensure consistency
      await fetchProductVariants(productId.value)

      alert('Đã xóa biến thể thành công!')
      console.log('Variant deleted successfully:', variantId)

    } catch (error) {
      console.error('Error deleting variant:', error)

      // Provide detailed error messages
      let errorMessage = 'Lỗi khi xóa biến thể'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.status === 404) {
        errorMessage = 'Biến thể không tồn tại hoặc đã bị xóa'
      } else if (error.response?.status === 400) {
        errorMessage = 'Không thể xóa biến thể do ràng buộc dữ liệu'
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server khi xóa biến thể. Vui lòng thử lại sau.'
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(errorMessage)

      // Refresh data in case of partial deletion
      await fetchProductVariants(productId.value)
    } finally {
      loading.value = false
    }
  }
}

// Get variant specifications string
const getVariantSpecs = (variant) => {
  if (!variant) return 'N/A'

  const specs = []
  if (variant.tenCpu) specs.push(`CPU: ${variant.tenCpu}`)
  if (variant.tenRam) specs.push(`RAM: ${variant.tenRam}`)
  if (variant.tenGpu) specs.push(`GPU: ${variant.tenGpu}`)
  if (variant.tenMauSac) specs.push(`Màu: ${variant.tenMauSac}`)

  return specs.length > 0 ? specs.join(', ') : 'N/A'
}

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN')
}

const statusClass = (status) => {
  return status === 1 ? 'badge bg-success' : 'badge bg-secondary'
}

const stockStatusClass = (stock) => {
  if (stock > 10) return 'badge bg-success'
  if (stock > 0) return 'badge bg-warning'
  return 'badge bg-danger'
}

const goBack = () => {
  router.push('/quan-li-san-pham')
}
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

.info-section {
  padding: 1rem 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-value {
  color: #6b7280;
  font-weight: 500;
}

.images-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  text-align: center;
}

.product-image {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.variants-table {
  table-layout: fixed !important;
  width: 100% !important;
}

.sku-code {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.price-text {
  font-weight: 600;
  color: #059669;
}

.stock-info {
  text-align: center;
}

.actions-column {
  min-width: 120px !important;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
