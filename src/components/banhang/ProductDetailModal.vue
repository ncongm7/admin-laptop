<template>
  <div v-if="visible" class="modal fade show d-block" style="z-index: 9999" @click.self="close">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-info-circle"></i> Chi tiết sản phẩm
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="close" :disabled="isLoading"></button>
        </div>

        <div class="modal-body">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted">Đang tải thông tin sản phẩm...</p>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i> {{ error }}
          </div>

          <!-- Product Details -->
          <div v-else-if="productDetail" class="product-detail-content">
            <!-- Header: Tên sản phẩm & Ảnh -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="product-image-section">
                  <img
                    :src="getProductMainImage()"
                    :alt="productDetail.tenSanPham"
                    class="product-main-image"
                    @error="handleImageError"
                  />
                  <div v-if="productDetail.anhSanPhams && productDetail.anhSanPhams.length > 1" class="product-thumbnails mt-2">
                    <img
                      v-for="(img, index) in productDetail.anhSanPhams.slice(0, 4)"
                      :key="index"
                      :src="img.uri"
                      :alt="`Ảnh ${index + 1}`"
                      class="thumbnail"
                      :class="{ active: selectedImageIndex === index }"
                      @click="selectedImageIndex = index"
                      @error="handleImageError"
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-8">
                <h4 class="product-name mb-2">{{ productDetail.tenSanPham }}</h4>
                <div class="product-meta mb-3">
                  <span class="badge bg-secondary me-2">Mã: {{ productDetail.maSanPham || 'N/A' }}</span>
                  <span
                    v-if="productDetail.trangThai === 1"
                    class="badge bg-success me-2"
                  >
                    <i class="bi bi-check-circle"></i> Đang bán
                  </span>
                  <span v-else class="badge bg-danger me-2">
                    <i class="bi bi-pause-circle"></i> Ngừng bán
                  </span>
                </div>
                <p v-if="productDetail.moTa" class="text-muted">{{ productDetail.moTa }}</p>
              </div>
            </div>

            <hr />

            <!-- Thông số kỹ thuật -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-gear"></i> Thông số kỹ thuật
                </h6>
                <div class="specs-grid">
                  <div v-if="productDetail.thuongHieu" class="spec-item">
                    <span class="spec-label">Thương hiệu:</span>
                    <span class="spec-value">{{ productDetail.thuongHieu }}</span>
                  </div>
                  <div v-if="productDetail.danhMuc" class="spec-item">
                    <span class="spec-label">Danh mục:</span>
                    <span class="spec-value">{{ productDetail.danhMuc }}</span>
                  </div>
                  <div v-if="productDetail.kichThuocManHinh" class="spec-item">
                    <span class="spec-label">Kích thước màn hình:</span>
                    <span class="spec-value">{{ productDetail.kichThuocManHinh }}"</span>
                  </div>
                  <div v-if="productDetail.doPhanGiai" class="spec-item">
                    <span class="spec-label">Độ phân giải:</span>
                    <span class="spec-value">{{ productDetail.doPhanGiai }}</span>
                  </div>
                  <div v-if="productDetail.congKetNoi" class="spec-item">
                    <span class="spec-label">Cổng kết nối:</span>
                    <span class="spec-value">{{ productDetail.congKetNoi }}</span>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            <!-- Danh sách biến thể -->
            <div class="row">
              <div class="col-12">
                <h6 class="section-title mb-3">
                  <i class="bi bi-list-ul"></i> Các biến thể sản phẩm
                  <span class="badge bg-info ms-2">{{ variants.length }} biến thể</span>
                </h6>

                <div v-if="variants.length === 0" class="alert alert-info">
                  <i class="bi bi-info-circle"></i> Sản phẩm chưa có biến thể nào
                </div>

                <div v-else class="variants-table-container">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Mã CTSP</th>
                        <th>Thông số</th>
                        <th>Màu sắc</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="variant in variants"
                        :key="variant.id"
                        :class="{
                          'table-success': variant.soLuongTon > 10,
                          'table-warning': variant.soLuongTon > 0 && variant.soLuongTon <= 10,
                          'table-danger': variant.soLuongTon === 0
                        }"
                      >
                        <td>
                          <code>{{ variant.maCtsp || variant.maCTSP || 'N/A' }}</code>
                        </td>
                        <td>
                          <div class="variant-specs">
                            <div v-if="variant.tenCpu">
                              <strong>CPU:</strong> {{ variant.tenCpu }}
                            </div>
                            <div v-if="variant.tenRam">
                              <strong>RAM:</strong> {{ variant.tenRam }}
                            </div>
                            <div v-if="variant.dungLuongOCung">
                              <strong>Ổ cứng:</strong> {{ variant.dungLuongOCung }}
                            </div>
                            <div v-if="variant.kichThuocManHinh">
                              <strong>Màn hình:</strong> {{ variant.kichThuocManHinh }}"
                            </div>
                          </div>
                        </td>
                        <td>
                          <span v-if="variant.tenMauSac" class="badge bg-secondary">
                            {{ variant.tenMauSac }}
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td>
                          <div class="price-cell">
                            <span
                              v-if="variant.coGiamGia && variant.giaGiam"
                              class="price-discounted"
                            >
                              {{ formatCurrency(variant.giaGiam) }}
                            </span>
                            <span v-else class="price-normal">
                              {{ formatCurrency(variant.giaBan) }}
                            </span>
                            <span
                              v-if="variant.coGiamGia && variant.giaGoc"
                              class="price-original"
                            >
                              <del>{{ formatCurrency(variant.giaGoc) }}</del>
                            </span>
                            <div v-if="variant.coGiamGia && variant.phanTramGiam" class="discount-badge">
                              <span class="badge bg-danger">-{{ variant.phanTramGiam }}%</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span :class="getStockClass(variant.soLuongTon)">
                            <i class="bi bi-box"></i> {{ variant.soLuongTon }}
                          </span>
                        </td>
                        <td>
                          <span
                            v-if="variant.soLuongTon > 0"
                            class="badge bg-success"
                          >
                            <i class="bi bi-check-circle"></i> Còn hàng
                          </span>
                          <span v-else class="badge bg-danger">
                            <i class="bi bi-x-circle"></i> Hết hàng
                          </span>
                        </td>
                        <td>
                          <button
                            v-if="variant.soLuongTon > 0"
                            class="btn btn-sm btn-primary"
                            @click="selectVariant(variant)"
                            :disabled="!canSelectVariant"
                          >
                            <i class="bi bi-cart-plus"></i> Chọn
                          </button>
                          <span v-else class="text-muted">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close" :disabled="isLoading">
            <i class="bi bi-x-circle"></i> Đóng
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getSanPhamById } from '@/service/sanpham/SanPhamService'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select-variant'])

