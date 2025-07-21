<!-- src/components/Breadcrumb.vue -->
<template>
  <!-- <div class="bg-white p-3 rounded shadow-sm mb-3">
    <h4 class="fw-bold text-success mb-1">{{ title }}</h4>
    <small>
      <a href="#" class="text-decoration-underline">Trang chủ</a>
      <span v-if="subTitle"> / {{ subTitle }}</span>
    </small>
  </div> -->
  <span></span>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    title: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      default: ''
    }
  }
}
</script>
