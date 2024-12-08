import { rollup } from 'rollup'
import vue from '@vitejs/plugin-vue'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import replace from '@rollup/plugin-replace';
import glob from 'fast-glob';
import { fileURLToPath } from "url";
import path, { resolve, dirname } from "path";

// !! 当在一个项目中进行npm install时，项目根目录的package.json中的dependencies、devDependencies、peerDependencies的依赖都会被安装
// !! 而在子依赖中的npm包则只会安装dependencies中的依赖，也正式基于此原理，我们在打包 npm 包的时候就将一些生产环境的依赖不进行打包，
// !! 而那些不进行打包的依赖则需要设置到package.json中的peerDependencies中


// 获取到入口的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 确定根目录，目前执行目录是 ./internal/build, 所以需要跳出两层
const projRoot = resolve(__dirname, "../..");
// 拼接 ./packages目录路径
const pkgRoot = resolve(projRoot, "packages");

const epRoot = resolve(pkgRoot, "akclown-ui");

// 拼接打包根目录
const buildOutput = resolve(projRoot, "dist");
// 拼接包目录
const epOutput = resolve(buildOutput, "akclown-ui");


// $ 与全量打包功能的rollup插件配置部分是一致的，不同的是入口文件和输出文件的配置
// $ 提供的CommonJS规范和ESM规范的代码都需要是模块化的，这样有利于实现按需加载以及打包时候的Tree shaking优化
// 那么要模块化，我们只需要打包后保持原来开发环境下的模块结构即可，那么rollup打包如何做到这个功能呢？‘
// !!! 如何我们想将一组文件转换为另一种格式，并同时保存文件结构和导出签名，推荐的方法是将每个文件变成一个入口文件

const excludeFiles = (files) => {
    // 要排除的文件路径的数组
    const excludes = ["node_modules"];
    return files.filter(path => !excludes.some((exclude) => path.includes(exclude)))
}

// 模块化打包任务函数
const buildModules = async () => {

    // 读取package目录下的所有文件 
    const input = excludeFiles(await glob('**/*.{js,ts,vue}', {
        cwd: pkgRoot,
        // 返回绝对路径
        absolute: true,
        onlyFiles: true,
    }))


    const bundle = await rollup({
        input: input,
        plugins: [
            vue(),
            nodeResolve({
                extensions: [".ts"]
            }),
            replace({
                'process.env.NODE_ENV': '"production"',
                // 这个选项用于防止在字符串后面紧跟一个等号时进行替换。可以用于避免错误的赋值操作
                preventAssignment: true,
            }),
            esbuild(),
        ],
        // 排除不进行打包的 npm 包，例如 Vue，以便减少包的体积
        // external: ["vue"]
        // $ 当我们提供Node.js环境的CommonJs和ESM模块规范的代码是不应该把node_modules中的代码包也进行打包的
        external: ['vue', '@vue/shared', '@element-plus/icons-vue', '@vueuse/core', 'async-validator']
    })

    // 配置输出文件格式、输出文件的目录、并且需要把源码中的目录结构完整输出，等于是复制一遍
    // !! 开启preserveModules选项，就是为了输出的产物结构与输入一致，简单来说就是与源码目录结构保持一致
    bundle.write({
        // 配置输出格式
        format: "esm",
        // 配置输出文件的目录
        dir: resolve(epOutput, "es"),
        // $ 该选项将使用原始模块名作为文件名,为所有模块创建单独的chunk
        preserveModules: true,
        // 将./dist/akclown-ui/es/akclown-ui下的文件提取到./dist/akclown-ui/es/
        // $ 将设置的目录作为根目录进行输出，其他结构不变
        preserveModulesRoot: epRoot,
        // [name]: 入口文件的文件名(不包含扩展名)，也就是生产.mjs结尾的文件
        entryFileNames: `[name].mjs`,
    })

    bundle.write({
        format: "cjs",
        dir: resolve(epOutput, "lib"),
        preserveModules: true,
        // 将./dist/akclown-ui/lib/akclown-ui下的文件提取到./dist/akclown-ui/lib/
        // $ 将设置的目录作为根目录进行输出，其他结构不变
        preserveModulesRoot: epRoot,
        // [name]：入口文件的文件名（不包含扩展名），也就是生产 .cjs 结尾的文件
        entryFileNames: `[name].cjs`,
    })
}

buildModules()