const { error: showError } = useToast()

const isLoading = ref(false)
const error = ref('')
const productDetail = ref(null)
const selectedImageIndex = ref(0)

const variants = computed(() => {
  if (!productDetail.value) return []
  
  // Nếu có chiTietSanPhams từ product ban đầu, dùng luôn
  if (props.product?.chiTietSanPhams && props.product.chiTietSanPhams.length > 0) {
    return props.product.chiTietSanPhams
  }
  
  // Nếu productDetail có chiTietSanPhams
  if (productDetail.value.chiTietSanPhams && productDetail.value.chiTietSanPhams.length > 0) {
    return productDetail.value.chiTietSanPhams
  }
  
  return []
})

const canSelectVariant = computed(() => {
  return true // Có thể chọn biến thể
})

/**
 * Lấy ảnh chính của sản phẩm
 */
const getProductMainImage = () => {
  if (!productDetail.value) return 'https://via.placeholder.com/400x400?text=No+Image'
  
  const images = productDetail.value.anhSanPhams || []
  if (images.length === 0) return 'https://via.placeholder.com/400x400?text=No+Image'
  
  // Lấy ảnh đã chọn hoặc ảnh mặc định
  const selectedImage = images[selectedImageIndex.value] || images.find(img => img.is_default) || images[0]
  return selectedImage.uri || 'https://via.placeholder.com/400x400?text=No+Image'
}

