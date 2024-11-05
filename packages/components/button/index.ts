import { withInstall, withNoopInstall } from '@akclown-ui/utils'
import Button from './src/button.vue'
import ButtonGroup from './src/button-group.vue'

// 通过 withInstall 方法给 Button 添加了一个 Vue3 插件所需的 install 方法
export const ElButton = withInstall(Button, { ButtonGroup })

export const ElButtonGroup = withNoopInstall(ButtonGroup)

export default ElButton

export * from './src/button'

