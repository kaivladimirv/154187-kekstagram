'use strict';

(function() {
  /**
   * @constructor
   * @param {string} image
   */
  var Resizer = function(image) {
    // Изображение, с которым будет вестись работа.
    this._image = new Image();
    this._image.src = image;

    // Холст.
    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');

    // Создаем холст только после загрузки изображения.
    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения. Это нужно
      // для удобства работы с координатами.
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;

      /**
       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
       * стороны изображения.
       * @const
       * @type {number}
       */
      var INITIAL_SIDE_RATIO = 0.75;

      // Размер меньшей стороны изображения.
      var side = Math.min(
        this._container.width * INITIAL_SIDE_RATIO,
        this._container.height * INITIAL_SIDE_RATIO);

      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
      // от размера меньшей стороны.
      this._resizeConstraint = new Square(
        this._container.width / 2 - side / 2,
        this._container.height / 2 - side / 2,
        side);

      // Отрисовка изначального состояния канваса.
      this.setConstraint();
    }.bind(this);

    // Фиксирование контекста обработчиков.
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  };

  Resizer.prototype = {
    /**
     * Родительский элемент канваса.
     * @type {Element}
     * @private
     */
    _element: null,

    /**
     * Положение курсора в момент перетаскивания. От положения курсора
     * рассчитывается смещение на которое нужно переместить изображение
     * за каждую итерацию перетаскивания.
     * @type {Coordinate}
     * @private
     */
    _cursorPosition: null,

    /**
     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
     * от верхнего левого угла исходного изображения.
     * @type {Square}
     * @private
     */
    _resizeConstraint: null,

    /**
     * Отрисовка канваса.
     */
    redraw: function() {
      // Очистка изображения.
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

      // Параметры линии.
      // NB! Такие параметры сохраняются на время всего процесса отрисовки
      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
      // чего-либо с другой обводкой.

      // Толщина линии.
      this._ctx.lineWidth = 4;

      // Сохранение состояния канваса.
      this._ctx.save();

      // Установка начальной точки системы координат в центр холста.
      this._ctx.translate(this._container.width / 2, this._container.height / 2);

      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
      // Отрисовка изображения на холсте. Параметры задают изображение, которое
      // нужно отрисовать и координаты его верхнего левого угла.
      // Координаты задаются от центра холста.
      this._ctx.drawImage(this._image, displX, displY);

      // Отрисовка прямоугольника, обозначающего область изображения после
      // кадрирования. Координаты задаются от центра.
      this.drawStrokeRectZigzag(
        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        this._resizeConstraint.side,
        this._resizeConstraint.side);

      this.drawOverlay();

      this.drawRectConstrainCaption(this._image.naturalWidth + ' x ' + this._image.naturalHeight);

      // Восстановление состояния канваса, которое было до вызова ctx.save
      // и последующего изменения системы координат. Нужно для того, чтобы
      // следующий кадр рисовался с привычной системой координат, где точка
      // 0 0 находится в левом верхнем углу холста, в противном случае
      // некорректно сработает даже очистка холста или нужно будет использовать
      // сложные рассчеты для координат прямоугольника, который нужно очистить.
      this._ctx.restore();
    },

    /**
     * Отрисовка прямоугольника, обозначающего область изображения после кадрирования.
     */
    drawStrokeRectDot: function(x, y, width, height) {
      var lineTop = {
        x: x,
        y: y
      };
      var lineBottom = {
        x: x,
        y: y + height - this._ctx.lineWidth / 2
      };
      var lineLeft = {
        x: x,
        y: y
      };
      var lineRight = {
        x: x + width - this._ctx.lineWidth / 2,
        y: y
      };

      //Отрисовка горизонтальных линий
      this.drawLineDot(lineTop.x, lineTop.y, width, false);
      this.drawLineDot(lineBottom.x, lineBottom.y, width, false);

      //Отрисовка вертикальных линий
      this.drawLineDot(lineLeft.x, lineLeft.y, height, true);
      this.drawLineDot(lineRight.x, lineRight.y, height, true);
    },

    /**
     * Отрисовка линии ввиде точек
     * @param {number} x
     * @param {number} y
     * @param {number} length
     * @param {boolean} vertical
     */
    drawLineDot: function(x, y, length, vertical) {
      var INDENT = 10;
      var radius = this._ctx.lineWidth / 2;
      var positionStart = vertical ? y : x;
      var positionEnd = positionStart + length;

      this._ctx.fillStyle = '#ffe753';

      while ((positionStart + radius) < positionEnd) {
        this._ctx.beginPath();
        this._ctx.arc(
          vertical ? x : positionStart,
          vertical ? positionStart : y,
          radius,
          0,
          2 * Math.PI,
          false);
        this._ctx.fill();

        positionStart += radius + INDENT;
      }
    },

    /**
     * Отрисовка прямоугольника, обозначающего область изображения после кадрирования.
     * Границы отображаются ввиде зигзагов
     */
    drawStrokeRectZigzag: function(x, y, width, height) {
      var SIZE = 10;
      var lengthLine = width - SIZE * 2;
      var remainder = lengthLine % (SIZE * 2);
      var halfRemainder = remainder / 2;

      lengthLine -= remainder;

      var lineTop = {
        x: x + SIZE + halfRemainder,
        y: y
      };
      var lineBottom = {
        x: x + SIZE + halfRemainder,
        y: y + height - this._ctx.lineWidth / 2 - SIZE
      };
      var lineLeft = {
        x: x,
        y: y + SIZE + halfRemainder
      };
      var lineRight = {
        x: x + width - this._ctx.lineWidth / 2 - SIZE,
        y: y + SIZE + halfRemainder
      };

      //Отрисовка горизонтальных линий
      this.drawLineZigzag(lineTop.x, lineTop.y, lengthLine, SIZE, false);
      this.drawLineZigzag(lineBottom.x, lineBottom.y, lengthLine, SIZE, false, true);

      // //Отрисовка вертикальных линий
      this.drawLineZigzag(lineLeft.x, lineLeft.y, lengthLine, SIZE, true);
      this.drawLineZigzag(lineRight.x, lineRight.y, lengthLine, SIZE, true, true);

      //Соединяем линии в углах прямоугольника
      this._ctx.beginPath();
      this._ctx.moveTo(lineTop.x, lineTop.y);
      this._ctx.lineTo(lineLeft.x, lineLeft.y);

      this._ctx.moveTo(lineTop.x + lengthLine, lineTop.y);
      this._ctx.lineTo(lineRight.x + SIZE, lineRight.y);

      this._ctx.moveTo(lineLeft.x, lineLeft.y + lengthLine);
      this._ctx.lineTo(lineBottom.x, lineBottom.y + SIZE);

      this._ctx.moveTo(lineRight.x + SIZE, lineRight.y + lengthLine);
      this._ctx.lineTo(lineBottom.x + lengthLine, lineBottom.y + SIZE);

      this._ctx.stroke();

    },

    /**
     * Отрисовка линии зигзагами
     * @param {number} x
     * @param {number} y
     * @param {number} length
     * @param {number} size
     * @param {boolean} vertical
     * @param {boolean} turnOver
     */
    drawLineZigzag: function(x, y, length, size, vertical, turnOver) {
      var position = vertical ? y + size : x + size;
      var positionEnd = position + length;
      var moveTo = {
        x: x,
        y: y
      };
      var toX;
      var toY;

      this._ctx.strokeStyle = '#ffe753';

      this._ctx.beginPath();

      if (turnOver) {
        moveTo.x = vertical ? x + size : x;
        moveTo.y = vertical ? y : y + size;
      }

      this._ctx.moveTo(moveTo.x, moveTo.y);

      while (position < positionEnd) {
        toX = vertical ? x + size : position;
        toY = vertical ? position : y + size;
        if (turnOver) {
          toX = vertical ? x : position;
          toY = vertical ? position : y;
        }
        this._ctx.lineTo(toX, toY);

        toX = vertical ? x : position + size;
        toY = vertical ? position + size : y;
        if (turnOver) {
          toX = vertical ? x + size : position + size;
          toY = vertical ? position + size : y + size;
        }
        this._ctx.lineTo(toX, toY);

        position += size * 2;
      }

      this._ctx.stroke();
    },

    /**
     * Отрисовка оверлея
     */
    drawOverlay: function() {
      var widthLeftRect = ((this._container.width - this._resizeConstraint.side) / 2) - this._ctx.lineWidth;
      var widthRightRect = ((this._container.width - this._resizeConstraint.side) / 2) + (this._ctx.lineWidth / 2);
      var heightTopRect = ((this._container.height - this._resizeConstraint.side) / 2) - this._ctx.lineWidth;
      var heightBottomRect = ((this._container.height - this._resizeConstraint.side) / 2) + (this._ctx.lineWidth / 2);

      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

      //Левый прямоугольник
      this._ctx.fillRect(-(this._container.width / 2), -(this._container.height / 2),
        widthLeftRect,
        this._container.height);

      //Правый прямоугольник
      this._ctx.fillRect(
        (this._container.width / 2) - widthRightRect, -(this._container.height / 2),
        widthRightRect,
        this._container.height);

      //Верхний прямоугольник
      this._ctx.fillRect(-(this._container.width / 2) + widthLeftRect, -(this._container.height / 2),
        this._resizeConstraint.side + (this._ctx.lineWidth / 2),
        heightTopRect);

      //Нижний прямоугольник
      this._ctx.fillRect(-(this._container.width / 2) + widthLeftRect,
        (this._container.height / 2) - heightBottomRect,
        this._resizeConstraint.side + (this._ctx.lineWidth / 2),
        heightBottomRect);
    },

    /**
     * Отрисовка подписи над прямоугольником, обозначающим область изображения после кадрирования
     * @param {string} caption
     */
    drawRectConstrainCaption: function(caption) {
      var fontSize = 12;

      this._ctx.fillStyle = 'white';
      this._ctx.font = fontSize + 'px "Open Sans"';
      this._ctx.textAlign = 'center';

      this._ctx.fillText(
        caption,
        0, -(this._resizeConstraint.side / 2) - fontSize);
    },

    /**
     * Включение режима перемещения. Запоминается текущее положение курсора,
     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
     * позволяющие перерисовывать изображение по мере перетаскивания.
     * @param {number} x
     * @param {number} y
     * @private
     */
    _enterDragMode: function(x, y) {
      this._cursorPosition = new Coordinate(x, y);
      document.body.addEventListener('mousemove', this._onDrag);
      document.body.addEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Выключение режима перемещения.
     * @private
     */
    _exitDragMode: function() {
      this._cursorPosition = null;
      document.body.removeEventListener('mousemove', this._onDrag);
      document.body.removeEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Перемещение изображения относительно кадра.
     * @param {number} x
     * @param {number} y
     * @private
     */
    updatePosition: function(x, y) {
      this.moveConstraint(
        this._cursorPosition.x - x,
        this._cursorPosition.y - y);
      this._cursorPosition = new Coordinate(x, y);
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onDragStart: function(evt) {
      this._enterDragMode(evt.clientX, evt.clientY);
    },

    /**
     * Обработчик окончания перетаскивания.
     * @private
     */
    _onDragEnd: function() {
      this._exitDragMode();
    },

    /**
     * Обработчик события перетаскивания.
     * @param {MouseEvent} evt
     * @private
     */
    _onDrag: function(evt) {
      this.updatePosition(evt.clientX, evt.clientY);
    },

    /**
     * Добавление элемента в DOM.
     * @param {Element} element
     */
    setElement: function(element) {
      if (this._element === element) {
        return;
      }

      this._element = element;
      this._element.insertBefore(this._container, this._element.firstChild);
      // Обработчики начала и конца перетаскивания.
      this._container.addEventListener('mousedown', this._onDragStart);
    },

    /**
     * Возвращает кадрирование элемента.
     * @return {Square}
     */
    getConstraint: function() {
      return this._resizeConstraint;
    },

    /**
     * Смещает кадрирование на значение указанное в параметрах.
     * @param {number} deltaX
     * @param {number} deltaY
     * @param {number} deltaSide
     */
    moveConstraint: function(deltaX, deltaY, deltaSide) {
      this.setConstraint(
        this._resizeConstraint.x + (deltaX || 0),
        this._resizeConstraint.y + (deltaY || 0),
        this._resizeConstraint.side + (deltaSide || 0));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     */
    setConstraint: function(x, y, side) {
      if (typeof x !== 'undefined') {
        this._resizeConstraint.x = x;
      }

      if (typeof y !== 'undefined') {
        this._resizeConstraint.y = y;
      }

      if (typeof side !== 'undefined') {
        this._resizeConstraint.side = side;
      }

      requestAnimationFrame(function() {
        this.redraw();

        var evt = document.createEvent('Event');
        evt.initEvent('resizerchange', true, true);
        window.dispatchEvent(evt);
      }.bind(this));
    },

    /**
     * Удаление. Убирает контейнер из родительского элемента, убирает
     * все обработчики событий и убирает ссылки.
     */
    remove: function() {
      this._element.removeChild(this._container);

      this._container.removeEventListener('mousedown', this._onDragStart);
      this._container = null;
    },

    /**
     * Экспорт обрезанного изображения как HTMLImageElement и исходником
     * картинки в src в формате dataURL.
     * @return {Image}
     */
    exportImage: function() {
      // Создаем Image, с размерами, указанными при кадрировании.
      var imageToExport = new Image();

      // Создается новый canvas, по размерам совпадающий с кадрированным
      // изображением, в него добавляется изображение взятое из канваса
      // с измененными координатами и сохраняется в dataURL, с помощью метода
      // toDataURL. Полученный исходный код, записывается в src у ранее
      // созданного изображения.
      var temporaryCanvas = document.createElement('canvas');
      var temporaryCtx = temporaryCanvas.getContext('2d');
      temporaryCanvas.width = this._resizeConstraint.side;
      temporaryCanvas.height = this._resizeConstraint.side;
      temporaryCtx.drawImage(this._image, -this._resizeConstraint.x, -this._resizeConstraint.y);
      imageToExport.src = temporaryCanvas.toDataURL('image/png');

      return imageToExport;
    }
  };

  /**
   * Вспомогательный тип, описывающий квадрат.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @param {number} side
   * @private
   */
  var Square = function(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  };

  /**
   * Вспомогательный тип, описывающий координату.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @private
   */
  var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
  };

  window.Resizer = Resizer;
})();
