<template>
    <div class="modal fade show d-block" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Hóa đơn chờ</h5>
                    <button type="button" class="btn-close btn-close-white" @click="close"></button>
                </div>
                <div class="modal-body">
                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>

                    <div v-else>
                        <div v-if="bills.length === 0" class="text-center py-4 text-muted">
                            <i class="bi bi-receipt" style="font-size: 3rem;"></i>
                            <p class="mt-3">Không có hóa đơn chờ</p>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Mã HD</th>
                                        <th>Thời gian</th>
                                        <th>Khách hàng</th>
                                        <th>Tổng tiền</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="bill in bills" :key="bill.id">
                                        <td>{{ bill.code }}</td>
                                        <td>{{ formatDateTime(bill.createdAt) }}</td>
                                        <td>{{ bill.customerName || 'Khách vãng lai' }}</td>
                                        <td>{{ formatPrice(bill.total) }}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" @click="selectBill(bill)">
                                                <i class="bi bi-check-circle"></i> Chọn
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="close">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatPrice, formatDateTime } from '@/utils/helpers'

const emit = defineEmits(['close', 'select-bill'])

const loading = ref(true)
const bills = ref([])

const close = () => {
    emit('close')
}

const selectBill = (bill) => {
    emit('select-bill', bill)
}

// Giả lập dữ liệu - thực tế sẽ gọi API
onMounted(() => {
    setTimeout(() => {
        bills.value = [
            {
                id: 1,
                code: 'HD20230001',
                createdAt: new Date(),
                customerName: 'Nguyễn Văn A',
                total: 25000000,
                items: [
                    { id: 1, name: 'MacBook Pro M1', price: 25000000, quantity: 1 }
                ]
            },
            {
                id: 2,
                code: 'HD20230002',
                createdAt: new Date(Date.now() - 3600000),
                customerName: null,
                total: 18000000,
                items: [
                    { id: 2, name: 'Dell XPS 13', price: 18000000, quantity: 1 }
                ]
            }
        ]
        loading.value = false
    }, 800)
})
</script>

<style scoped>
.modal-content {
    max-height: 80vh;
    display: flex;
    flex-direction: column;
}

.modal-body {
    overflow-y: auto;
}
</style>    