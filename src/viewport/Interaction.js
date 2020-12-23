var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var Interaction = /** @class */ (function () {
            function Interaction() {
                this.offset = 0;
                this.x = 0;
                this.y = 0;
                this.initialX = 0;
                this.initialY = 0;
                this.constrain = false;
                this.success = false;
                this.selectUnderneath = false;
            }
            Interaction.prototype.reset = function () {
                this.success = false;
            };
            return Interaction;
        }());
        viewport.Interaction = Interaction;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Interaction.js.map