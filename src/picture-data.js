'use strict';

/**
 * Функция-конструктор создания объекта для работы с данными изображения
 */
function PictureData(data, index) {
  this.data = data;
  this.data.index = index;
}

/**
 * Возвращает порядковый номер(индекс) изображения
 */
PictureData.prototype.getIndex = function() {
  return this.data.index;
};

/**
 * Возвращает url изображения
 */
PictureData.prototype.getUrl = function() {
  return this.data.url;
};

/**
 * Возвращает количество лайков
 */
PictureData.prototype.getLikesCount = function() {
  return this.data.likes;
};

/**
 * Увеличивает количество лайков на один
 */
PictureData.prototype.likesIncrement = function() {
  this.data.likes++;
};

/**
 * Возвращает количество комментариев
 */
PictureData.prototype.getСommentsCount = function() {
  return this.data.comments;
};

/**
 * Увеличивает количество комментариев на один
 */
PictureData.prototype.commentsIncrement = function() {
  this.data.comments++;
};


module.exports = PictureData;
