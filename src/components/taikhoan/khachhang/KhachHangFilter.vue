<template>
  <div class="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
    <div class="d-flex align-items-center gap-2 flex-grow-1">
      <input type="text" class="form-control" placeholder="Tên, SĐT, Email..." v-model="keyword" />
    </div>
    <div class="col-md-2">
      <button class="btn btn-secondary w-100">Tìm kiếm</button>
    </div>
    <div class="col-4"></div>
     <div class="d-flex align-items-center gap-2">
      <!-- <label class="form-check-label" for="checkIndeterminateDisabled">
        Nhân viên chăm sóc/Bán hàng
      </label> -->
      <select class="form-select form-select-sm" v-model="status">
        <option value="">Nhân viên chăm sóc/Bán hàng</option>
        <option value="new">Nhân Viên 1</option>
        <option value="contacted">Nhân Viên 2</option>
        <option value="not_contacted">Nhân Viên 3</option>
      </select>
    </div>
  </div>
<div class="row gy-2 gx-3 p-3 align-items-center">
<div class="d-flex gap-2 mx-auto col-auto" >
  <button type="button" class="btn btn-primary">All</button>
<button type="button" class="btn btn-secondary">Khách quen</button>
<button type="button" class="btn btn-success">Khách mới</button>
</div>



<div class="d-flex gap-3 mx-auto col-auto">
   <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
      <button class="btn btn-sm btn-outline-secondary">&lt;</button>
      <button class="btn btn-sm btn-outline-secondary">&gt;</button>

      <select class="form-select form-select-sm" style="width: 120px;">
        <option value="10">Hiển thị 10 kết</option>
        <option value="20" selected>Hiển thị 20 kết</option>
        <option value="50">Hiển thị 50 kết</option>
      </select>
       <button class="btn btn-sm btn-outline-primary"><i class="fas fa-columns"></i></button>
</div>
</div>
</div>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      status: '',
    }
  }
}
</script>
