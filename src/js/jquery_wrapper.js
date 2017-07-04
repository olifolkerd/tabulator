/*
 * This file is part of the Tabulator package.
 *
 * (c) Oliver Folkerd <oliver.folkerd@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * Full Documentation & Demos can be found at: http://olifolkerd.github.io/tabulator/
 *
 */

 (function (factory) {
 	"use strict";
 	if (typeof define === 'function' && define.amd) {
 		define(['jquery'], factory);
 	}
 	else if(typeof module !== 'undefined' && module.exports) {
 		module.exports = factory(require('jquery'));
 	}
 	else {
 		factory(jQuery);
 	}
 }(function ($, undefined) {

 	/*=include core.js */

 	$.widget("ui.tabulator", Tabulator);

 }));


