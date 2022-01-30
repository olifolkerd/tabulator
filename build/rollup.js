import Bundler  from "./Bundler.js";
const pkg = require("../package.json");

var bundler = new Bundler(pkg.version, process.env.TARGET);

module.exports = bundler.bundle();
