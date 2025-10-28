<template>
  <div>
    <!-- Breadcrumb luôn hiển thị -->
    <Breadcrumb title="Quản Lý Khách Hàng" subTitle="Khách hàng" />

    <!-- Nếu chưa thêm khách hàng thì hiển thị toàn bộ nội dung -->
    <template v-if="!showForm">
      <div class="card mb-4">
        <div class="card-body pb-2">
          <KhachHangHeader @themMoi="showForm = true" />
          <KhachHangFilter :totalCustomers="totalCustomers" @search="onSearch" />
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <KhachHangTable ref="tableRef" @customers-updated="onCustomersUpdated" />
        </div>
      </div>
    </template>

    <!-- Nếu đang thêm khách hàng -->
    <KhachHangFormDN v-else @close="showForm = false" @success="onAddSuccess" />
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
const tableRef = ref(null)
const totalCustomers = ref(0)

// Xử lý khi thêm khách hàng thành công
const onAddSuccess = () => {
  console.log('Thêm khách hàng thành công, đóng form và refresh table')
  showForm.value = false
  // Gọi method refresh của table component
  if (tableRef.value && tableRef.value.fetchCustomers) {
    tableRef.value.fetchCustomers()
  }
  // Cập nhật tổng số khách hàng
  updateTotalCustomers()
}

// Cập nhật tổng số khách hàng
const updateTotalCustomers = () => {
  if (tableRef.value && tableRef.value.customers) {
    totalCustomers.value = tableRef.value.customers.length
  }
}

// Xử lý khi table cập nhật số lượng khách hàng
const onCustomersUpdated = (count) => {
  totalCustomers.value = count
  console.log('Tổng số khách hàng đã cập nhật:', count)
}

// Xử lý tìm kiếm
const onSearch = (searchParams) => {
  console.log('Tìm kiếm với params:', searchParams)
  // Truyền search params cho table component
  if (tableRef.value && tableRef.value.searchCustomers) {
    tableRef.value.searchCustomers(searchParams)
  }
}
</script>
