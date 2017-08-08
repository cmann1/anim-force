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
                return _this;
            }
            Sprite.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (!this.worldAABB.contains(x, y))
                    return false;
                var dx, dy;
                var local = app.MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
                var w = this.srcWidth * 0.5 * this.scaleX;
                var h = this.srcHeight * 0.5 * this.scaleY;
                x = local.x;
                y = local.y;
                if (this.selected) {
                    // Rotation
                    dx = x;
                    dy = y + h;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor)) {
                        result.offset = Math.atan2(y, x) - this.rotation + this.worldRotation;
                        result.node = this;
                        result.part = 'rotation';
                        return true;
                    }
                    // Scale X
                    dx = x - w;
                    dy = y;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor, true)) {
                        result.x = dx;
                        result.y = dy;
                        result.offset = this.scaleX;
                        result.node = this;
                        result.part = 'scaleX';
                        return true;
                    }
                    // Scale Y
                    dx = x;
                    dy = y - h;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor, true)) {
                        result.x = dx;
                        result.y = dy;
                        result.offset = this.scaleY;
                        result.node = this;
                        result.part = 'scaleY';
                        return true;
                    }
                    // Scale
                    dx = x - w;
                    dy = y - h;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor, true)) {
                        result.x = dx;
                        result.y = dy;
                        result.initialX = this.scaleX;
                        result.initialY = this.scaleY;
                        result.offset = Math.sqrt(x * x + y * y);
                        result.node = this;
                        result.part = 'scale';
                        return true;
                    }
                }
                w = Math.abs(w);
                h = Math.abs(h);
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
                            this.scaleX = (local.x) / (this.srcWidth * 0.5 * interaction.offset) * interaction.offset;
                        }
                        if (interaction.part == 'scale' || interaction.part == 'scaleY') {
                            this.scaleY = (local.y) / (this.srcHeight * 0.5 * interaction.offset) * interaction.offset;
                        }
                    }
                    return true;
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Sprite.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var scaleX = Math.abs(this.scaleX);
                var scaleY = Math.abs(this.scaleY);
                var cosR = Math.abs(Math.cos(this.worldRotation));
                var sinR = Math.abs(Math.sin(this.worldRotation));
                var w = (this.srcHeight * scaleY * sinR + this.srcWidth * scaleX * cosR) * 0.5;
                var h = (this.srcWidth * scaleX * sinR + this.srcHeight * scaleY * cosR) * 0.5;
                if (this.selected) {
                    w += app.Config.handleClick / worldScale;
                    h += app.Config.handleClick / worldScale;
                }
                this.worldAABB.x1 = this.worldX - w;
                this.worldAABB.y1 = this.worldY - h;
                this.worldAABB.x2 = this.worldX + w;
                this.worldAABB.y2 = this.worldY + h;
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
                if (this.selected) {
                    // Rotation
                    this.drawHandle(ctx, w * scaleX, 0, null, app.Config.handle);
                    // Scale X/Y
                    this.drawHandle(ctx, this.srcWidth * scaleX, h * scaleY, null, app.Config.handle, true);
                    this.drawHandle(ctx, w * scaleX, this.srcHeight * scaleY, null, app.Config.handle, true);
                    this.drawHandle(ctx, this.srcWidth * scaleX, this.srcHeight * scaleY, null, app.Config.handle, true);
                }
                ctx.restore();
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