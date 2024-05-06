// doc: https://github.com/kentcdodds/babel-plugin-handbook

// TODO: Remove json5, jsonpath and @types/jsonpath

// fs
import * as fs from 'node:fs'
import * as fpath from 'path'

// babel
import generate from '@babel/generator'
import template, { PublicReplacements } from "@babel/template";
import * as babelParser from '@babel/parser'
import traverse, { Node, NodePath } from '@babel/traverse'
import * as t from '@babel/types'

// jsonpath
import * as jsonPath from 'jsonpath'

// local
import Constant from './src/Constant';

function getFolderDepth(relativePath: string): number {
    const length = Math.max(
        relativePath.split('\\').length,
        relativePath.split('/').length)

    return length - 1
}

function repeat(sub: string, number: number): string {
    return Array(number).fill(sub).join('')
}

type AnalyseOptions = { importMock?: boolean, call?: boolean }

async function analyseFile(relativePath: string, content: string, options?: AnalyseOptions): Promise<string> {

    const excludedImport = new Set<string>(['test.js', 'os.js', 'squish.js'])
    const folderDepth = getFolderDepth(relativePath)
    const imports: Set<string> = new Set<string>()

    const ast = babelParser.parse(content, {
        sourceType: 'module',
        strictMode: false
    })

    traverse(ast, {
        Program: {
            exit(path) {
                for (const imp of imports) {
                    const importTemplate = template(imp)
                    const firstStatement = path.get("body").shift()

                    if (firstStatement) {
                        firstStatement.insertBefore(importTemplate())
                    }
                }

                if (options?.call) {
                    const callInit = template(`init()`)
                    const callMain = template(`main()`)

                    const lastStatement = path.get("body").pop()
                    if (lastStatement) {
                        lastStatement.insertAfter(callMain())
                        lastStatement.insertAfter(callInit())
                    }
                }
            }

        },
        Identifier(path) {
            if (path.node.name === 'arguments') {
                throw `arguments is not supported in 'strict mode'. Found in script ${relativePath}, at: ${JSON.stringify(path.node.loc?.start)}`
            }

            if (path.node.name === 'object') {
                path.node.name = 'SQobject'
            }

            if (path.node.name === 'test')
                imports.add(`import test from './${repeat('../', folderDepth)}mock/test.js'`)

            if (path.node.name === 'OS') {
                path.node.name = 'os'
                imports.add(`import os from './${repeat('../', folderDepth)}mock/os.js'`)
            }

            const functions = ["startApplication", "waitForObject", "currentApplicationContext", "findObject", "clickButton", "doubleClick", "Button", "SQobject"]

            if ((path.parent.type === 'CallExpression'
                || path.parent.type === 'MemberExpression')
                && new Set(functions).has(path.node.name)) {

                imports.add(`import { ${path.node.name} } from './${repeat('../', folderDepth)}mock/squish.js'`)
            }

        },
        ImportDeclaration(path) {
            const name = path.node.source.value.split('/').pop() || ''
            if (!excludedImport.has(name)) {
                const source = (path.node as t.ImportDeclaration).source
                const importPath = source.value
                source.value = `./${repeat('../', folderDepth)}${importPath}`
            }
        }
    })

    const result = generate(ast, { comments: true, concise: false, compact: false, jsescOption: { es6: true } })
    return result.code

}

async function cleanup(path: string) {
    // cleanup
    if (fs.existsSync(path))
        fs.rmSync(path, { recursive: true, force: true })

    fs.mkdirSync(Constant.destRoot)

}

async function copyAndAnalyseFolder(dir: string, options?: AnalyseOptions) {

    const srcDir = `${Constant.srcRoot}\\${dir}`
    const destDir = `${Constant.destRoot}`

    try {

        const files = fs.readdirSync(srcDir, { recursive: true });

        //fs.mkdirSync(destDir)

        for (const file of files) {
            const srcFileName = `${srcDir}\\${file}`
            const destFileName = `${destDir}\\${file}`

            const stats = fs.statSync(srcFileName)
            if (!stats.isFile()) {
                fs.mkdirSync(destFileName)
            } else if (fpath.extname(file.toString()) === '.js') {
                const content = fs.readFileSync(srcFileName.toString(), { encoding: 'utf-8' })
                const destContent = await analyseFile(file.toString(), content, options)

                fs.writeFileSync(destFileName, destContent)
            } else {
                fs.copyFileSync(srcFileName, destFileName)
            }
        }

    } catch (err) {
        console.error(err);
    }

}

async function main() {

    await cleanup(Constant.destRoot)

    await copyAndAnalyseFolder('framework')
    //await copyAndAnalyseFolder('globalScripts')
    await copyAndAnalyseFolder('suite_GVA/shared/scripts')
    await copyAndAnalyseFolder('suite_GVA', { importMock: true, call: true })

    fs.cpSync('./mock', `${Constant.destRoot}/mock`, { recursive: true })

    fs.writeFileSync(`${Constant.destRoot}\\package.json`, Constant.nodeConfig)


}

main()
