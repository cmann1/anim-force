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
        var SpriteAsset = app.assets.SpriteAsset;
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite(asset, palette, frame, name) {
                if (palette === void 0) { palette = 0; }
                if (frame === void 0) { frame = 0; }
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name || (asset ? asset.spriteName : null)) || this;
                _this.src = null;
                _this.srcX = 0;
                _this.srcY = 0;
                _this.srcWidth = 0;
                _this.srcHeight = 0;
                _this.type = 'sprite';
                _this.asset = asset;
                _this.palette = palette;
                _this.frame = frame;
                (asset || SpriteAsset.NULL).setSpriteSource(_this);
                _this.rotationHandle = new model.Handle(_this, 'rotation', app.Config.handleRadius, model.HandleShape.CIRCLE, model.HandleType.ROTATION, app.Config.handle);
                _this.scaleHandle = new model.Handle(_this, 'scale', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.SCALE, app.Config.handle);
                _this.scaleXHandle = new model.Handle(_this, 'scaleX', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.AXIS, app.Config.handle);
                _this.scaleYHandle = new model.Handle(_this, 'scaleY', app.Config.handleRadius, model.HandleShape.SQUARE, model.HandleType.AXIS, app.Config.handle);
                _this.handles.push(_this.rotationHandle);
                _this.handles.push(_this.scaleHandle);
                _this.handles.push(_this.scaleXHandle);
                _this.handles.push(_this.scaleYHandle);
                return _this;
            }
            Sprite.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (!this.worldAABB.contains(x, y))
                    return false;
                if (this.hitTestHandles(x, y, worldScaleFactor, result)) {
                    return true;
                }
                var local = app.MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
                var w = Math.abs(this.srcWidth * 0.5 * this.scaleX);
                var h = Math.abs(this.srcHeight * 0.5 * this.scaleY);
                x = local.x;
                y = local.y;
                if (x >= -w && x <= w && y >= -h && y <= h) {
                    result.x = x;
                    result.y = y;
                    result.offset = this.rotation;
                    result.node = this;
                    result.part = 'base';
                    return true;
                }
                return false;
            };
            Sprite.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                if (interaction.part == 'scale' || interaction.part == 'scaleX' || interaction.part == 'scaleY') {
                    var local = app.MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
                    if (interaction.part == 'scale' && interaction.constrain) {
                        var scale = Math.sqrt(local.x * local.x + local.y * local.y) / interaction.offset;
                        this.scaleX = interaction.initialX * scale;
                        this.scaleY = interaction.initialY * scale;
                    }
                    else {
                        if (interaction.part == 'scale' || interaction.part == 'scaleX') {
                            this.scaleX = local.x / (this.srcWidth * 0.5);
                        }
                        if (interaction.part == 'scale' || interaction.part == 'scaleY') {
                            this.scaleY = local.y / (this.srcHeight * 0.5);
                        }
                    }
                    return true;
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Sprite.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var x = this.worldX;
                var y = this.worldY;
                var w = this.srcWidth * 0.5 * this.scaleX;
                var h = this.srcHeight * 0.5 * this.scaleY;
                this.rotationHandle.active = this.selected;
                this.scaleHandle.active = this.selected;
                this.scaleXHandle.active = this.selected;
                this.scaleYHandle.active = this.selected;
                this.scaleHandle.rotation = this.scaleXHandle.rotation = this.scaleYHandle.rotation = this.worldRotation;
                var local = app.MathUtils.rotate(0, -h, this.worldRotation);
                this.rotationHandle.x = x + local.x;
                this.rotationHandle.y = y + local.y;
                var local = app.MathUtils.rotate(w, h, this.worldRotation);
                this.scaleHandle.x = x + local.x;
                this.scaleHandle.y = y + local.y;
                var local = app.MathUtils.rotate(w, 0, this.worldRotation);
                this.scaleXHandle.x = x + local.x;
                this.scaleXHandle.y = y + local.y;
                var local = app.MathUtils.rotate(0, h, this.worldRotation);
                this.scaleYHandle.x = x + local.x;
                this.scaleYHandle.y = y + local.y;
                this.prepareAABB(worldScale);
                var scaleX = Math.abs(this.scaleX);
                var scaleY = Math.abs(this.scaleY);
                var cosR = Math.abs(Math.cos(this.worldRotation));
                var sinR = Math.abs(Math.sin(this.worldRotation));
                var w1 = (this.srcHeight * scaleY * sinR + this.srcWidth * scaleX * cosR) * 0.5;
                var h1 = (this.srcWidth * scaleX * sinR + this.srcHeight * scaleY * cosR) * 0.5;
                this.worldAABB.unionF(this.worldX - w1, this.worldY - h1, this.worldX + w1, this.worldY + h1);
                if (this.worldAABB.intersects(viewport)) {
                    drawList.add(this);
                }
            };
            Sprite.prototype.draw = function (ctx, worldScale) {
                ctx.save();
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                ctx.rotate(this.worldRotation);
                ctx.scale(this.scaleX * worldScale, this.scaleY * worldScale);
                ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);
                ctx.drawImage(this.src, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0, this.srcWidth, this.srcHeight);
                ctx.restore();
            };
            Sprite.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.worldAABB.intersects(viewport))
                    return;
                ctx.save();
                var scaleX = this.scaleX * worldScale;
                var scaleY = this.scaleY * worldScale;
                var w = this.srcWidth * 0.5;
                var h = this.srcHeight * 0.5;
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                ctx.rotate(this.worldRotation);
                ctx.translate(-w * scaleX, -h * scaleY);
                ctx.setLineDash([2, 2]);
                ctx.strokeStyle = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                ctx.lineWidth = this.selected ? 3 : 1;
                ctx.beginPath();
                ctx.rect(0, 0, this.srcWidth * scaleX, this.srcHeight * scaleY);
                ctx.stroke();
                ctx.restore();
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
                if (app.Config.drawAABB) {
                    this.worldAABB.draw(ctx, worldScale);
                }
            };
            return Sprite;
        }(model.Node));
        model.Sprite = Sprite;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Sprite.js.map