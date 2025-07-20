<template>
    <div class="modal fade" id="productDetailModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Chi tiết sản phẩm</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img :src="product.image" class="img-fluid rounded" alt="Product" />
                        </div>
                        <div class="col-md-6">
                            <h6>{{ product.name }}</h6>
                            <p class="text-muted">{{ product.code }}</p>
                            <div class="mb-3">
                                <label class="form-label">Chọn cấu hình:</label>
                                <select class="form-select" v-model="selectedConfig">
                                    <option v-for="config in product.configs" :key="config.id" :value="config.id">
                                        {{ config.name }} - {{ config.price.toLocaleString() }}₫
                                    </option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Chọn IMEI:</label>
                                <select class="form-select" v-model="selectedImei">
                                    <option value="">Tự động chọn</option>
                                    <option v-for="imei in availableImeis" :key="imei" :value="imei">{{ imei }}</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Số lượng:</label>
                                <input type="number" class="form-control" v-model="quantity" min="1" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button type="button" class="btn btn-primary"
                        @click="$emit('add-to-cart', { product, selectedConfig, selectedImei, quantity })">Thêm vào
                        giỏ</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const selectedConfig = ref('')
const selectedImei = ref('')
const quantity = ref(1)
// Placeholder data
const product = ref({
    name: 'MacBook Pro 14',
    code: 'MBP14',
    image: 'https://via.placeholder.com/300x200',
    configs: [
        { id: 1, name: 'RAM 8GB, SSD 256GB', price: 35000000 },
        { id: 2, name: 'RAM 16GB, SSD 512GB', price: 40000000 }
    ]
})
const availableImeis = ref(['IMEI001', 'IMEI002', 'IMEI003'])
// Emits: add-to-cart
</script>

<style scoped>
.modal-body {
    max-height: 70vh;
    overflow-y: auto;
}
</style>