<template>
  <div class="skeleton-loader" :class="type">
    <!-- Table skeleton -->
    <template v-if="type === 'table'">
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div v-for="j in columns" :key="j" class="skeleton-cell" :style="{ width: cellWidths[j - 1] || 'auto' }"></div>
      </div>
    </template>

    <!-- Card skeleton -->
    <template v-else-if="type === 'card'">
      <div class="skeleton-card">
        <div class="skeleton-header"></div>
        <div class="skeleton-body">
          <div v-for="i in lines" :key="i" class="skeleton-line" :style="{ width: lineWidths[i - 1] || '100%' }"></div>
        </div>
      </div>
    </template>

    <!-- List skeleton -->
    <template v-else-if="type === 'list'">
      <div v-for="i in items" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 60%"></div>
          <div class="skeleton-line" style="width: 40%"></div>
        </div>
      </div>
    </template>

    <!-- Default skeleton -->
    <template v-else>
      <div class="skeleton-default">
        <div v-for="i in lines" :key="i" class="skeleton-line" :style="{ width: lineWidths[i - 1] || '100%' }"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default', // 'table', 'card', 'list', 'default'
    validator: (value) => ['table', 'card', 'list', 'default'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 5
  },
  items: {
    type: Number,
    default: 5
  },
  lines: {
    type: Number,
    default: 3
  },
  cellWidths: {
    type: Array,
    default: () => []
  },
  lineWidths: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

/* Skeleton animation */
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-base {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* Table skeleton */
.skeleton-loader.table {
  display: table;
  width: 100%;
}

.skeleton-row {
  display: table-row;
  margin-bottom: 0.5rem;
}

.skeleton-cell {
  display: table-cell;
  height: 40px;
  padding: 0.5rem;
  margin-right: 0.5rem;
}

.skeleton-cell:last-child {
  margin-right: 0;
}

/* Card skeleton */
.skeleton-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.skeleton-header {
  height: 20px;
  width: 40%;
  margin-bottom: 1rem;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* List skeleton */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Default skeleton */
.skeleton-default {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 0.5rem;
}

/* Apply animation to all skeleton elements */
.skeleton-cell,
.skeleton-header,
.skeleton-line,
.skeleton-avatar {
  @extend .skeleton-base;
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-cell {
    height: 32px;
    padding: 0.25rem;
  }
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
}
</style>

