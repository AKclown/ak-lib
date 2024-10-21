import type { ExtractPropTypes, PropType } from 'vue'
import type Icon from './icon.vue'

export type IconType = InstanceType<typeof Icon>

export const iconProps = {
    color: String,
    size: [Number, String] as PropType<number | string>, // size 可以是数字，也可以是字符串
} as const;

export type IconProps = ExtractPropTypes<typeof iconProps>;


