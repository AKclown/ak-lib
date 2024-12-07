<template>
  <button
    ref="_ref"
    :class="[
      ns.b(),
      ns.is('disabled', disabled),
      ns.is('plain', plain),
      ns.is('round', round),
      ns.is('circle', circle),
      ns.m(__size),
      ns.m(__type),
    ]"
    :disabled="disabled"
    :autofocus="autofocus"
    :type="nativeType"
    @click="handleClick"
  >
    <template v-if="loading">
      <slot v-if="$slots.loading" name="loading"></slot>
      <el-icon v-else :class="[ns.is('loading')]">
        <component :is="loadingIcon" />
      </el-icon>
    </template>

    <el-icon v-if="icon || $slots.icon">
      <component :is="icon" v-if="icon" />
      <slot v-else name="icon" />
    </el-icon>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { useNamespace } from "@akclown-ui/hooks";
import { buttonEmits, buttonProps } from "./button";
import ElIcon from "@akclown-ui/components/icon";
import { buttonGroupContextKey } from "@akclown-ui/tokens";

// 定义组件名称
defineOptions({
  name: "ElButton",
});

// 定义 Props
const props = defineProps(buttonProps);

// 使用 inject 取出祖先组件提供的依赖
const buttonGroupContext = inject(buttonGroupContextKey, null);
// 使用 computed 进行缓存计算
const __size = computed(() => props.type || buttonGroupContext?.size);
const __type = computed(() => props.type || buttonGroupContext?.type);

// 定义 emit
const emit = defineEmits(buttonEmits);

// classname 的 BEM 命名
const ns = useNamespace("button");

// 按钮 html 元素
const _ref = ref<HTMLButtonElement | null>(null);

// 点击事件函数
const handleClick = (evt: MouseEvent) => {
  emit("click", evt);
};

// 组件暴露自己的属性以及方法，去供外部使用
defineExpose({
  ref: _ref,
});
</script>

<style lang="less" scoped></style>
