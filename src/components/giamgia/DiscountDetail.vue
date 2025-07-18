<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Chi tiết chương trình giảm giá</h5>
                    <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Thông tin chính -->
                        <div class="col-md-8">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h4 class="card-title">{{ discount.tenDotGiamGia }}</h4>
                                    <p class="card-text text-muted">{{ discount.moTa }}</p>

                                    <div class="row mt-4">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label text-muted">Thời gian bắt đầu</label>
                                                <p>{{ formatDateTime(discount.thoiGianBatDau) }}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label text-muted">Người tạo</label>
                                                <div class="d-flex align-items-center">
                                                    <img :src="discount.createdByAvatar || defaultAvatar"
                                                        class="rounded-circle me-2" width="30" height="30">
                                                    <span>{{ discount.createdByName }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label text-muted">Thời gian kết thúc</label>
                                                <p>{{ formatDateTime(discount.thoiGianKetThuc) }}</p>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label text-muted">Trạng thái</label>
                                                <p>
                                                    <span class="badge" :class="statusBadgeClass">
                                                        {{ discountStatus }}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Danh sách sản phẩm áp dụng -->
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Sản phẩm áp dụng</h5>
                                    <button class="btn btn-sm btn-primary" @click="openApplyModal">
                                        <i class="bi bi-plus"></i> Thêm sản phẩm
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Giá gốc</th>
                                                    <th>Giá giảm</th>
                                                    <th>% Giảm</th>
                                                    <th>Đã bán</th>
                                                    <th>Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="product in appliedProducts" :key="product.id">
                                                    <td>
                                                        <div class="d-flex align-items-center">
                                                            <img :src="product.image || defaultProductImage"
                                                                class="rounded me-2" width="40" height="40">
                                                            <div>
                                                                <strong>{{ product.name }}</strong>
                                                                <div class="text-muted small">{{ product.sku }}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{{ formatCurrency(product.originalPrice) }}</td>
                                                    <td>{{ formatCurrency(product.discountedPrice) }}</td>
                                                    <td>
                                                        <span class="badge bg-danger">
                                                            {{ product.discountPercentage }}%
                                                        </span>
                                                    </td>
                                                    <td>{{ product.soldQuantity }}</td>
                                                    <td>
                                                        <button class="btn btn-sm btn-outline-danger"
                                                            @click="removeProduct(product)">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr v-if="appliedProducts.length === 0">
                                                    <td colspan="6" class="text-center py-4 text-muted">
                                                        Chưa có sản phẩm nào được áp dụng
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Thống kê -->
                        <div class="col-md-4">
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h5 class="card-title">Thống kê hiệu quả</h5>

                                    <div class="mb-3">
                                        <label class="form-label text-muted">Mục tiêu doanh thu</label>
                                        <h4>{{ formatCurrency(discount.mucTieuDoanhThu || 0) }}</h4>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted">Doanh thu đạt được</label>
                                        <h4>{{ formatCurrency(discount.doanhThu || 0) }}</h4>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted">Tỷ lệ hoàn thành</label>
                                        <div class="d-flex align-items-center">
                                            <div class="progress flex-grow-1 me-2" style="height: 10px;">
                                                <div class="progress-bar bg-success"
                                                    :style="{ width: `${effectiveness}%` }"></div>
                                            </div>
                                            <span>{{ effectiveness }}%</span>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted">Số sản phẩm áp dụng</label>
                                        <h4>{{ appliedProducts.length }}</h4>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label text-muted">Số đơn hàng</label>
                                        <h4>{{ discount.soDonHang || 0 }}</h4>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">Hành động</h5>
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-outline-primary" @click="$emit('edit', discount)">
                                            <i class="bi bi-pencil"></i> Chỉnh sửa
                                        </button>
                                        <button class="btn btn-outline-danger" @click="confirmDelete">
                                            <i class="bi bi-trash"></i> Xóa chương trình
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDiscountStore } from '@/stores/discountStore'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const props = defineProps({
    discount: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close', 'edit'])

const discountStore = useDiscountStore()
const appliedProducts = ref([])
const loading = ref(false)

const discountStatus = computed(() => {
    const now = new Date()
    const start = new Date(props.discount.thoiGianBatDau)
    const end = new Date(props.discount.thoiGianKetThuc)

    if (now < start) return 'Sắp diễn ra'
    if (now > end) return 'Đã kết thúc'
    return 'Đang hoạt động'
})

const statusBadgeClass = computed(() => {
    const now = new Date()
    const start = new Date(props.discount.thoiGianBatDau)
    const end = new Date(props.discount.thoiGianKetThuc)

    if (now < start) return 'bg-warning'
    if (now > end) return 'bg-secondary'
    return 'bg-success'
})

const effectiveness = computed(() => {
    if (!props.discount.doanhThu || !props.discount.mucTieuDoanhThu) return 0
    return Math.min(100, Math.round((props.discount.doanhThu / props.discount.mucTieuDoanhThu) * 100))
})

const fetchAppliedProducts = async () => {
    try {
        loading.value = true
        const products = await discountStore.getAppliedProducts(props.discount.id)
        appliedProducts.value = products
    } catch (error) {
        console.error('Error fetching applied products:', error)
    } finally {
        loading.value = false
    }
}

const removeProduct = async (product) => {
    if (confirm(`Bạn chắc chắn muốn xóa sản phẩm "${product.name}" khỏi chương trình?`)) {
        try {
            await discountStore.removeProductFromDiscount(props.discount.id, product.id)
            await fetchAppliedProducts()
        } catch (error) {
            console.error('Error removing product:', error)
        }
    }
}

const openApplyModal = () => {
    emit('close')
    emit('apply-products')
}

const confirmDelete = () => {
    if (confirm(`Bạn chắc chắn muốn xóa chương trình "${props.discount.tenDotGiamGia}"?`)) {
        emit('close')
        emit('delete', props.discount)
    }
}

watch(() => props.discount, () => {
    if (props.discount) {
        fetchAppliedProducts()
    }
}, { immediate: true })
</script>

<style scoped>
.modal-content {
    border: none;
    border-radius: 10px;
    overflow: hidden;
}

.modal-header {
    padding: 15px 20px;
}

.modal-title {
    font-weight: 600;
}

.modal-body {
    padding: 20px;
}

.card {
    border-radius: 8px;
    border: 1px solid #e9ecef;
    margin-bottom: 20px;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 15px 20px;
}

.card-body {
    padding: 20px;
}

.table-responsive {
    border-radius: 8px;
    overflow: hidden;
}

.table thead th {
    background-color: #f1f5fd;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
    background-color: #f8f9fa;
}

.progress {
    background-color: #e9ecef;
    border-radius: 10px;
}

.badge {
    font-weight: 500;
    padding: 6px 10px;
    font-size: 0.8rem;
}

.form-label {
    font-weight: 500;
    color: #6c757d;
    margin-bottom: 5px;
}

.btn {
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 500;
}
</style>