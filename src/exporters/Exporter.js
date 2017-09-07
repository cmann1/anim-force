var app;
(function (app) {
    var exporters;
    (function (exporters) {
        var Exporter = (function () {
            function Exporter() {
            }
            Exporter.prototype.exportModel = function (model) {
                return '';
            };
            Exporter.num = function (value) {
                return value.toFixed(4).replace(/\.0000/, '');
            };
            return Exporter;
        }());
        exporters.Exporter = Exporter;
    })(exporters = app.exporters || (app.exporters = {}));
})(app || (app = {}));
//# sourceMappingURL=Exporter.js.map