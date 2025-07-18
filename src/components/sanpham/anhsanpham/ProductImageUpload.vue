<template>
    <div class="product-image-upload">
        <input type="file" accept="image/*" @change="onFileChange" />
    </div>
</template>

<script setup>
const emit = defineEmits(['uploaded'])
function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    // Demo: tạo url tạm, thực tế sẽ upload lên server
    const url = URL.createObjectURL(file)
    emit('uploaded', { url })
}
</script>

<style scoped>
.product-image-upload input[type="file"] {
    display: block;
    margin-bottom: 1rem;
}
</style>
