// fs
import * as fs from 'node:fs';

// babel
import generate from '@babel/generator'
import * as babelParser from '@babel/parser'
import traverse, { Node, NodePath } from '@babel/traverse'
import * as t from '@babel/types'

async function analyseFile(content: string): Promise<string> {

    const ast = babelParser.parse(content, {
        sourceType: 'module'
    })

    traverse(ast, {
        enter(path) {
            // console.log(`enter ${path.type}`);
            if (path.type === 'ImportDeclaration') {
                console.log((path.node as t.ImportDeclaration).source.value);
                throw 'It is enough!'
            }
        },
        /*ImportDeclaration(path) {
            console.log(path.node);
            throw 'It is enough!'
        }*/
    })

    const result = generate(ast, { minified: true })
    return result.code

}

async function main() {

    const srcRoot = "C:\\projects\\ravens\\poc\\squish\\automatedtests"
    const destRoot = './generated'
    const dir = 'framework'

    const srcDir = `${srcRoot}\\${dir}`
    const destDir = `${destRoot}\\${dir}`

    try {

        const files = fs.readdirSync(srcDir, { recursive: true });

        console.log('files', files);

        // cleanup
        fs.rmSync(destRoot, { recursive: true })
        fs.mkdirSync(destRoot)
        fs.mkdirSync(destDir)

        for (const file of files) {
            const srcFileName = `${srcDir}\\${file}`
            const destFileName = `${destDir}\\${file}`

            const stats = fs.statSync(srcFileName)
            if (!stats.isFile()) {
                fs.mkdirSync(destFileName)
            } else {
                const content = fs.readFileSync(srcFileName, { encoding: 'utf-8' })
                const destContent = await analyseFile(content)

                fs.writeFileSync(destFileName, destContent)
            }
        }

    } catch (err) {
        console.error(err);
    }

}

main()
