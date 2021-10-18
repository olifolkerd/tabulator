import Bundler  from "./Bundler.js";

var bundler = new Bundler("5.0.1", process.env.TARGET);

module.exports = bundler.bundle();
