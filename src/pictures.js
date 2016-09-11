'use strict';

var load = require('./load');
var Picture = require('./picture');
var gallery = require('./gallery');
var PictureData = require('./picture-data');
var filters = document.querySelector('.filters');
var containerPicturesList = document.querySelector('.pictures');
var PICTURES_LOAD_URL = '/api/pictures';
var PICTURES_LIMIT = 12;
var currentPageNumber = 0;
var currentFilterId;
var allPicturesIsloaded = false;

/**
 * Производит отрисовку списка изображений на странице
 */
function renderPicturesList(pictures) {
  if (!pictures.length) {
    allPicturesIsloaded = true;
    return false;
  }

  var nextIndexPicture = gallery.getPicturesCount();
  var picturesData = [];

  pictures.forEach(function(item) {
    var pictureData = new PictureData(item, nextIndexPicture);
    var picture = new Picture(pictureData);
    picture.appendTo(containerPicturesList);

    picturesData.push(pictureData);
    nextIndexPicture++;
  });

  gallery.setPictures(picturesData);

  return true;
}

/**
 * Очищает список изображений
 */
function clearPicturesList() {
  currentPageNumber = 0;
  containerPicturesList.innerHTML = '';
  allPicturesIsloaded = false;

  gallery.clear();
}

/**
 * Получает информацию о изображениях с сервера
 */
function fetchPicturesList(callback) {
  if (allPicturesIsloaded) {
    return;
  }

  var from = PICTURES_LIMIT * currentPageNumber;
  var to = from + PICTURES_LIMIT;

  load.fetch(PICTURES_LOAD_URL, {
    from: from,
    to: to,
    filter: currentFilterId
  }, callback);

  currentPageNumber++;
}

/**
 * Получает информацию о изображениях с сервера до тех пор
 * пока видимая часть окна браузера не будет заполнена изображениями
 * или пока не будут получены все изображения
 */
function fetchMorePicturesList() {
  if (allPicturesIsloaded || containerPicturesListIsFilled()) {
    return;
  }

  fetchPicturesList(function(pictures) {
    renderPicturesList(pictures);
    setTimeout(fetchMorePicturesList, 50);
  });
}

/**
 * Определяет достигнут ли конец страницы
 */
function isEndOfPageReached() {
  var GAP = 500;
  var footerPosition = document.querySelector('footer').getBoundingClientRect();

  return footerPosition.top - window.innerHeight - GAP <= 0;
}

/**
 * Определяет заполнен ли контейнер со списком изображений
 */
function containerPicturesListIsFilled() {
  var height = containerPicturesList.getBoundingClientRect().height;

  return height > window.innerHeight;
}

/**
 * Устанавливает фильтр
 */
function initFilter() {
  currentFilterId = localStorage.getItem('lastFilterId') || 'filter-popular';
  [].forEach.call(filters.elements['filter'], function(item) {
    item.checked = (item.id === currentFilterId);
  });
}

/**
 * Выполняет указанную функцию не чаще указанного интервала времени
 */
function throttle(callback, interval) {
  var scrollTimeout;

  return function() {
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(function() {
      callback();
    }, interval);
  };
}

/**
 * Добавляет обработчик прокрутки страницы
 */
function onWindowScroll() {
  window.addEventListener('scroll', throttle(function() {
    if (allPicturesIsloaded || !isEndOfPageReached()) {
      return;
    }

    fetchPicturesList(renderPicturesList);
  }, 100));
}

/**
 * Добавляет обработчик изменения фильтра
 */
function onFilterChange() {
  filters.addEventListener('click', function(evt) {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }

    currentFilterId = evt.target.getAttribute('for');
    localStorage.setItem('lastFilterId', currentFilterId);

    clearPicturesList();
    fetchMorePicturesList();
  }, true);
}


initFilter();
//Производим загрузку первоначального списка изображений при открытии страницы
fetchPicturesList(function(pictures) {
  filters.classList.add('hidden');

  if (!renderPicturesList(pictures)) {
    return;
  }

  filters.classList.remove('hidden');

  onFilterChange();
  onWindowScroll();

  fetchMorePicturesList();

  window.dispatchEvent(new Event('hashchange'));
});
