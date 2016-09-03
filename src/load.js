'use strict';

/**
 * Загружает данные с указанного адреса
 */
function fetch(url, params, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function(evt) {
    callback(JSON.parse(evt.target.response));
  };

  xhr.open('GET', url + '?from=' + params.from + '&to=' + params.to + '&filter=' + params.filter);
  xhr.send();
}


exports.fetch = fetch;
