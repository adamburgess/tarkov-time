import postcss from 'rollup-plugin-postcss'
import tailwindcss from 'tailwindcss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import fs from 'fs/promises'
import mustache from 'mustache'
import htmlMinifier from 'html-minifier'
import { brotliCompressSync } from 'zlib'
import esbuild from 'rollup-plugin-esbuild'

const production = !process.env.ROLLUP_WATCH;
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

            const minifiedHtml = htmlMinifier.minify(html, {
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

            console.log('index.html size', minifiedHtml.length, 'brotli', brotliCompressSync(Buffer.from(minifiedHtml)).length);
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

function vercelMiddleware(options) {
    return {
        name: 'vercel-middleware',
        async generateBundle(_, bundle) {
            this.emitFile({
                type: 'asset',
                fileName: 'functions-manifest.json',
                source: JSON.stringify({
                    version: 1,
                    pages: {
                        '_middleware.js': {
                            runtime: 'web',
                            env: [],
                            files: [Object.keys(bundle)[0]],
                            name: 'api',
                            regexp: options.regexp,
                            sortingIndex: 1
                        }
                    }
                }, null, 2)
            });
        }
    }
}

export default [{
    input: 'src/main.tsx',
    output: {
        file: '.output/static/bundle.js',
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
            minimize: production,
            sourceMap: production ? false : 'inline'
        }),
        favicon(),
        html(),
        production && terser({ compress: { passes: 5 } }),
    ]
}, {
    input: 'src/api.ts',
    output: {
        file: '.output/_middleware.js',
        format: 'cjs'
    }, 
    plugins: [
        resolve(),
        commonjs(),
        esbuild(),
        vercelMiddleware({
            regexp: '^/(api|left|right)$',
        }),
    ]
}];
