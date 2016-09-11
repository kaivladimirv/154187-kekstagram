'use strict';

var IMAGE_WIDTH = 182;
var IMAGE_HEIGHT = 182;
var TIMEOUT_IMAGE_LOAD = 10000;
var utils = require('./utils');
var BaseComponent = require('./base-component');
var pictureTemplate = createPictureTemplate();

/**
 * Производит создание шаблона блока с изображением
 */
function createPictureTemplate() {
  var template = document.getElementById('picture-template');

  if ('content' in template) {
    return template.content.querySelector('.picture');
  } else {
    return template.querySelector('.picture');
  }
}

/**
 * Производит создание DOM-элемента для указанного изображения
 */
function createPicture(pictureData) {
  var element = pictureTemplate.cloneNode(true);

  loadPicture(pictureData.getUrl(), function(isLoaded) {
    if (!isLoaded) {
      element.classList.add('picture-load-failure');
      return;
    }

    var img = element.querySelector('img');
    img.src = pictureData.getUrl();
    img.width = IMAGE_WIDTH;
    img.height = IMAGE_HEIGHT;
  });

  return element;
}

/**
 * Производит загрузку изображения в фоновом режиме
 */
function loadPicture(url, callback) {
  var timeoutId;
  var image = new Image();

  image.onload = function() {
    clearTimeout(timeoutId);
    callback(true);
  };

  image.onerror = function() {
    clearTimeout(timeoutId);
    callback(false);
  };

  timeoutId = setTimeout(function() {
    image.src = '';
    callback(false);
  }, TIMEOUT_IMAGE_LOAD);

  image.src = url;
}

/**
 * Функция-конструктор создания объекта для работы с изображением
 */
function Picture(pictureData) {
  BaseComponent.call(this, createPicture(pictureData));

  this.comments = this.element.querySelector('.picture-comments');
  this.likes = this.element.querySelector('.picture-likes');

  this.pictureData = pictureData;

  this.renderСommentsCount();
  this.renderLikesCount();

  this.onLikesCountIsChanged = this.onLikesCountIsChanged.bind(this);
  document.addEventListener('likesCountIsChanged', this.onLikesCountIsChanged);
}

utils.inherit(Picture, BaseComponent);

/**
 * Назначает обработчик клика по изображению
 */
Picture.prototype.onClick = function(evt) {
  evt.preventDefault();

  window.location.hash = 'photo/' + this.pictureData.getUrl();
};

/**
 * Обрабатывает событие изменения количетсва лайков
 */
Picture.prototype.onLikesCountIsChanged = function(evt) {
  if (this.pictureData.getIndex() !== evt.detail.index) {
    return;
  }

  this.renderLikesCount();
};

/**
 * Производит отрисовку количества комментариев
 */
Picture.prototype.renderСommentsCount = function() {
  this.comments.textContent = this.pictureData.getСommentsCount();
};

/**
 * Производит отрисовку количества лайков
 */
Picture.prototype.renderLikesCount = function() {
  this.likes.textContent = this.pictureData.getLikesCount();
};


module.exports = Picture;
