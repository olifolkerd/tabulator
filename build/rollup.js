import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import del  from "rollup-plugin-delete";
import postcss from 'rollup-plugin-postcss';
const license = require('rollup-plugin-license');

const version_no = "4.9.3";
const version = "/* Tabulator v" + version_no + " (c) Oliver Folkerd <%= moment().format('YYYY') %> */";

// const globby = require('globby');
// ./src/scss/**/tabulator*.scss
// const configs = globby.sync('**/*.js').map(inputFile => ({
//   entry: inputFile
//   dest: inputFile.replace('src', 'dist'),
//   format: 'umd'
// }));
// module.exports = configs

export default [

    //Stylesheet
    {
        input: 'src/scss/tabulator.scss',
        output: {
            file: 'dist/css/tabulator.css',
            format: 'es',
        },
        plugins: [
            del({ targets: 'dist/*' }),
            postcss({
                modules: false,
                extract: true,
                minimize: true,
                sourceMap: true,
            }),
        ]
    },

    // UMD
    {
        input:"src/js/builds/usd.js",
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: "bundled",
            }),
            terser(),
            license({
                banner: {
                    commentStyle:"none",
                    content:version,
                },
            }),
        ],
        output: {
            file: `dist/js/tabulator.js`,
            format: "umd",
            name: "Tabulator",
            esModule: false,
            exports: "default",
            sourcemap: true,
        },
    },

    // ESM
    {
        input:"src/js/builds/esm.js",
        plugins: [
            nodeResolve(),
            license({
                banner: {
                    commentStyle:"none",
                    content:version,
                },
            }),
        ],
        output: [
            {
                file: "dist/js/esm.js",
                format: "esm",
                exports: "named",
                sourcemap: true,
                plugins:[],
            },
        ],
    },
];