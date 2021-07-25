//import typescript from '@rollup/plugin-typescript'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import tailwindcss from 'tailwindcss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import serve from 'rollup-plugin-serve'
import fs from 'fs/promises'
import mustache from 'mustache'
import htmlMinifier from 'html-minifier'

const production = !process.env.ROLLUP_WATCH;
if (production) {
    process.env.NODE_ENV = 'production';
}

function html() {
    return {
        name: 'html',
        async generateBundle(options, bundle) {
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
                removeOptionalTags: true,
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
        }
    };
}

export default {
    input: 'src/main.tsx',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: production ? false : 'inline',
        indent: false,
    },
    treeshake: production,
    // perf: true,
    
    plugins: [
        resolve(),
        commonjs(),
        json(),
        typescript(),
        postcss({
            plugins: [
                tailwindcss
            ],
            extract: true,
            minimize: production,
            sourceMap: production ? false : 'inline'
        }),
        html(),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve({ contentBase: 'dist', port: 5000, host: '0.0.0.0' }),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('dist'),

        production && terser({ compress: { passes: 2 } }),
    ]
}
