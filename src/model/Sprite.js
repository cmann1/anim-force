///<reference path='Node.ts'/>
///<reference path='Bone.ts'/>
///<reference path='DrawList.ts'/>
///<reference path='../assets/SpriteAsset.ts'/>
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
        var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite(asset, palette, frame, name) {
                if (palette === void 0) { palette = 0; }
                if (frame === void 0) { frame = 0; }
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name || asset.spriteName) || this;
                _this.src = null;
                _this.srcX = 0;
                _this.srcY = 0;
                _this.srcWidth = 0;
                _this.srcHeight = 0;
                _this.asset = asset;
                _this.palette = palette;
                _this.frame = frame;
                asset.setSpriteSource(_this);
                return _this;
            }
            Sprite.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) {
                var offset = model.Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
                worldX += offset.x;
                worldY += offset.y;
                this.worldX = worldX;
                this.worldY = worldY;
                worldRotation += this.rotation;
                this.worldRotation = worldRotation;
                drawList.add(this);
            };
            Sprite.prototype.draw = function (ctx) {
                ctx.save();
                ctx.translate(this.worldX, this.worldY);
                ctx.rotate(this.worldRotation);
                ctx.scale(this.scaleX, this.scaleY);
                ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);
                ctx.drawImage(this.src, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0, this.srcWidth, this.srcHeight);
                ctx.restore();
            };
            Sprite.prototype.drawControls = function (ctx) {
                ctx.save();
                ctx.translate(this.worldX, this.worldY);
                ctx.rotate(this.worldRotation);
                ctx.scale(this.scaleX, this.scaleY);
                ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);
                ctx.strokeStyle = '#F00';
                ctx.beginPath();
                ctx.rect(0, 0, this.srcWidth, this.srcHeight);
                ctx.stroke();
                ctx.restore();
            };
            return Sprite;
        }(model.Node));
        model.Sprite = Sprite;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Sprite.js.map