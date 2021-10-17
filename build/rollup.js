import Bundler  from "./Bundler.js";

var bundler = new Bundler("5.0.0-alpha.0", process.env.TARGET);

module.exports = bundler.bundle();
