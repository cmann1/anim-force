var app;
(function (app) {
    var Clipboard = /** @class */ (function () {
        function Clipboard() {
        }
        Clipboard.getData = function (type) {
            return Clipboard.data[type];
        };
        Clipboard.setData = function (type, data) {
            Clipboard.data[type] = data;
        };
        Clipboard.data = {};
        return Clipboard;
    }());
    app.Clipboard = Clipboard;
})(app || (app = {}));
//# sourceMappingURL=Clipboard.js.map