<template>
  <div>
    <el-icon :color="'green'" :size="18"><EditIcon /></el-icon>
    <el-button :disabled="true">按钮</el-button>
  </div>
</template>
<script setup lang="ts">
import EditIcon from "./EditIcon.vue";
</script>
<style scoped></style>
