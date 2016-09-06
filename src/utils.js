'use strict';

/**
 * Производит наследование
 */
function inherit(child, parent) {
  var EmptyConstructor = function() {};
  EmptyConstructor.prototype = parent.prototype;
  child.prototype = new EmptyConstructor();
  child.prototype.constructor = child;
}


module.exports.inherit = inherit;
