'use strict';

var IMAGE_WIDTH = 182;
var IMAGE_HEIGHT = 182;
var TIMEOUT_IMAGE_LOAD = 10000;
var gallery = require('./gallery');
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
function createPicture(picture) {
  var element = pictureTemplate.cloneNode(true);

  loadPicture(picture.url, function(isLoaded) {
    if (!isLoaded) {
      element.classList.add('picture-load-failure');
      return;
    }

    var img = element.querySelector('img');
    img.src = picture.url;
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
function Picture(picture, index) {
  this.data = picture;
  this.data.index = index;
  this.element = createPicture(picture);

  this.addEventsListeners();
}

/**
 * Добавляет обработчики событий
 */
Picture.prototype.addEventsListeners = function() {
  this.onClick();
};

/**
 * Назначает обработчик клика по изображению
 */
Picture.prototype.onClick = function() {
  var self = this;

  this.element.onclick = function(event) {
    event.preventDefault();

    gallery.show(self.data.index);

    event.stopPropagation();
  };
};

/**
 * Удаляет обработчики событий
 */
Picture.prototype.remove = function() {
  this.element.onclick = null;
};


module.exports = Picture;
