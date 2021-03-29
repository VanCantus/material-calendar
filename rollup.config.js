import sass from 'rollup-plugin-sass';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';

import pkg from './package.json';

export default {
    input: 'src/index.tsx',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            strict: false
        }
    ],
    plugins: [
        external({
            includeDependencies: true
        }),
        sass({ insert: true }),
        typescript({})
    ]
};

