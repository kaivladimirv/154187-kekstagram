'use strict';

var pictures = [];

function loadJsonpData(url, callbackName, callback) {
  window[callbackName] = callback;

  var el = document.createElement('script');
  el.src = url + '?callback=' + callbackName;
  document.body.appendChild(el);
}

loadJsonpData('http://localhost:1506/api/pictures', 'onPicturesIsLoaded', function(data) {
  pictures = data;
});
