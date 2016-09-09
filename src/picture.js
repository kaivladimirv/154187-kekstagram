'use strict';

var IMAGE_WIDTH = 182;
var IMAGE_HEIGHT = 182;
var TIMEOUT_IMAGE_LOAD = 10000;
var gallery = require('./gallery');
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

  this.pictureData = pictureData;
}

utils.inherit(Picture, BaseComponent);

/**
 * Назначает обработчик клика по изображению
 */
Picture.prototype.onClick = function(evt) {
  evt.preventDefault();

  gallery.show(this.pictureData.getIndex());
};


module.exports = Picture;
