<style>
table th, table td {
  vertical-align: middle;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

</style>
<template>
  <div>
  <table class="table table-bordered table-hover">
    <thead class="table-light">
      <tr>
         <th><input type="checkbox" v-model="selectAll" @change="toggleAll" /></th>
        <th>#</th>
        <th>Mã KH</th>
        <th>Họ và tên</th>
        <th>Điện thoại</th>
        <th>Email</th>
        <th>Sinh nhật</th>
        <th>Địa chỉ</th>
        <th>Giới tính</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(customer, index) in customers"
          :key="customer.id"
          @dblclick="openDetail(customer)">
         <th> <input type="checkbox" v-model="selected" :value="customer.id" /></th>
        <td>{{ index + 1 }}</td>
        <td>{{ customer.code }}</td>
        <td>{{ customer.name }}</td>
        <td>{{ customer.phone }}</td>
        <td>{{ customer.email }}</td>
        <td>{{ customer.birthday }}</td>
        <td>{{ customer.source }}</td>
        <td>{{ customer.contact }}</td>
      </tr>
    </tbody>
  </table>
<div class="d-flex  gap-2 mx-auto" >
  <button type="button" class="btn btn-success">Email</button>
  <button type="button" class="btn btn-success">SMS</button>
</div>

 <!-- 🟡 Modal chi tiết khách hàng -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.3);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết khách hàng</h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <CustomerDetail :data="selectedCustomer" />
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import CustomerDetail  from './KhachHangForrm.vue'
export default {
  components: { CustomerDetail  },
  data() {
    return {
      customers: [
        {
          id: 1
           , code: 'KH0368'
           , name: 'Nguyễn Thanh Huyền'
           , phone: '0953232323'
           , email: 'hien@gmail.com'
           , birthday: '06/07/2023'
           , source: 'Landing page'
           , contact: 'Nam'
        },

         {
          id: 1
           , code: 'KH0368'
           , name: 'Nguyễn Thanh Huyền'
           , phone: '0953232323'
           , email: 'hien@gmail.com'
           , birthday: '06/07/2023'
           , source: 'Landing page'
           , contact: 'Nam'
        },

         {
          id: 1
           , code: 'KH0368'
           , name: 'Nguyễn Thanh Huyền'
           , phone: '0953232323'
           , email: 'hien@gmail.com'
           , birthday: '06/07/2023'
           , source: 'Landing page'
           , contact: 'Nam'
        },

         {
          id: 1
           , code: 'KH0368'
           , name: 'Nguyễn Thanh Huyền'
           , phone: '0953232323'
           , email: 'hien@gmail.com'
           , birthday: '06/07/2023'
           , source: 'Landing page'
           , contact: 'Nam'
        },
        // ... các bản ghi khác
      ],
      selectedCustomer: null,
      showModal: false
    }
  },
   methods: {
    openDetail(customer) {
      this.selectedCustomer = customer
      this.showModal = true
    }
  }
}
</script>


