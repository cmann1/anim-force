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
    var model;
    (function (model) {
        var BoxNode = (function (_super) {
            __extends(BoxNode, _super);
            function BoxNode(name, allowRotation, allowScale) {
                if (allowRotation === void 0) { allowRotation = true; }
                if (allowScale === void 0) { allowScale = true; }
                var _this = _super.call(this, name) || this;
                _this.boxWidth = 50;
                _this.boxHeight = 50;
                _this._allowRotation = false;
                _this._allowScale = false;
                _this.drawOutline = true;
                _this.hitRadius = -1;
                _this.allowRotation = allowRotation;
                _this.allowScale = allowScale;
                return _this;
            }
            BoxNode.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (!this.visible || !this.worldAABB.contains(x, y))
                    return false;
                if (this.hitTestHandles(x, y, worldScaleFactor, result)) {
                    return true;
                }
                var w = Math.abs(this.boxWidth * 0.5 * this.scaleX);
                var h = Math.abs(this.boxHeight * 0.5 * this.scaleY);
                var local = app.MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
                x = local.x;
                y = local.y;
                if (((this.selected || this.hitRadius == -1) && x >= -w && x <= w && y >= -h && y <= h) ||
                    (this.hitRadius != -1 && x * x + y * y <= this.hitRadius * this.hitRadius)) {
                    result.x = x;
                    result.y = y;
                    result.offset = this.rotation;
                    result.node = this;
                    result.part = 'base';
                    return true;
                }
                return false;
            };
            BoxNode.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                var part = interaction.part;
                if (part == 'scale' || part == 'scaleX' || part == 'scaleY') {
                    var local = app.MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
                    if (part == 'scale' && interaction.constrain) {
                        var scale = Math.sqrt(local.x * local.x + local.y * local.y) / interaction.offset;
                        this.scaleX = interaction.initialX * scale;
                        this.scaleY = interaction.initialY * scale;
                        this.onPropertyChange('scaleX');
                        this.onPropertyChange('scaleY');
                    }
                    else {
                        if (part == 'scale' || part == 'scaleX') {
                            this.scaleX = local.x / (this.boxWidth * 0.5);
                        }
                        if (part == 'scale' || part == 'scaleY') {
                            this.scaleY = local.y / (this.boxHeight * 0.5);
                        }
                        if (part == 'scale') {
                            this.onPropertyChange('scaleX');
                            this.onPropertyChange('scaleY');
                        }
                        else if (part == 'scaleX') {
                            this.onPropertyChange('scaleX');
                        }
                        else {
                            this.onPropertyChange('scaleY');
                        }
                    }
                    return true;
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            BoxNode.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var x = this.worldX;
                var y = this.worldY;
                var w = this.boxWidth * 0.5 * this.scaleX;
                var h = this.boxHeight * 0.5 * this.scaleY;
                if (this._allowRotation) {
                    this.rotationHandle.active = this.selected;
                    var local_1 = app.MathUtils.rotate(0, -h, this.worldRotation);
                    this.rotationHandle.x = x + local_1.x;
                    this.rotationHandle.y = y + local_1.y;
                }
                if (this._allowScale) {
                    this.scaleHandle.active = this.selected;
                    this.scaleXHandle.active = this.selected;
                    this.scaleYHandle.active = this.selected;
                    this.scaleHandle.rotation = this.scaleXHandle.rotation = this.scaleYHandle.rotation = this.worldRotation;
                    var local = app.MathUtils.rotate(w, h, this.worldRotation);
                    this.scaleHandle.x = x + local.x;
                    this.scaleHandle.y = y + local.y;
                    local = app.MathUtils.rotate(w, 0, this.worldRotation);
                    this.scaleXHandle.x = x + local.x;
                    this.scaleXHandle.y = y + local.y;
                    local = app.MathUtils.rotate(0, h, this.worldRotation);
                    this.scaleYHandle.x = x + local.x;
                    this.scaleYHandle.y = y + local.y;
                }
                this.prepareAABB(worldScale);
                if (this._allowRotation) {
                    var scaleX = Math.abs(this.scaleX);
                    var scaleY = Math.abs(this.scaleY);
                    var cosR = Math.abs(Math.cos(this.worldRotation));
                    var sinR = Math.abs(Math.sin(this.worldRotation));
                    var w1 = (this.boxHeight * scaleY * sinR + this.boxWidth * scaleX * cosR) * 0.5;
                    var h1 = (this.boxWidth * scaleX * sinR + this.boxHeight * scaleY * cosR) * 0.5;
                    this.worldAABB.unionF(this.worldX - w1, this.worldY - h1, this.worldX + w1, this.worldY + h1);
                }
                else {
                    this.worldAABB.unionF(this.worldX - this.boxWidth, this.worldY - this.boxHeight, this.worldX + this.boxWidth, this.worldY + this.boxHeight);
                }
                if (this.visible && drawList && this.worldAABB.intersects(viewport)) {
                    drawList.add(this);
                }
            };
            BoxNode.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.visible || !this.worldAABB.intersects(viewport))
                    return;
                if (this.drawOutline || this.selected || this.highlighted) {
                    ctx.save();
                    var scaleX = this.scaleX * worldScale;
                    var scaleY = this.scaleY * worldScale;
                    var w = this.boxWidth * 0.5;
                    var h = this.boxHeight * 0.5;
                    ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                    ctx.rotate(this.worldRotation);
                    ctx.translate(-w * scaleX, -h * scaleY);
                    ctx.setLineDash([2, 2]);
                    ctx.strokeStyle = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                    ctx.lineWidth = this.selected ? 3 : 1;
                    ctx.beginPath();
                    ctx.rect(0, 0, this.boxWidth * scaleX, this.boxHeight * scaleY);
                    ctx.stroke();
                    ctx.restore();
                }
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
                if (app.Config.drawAABB) {
                    this.worldAABB.draw(ctx, worldScale);
                }
            };
            Object.defineProperty(BoxNode.prototype, "allowRotation", {
                //
                get: function () {
                    return this._allowRotation;
                },
                set: function (allow) {
                    if (this._allowRotation == allow)
                        return;
                    this._allowRotation = allow;
                    if (allow) {
                        this.rotationHandle = new model.Handle(this, 'rotation', app.Config.handleRadius, model.HandleShape.CIRCLE, model.HandleType.ROTATION, app.Config.handle);
                        this.handles.push(this.rotationHandle);
                    }
                    else if (this.rotationHandle) {
                        this.handles.splice(this.handles.indexOf(this.rotationHandle), 1);
                        this.rotationHandle = null;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BoxNode.prototype, "allowScale", {
                get: function () {
                    return this._allowScale;
                },
                set: function (allow) {
                    if (this._allowScale == allow)
                        return;
                    this._allowScale = allow;
                    if (allow) {
                        this.scaleHandle = new model.Handle(this, 'scale', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.SCALE, app.Config.handle);
                        this.scaleXHandle = new model.Handle(this, 'scaleX', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.AXIS, app.Config.handle);
                        this.scaleYHandle = new model.Handle(this, 'scaleY', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.AXIS, app.Config.handle);
                        this.handles.push(this.scaleHandle);
                        this.handles.push(this.scaleXHandle);
                        this.handles.push(this.scaleYHandle);
                    }
                    else {
                        this.handles.splice(this.handles.indexOf(this.scaleHandle), 1);
                        this.scaleHandle = null;
                        this.handles.splice(this.handles.indexOf(this.scaleHandle), 1);
                        this.scaleXHandle = null;
                        this.handles.splice(this.handles.indexOf(this.scaleYHandle), 1);
                        this.scaleYHandle = null;
                    }
                },
                enumerable: true,
                configurable: true
            });
            return BoxNode;
        }(model.Node));
        model.BoxNode = BoxNode;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=BoxNode.js.map