/**
 * Xử lý lỗi ảnh
 */
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
}

/**
 * Load chi tiết sản phẩm từ API
 */
const loadProductDetail = async () => {
  if (!props.product || !props.product.id) {
    error.value = 'Không có thông tin sản phẩm!'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // Nếu product đã có đầy đủ thông tin (từ kết quả tìm kiếm), dùng luôn
    if (props.product.chiTietSanPhams && props.product.chiTietSanPhams.length > 0) {
      productDetail.value = props.product
      console.log('✅ Sử dụng dữ liệu sản phẩm từ props:', productDetail.value)
    } else {
      // Gọi API để lấy chi tiết đầy đủ
      const response = await getSanPhamById(props.product.id)
      
      if (response && response.data) {
        productDetail.value = response.data
        console.log('✅ Đã load chi tiết sản phẩm từ API:', productDetail.value)
      } else {
        error.value = 'Không tìm thấy thông tin sản phẩm!'
      }
    }
  } catch (err) {
    console.error('❌ Lỗi khi load chi tiết sản phẩm:', err)
    error.value = err.response?.data?.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại!'
  } finally {
    isLoading.value = false
  }
}

/**
 * Chọn biến thể và emit event
 */
const selectVariant = (variant) => {
  if (variant.soLuongTon <= 0) {
    showError('Sản phẩm này đã hết hàng!')
    return
  }

  emit('select-variant', {
    variant: variant,
    product: productDetail.value || props.product
  })
}

/**
 * Đóng modal
 */
const close = () => {
  emit('close')
}

/**
 * Format currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value || 0)
}

/**
 * Get stock class
 */
const getStockClass = (stock) => {
  if (stock > 10) return 'text-success fw-bold'
  if (stock > 0) return 'text-warning fw-bold'
  return 'text-danger fw-bold'
}

// Watch visible để load dữ liệu khi mở modal
watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedImageIndex.value = 0
    loadProductDetail()
  } else {
    productDetail.value = null
    error.value = ''
  }
})

// Watch product để reload khi product thay đổi
watch(() => props.product, () => {
  if (props.visible) {
    loadProductDetail()
  }
}, { deep: true })
</script>

<style scoped>
.modal-backdrop {
  z-index: 9998;
}

.modal {
  z-index: 9999;
}

.product-detail-content {
  padding: 0.5rem 0;
}

.product-image-section {
  text-align: center;
}

.product-main-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.product-thumbnails {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumbnail:hover {
  border-color: #0dcaf0;
  transform: scale(1.1);
}

.thumbnail.active {
  border-color: #0dcaf0;
  box-shadow: 0 0 8px rgba(13, 202, 240, 0.5);
}

.product-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.spec-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.spec-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.variants-table-container {
  max-height: 400px;
  overflow-y: auto;
}

.variant-specs {
  font-size: 0.85rem;
}

.variant-specs div {
  margin-bottom: 0.25rem;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-normal,
.price-discounted {
  font-size: 1rem;
  font-weight: 700;
  color: #dc3545;
}

.price-original {
  font-size: 0.85rem;
  color: #6c757d;
}

.discount-badge {
  margin-top: 0.25rem;
}

/* Scrollbar */
.variants-table-container::-webkit-scrollbar {
  width: 6px;
}

.variants-table-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.variants-table-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .specs-grid {
    grid-template-columns: 1fr;
  }

  .product-main-image {
    max-width: 100%;
  }
}
</style>

