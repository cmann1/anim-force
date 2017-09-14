var app;
(function (app) {
    var ui;
    (function (ui) {
        var Dialog = (function () {
            function Dialog(title, options) {
                var _this = this;
                this.title = '';
                this.icon = '';
                this.isOpen = false;
                this.buttonData = {};
                this.confirmButton = null;
                this.$focusButton = null;
                this.confirmValue = null;
                this.cancelValue = null;
                /*
                 * Events
                 */
                this.onButtonClick = function (event) {
                    var id = event.target.innerText;
                    if (id == _this.confirmButton) {
                        _this.confirm();
                        _this.dlg.close();
                    }
                    else if (_this.buttonData[id].cancel) {
                        _this.cancel();
                        _this.dlg.close();
                    }
                    else if (_this.buttonCallback) {
                        _this.buttonCallback(id);
                    }
                };
                this.onDlgClose = function () {
                    if (_this.isOpen) {
                        _this.cancel();
                        if (_this.closeCallback) {
                            _this.closeCallback(_this);
                        }
                    }
                };
                this.title = title;
                var defaults = {
                    name: 'Dlg' + (++Dialog.nextId),
                    dlgClass: '',
                    overlay: true,
                    overlayClass: 'clear',
                    closeButton: 'title',
                    closeOnEsc: true,
                    closeOnClick: 'overlay',
                    draggable: false,
                    repositionOnOpen: true,
                    position: { x: 'center', y: 'center' },
                    offset: { x: 0, y: 0 },
                    zIndex: 10000,
                    type: 'plain',
                    icon: null
                };
                Object['assign'](defaults, options || {});
                options = defaults;
                this.name = options.name;
                this.$dlg = $("<div class=\"dialog button-layout " + options.type + "\">\n\t\t\t\t\t<div class=\"content-pane\">\n\t\t\t\t\t\n\t\t\t\t\t</div>\n\t\t\t\t</div>");
                if (options.buttons) {
                    var $buttonBar = $("<div class=\"button-bar\"></div>");
                    this.$dlg.append($buttonBar);
                    var rightButtons = [];
                    var i = 0;
                    for (var _i = 0, _a = options.buttons; _i < _a.length; _i++) {
                        var buttonData = _a[_i];
                        if (typeof (buttonData) != 'object') {
                            buttonData = { label: buttonData };
                        }
                        if (i++ > 0)
                            $buttonBar.append(' ');
                        var $element = void 0;
                        if (buttonData.content) {
                            $element = typeof (buttonData.content) == 'string' ? $(buttonData.content) : buttonData.content;
                        }
                        else {
                            $element = $("<button class=\"button\">" + buttonData.label + "</button>");
                            if (buttonData.confirm)
                                this.confirmButton = buttonData.label;
                        }
                        if (buttonData.rightAlign)
                            rightButtons.push($element);
                        else
                            $buttonBar.append($element);
                        if (buttonData.className)
                            $element.addClass(buttonData.className);
                        if (buttonData.focus)
                            this.$focusButton = $element;
                        buttonData.$element = $element;
                        this.buttonData[buttonData.label] = buttonData;
                    }
                    if (rightButtons.length) {
                        $buttonBar.append($('<div class="flex-filler wide"></div>'));
                        for (var _b = 0, rightButtons_1 = rightButtons; _b < rightButtons_1.length; _b++) {
                            var $button = rightButtons_1[_b];
                            $buttonBar.append($button);
                        }
                    }
                }
                this.$buttons = this.$dlg.find('.button-bar button');
                this.confirmCallback = options.confirm;
                this.cancelCallback = options.cancel;
                this.buttonCallback = options.button;
                this.closeCallback = options.close;
                this.$contentPane = this.$dlg.find('.content-pane');
                this.$dlg.find('.button-bar').on('click', 'button', this.onButtonClick);
                if (options.content) {
                    this.setContent(options.content);
                }
                if (!options.icon) {
                    if (options.type == 'info')
                        options.icon = 'info-circle';
                    else if (options.type == 'warning' || options.type == 'error')
                        options.icon = 'warning';
                }
                if (options.icon) {
                    this.icon = "<i class=\"fa fa-" + options.icon + " fa-2x\"></i> ";
                }
                this.dlg = new jBox('Modal', {
                    title: this.icon + this.title,
                    addClass: 'jbox-dialog-wrapper ' + options.type + ' ' + options.dlgClass,
                    overlay: options.overlay,
                    overlayClass: options.overlayClass,
                    closeButton: options.closeButton,
                    closeOnEsc: options.closeOnEsc,
                    closeOnClick: options.closeOnClick,
                    draggable: options.draggable,
                    repositionOnOpen: options.repositionOnOpen,
                    repositionOnContent: true,
                    reposition: true,
                    isolateScroll: false,
                    content: this.$dlg,
                    onClose: this.onDlgClose,
                    zIndex: options.zIndex,
                    position: options.position,
                    offset: options.offset
                });
            }
            Dialog.prototype.close = function () {
                if (this.isOpen) {
                    this.cancel();
                    this.dlg.close();
                }
            };
            Dialog.prototype.show = function () {
                this.isOpen = true;
                this.dlg.open();
                if (this.$focusButton) {
                    this.$focusButton.focus();
                }
            };
            Dialog.prototype.disable = function () {
                this.dlg.disable();
            };
            Dialog.prototype.enable = function () {
                this.dlg.enable();
            };
            Dialog.prototype.getButtons = function () {
                return this.$buttons;
            };
            Dialog.prototype.getButton = function (label) {
                var buttonData = this.buttonData[label];
                return buttonData ? buttonData.$element : null;
            };
            Dialog.prototype.getContent = function () {
                return this.$contentPane;
            };
            Dialog.prototype.reposition = function () {
                this.dlg.position();
            };
            Dialog.prototype.setContent = function (content) {
                this.$contentPane.empty().append(content);
                this.dlg && this.dlg.setContent(this.$dlg);
            };
            Dialog.prototype.setTitle = function (title) {
                if (title == this.title)
                    return;
                this.title = title;
                this.dlg.setTitle(this.icon + this.title);
            };
            Dialog.prototype.setConfirmCallback = function (callback) {
                this.confirmCallback = callback;
            };
            Dialog.prototype.setCancelCallback = function (callback) {
                this.cancelCallback = callback;
            };
            Dialog.prototype.setName = function (name) {
                this.name = name;
            };
            //
            Dialog.prototype.confirm = function (value) {
                if (this.confirmCallback) {
                    this.confirmCallback(this.name, value != undefined ? value : this.getConfirmValue());
                }
            };
            Dialog.prototype.cancel = function (value) {
                if (this.cancelCallback) {
                    this.cancelCallback(this.name, value != undefined ? value : this.getCancelValue());
                }
            };
            Dialog.prototype.getConfirmValue = function () {
                return this.confirmValue;
            };
            Dialog.prototype.getCancelValue = function () {
                return this.cancelValue;
            };
            return Dialog;
        }());
        Dialog.nextId = 0;
        ui.Dialog = Dialog;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=Dialog.js.map