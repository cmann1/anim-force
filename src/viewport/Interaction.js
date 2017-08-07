var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var Interaction = (function () {
            function Interaction() {
                this.offset = 0;
                this.x = 0;
                this.y = 0;
                this.success = false;
            }
            return Interaction;
        }());
        viewport.Interaction = Interaction;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Interaction.js.map