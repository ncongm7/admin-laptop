<template>
    <div class="banhang-main-bg py-4">
        <div class="container-xl">
            <BanHangCreateInvoiceBar @create-invoice="handleCreateInvoice" class="mb-4" />
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="banhang-title">
                    <h2 class="fw-bold mb-1"><i class="lucide lucide-shopping-cart"></i> Bán hàng</h2>
                    <div class="banhang-title-bar"></div>
                </div>
                <button class="btn btn-outline-primary rounded-pill px-4 banhang-pending-btn"
                    @click="showPending = !showPending">
                    <i class="lucide lucide-clock"></i> Hóa đơn chờ
                </button>
            </div>
            <div class="row g-4">
                <div class="col-lg-8 col-12">
                    <BanHangLeft />
                </div>
                <div class="col-lg-4 col-12">
                    <BanHangRight />
                </div>
            </div>
            <div v-if="showPending" class="banhang-pending-popup shadow-lg p-4">
                <PendingOrders :orders="pendingOrders" @remove="handleRemovePendingOrder"
                    @refresh="handleRefreshPendingOrders" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import BanHangLeft from '@/views/banhang/trai/BanHangLeft.vue'
import BanHangRight from '@/views/banhang/phai/BanHangRight.vue'
import PendingOrders from '@/components/banhang/trai/PendingOrders.vue'
import BanHangCreateInvoiceBar from '@/components/banhang/BanHangCreateInvoiceBar.vue'
const showPending = ref(false)
const pendingOrders = ref([])
function handleRemovePendingOrder(order) { }
function handleRefreshPendingOrders() { }
function handleCreateInvoice() {
    // TODO: Xử lý logic tạo hóa đơn mới (ví dụ: mở modal, chuyển tab, reset form...)
}
</script>

<style scoped>
.banhang-main-bg {
    min-height: 100vh;
    background: linear-gradient(120deg, #f6f8fa 60%, #e3f0ff 100%);
}

.banhang-title {
    margin-top: 1rem;
}

.banhang-title h2 {
    color: #0d6efd;
    letter-spacing: 1px;
    font-family: 'Inter', 'Roboto', Arial, sans-serif;
}

.banhang-title-bar {
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #0d6efd, #67c6ff);
    border-radius: 2px;
    margin-bottom: 0.5rem;
}

.banhang-pending-btn {
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px #0d6efd22;
}

.banhang-pending-popup {
    position: fixed;
    top: 90px;
    right: 40px;
    background: #fff;
    border-radius: 18px;
    z-index: 1000;
    min-width: 340px;
    max-width: 90vw;
    box-shadow: 0 8px 32px #0d6efd22;
}

@media (max-width: 991px) {
    .banhang-title {
        margin-top: 0.5rem;
    }

    .banhang-title-bar {
        width: 40px;
        height: 3px;
    }

    .banhang-pending-popup {
        right: 10px;
        top: 70px;
        min-width: 220px;
    }
}

@media (max-width: 600px) {
    .banhang-title {
        margin-top: 0.2rem;
    }

    .banhang-title-bar {
        width: 30px;
        height: 2px;
    }

    .banhang-pending-popup {
        right: 2px;
        top: 60px;
        min-width: 120px;
    }
}
</style>