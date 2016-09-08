'use strict';

function BaseComponent(element) {
  this.element = element;

  this.addEventsListeners();
}

/**
 * Добавляет элемент в указанную ноду на странице
 */
BaseComponent.prototype.appendTo = function(parent) {
  parent.appendChild(this.element);
};

/**
 * Удаляет элемент со cтраницы
 */
BaseComponent.prototype.remove = function() {
  this.element.removeEventListener('click', this.onclick);
  this.element.parentNode.removeChild(this.element);
};

/**
 * Добавляет обработчики событий
 */
BaseComponent.prototype.addEventsListeners = function() {
  this.onClick = this.onClick.bind(this);
  this.element.addEventListener('click', this.onClick);
};

/**
 * Обработчик клика по компоненту
 */
BaseComponent.prototype.onClick = function() {};


module.exports = BaseComponent;
