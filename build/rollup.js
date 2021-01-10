import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import scss  from "rollup-plugin-scss";
import del  from "rollup-plugin-delete";

const input = ["src/js/esm.js"];
export default [
{
  input: './src/scss/tabulator.scss',
  plugins: [
    del({ targets: 'dist/*' }),
    scss ({
      output: './dist/css/tabulator.css',
    }),
  ],
},
// {
//   input: './src/scss/tabulator.scss',
//   plugins: [
//     scss ({
//       output: './dist/css/tabulator.min.css',
//       outputStyle: "compressed",
//     }),
//   ],
// },
  {
    // UMD
    input:"src/js/tabulator_full.js",
    plugins: [
      nodeResolve(),
      babel({
        babelHelpers: "bundled",
      }),
      terser(),
    ],
    output: {
      file: `dist/js/tabulator.js`,
      format: "umd",
      name: "Tabulator", // this is the name of the global object
      esModule: false,
      exports: "default",
      sourcemap: true,
    },
  },
// ESM and CJS
  {
    input,
    plugins: [nodeResolve()],
    output: [
      {
        dir: "dist/js/esm",
        format: "esm",
        exports: "named",
        sourcemap: true,
      },
      {
        dir: "dist/js/cjs",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
  },
];