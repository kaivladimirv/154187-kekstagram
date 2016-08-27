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
 * Производит отрисовку указанного изображения на странице
 */
function renderPicture(picture, index) {
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

  onPictureClick(element, index);

  return element;
}

/**
 * Назначает обработчик клика по изображению
 */
function onPictureClick(element, index) {
  element.onclick = function(event) {
    event.preventDefault();

    gallery.show(index);

    event.stopPropagation();
  };
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

exports.render = renderPicture;
