'use strict';

var utils = require('./utils');
var BaseComponent = require('./base-component');

function Child(element) {
  BaseComponent.call(this, element);
}

utils.inherit(Child, BaseComponent);

/**
 * Обработчик клика по компоненту
 */
Child.prototype.onClick = function(evt) {
  evt.preventDefault();
  console.log('Click on the ChildComponent');
};
