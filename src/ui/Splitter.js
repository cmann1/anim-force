var app;
(function (app) {
    var ui;
    (function (ui) {
        var Splitter = (function () {
            // private
            function Splitter($first, $second, orientation, defaultPosition, anchor, id) {
                if (anchor === void 0) { anchor = 0 /* FIRST */; }
                if (id === void 0) { id = null; }
                var _this = this;
                this._barThickness = 6;
                this.cursor = 'col-resize';
                this.widthProp = 'width';
                this.xProp = 'X';
                this.leftProp = 'left';
                this.rightProp = 'right';
                this.dragOffset = 0;
                /*
                 * Events
                 */
                this.onMouseDown = function (event) {
                    if (event.button == 0) {
                        _this.dragOffset = event["offset" + _this.xProp] - Math.floor(_this._barThickness * 0.5) + 1;
                        app.$window
                            .on('mousemove', _this.onMouseMove)
                            .on('mouseup', _this.onMouseUp);
                        app.$body.css('cursor', _this.cursor);
                    }
                    event.preventDefault();
                };
                this.onMouseMove = function (event) {
                    var offset = _this.$container.offset();
                    var newPosition = event["page" + _this.xProp] - offset[_this.leftProp] - _this.dragOffset;
                    if (_this.anchor == 1 /* SECOND */) {
                        newPosition = _this.$container[_this.widthProp]() - newPosition;
                    }
                    _this.position = newPosition;
                    _this.update();
                };
                this.onMouseUp = function (event) {
                    app.$window
                        .off('mousemove', _this.onMouseMove)
                        .off('mouseup', _this.onMouseUp);
                    app.$body.css('cursor', '');
                    if (_this.id !== null) {
                        localStorage.setItem(_this.id, _this.position.toString());
                    }
                };
                this.onContextMenu = function (event) {
                    event.preventDefault();
                    return false;
                };
                this.$container = $first.parent();
                this.$container.addClass('splitter-container');
                $first.addClass('splitter-partition');
                $second.addClass('splitter-partition');
                this.$bar = $('<div>')
                    .addClass('splitter-bar')
                    .on('contextmenu', this.onContextMenu)
                    .on('mousedown', this.onMouseDown);
                this.$container.append(this.$bar);
                if (id != null) {
                    this.id = 'splitter-' + id + '-position';
                    var p = localStorage.getItem(this.id);
                    if (p !== null) {
                        defaultPosition = parseFloat(p);
                    }
                    else {
                        localStorage.setItem(this.id, defaultPosition.toString());
                    }
                }
                this.$first = $first;
                this.$second = $second;
                this.anchor = anchor;
                this.position = defaultPosition;
                this.orientation = orientation;
            }
            Splitter.prototype.update = function () {
                var thickness = this._barThickness * 0.5;
                if (this.position < 0) {
                    this.position = 0;
                }
                else {
                    var maxPosition = this.$container[this.widthProp]();
                    if (this.position > maxPosition) {
                        this.position = maxPosition;
                    }
                }
                if (this.anchor == 0 /* FIRST */) {
                    this.$first.css(this.widthProp, this.position - thickness);
                    this.$second.css(this.leftProp, this.position + thickness);
                    this.$bar.css(this.leftProp, this.position - thickness);
                }
                else {
                    this.$first.css(this.rightProp, this.position + thickness);
                    this.$second.css(this.widthProp, this.position - thickness);
                    this.$bar.css(this.rightProp, this.position - thickness);
                }
                this.$first.trigger('resize');
                this.$second.trigger('resize');
            };
            Object.defineProperty(Splitter.prototype, "orientation", {
                get: function () {
                    return this._orientation;
                },
                set: function (value) {
                    this._orientation = value;
                    var props = { left: '', right: '', top: '', bottom: '', width: '', height: '' };
                    this.$first.css(props);
                    this.$second.css(props);
                    this.$bar.css(props);
                    this.$bar.removeClass('splitter-ver').removeClass('splitter-hor');
                    if (value == 1 /* HORIZONTAL */) {
                        this.cursor = 'col-resize';
                        this.xProp = 'X';
                        this.widthProp = 'width';
                        this.leftProp = 'left';
                        this.rightProp = 'right';
                        this.$first.css({ top: 0, bottom: 0, left: 0 });
                        this.$second.css({ top: 0, bottom: 0, right: 0 });
                        this.$bar
                            .css({ top: 0, bottom: 0, width: this._barThickness, cursor: this.cursor })
                            .addClass('splitter-ver');
                    }
                    else {
                        this.cursor = 'row-resize';
                        this.xProp = 'Y';
                        this.widthProp = 'height';
                        this.leftProp = 'top';
                        this.rightProp = 'bottom';
                        this.$first.css({ left: 0, right: 0, top: 0 });
                        this.$second.css({ left: 0, right: 0, bottom: 0 });
                        this.$bar
                            .css({ left: 0, right: 0, height: this._barThickness, cursor: this.cursor })
                            .addClass('splitter-hor');
                    }
                    this.update();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Splitter.prototype, "barThickness", {
                get: function () {
                    return this._barThickness;
                },
                set: function (value) {
                    this._barThickness = Math.ceil(value / 2) * 2;
                    this.$bar.css(this.widthProp, this._barThickness);
                    this.update();
                },
                enumerable: true,
                configurable: true
            });
            return Splitter;
        }());
        ui.Splitter = Splitter;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=Splitter.js.map