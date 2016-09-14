/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {

  var cookies = require('browser-cookies');

  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var x = resizeForm.elements.x;
    var y = resizeForm.elements.y;
    var size = resizeForm.elements.size;
    var valid = false;

    valid = (x.value >= 0);
    x.setCustomValidity(!valid ? 'Значение не может быть отрицательным!' : '');
    if (!valid) {
      return false;
    }

    valid = (y.value >= 0);
    y.setCustomValidity(!valid ? 'Значение не может быть отрицательным!' : '');
    if (!valid) {
      return false;
    }

    valid = ((Number(x.value) + Number(size.value)) <= currentResizer._image.naturalWidth);
    size.setCustomValidity(!valid ? 'Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения!' : '');
    if (!valid) {
      return false;
    }

    valid = ((Number(y.value) + Number(size.value)) <= currentResizer._image.naturalHeight);
    size.setCustomValidity(!valid ? 'Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения!' : '');
    if (!valid) {
      return false;
    }

    return true;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработчик ввода данных в форме кадрирования.
   */
  resizeForm.addEventListener('input', function() {
    if (!resizeFormIsValid()) {
      resizeForm.elements.fwd.click();
      resizeForm.elements.fwd.disabled = true;
    } else {
      resizeForm.elements.fwd.disabled = false;
    }
  });

  /**
   * Обработчик изменений в форме кадрирования.
   */
  resizeForm.addEventListener('change', function() {
    if (!resizeFormIsValid()) {
      return;
    }

    var x = parseInt(resizeForm.x.value, 10);
    var y = parseInt(resizeForm.y.value, 10);
    var size = parseInt(resizeForm.size.value, 10);
    var constraint = currentResizer.getConstraint();

    x = isNaN(x) ? constraint.x : x;
    y = isNaN(y) ? constraint.y : y;
    size = isNaN(size) ? constraint.side : size;

    currentResizer.setConstraint(x, y, size);
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      var image = currentResizer.exportImage().src;

      var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
      for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].style.backgroundImage = 'url(' + image + ')';
      }

      filterImage.src = image;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia',
        'marvin': 'filter-marvin'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];

    saveFilterImageInCookies(selectedFilter);
  });

  /**
   *
   */
  window.addEventListener('resizerchange', function() {
    var constraint = currentResizer.getConstraint();

    resizeForm.x.value = constraint.x;
    resizeForm.y.value = constraint.y;
    resizeForm.size.value = constraint.side;
  });

  /**
   * Сохраняет последний выбранный фильтр в куки
   * @param {string} filterName
   */
  function saveFilterImageInCookies(filterName) {
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    var lastBithdayGraceHopper = new Date(today.getFullYear(), 11, 9);
    if (lastBithdayGraceHopper > today) {
      lastBithdayGraceHopper = new Date(today.getFullYear() - 1, 11, 9);
    }
    var diffInDays = Math.round((today - lastBithdayGraceHopper) / 1000 / 60 / 60 / 24);

    cookies.set('upload-filter', filterName, {
      expires: diffInDays
    });
  }

  /**
   * Устанавливает фильтр по умолчанию
   */
  function setDefaultFilterImage() {
    var filterName = cookies.get('upload-filter');
    if (!filterName) {
      return;
    }

    [].forEach.call(filterForm['upload-filter'], function(item) {
      item.checked = (item.value === filterName);
    });

    var evt = document.createEvent('Event');
    evt.initEvent('change', true, true);
    filterForm.dispatchEvent(evt);
  }

  cleanupResizer();
  updateBackground();
  setDefaultFilterImage();
})();
