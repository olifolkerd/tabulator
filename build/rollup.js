import Bundler  from "./Bundler.js";

var bundler = new Bundler("4.9.3", process.env.TARGET);

module.exports = bundler.bundle();
