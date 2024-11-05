<template>
  <div :class="[ns.b('group')]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, reactive, toRef } from "vue";

import { useNamespace } from "@akclown-ui/hooks";
import { buttonGroupProps } from "./button-group";
import { buttonGroupContextKey } from "@akclown-ui/tokens";

defineOptions({
  name: "ElButtonGroup",
});

const ns = useNamespace("button");

const props = defineProps(buttonGroupProps);

provide(
  buttonGroupContextKey,
  reactive({
    size: toRef(props, "size"),
    type: toRef(props, "type"),
  })
);
</script>

<style lang="less" scoped></style>
