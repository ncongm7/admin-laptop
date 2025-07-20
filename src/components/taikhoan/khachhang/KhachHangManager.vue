<template>
    <div>
        <div class="card mb-4">
            <div class="card-body pb-2">
                <KhachHangHeader />
                <KhachHangFilter />
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <KhachHangTable />
            </div>
        </div>
    </div>
</template>
<script setup>
import KhachHangHeader from './KhachHangHeader.vue'
import KhachHangFilter from './KhachHangFilter.vue'
import KhachHangTable from './KhachHangTable.vue'
</script>
<style scoped>
.card {
    border-radius: 14px;
    box-shadow: 0 2px 10px rgba(60, 72, 88, 0.08);
    background: #fff;
    border: none;
    margin-bottom: 24px;
}
</style>