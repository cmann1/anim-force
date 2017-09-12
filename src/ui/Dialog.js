var app;
(function (app) {
    var ui;
    (function (ui) {
        var Dialog = (function () {
            function Dialog(title, options) {
                var _this = this;
                this.isOpen = false;
                this.buttonData = {};
                this.confirmButton = null;
                this.$focusButton = null;
                /*
                 * Events
                 */
                this.onButtonClick = function (event) {
                    var id = event.target.innerText;
                    if (id == _this.confirmButton) {
                        _this.confirm();
                    }
                    else if (_this.buttonData[id].cancel) {
                        _this.cancel();
                    }
                    else if (_this.buttonCallback) {
                        _this.buttonCallback(id);
                    }
                };
                this.onDlgClose = function () {
                    if (_this.isOpen) {
                        _this.cancel();
                    }
                };
                var defaults = {
                    overlay: true,
                    overlayClass: 'clear',
                    closeButton: true,
                    closeOnEsc: true,
                    closeOnClick: 'body',
                    type: 'plain',
                    icon: null
                };
                Object['assign'](defaults, options || {});
                options = defaults;
                this.$dlg = $("<div class=\"dialog " + options.type + "\">\n\t\t\t\t\t<div class=\"content-pane\">\n\t\t\t\t\t\n\t\t\t\t\t</div>\n\t\t\t\t</div>");
                if (options.buttons) {
                    var $buttonBar = $("<div class=\"button-bar\"></div>");
                    this.$dlg.append($buttonBar);
                    var i = 0;
                    for (var _i = 0, _a = options.buttons; _i < _a.length; _i++) {
                        var buttonData = _a[_i];
                        if (typeof (buttonData) != 'object') {
                            buttonData = { label: buttonData };
                        }
                        if (i++ > 0)
                            $buttonBar.append(' ');
                        var $button = $("<button class=\"button\">" + buttonData.label + "</button>");
                        $buttonBar.append($button);
                        if (buttonData.className)
                            $button.addClass(buttonData.className);
                        if (buttonData.confirm)
                            this.confirmButton = buttonData.label;
                        if (buttonData.focus)
                            this.$focusButton = $button;
                        this.buttonData[buttonData.label] = buttonData;
                    }
                }
                if (options.confirm)
                    this.confirmCallback = options.confirm;
                if (options.cancel)
                    this.cancelCallback = options.cancel;
                if (options.button)
                    this.buttonCallback = options.button;
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
                var icon = '';
                if (options.icon) {
                    icon = "<i class=\"fa fa-" + options.icon + " fa-2x\"></i> ";
                }
                this.dlg = new jBox('Modal', {
                    title: icon + title,
                    addClass: options.type,
                    overlay: options.overlay,
                    overlayClass: options.overlayClass,
                    closeButton: options.closeButton,
                    closeOnEsc: options.closeOnEsc,
                    closeOnClick: options.closeOnClick,
                    content: this.$dlg,
                    onClose: this.onDlgClose
                });
            }
            Dialog.prototype.show = function () {
                this.isOpen = true;
                this.dlg.open();
                if (this.$focusButton) {
                    this.$focusButton.focus();
                }
            };
            Dialog.prototype.confirm = function (value) {
                this.isOpen = false;
                this.dlg.close();
                if (this.confirmCallback) {
                    this.confirmCallback(value || this.getConfirmValue());
                }
            };
            Dialog.prototype.cancel = function (value) {
                this.isOpen = false;
                this.dlg.close();
                if (this.cancelCallback) {
                    this.cancelCallback(value || this.getCancelValue());
                }
            };
            Dialog.prototype.setContent = function (content) {
                this.$contentPane.empty().append(content);
            };
            Dialog.prototype.getContent = function () {
                return this.$contentPane;
            };
            Dialog.prototype.getConfirmValue = function () {
                return null;
            };
            Dialog.prototype.getCancelValue = function () {
                return null;
            };
            return Dialog;
        }());
        ui.Dialog = Dialog;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=Dialog.js.map