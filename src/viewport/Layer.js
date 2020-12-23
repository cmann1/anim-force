var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var Layer = /** @class */ (function () {
            function Layer(layer, subLayer) {
                this.visible = true;
                this.locked = false;
                this.layer = layer;
                this.subLayer = subLayer;
            }
            return Layer;
        }());
        viewport.Layer = Layer;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Layer.js.map