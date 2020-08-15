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

const production = !process.env.ROLLUP_WATCH;
if (production) {
    process.env.NODE_ENV = 'production';
}

// function serve() {
//     let server;

//     function toExit() {
//         if (server) server.kill(0);
//     }

//     return {
//         writeBundle() {
//             if (server) return;
//             server = require('child_process').spawn('yarn', ['run', 'serve', '--dev'], {
//                 stdio: ['ignore', 'inherit', 'inherit'],
//                 shell: true
//             });

//             process.on('SIGTERM', toExit);
//             process.on('exit', toExit);
//         }
//     };
// }

export default {
    input: 'src/main.tsx',
    output: {
        file: 'dist/build/bundle.js',
        format: 'iife',
        sourcemap: production ? true : 'inline',
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
            sourceMap: production ? true : 'inline'
        }),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve({ contentBase: 'dist', port: 5000, host: '0.0.0.0' }),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('dist'),

        production && terser(),
    ]
}