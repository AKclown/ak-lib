/** 
 * 全量打包:  (rollup打包分为三个过程)
 * 1. 配置入口文件
 * 2. 配置插件
 * 3. 配置输出文件格式
 * 
 * $ 一般业务项目都是通过 "配置文件 + 命令行" 的方式，但是在类库中我们则是通过JavaScript API的方式， 原因如下:
 * 虽然配置文件提供了一种简单的配置rollup的方式，但是他们也限制了rollup可以被调用和配置的方式
 * 特别是如果你正在将rollup嵌入到另一个构建工具中，或者想将其集成到更高级构建流程中，直接从脚本中以编程方式调用rollup可能更好
 *  
 */
import { rollup } from "rollup";
import vue from '@vitejs/plugin-vue'
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import replace from '@rollup/plugin-replace';
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";

// 获取到入口的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 确定根目录，目前执行目录是 ./internal/build, 所以需要跳出两层
const projRoot = resolve(__dirname, "../..");
// 拼接 ./packages目录路径
const pkgRoot = resolve(projRoot, "packages");
// 拼接./packages/akclown-ui目录路径
const epRoot = resolve(pkgRoot, "akclown-ui");

// 拼接打包根目录
const buildOutput = resolve(projRoot, "dist");
// 拼接包目录
const epOutput = resolve(buildOutput, "akclown-ui");

// 全量打包任务函数
const buildFullEntry = async () => {
    const bundle = await rollup({
        // 配置入口文件
        input: resolve(epRoot, "index.ts"),
        plugins: [
            // 将.vue文件编译成JavaScript文件
            vue(),
            // rollup无法解析外部依赖，例如 Vue，需要通过 nodeResolve 插件进行解析
            // 默认情况下nodeResolve不认识.ts文件
            nodeResolve({
                extensions: [".ts"]
            }),
            // 在构建过程中，替换代码中的特定字符串，例如将process.env.NODE_ENV替换为"production" 
            replace({
                'process.env.NODE_ENV': '"production"',
                // 这个选项用于防止在字符串后面紧跟一个等号时进行替换。可以用于避免错误的赋值操作
                preventAssignment: true,
            }),
            // 将typescript代码编译成JavaScript代码
            esbuild(),

        ],
        // 排除不进行打包的 npm 包，例如 Vue，以便减少包的体积
        external: ["vue"]
    })
    // 配置输出文件格式
    bundle.write({
        // 输出的格式(可以在浏览器环境下和NodeJS环境下使用的代码格式，它将CommonJS、AMD以及普通的全局定义模块三种模块进行规范进行整合)
        format: 'umd',
        // 输出的文件
        file: resolve(epOutput, "dist", "index.full.js"),
        // 根据 UMD 模块规范我们需要给整个组件库设置一个变量名称，"AKclownUI"最终会挂载到全局变量上
        // 将整个组件库要设置一个变量名: `AKclownUI`, `AKclownUI`变量对应的就是ElementPlus全局变量
        name: "AKclownUI",
        // 此外我们需要告诉Rollup，Vue是外部依赖，vue模块的ID为全局变量Vue (为什么这么设置，，需要对UMD的模块规范原理了解)
        globals: {
            // $ 组件库中需要使用到的全局变量 Vue
            vue: "Vue"
        }
    });
}

buildFullEntry();
