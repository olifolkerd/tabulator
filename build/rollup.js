import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import scss  from "rollup-plugin-scss";
import del  from "rollup-plugin-delete";

const version_no = "4.9.3";
const version = "/* Tabulator v" + version_no + " (c) Oliver Folkerd */\n";



// const globby = require('globby');
// ./src/scss/**/tabulator*.scss
// const configs = globby.sync('**/*.js').map(inputFile => ({
//   entry: inputFile
//   dest: inputFile.replace('src', 'dist'),
//   format: 'umd'
// }));
// module.exports = configs
//
// const input = ["src/js/esm.js"];
// export default [
// {
//   input: './src/scss/tabulator.scss',
//   output: {
//         file: './dist/css/tabulator.css',
//       },
//   plugins: [
//     del({ targets: 'dist/*' }),
//     scss ({output:false}),
//   ],
// },


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
  // {
  //   // UMD
  //   input:"src/js/tabulator_full.js",
  //   plugins: [
  //     nodeResolve(),
  //     babel({
  //       babelHelpers: "bundled",
  //     }),
  //     terser(),
  //   ],
  //   output: {
  //     file: `dist/js/tabulator.js`,
  //     format: "umd",
  //     name: "Tabulator", // this is the name of the global object
  //     esModule: false,
  //     exports: "default",
  //     sourcemap: true,
  //     banner: version,
  //   },
  // },
// ESM and CJS
  {
    input,
    plugins: [nodeResolve()],
    output: [
      {
        file: "dist/js/esm.js",
        format: "esm",
        exports: "named",
        sourcemap: true,
        plugins:[terser({
          format:{
            comments:function(node, comment){
              console.log("version", version)
              return comment.value.startsWith("/* Tabulator");
            }
          }
        })],
        banner: version,
      },
      // {
      //   dir: "dist/js/cjs",
      //   format: "cjs",
      //   exports: "named",
      //   sourcemap: true,
      // },
    ],
  },
];