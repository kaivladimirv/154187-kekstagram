'use strict';

function BaseComponent(element) {
  this.element = element;

  this.onClick = this.onClick.bind(this);
  this.element.addEventListener('click', this.onClick);
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
 * Обработчик клика по компоненту
 */
BaseComponent.prototype.onClick = function() {
  console.log('Click on the BaseComponent');
};


module.exports = BaseComponent;
