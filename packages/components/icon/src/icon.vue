<template>
  <i :class="bem.b()" :style="style" v-bind="$attrs">
    <slot />
  </i>
</template>

<script setup lang="ts">
import type { CSSProperties } from "vue";
import { computed } from "vue";
import { useNamespace } from "@akclown-ui/hooks";
import { addUnit, isUndefined } from "@akclown-ui/utils";
import { iconProps } from "./icon";

defineOptions({
  name: "ElIcon",
});

const props = defineProps(iconProps);
const bem = useNamespace("icon");

// CSSProperties 是 Vue3 提供的 CSS 属性的类型
const style = computed<CSSProperties>(() => {
  if (!props.size && !props.color) return {};

  return {
    fontsize: isUndefined(props.size) ? undefined : addUnit(props.size),
    "--color": props.color, // 通过 CSS 变量方式进行设置 color
  };
});
</script>
