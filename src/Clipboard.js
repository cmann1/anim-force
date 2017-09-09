var app;
(function (app) {
    var Clipboard = (function () {
        function Clipboard() {
        }
        Clipboard.getData = function (type) {
            return Clipboard.data[type];
        };
        Clipboard.setData = function (type, data) {
            Clipboard.data[type] = data;
        };
        return Clipboard;
    }());
    Clipboard.data = {};
    app.Clipboard = Clipboard;
})(app || (app = {}));
//# sourceMappingURL=Clipboard.js.map