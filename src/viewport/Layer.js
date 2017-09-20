var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var Layer = (function () {
            function Layer() {
                this.visible = true;
                this.locked = false;
            }
            return Layer;
        }());
        viewport.Layer = Layer;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Layer.js.map