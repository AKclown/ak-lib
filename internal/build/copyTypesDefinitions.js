// 因为 ESM 与 CJS 两种格式都需要类型声明文件，所以我们一开始把声明文件只生成到一个文件夹中，
// 生成之后，再把所有声明文件复制到dist/akclown-ui/es和dist/akclown-ui/lib中

import path, { resolve } from 'path'
import { fileURLToPath } from 'url'
import { copy } from "fs-extra";

const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);

const projRoot = resolve(__dirnameNew, '..', '..');

const buildOutput = resolve(projRoot, 'dist');

const epOutput = resolve(buildOutput, 'akclown-ui');


export const copyTypesDefinitions = async () => {
    const src = path.resolve(buildOutput, 'types', 'packages')
    // 将 ./dist/types/packages 的内容复制到 ./dist/akclown-ui/es 目录下, recursive 为 true 表示递归复制
    await copy(src, resolve(epOutput, "es"), { recursive: true })
    // 将 ./dist/types/packages 的内容复制到 ./dist/akclown-ui/lib 目录下, recursive 为 true 表示递归复制
    await copy(src, resolve(epOutput, "lib"), { recursive: true })
}
