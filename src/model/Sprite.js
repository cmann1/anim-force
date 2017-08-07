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
                var local = model.Node.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
                x = local.x + this.srcWidth * 0.5;
                y = local.y + this.srcHeight * 0.5;
                if (x >= 0 && x <= this.srcWidth && y >= 0 && y <= this.srcHeight) {
                    result.x = local.x;
                    result.y = local.y;
                    result.offset = this.rotation;
                    result.node = this;
                    result.part = 'base';
                    return true;
                }
                return false;
            };
            Sprite.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Sprite.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var cosR = Math.abs(Math.cos(this.worldRotation));
                var sinR = Math.abs(Math.sin(this.worldRotation));
                var w = (this.srcHeight * this.scaleY * sinR + this.srcWidth * this.scaleX * cosR) * 0.5;
                var h = (this.srcWidth * this.scaleX * sinR + this.srcHeight * this.scaleY * cosR) * 0.5;
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
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                ctx.rotate(this.worldRotation);
                ctx.translate(-this.srcWidth * 0.5 * scaleX, -this.srcHeight * 0.5 * scaleY);
                ctx.setLineDash([2, 2]);
                ctx.strokeStyle = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                ctx.lineWidth = this.selected ? 3 : 1;
                ctx.beginPath();
                ctx.rect(0, 0, this.srcWidth * scaleX, this.srcHeight * scaleY);
                ctx.stroke();
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