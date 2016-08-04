'use strict';

function getMessage(a, b) {
  switch (typeof a) {
    case 'boolean':
      if (a) {
        return 'Переданное GIF-изображение анимировано и содержит [' + b + '] кадров';
      } else {
        return 'Переданное GIF-изображение не анимировано';
      }

    case 'number':
      return 'Переданное SVG-изображение содержит [' + a + '] объектов и [' + (b * 4) + '] атрибутов';

    case 'object':
      if (typeof b === 'object') {
        var artifactsSquare = 0;

        for (var i = 0; i < a.length; i++) {
          artifactsSquare += a[i] * b[i];
        }

        return 'Общая площадь артефактов сжатия: [' + artifactsSquare + '] пикселей';
      }

      var amountOfRedPoints = a.reduce(function(sum, value) {
        return sum + value;
      }, 0);

      return 'Количество красных точек во всех строчках изображения: [' + amountOfRedPoints + ']';

  }
}
