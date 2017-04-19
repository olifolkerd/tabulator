"use strict";

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

(function () {

  'use strict';

  window.Tabulator = {

    //setup options


    options: {},

    //constructor


    _create: function _create() {

      var self = this;

      var element = self.element;
    },

    //set options


    _setOption: function _setOption(option, value) {

      var self = this;
    },

    //deconstructor


    _destroy: function _destroy() {

      var self = this;

      var element = self.element;

      element.empty();

      element.removeClass("tabulator");
    }

  };
})();

$.widget("ui.tabulator", Tabulator)();