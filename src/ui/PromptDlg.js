var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var app;
(function (app) {
    var ui;
    (function (ui) {
        var Key = KeyCodes.Key;
        var PromptDlg = (function (_super) {
            __extends(PromptDlg, _super);
            function PromptDlg(title, options) {
                var _this = _super.call(this, title, PromptDlg.getOptions(options)) || this;
                /*
                 * Events
                 */
                _this.onInputKeyPress = function (event) {
                    if (event.keyCode == Key.Enter) {
                        _this.confirm(_this.$input.val());
                        _this.dlg.close();
                    }
                };
                _this.$input = $('<input type="text"/>').on('keypress', _this.onInputKeyPress);
                _super.prototype.setContent.call(_this, _this.$input);
                return _this;
            }
            PromptDlg.prototype.show = function (value) {
                if (value === void 0) { value = null; }
                this.isOpen = true;
                this.$input.val(value === null ? '' : value);
                this.dlg.open();
                this.$input.focus();
            };
            PromptDlg.prototype.setContent = function (content) { console.log('Set content not allowed on PromptDlg'); };
            PromptDlg.getOptions = function (options) {
                if (!options.buttons) {
                    options.buttons = [
                        { label: 'Save', confirm: true },
                        { label: 'Cancel', cancel: true }
                    ];
                }
                return options;
            };
            PromptDlg.prototype.getConfirmValue = function () {
                return this.$input.val();
            };
            PromptDlg.prototype.getCancelValue = function () { return null; };
            return PromptDlg;
        }(ui.Dialog));
        ui.PromptDlg = PromptDlg;
    })(ui = app.ui || (app.ui = {}));
})(app || (app = {}));
//# sourceMappingURL=PromptDlg.js.map