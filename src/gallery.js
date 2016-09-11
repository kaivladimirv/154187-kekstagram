'use strict';

function Gallery() {
  this.pictures = [];
  this.activePicture = 0;

  this.overlay = document.querySelector('.gallery-overlay');
  this.buttonClose = document.querySelector('.gallery-overlay-close');
  this.element = document.querySelector('.gallery-overlay-image');
  this.likesCount = document.querySelector('.likes-count');
  this.commentsCount = document.querySelector('.comments-count');

  this.onLocationHashChanged = this.onLocationHashChanged.bind(this);
  window.addEventListener('hashchange', this.onLocationHashChanged);
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

  this.element.src = this.pictures[indexPicture].getUrl();

  this.renderСommentsCount();
  this.renderLikesCount();
};

/**
 * Производит поиск изображения по его url.
 * Возвращает индекс изображения.
 */
Gallery.prototype.findIndexPictureByUrl = function(urlPicture) {
  return this.pictures.findIndex(function(element) {
    return element.getUrl() === urlPicture;
  });
};

/**
 * Отображает галерею
 */
Gallery.prototype.show = function(pictureIdentifier) {
  var isUrlPicture = !isFinite(pictureIdentifier);
  var indexPicture;

  if (isUrlPicture) { //если это url, то нужно получить индекс изображения
    indexPicture = this.findIndexPictureByUrl(pictureIdentifier);
    if (indexPicture === -1) {
      return;
    }
  } else {
    indexPicture = pictureIdentifier;
  }

  this.addEventsListeners();

  this.overlay.classList.remove('invisible');

  this.setActivePicture(indexPicture);
};

/**
 * Скрывает галерею
 */
Gallery.prototype.hide = function() {
  if (this.overlay.classList.contains('invisible')) {
    return;
  }

  this.overlay.classList.add('invisible');

  this.removeEventsListeners();

  window.location.hash = '';
};

/**
 * Производит отрисовку количества комментариев
 */
Gallery.prototype.renderСommentsCount = function() {
  this.commentsCount.textContent = this.pictures[this.activePicture].getСommentsCount();
};

/**
 * Производит отрисовку количества лайков
 */
Gallery.prototype.renderLikesCount = function() {
  this.likesCount.textContent = this.pictures[this.activePicture].getLikesCount();
};

/**
 * Добавляет обработчики событий
 */
Gallery.prototype.addEventsListeners = function() {
  this.onButtonCloseClick = this.onButtonCloseClick.bind(this);
  this.buttonClose.addEventListener('click', this.onButtonCloseClick);

  this.onElementClick = this.onElementClick.bind(this);
  this.element.addEventListener('click', this.onElementClick);

  this.onLikesCountClick = this.onLikesCountClick.bind(this);
  this.likesCount.addEventListener('click', this.onLikesCountClick);
};

/**
 * Удаляет обработчики событий
 */
Gallery.prototype.removeEventsListeners = function() {
  this.buttonClose.removeEventListener('click', this.onButtonCloseClick);
  this.element.removeEventListener('click', this.onElementClick);
};

/**
 * Обработчик клика по кнопке закрыть
 */
Gallery.prototype.onButtonCloseClick = function() {
  this.hide();
};

/**
 * Обработчик клика на элемент галереи
 */
Gallery.prototype.onElementClick = function() {
  var nextIndexPicture = (this.activePicture >= (this.pictures.length - 1)) ? 0 : (this.activePicture + 1);

  window.location.hash = 'photo/' + this.pictures[nextIndexPicture].getUrl();
};

/**
 * Обработчик клика по элементу количество лайков
 */
Gallery.prototype.onLikesCountClick = function() {
  this.pictures[this.activePicture].likesIncrement();
  this.renderLikesCount();
};

/**
 * Обработчик изменения хэша адресной строки
 */
Gallery.prototype.onLocationHashChanged = function() {
  var urlPicture = this.getUrlPictureFromLocationHash();

  if (!urlPicture) {
    this.hide();
    return;
  }

  this.show(urlPicture);
};

/**
 * Возвращает url изображения из хэша
 */
Gallery.prototype.getUrlPictureFromLocationHash = function() {
  var hash = window.location.hash.match(/#photo\/(\S+)/);
  if (!hash || (hash.length < 2)) {
    return '';
  }

  return hash[1];
};


module.exports = new Gallery();
