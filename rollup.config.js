import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import buble from "rollup-plugin-buble";
import uglify from "rollup-plugin-uglify";
export default {
  input: "src/js/main.js",
  output: {
    format: "iife",
    file: "dist/bundle.js"
  },
  plugins: [
      nodeResolve({ jsnext: true })
    , commonjs()
    , buble()
    // , uglify()
  ],
  // sourcemap: true
  sourcemap: false
}