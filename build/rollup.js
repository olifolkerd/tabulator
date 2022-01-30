import Bundler  from "./Bundler.js";

var bundler = new Bundler("5.1.0", process.env.TARGET);

module.exports = bundler.bundle();
