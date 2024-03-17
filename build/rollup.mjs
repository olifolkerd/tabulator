import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import Bundler from "./Bundler.mjs";
const pkg = require("../package.json");

var bundler = new Bundler(pkg.version, process.env.TARGET);

export default bundler.bundle();
