import { Project } from 'ts-morph'
import { fileURLToPath } from "url";
import { dirname, resolve, relative } from "path";
import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import vueCompiler from '@vue/compiler-sfc'

// $ 平时设置Typescript项目的配置是通过根目录的tsconfig.json文件来设置的，现在可以通过给Project传递一个对象，在对象中进行相关的设置

// 因为我们本身就已经在项目中 tsconfig.json 文件设置了相关的 TypeScript 项目的配置，
// 我们可以通过 tsConfigFilePath 字段设置本地项目中的 tsconfig.json 文件作为 ts-morph 项目的 TypeScript 配置

const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = dirname(__filenameNew);

const projRoot = resolve(__dirnameNew, "..", "..");

// 拼接 ./packages目录路径
const pkgRoot = resolve(projRoot, "packages");
// 拼接./packages/akclown-ui目录路径
const epRoot = resolve(pkgRoot, "akclown-ui");

// dist目录地址
const buildOutput = resolve(projRoot, "dist");
// `tsconfig.json` 文件绝对路径
const TSCONFIG_PATH = resolve(projRoot, "tsconfig.web.json");
// 声明文件输出目录
const outDir = resolve(buildOutput, "types");

const excludeFiles = (files) => {
    // 要排除的文件路径的数组
    const excludes = ["node_modules"];
    return files.filter(path => !excludes.some((exclude) => path.includes(exclude)))
}

/** 手动添加Typescript源文件 */
const addSourceFiles = async (project) => {
    // 读取文件类型 .js .jsx .ts .tsx .vue
    const globSourceFile = '**/*.{js,jsx,ts,tsx,vue}';
    const filePaths = excludeFiles(
        await glob([globSourceFile, "!akclown-ui/**/*"], {
            cwd: pkgRoot,  // 读取packages目录下除了 akclown-ui 目录下的所有文件
            absolute: true, // 读取绝对路径
            onlyFiles: true, // 只读取文件，不读取目录
        })
    )

    const epPaths = excludeFiles(
        await glob(globSourceFile, {
            cwd: epRoot,  // 读取 ./packages/akclown-ui 目录下的文件
            onlyFiles: true, // 只读取文件，不读取目录
        })
    )
    // filePaths变量是一个packages目录下除了 akclown-ui 目录下的所有文件的绝对路径数组
    // epPaths变量是一个./packages/akclown-ui 目录下的所有文件的绝对路径数组
    // 之所以这么设计是因为我们要把 ./packages/akclown-ui 目录下的文件生成的 .d.ts文件移动到./packages目录下而不是./packages/akclown-ui目录下
    console.log("filePaths", filePaths, "epPaths", epPaths);

    // Typescript只能处理 .ts 文件，对于 .ts 文件，我们只需要通过 addSourceFileAtPath 方法添加ts-morph项目的Typescript源文件即可
    // 而 .vue 文件 则需要先编译，然后获取编译后的代码再通过CreateSourceFile方法创建 ts-morph 项目的Typescript源文件.
    // 而epPaths变量中的文件，则需要通过读取文件内容再通过CreateSourceFile方法创建ts-morph项目的Typescript源文件，因为这样可以构建新的文件路径以达到移动的目的

    await Promise.all([
        ...filePaths.map(async (file) => {
            if (file.endsWith(".vue")) {
                // 处理 .vue 文件， 因为Typescript编译器无法识别.vue文件，因此需要先编译

                // 只需要对.vue文件初步编译后获取 script 部分代码，再对 <script setup> 标签 部分代码再进行编译，
                // 再把编译后的内容通过ts-morph的实例对象的createSourcefile方法创建ts-morph项目的Typescript源文件
                const content = await readFile(file, "utf-8")
                // 初步解析出template、script、scriptSetup、style模块
                const sfc = vueCompiler.parse(content)
                const { script, scriptSetup } = sfc.descriptor;

                if (script || scriptSetup) {
                    let content = script?.content ?? "";
                    if (scriptSetup) {
                        // 如果存在scriptSetup，则需要通过compileScript方法编译
                        const compiled = vueCompiler.compileScript(sfc.descriptor, {
                            id: "xxx"
                        })
                        content += compiled.content;
                    }
                }
                const lang = scriptSetup.lang || script.lang || "js";

                project.createSourceFile(
                    `${relative(process.cwd(), file)}.${lang}`,
                    content,
                )

            } else {
                // 对于.ts文件，直接添加到ts-morph项目中
                project.addSourceFileAtPath(file)
            }
        }),
        // todo: 未按照预期移动文件
        ...epPaths.map(async (file) => {
            // 读取 ./packages/akclown-ui 目录下的文件，并手动通过createSourceFile方法添加ts-morph项目的 TypeScript 源文件
            const content = await readFile(resolve(epRoot, file), "utf-8");
            // 以构建新的文件路径以达到移动的目的
            project.createSourceFile(resolve(epRoot, file), content, { overwrite: true })
        })

    ])

}

// 如果文件中存在类型错误会造成的typescript编译错误，所以在生成.d.ts文件前，我们需要进行类型检查
const typeCheck = (project) => {
    const diagnostics = project.getPreEmitDiagnostics();
    if (diagnostics.length) {
        console.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
        const err = new Error("Failed to generate typings");
        console.error(err);
        throw err
    }
}

export const generateTypesDefinitions = async () => {
    const project = new Project({
        compilerOptions: {
            // 是否只输出类型文件.d.ts
            emitDeclarationOnly: true,
            // 输出目录
            outDir,
            // 用于解析非相对模块名称的目录
            baseUrl: projRoot,
            // 它对应了 Node.js 中 --preserve-symlinks 选项的行为，Node.js 有这样一个选项：–preserve-symlinks，可以设置成按照软链所在的位置查找依赖
            preserveSymlinks: true,
            // 跳过.d.ts类型声明文件的类型检查。这样可以加快编译速度
            skipLibCheck: true,
            // 是否允许隐式声明 any 类型了
            noImplicitAny: true,
        },
        // 手动指定tsconfig.json文件作为ts-morph项目的Typescript配置
        tsConfigFilePath: TSCONFIG_PATH,
        // 上面是通过tsconfig.json文件配置读取的源文件，这种方式是无法读取.vue文件的，所以我们放弃这种方式读取源文件，而是通过手动添加源文件的方式
        // 首先配置skipAddingFilesFromTsConfig属性为true来取消从tsconfig.json文件中添加TypeScript源文件
        skipAddingFilesFromTsConfig: true, // 取消从tsconfig.json文件中添加TypeScript源文件
    });

    await addSourceFiles(project)

    // typeCheck(project);

    project.emit();
}
