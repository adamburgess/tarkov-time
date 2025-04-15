import postcss from 'rollup-plugin-postcss'
import tailwindcss from 'tailwindcss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import fs from 'fs/promises'
import mustache from 'mustache'
import htmlMinifier from 'html-minifier'
import { brotliCompressSync, gzipSync } from 'zlib'
import esbuild from 'rollup-plugin-esbuild'

const production = !process.env.ROLLUP_WATCH || process.env.NODE_ENV == 'production';
if (production) {
    process.env.NODE_ENV = 'production';
}

function html() {
    return {
        name: 'html',
        async generateBundle(_, bundle) {
            const script = bundle['bundle.js'];
            const css = bundle['bundle.css'];

            const template = await fs.readFile('src/index.html.mustache', 'utf8');

            const html = mustache.render(template, {
                script: script.code,
                style: css.source
            });

            const minifiedHtml = !production ? html : htmlMinifier.minify(html, {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                html5: true,
                processConditionalComments: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                trimCustomFragments: true,
                useShortDoctype: true,
            });

            this.emitFile({
                type: 'asset',
                fileName: 'index.html',
                source: minifiedHtml
            });

            delete bundle['bundle.js'];
            delete bundle['bundle.css'];

            console.log('index.html size', minifiedHtml.length, 'brotli', brotliCompressSync(Buffer.from(minifiedHtml)).length, 'gzip', gzipSync(Buffer.from(minifiedHtml)).length);
        }
    };
}

function favicon() {
    return {
        name: 'favicon',
        async generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'favicon.ico',
                source: await fs.readFile('src/favicon.ico')
            });
        }
    }
}

function headers(content) {
    return {
        name: 'headers',
        async generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: '_headers',
                source: content
            });
        }
    }
}

function routes(include) {
    return {
        name: 'routes',
        async generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: '_routes.json',
                source: JSON.stringify({
                    version: 1,
                    include,
                    exclude: []
                }, null, 2)
            });
        }
    }
}

export default [{
    input: 'src/main.tsx',
    output: {
        file: '.output/bundle.js',
        format: 'es',
        sourcemap: production ? false : 'inline',
        indent: false
    },
    plugins: [
        resolve(),
        commonjs(),
        esbuild(),
        postcss({
            plugins: [
                tailwindcss
            ],
            extract: true,
            minimize: {
                preset: ['default', {
                    discardComments: {
                        removeAll: true,
                    },
                }]
            },
            sourceMap: production ? false : 'inline'
        }),
        favicon(),
        html(),
        production && terser({ 
            compress: {
                passes: 5,
                unsafe_methods: true
            },
            mangle: {
                properties: {
                    reserved: ['class']
                }
            },
            ecma: 2019
        }),
        headers(`/
    Cache-Control: max-age=3600, stale-while-revalidate=82800, stale-if-error=31536000

/favicon.ico
    Cache-Control: max-age=604800, stale-if-error=31536000
`),
        //routes(['/api', '/left', '/right'])
        routes([])
    ]
}/*, {
    input: 'src/api.ts',
    output: {
        file: '.output/_worker.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        commonjs(),
        esbuild()
    ]
}*/];
