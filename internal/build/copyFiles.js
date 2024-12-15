import { copyFile } from "fs/promises";
import { fileURLToPath } from "url";
import { resolve, dirname, join } from "path";

const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = dirname(__filenameNew);
const projRoot = resolve(__dirnameNew, "..", '..');

const pkgRoot = resolve(projRoot, 'packages');
const epRoot = resolve(pkgRoot, 'akclown-ui');
const epPackage = resolve(epRoot, 'package.json');

const buildOutput = resolve(projRoot, 'dist');
const epOutput = resolve(buildOutput, 'akclown-ui');

// 将packages/akclown-ui 下的package.json 拷贝到 dist/akclown-ui 下
export const copyFiles = () => copyFile(epPackage, join(epOutput, 'package.json'))