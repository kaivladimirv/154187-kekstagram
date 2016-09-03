'use strict';

function Gallery() {
  this.pictures = [];
  this.activePicture = 0;

  this.overlay = document.querySelector('.gallery-overlay');
  this.buttonClose = document.querySelector('.gallery-overlay-close');
  this.element = document.querySelector('.gallery-overlay-image');
  this.likesCount = document.querySelector('.likes-count');
  this.commentsCount = document.querySelector('.comments-count');
}

/**
 * Устанавливает список изображений для просмотра
 */
Gallery.prototype.setPictures = function(pictures) {
  this.pictures = this.pictures.concat(pictures);
};

/**
 * Возвращает количество изображений в галереи
 */
Gallery.prototype.getPicturesCount = function() {
  return this.pictures.length;
};

/**
 * Очищает список изображений
 */
Gallery.prototype.clear = function() {
  this.pictures = [];
};

/**
 * Устанавливает активное изображение
 */
Gallery.prototype.setActivePicture = function(indexPicture) {
  if (!this.pictures[indexPicture]) {
    return;
  }

  this.activePicture = indexPicture;

  this.element.src = this.pictures[indexPicture].url;
  this.likesCount.textContent = this.pictures[indexPicture].likes;
  this.commentsCount.textContent = this.pictures[indexPicture].comments;
};

/**
 * Отображает галерею
 */
Gallery.prototype.show = function(indexPicture) {
  this.addEventsListeners();

  this.overlay.classList.remove('invisible');

  this.setActivePicture(indexPicture);
};

/**
 * Скрывает галерею
 */
Gallery.prototype.hide = function() {
  this.overlay.classList.add('invisible');

  this.removeEventsListeners();
};

/**
 * Добавляет обработчики событий
 */
Gallery.prototype.addEventsListeners = function() {
  this.onButtonCloseClick();
  this.onElementClick();
};

/**
 * Удаляет обработчики событий
 */
Gallery.prototype.removeEventsListeners = function() {
  this.buttonClose.onclick = null;
  this.element.onclick = null;
};

/**
 * Назначает обработчик клика по кнопке закрыть
 */
Gallery.prototype.onButtonCloseClick = function() {
  var self = this;

  this.buttonClose.onclick = function() {
    self.hide();
  };
};

/**
 * Назначает обработчик клика на элемент галереи
 */
Gallery.prototype.onElementClick = function() {
  var self = this;

  this.element.onclick = function() {
    var nextIndexPicture = (self.activePicture >= (self.pictures.length - 1)) ? 0 : (self.activePicture + 1);

    self.setActivePicture(nextIndexPicture);
  };
};


module.exports = new Gallery();
