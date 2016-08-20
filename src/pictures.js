'use strict';

var IMAGE_WIDTH = 182;
var IMAGE_HEIGHT = 182;
var TIMEOUT_IMAGE_LOAD = 10000;
var filters = document.querySelector('.filters');
var containerPicturesList = document.querySelector('.pictures');
var pictureTemplate;

/**
 * Загружает данные по протколу JSONP
 */
function loadJsonpData(url, callbackName, callback) {
  window[callbackName] = callback;

  var el = document.createElement('script');
  el.src = url + '?callback=' + callbackName;
  document.body.appendChild(el);
}

/**
 * Производит создание шаблона блока с изображением
 */
function createPictureTemplate() {
  var template = document.getElementById('picture-template');

  if ('content' in template) {
    pictureTemplate = template.content.querySelector('.picture');
  } else {
    pictureTemplate = template.querySelector('.picture');
  }
}

/**
 * Производит отрисовку списка изображений на странице
 */
function renderPicturesList(pictures) {
  filters.classList.add('hidden');

  if (!pictures.length) {
    return;
  }

  pictures.forEach(function(picture) {
    renderPicture(picture);
  });

  filters.classList.remove('hidden');
}

/**
 * Производит отрисовку указанного изображения на странице
 */
function renderPicture(picture) {
  var element = pictureTemplate.cloneNode(true);
  containerPicturesList.appendChild(element);

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


createPictureTemplate();

loadJsonpData('http://localhost:1506/api/pictures', 'onPicturesIsLoaded', renderPicturesList);
