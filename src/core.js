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

 (function(){

 	'use strict';

 	$.widget("ui.tabulator", {

 		//setup options
 		options: {

 		},

 		//constructor
 		_create: function(){
 			var self = this;
 			var element = self.element;
 		},

 		//deconstructor
 		_destroy: function(){
 			var self = this;
 			var element = self.element;

 			element.empty();

 			element.removeClass("tabulator");
 		},
 	});

 })();
