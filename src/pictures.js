'use strict';

var load = require('./load');
var picture = require('./picture');
var filters = document.querySelector('.filters');
var containerPicturesList = document.querySelector('.pictures');

/**
 * Производит отрисовку списка изображений на странице
 */
function renderPicturesList(pictures) {
  filters.classList.add('hidden');

  if (!pictures.length) {
    return;
  }

  pictures.forEach(function(item) {
    containerPicturesList.appendChild(picture.render(item));
  });

  filters.classList.remove('hidden');
}

load.fetchJsonp('http://localhost:1506/api/pictures', 'onPicturesIsLoaded', renderPicturesList);
