var app;
(function (app) {
    var model;
    (function (model) {
        var HandleShape;
        (function (HandleShape) {
            HandleShape[HandleShape["CIRCLE"] = 0] = "CIRCLE";
            HandleShape[HandleShape["SQUARE"] = 1] = "SQUARE";
            HandleShape[HandleShape["LINE"] = 2] = "LINE";
        })(HandleShape = model.HandleShape || (model.HandleShape = {}));
        var Handle = (function () {
            function Handle(interaction, radius, shape, fill, outline) {
                if (radius === void 0) { radius = app.Config.handleRadius; }
                if (shape === void 0) { shape = HandleShape.CIRCLE; }
                if (fill === void 0) { fill = app.Config.control; }
                if (outline === void 0) { outline = app.Config.outline; }
                this.active = true;
                this.interaction = interaction;
                this.radius = radius;
                this.shape = shape;
                this.fill = fill;
                this.outline = outline;
            }
            Handle.prototype.draw = function (ctx, worldScale, selected, highlighted) {
                ctx.save();
                var x = this.x * worldScale;
                var y = this.y * worldScale;
                var x2 = this.x2 * worldScale;
                var y2 = this.y2 * worldScale;
                var radius = this.radius;
                var shape = this.shape;
                var fill = selected ? app.Config.selected : (highlighted ? app.Config.highlighted : this.fill);
                ctx.translate(x, y);
                ctx.rotate(this.rotation);
                // Outline
                ctx.beginPath();
                ctx.fillStyle = this.outline;
                if (shape == HandleShape.CIRCLE) {
                    ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
                }
                else if (shape == HandleShape.SQUARE) {
                    ctx.rect(-radius - 1, -radius - 1, (radius + 1) * 2, (radius + 1) * 2);
                }
                else if (shape == HandleShape.LINE) {
                    ctx.lineWidth = radius + 2;
                    ctx.strokeStyle = this.outline;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x2 - x, y2 - y);
                    ctx.stroke();
                }
                ctx.fill();
                // Fill
                ctx.beginPath();
                ctx.fillStyle = fill;
                if (shape == HandleShape.CIRCLE) {
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                }
                else if (shape == HandleShape.SQUARE) {
                    ctx.rect(-radius, -radius, radius * 2, radius * 2);
                }
                else if (shape == HandleShape.LINE) {
                    ctx.lineWidth = radius;
                    ctx.strokeStyle = fill;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x2 - x, y2 - y);
                    ctx.stroke();
                }
                ctx.fill();
                ctx.restore();
            };
            Handle.prototype.expand = function (aabb, worldScale) {
                var x = this.x;
                var y = this.y;
                var x2 = this.x2;
                var y2 = this.y2;
                var radius = (this.radius + app.Config.interactionTolerance) / worldScale;
                var shape = this.shape;
                if (shape == HandleShape
                    .CIRCLE || shape == HandleShape.SQUARE) {
                    aabb.unionF(x - radius, y - radius, x + radius, y + radius);
                }
                else if (shape == HandleShape.LINE) {
                    aabb.unionF((x < x2 ? x : x2) - radius, (y < y2 ? y : y2) - radius, (x > x2 ? x : x2) + radius, (y > y2 ? y : y2) + radius);
                }
            };
            return Handle;
        }());
        model.Handle = Handle;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Handle.js.map