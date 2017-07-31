///<reference path='../assets/SpriteAsset.ts'/>
var app;
(function (app) {
    var armature;
    (function (armature) {
        var Sprite = (function () {
            function Sprite(asset, palette, frame) {
                if (palette === void 0) { palette = 0; }
                if (frame === void 0) { frame = 0; }
                this.src = null;
                this.srcX = 0;
                this.srcY = 0;
                this.srcWidth = 0;
                this.srcHeight = 0;
                this.x = 0;
                this.y = 0;
                this.rotation = 0;
                this.scaleX = 1;
                this.scaleY = 1;
                this.asset = asset;
                this.palette = palette;
                this.frame = frame;
                asset.setSpriteSource(this);
            }
            Sprite.prototype.draw = function (ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(this.scaleX, this.scaleY);
                ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);
                // ctx.fillStyle = '#FF0000';
                // ctx.rect(0, 0, this.srcWidth, this.srcHeight);
                // ctx.fill();
                ctx.drawImage(this.src, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0, this.srcWidth, this.srcHeight);
                ctx.restore();
            };
            return Sprite;
        }());
        armature.Sprite = Sprite;
    })(armature = app.armature || (app.armature = {}));
})(app || (app = {}));
//# sourceMappingURL=Sprite.js.map