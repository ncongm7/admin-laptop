<template>
  <div>
    <!-- Breadcrumb luôn hiển thị -->
    <Breadcrumb title="Quản Lý Khách Hàng" subTitle="Khách hàng" />

    <!-- Nếu chưa thêm khách hàng thì hiển thị toàn bộ nội dung -->
    <template v-if="!showForm">
      <div class="card mb-4">
        <div class="card-body pb-2">
          <KhachHangHeader @themMoi="showForm = true" />
          <KhachHangFilter />
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <KhachHangTable />
        </div>
      </div>
    </template>

    <!-- Nếu đang thêm khách hàng -->
    <KhachHangFormDN v-else @close="showForm = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import Breadcrumb from './Breadcrumd.vue'
import KhachHangHeader from './KhachHangHeader.vue'
import KhachHangFilter from './KhachHangFilter.vue'
import KhachHangTable from './KhachHangTable.vue'
import KhachHangFormDN from './KhachHangFormDN.vue'

const showForm = ref(false)
</script>
