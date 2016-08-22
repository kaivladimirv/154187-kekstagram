'use strict';

/**
 * Загружает данные по протколу JSONP
 */
function fetchJsonp(url, callbackName, callback) {
  window[callbackName] = callback;

  var el = document.createElement('script');
  el.src = url + '?callback=' + callbackName;
  document.body.appendChild(el);
}


exports.fetchJsonp = fetchJsonp;
