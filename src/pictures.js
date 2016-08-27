'use strict';

var load = require('./load');
var Picture = require('./picture');
var gallery = require('./gallery');
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

  pictures.forEach(function(item, index) {
    containerPicturesList.appendChild(new Picture(item, index).element);
  });

  filters.classList.remove('hidden');

  gallery.setPictures(pictures);
}

load.fetchJsonp('http://localhost:1506/api/pictures', 'onPicturesIsLoaded', renderPicturesList);
