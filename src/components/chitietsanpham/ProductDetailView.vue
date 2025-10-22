<template>
    <div class="product-detail-view">
        <div class="row">
            <div class="col-12">
                <button class="btn btn-outline-secondary mb-3" @click="goBack">
                    <i class="bi bi-arrow-left me-1"></i> Quay lại
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="card">
                    <div class="card-body">
                        <ProductImageGallery :images="variant.anhSanPhams || []" />
                    </div>
                </div>
            </div>

            <div class="col-md-7">
                <div class="card">
                    <div class="card-header">
                        <h4 class="mb-0">{{ variant.tenSP || 'Chi tiết sản phẩm' }}</h4>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-6">
                                <div class="attribute-item">
                                    <label>Giá bán:</label>
                                    <span class="value">{{ formatCurrency(variant.giaBan) }}</span>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="attribute-item">
                                    <label>Bảo hành:</label>
                                    <span class="value">{{ variant.thoiGianBaoHanh }} tháng</span>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="attribute-item">
                                    <label>RAM:</label>
                                    <span class="value">{{ variant.ram?.dungLuong || 'N/A' }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>Ổ cứng:</label>
                                    <span class="value">
                                        {{ variant.oCung?.tenOCung || 'N/A' }} ({{ variant.oCung?.loaiOCung || 'N/A' }})
                                    </span>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="attribute-item">
                                    <label>Màu sắc:</label>
                                    <span class="value">{{ variant.mauSac?.tenMau || 'N/A' }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>Số lượng tồn:</label>
                                    <span class="value">{{ variant.imeiCount || 0 }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        <h5 class="mb-0">Thông tin sản phẩm gốc</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="attribute-item">
                                    <label>Tên sản phẩm:</label>
                                    <span class="value">{{ product.tenSanPham }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>Hãng:</label>
                                    <span class="value">{{ product.hang?.tenHang || 'N/A' }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>CPU:</label>
                                    <span class="value">{{ product.cpu?.tenCPU || 'N/A' }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>GPU:</label>
                                    <span class="value">{{ product.gpu?.tenGPU || 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="attribute-item">
                                    <label>Màn hình:</label>
                                    <span class="value">
                                        {{ product.kichThuocManHinh?.giaTri || 'N/A' }} -
                                        {{ product.loaiManHinh?.congNghe || 'N/A' }}
                                    </span>
                                </div>

                                <div class="attribute-item">
                                    <label>Hệ điều hành:</label>
                                    <span class="value">{{ product.heDieuHanh?.tenHĐH || 'N/A' }}</span>
                                </div>

                                <div class="attribute-item">
                                    <label>Pin:</label>
                                    <span class="value">{{ product.dungLuongPin?.dungLuongWh || 'N/A' }} Wh</span>
                                </div>

                                <div class="attribute-item">
                                    <label>Camera:</label>
                                    <span class="value">{{ product.camera?.doPhanGiai || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <ImeiManagement :variant-id="variant.id" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/formatters'
import { useProductDetailStore } from '@/stores/productDetailStore'
import { useProductStore } from '@/stores/productStore'
import ProductImageGallery from '@/components/chitietsanpham/ProductImageGallery.vue'
import ImeiManagement from '@/components/chitietsanpham/ImeiManagement.vue'

const route = useRoute()
const router = useRouter()
const productDetailStore = useProductDetailStore()
const productStore = useProductStore()

const variantId = ref(route.params.variantId)
const variant = ref({})
const product = ref({})

// Lấy thông tin chi tiết biến thể
onMounted(async () => {
    try {
        const response = await productDetailStore.fetchVariantDetail(variantId.value)
        variant.value = response

        // Lấy thông tin sản phẩm gốc
        if (response.san_pham_id) {
            const productResponse = await productStore.fetchProductById(response.san_pham_id)
            product.value = productResponse
        }
    } catch (error) {
        console.error('Lỗi khi lấy thông tin biến thể:', error)
    }
})

const goBack = () => {
    router.push(`/products/${product.value.id}/variants`)
}
</script>

<style scoped>
.product-detail-view {
    padding: 20px 0;
}

.attribute-item {
    margin-bottom: 15px;
}

.attribute-item label {
    display: block;
    font-weight: 500;
    color: #6c757d;
    margin-bottom: 5px;
}

.attribute-item .value {
    font-size: 1.1rem;
}
</style>