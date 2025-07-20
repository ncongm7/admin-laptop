<template>
  <div class="product-search p-3 border-bottom">
    <h6 class="mb-3">Tìm kiếm sản phẩm</h6>
    <form @submit.prevent>
      <div class="mb-2">
        <input type="text" class="form-control" placeholder="Tên, mã, barcode..." v-model="searchQuery" />
      </div>
      <div class="mb-2">
        <select class="form-select" v-model="selectedBrand">
          <option value="">Tất cả hãng</option>
          <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
        </select>
      </div>
      <div class="mb-2">
        <select class="form-select" v-model="selectedAttribute">
          <option value="">Tất cả thuộc tính</option>
          <option v-for="attr in attributes" :key="attr" :value="attr">{{ attr }}</option>
        </select>
      </div>
      <button class="btn btn-primary w-100" type="submit">Tìm kiếm</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
const selectedBrand = ref('')
const selectedAttribute = ref('')
// Placeholder data
const brands = ref(['Apple', 'Dell', 'HP', 'Lenovo'])
const attributes = ref(['RAM 8GB', 'SSD 512GB', 'Màn hình 15.6"'])
// Emits: emit('search', { searchQuery, selectedBrand, selectedAttribute })
</script>

<style scoped>
.product-search {
  background: #fff;
  border-radius: 8px 8px 0 0;
}
</style> 