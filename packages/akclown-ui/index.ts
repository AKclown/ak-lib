import ElIcon from '@akclown-ui/components/icon';
import ElButton, { ElButtonGroup } from '@akclown-ui/components/button';

// 组件库
const components = [ElIcon, ElButton, ElButtonGroup];

// 是否已安装标识
const INSTALLED_KEY = Symbol('INSTALLED_KEY');

const ElementPlus = {
    install(app: any) {
        // 如果该组件库已经安装过了，则不进行安装
        if (app[INSTALLED_KEY]) return;
        // 将标识值设置为 true，表示已经安装了
        app[INSTALLED_KEY] = true;
        // 循环组件库中的每个组件进行安装
        components.forEach(c => app.use(c))
    }
}

export default ElementPlus;
