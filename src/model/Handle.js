var app;
(function (app) {
    var model;
    (function (model) {
        var HandleShape;
        (function (HandleShape) {
            HandleShape[HandleShape["CIRCLE"] = 0] = "CIRCLE";
            HandleShape[HandleShape["SQUARE"] = 1] = "SQUARE";
            HandleShape[HandleShape["TRI"] = 2] = "TRI";
            HandleShape[HandleShape["LINE"] = 3] = "LINE";
        })(HandleShape = model.HandleShape || (model.HandleShape = {}));
        var HandleType;
        (function (HandleType) {
            HandleType[HandleType["VECTOR"] = 0] = "VECTOR";
            HandleType[HandleType["AXIS"] = 1] = "AXIS";
            HandleType[HandleType["SCALE"] = 2] = "SCALE";
            HandleType[HandleType["ROTATION"] = 3] = "ROTATION";
        })(HandleType = model.HandleType || (model.HandleType = {}));
        var Handle = (function () {
            function Handle(node, interaction, radius, shape, type, fill, outline) {
                if (radius === void 0) { radius = app.Config.handleRadius; }
                if (shape === void 0) { shape = HandleShape.CIRCLE; }
                if (type === void 0) { type = HandleType.VECTOR; }
                if (fill === void 0) { fill = app.Config.control; }
                if (outline === void 0) { outline = app.Config.outline; }
                this.active = true;
                this.rotation = 0;
                this.node = node;
                this.interaction = interaction;
                this.radius = radius;
                this.shape = shape;
                this.type = type;
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
                ctx.strokeStyle = this.outline;
                ctx.fillStyle = fill;
                if (shape == HandleShape.CIRCLE) {
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                }
                else if (shape == HandleShape.SQUARE) {
                    ctx.rect(-radius, -radius, radius * 2, radius * 2);
                }
                else if (shape == HandleShape.TRI) {
                    ctx.moveTo(-radius, radius);
                    ctx.lineTo(radius, radius);
                    ctx.lineTo(0, -radius);
                    ctx.closePath();
                }
                else if (shape == HandleShape.LINE) {
                    ctx.lineWidth = radius + 2;
                    ctx.strokeStyle = this.outline;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x2 - x, y2 - y);
                    ctx.stroke();
                    ctx.lineWidth = radius;
                    ctx.strokeStyle = fill;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(x2 - x, y2 - y);
                    ctx.stroke();
                }
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            };
            Handle.prototype.expand = function (aabb, worldScale) {
                var x = this.x;
                var y = this.y;
                var x2 = this.x2;
                var y2 = this.y2;
                var radius = (this.radius + app.Config.interactionTolerance) / worldScale;
                var shape = this.shape;
                if (shape == HandleShape.CIRCLE || shape == HandleShape.SQUARE || shape == HandleShape.TRI) {
                    aabb.unionF(x - radius, y - radius, x + radius, y + radius);
                }
                else if (shape == HandleShape.LINE) {
                    aabb.unionF((x < x2 ? x : x2) - radius, (y < y2 ? y : y2) - radius, (x > x2 ? x : x2) + radius, (y > y2 ? y : y2) + radius);
                }
            };
            Handle.prototype.hitTest = function (worldX, worldY, worldScaleFactor, result) {
                var x = this.x;
                var y = this.y;
                var x2 = this.x2;
                var y2 = this.y2;
                var radius = (this.radius + app.Config.interactionTolerance) * worldScaleFactor;
                var shape = this.shape;
                var hit = false;
                var dx = worldX - x;
                var dy = worldY - y;
                if (this.rotation != 0) {
                    var local = app.MathUtils.rotate(dx, dy, this.rotation);
                    dx = local.x;
                    dy = local.y;
                }
                if (shape == HandleShape.LINE) {
                    var lineDx = x2 - x;
                    var lineDy = y2 - y;
                    var u = ((worldX - x) * lineDx + (worldY - y) * lineDy) / (lineDx * lineDx + lineDy * lineDy);
                    var lineX, lineY;
                    if (u < 0) {
                        lineX = x;
                        lineY = y;
                    }
                    else if (u > 1) {
                        lineX = x2;
                        lineY = y2;
                    }
                    else {
                        lineX = x + u * lineDx;
                        lineY = y + u * lineDy;
                    }
                    dx = worldX - lineX;
                    dy = worldY - lineY;
                }
                if (shape == HandleShape.CIRCLE || shape == HandleShape.LINE) {
                    hit = Math.sqrt(dx * dx + dy * dy) <= radius;
                }
                else if (shape == HandleShape.SQUARE || shape == HandleShape.TRI) {
                    hit = dx >= -radius && dx <= radius && dy >= -radius && dy <= radius;
                }
                if (hit) {
                    result.part = this.interaction;
                    result.node = this.node;
                    if (this.type == HandleType.VECTOR) {
                        result.x = worldX - x;
                        result.y = worldY - y;
                        result.offset = this.node.parent ? -this.node.parent.worldRotation : 0;
                    }
                    else if (this.type == HandleType.AXIS) {
                        result.x = worldX - x;
                        result.y = worldY - y;
                        result.offset = 1;
                    }
                    else if (this.type == HandleType.SCALE) {
                        var local = app.MathUtils.rotate(worldX - this.node.worldX, worldY - this.node.worldY, this.rotation);
                        result.x = worldX - x;
                        result.y = worldY - y;
                        result.initialX = this.node.scaleX;
                        result.initialY = this.node.scaleY;
                        result.offset = Math.sqrt(local.x * local.x + local.y * local.y);
                    }
                    else if (this.type == HandleType.ROTATION) {
                        result.initialX = this.node.rotation;
                        result.offset = (this.node.parent ? this.node.parent.worldRotation : 0)
                            + (Math.atan2(worldY - this.node.worldY, worldX - this.node.worldX)
                                - this.node.worldRotation);
                    }
                }
                return hit;
            };
            return Handle;
        }());
        model.Handle = Handle;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Handle.js.map