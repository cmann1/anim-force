var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        var Sprite = /** @class */ (function (_super) {
            __extends(Sprite, _super);
            function Sprite(asset, palette, frame, name) {
                if (asset === void 0) { asset = null; }
                if (palette === void 0) { palette = 0; }
                if (frame === void 0) { frame = 0; }
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name || (asset ? asset.spriteName : null)) || this;
                _this.paletteCount = 0;
                _this.frameCount = 0;
                _this.src = null;
                _this.srcX = 0;
                _this.srcY = 0;
                _this.srcWidth = 0;
                _this.srcHeight = 0;
                _this.type = 'sprite';
                _this.asset = asset;
                _this._palette = palette;
                _this._frame = frame;
                (asset || SpriteAsset.NULL).setSpriteSource(_this);
                return _this;
            }
            Sprite.prototype.updateFrameData = function () {
                this.srcX = this.frameData.x;
                this.srcY = this.frameData.y;
                this.srcWidth = this.boxWidth = this.frameData.width;
                this.srcHeight = this.boxHeight = this.frameData.height;
            };
            Object.defineProperty(Sprite.prototype, "name", {
                get: function () {
                    return this._name || (this.asset && this.asset.spriteName) || 'Untitled Sprite ' + this.id;
                },
                set: function (value) {
                    this.setName(value);
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "frame", {
                get: function () {
                    return this._frame;
                },
                set: function (value) {
                    // if(value < 0) value = 0;
                    // else if(value > this.frameCount - 1) value = this.frameCount - 1;
                    if (this._frame == value)
                        return;
                    this._frame = value;
                    this.frameData = this.spritePaletteData[this.getFrame()];
                    this.updateFrameData();
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Sprite.prototype, "palette", {
                get: function () {
                    return this.getPalette();
                },
                set: function (value) {
                    if (this._palette == value)
                        return;
                    this._palette = value;
                    this.spritePaletteData = this.spriteData[this.getPalette()];
                    this.frame = this._frame;
                    this.frameData = this.spritePaletteData[this.getFrame()];
                    this.updateFrameData();
                },
                enumerable: false,
                configurable: true
            });
            Sprite.prototype.loadSprite = function (spriteGroup, spriteName) {
                this.asset = app.main.spriteManager.loadSprite(spriteGroup, spriteName);
                this.asset.setSpriteSource(this);
            };
            Sprite.prototype.getFrame = function () {
                return mod(Math.round(this._frame), this.frameCount);
            };
            Sprite.prototype.getPalette = function () {
                return mod(Math.round(this._palette), this.paletteCount);
            };
            Sprite.prototype.setFrame = function (newFrame) {
                var oldFrame = this._frame;
                this.frame = newFrame;
                if (this._frame != oldFrame) {
                    this.onPropertyChange('frame');
                }
            };
            Sprite.prototype.setPalette = function (newPalette) {
                var oldPalette = this._palette;
                this.palette = newPalette;
                if (this._palette != oldPalette) {
                    this.onPropertyChange('palette');
                }
            };
            Sprite.prototype.setSrc = function (newSrc, spriteData, paletteCount, frameCount) {
                this.paletteCount = paletteCount;
                this.frameCount = frameCount;
                this.spriteData = spriteData;
                this.palette = this._palette;
                this.spritePaletteData = spriteData[this.getPalette()];
                this.frame = this._frame;
                this.frameData = this.spritePaletteData[this.getFrame()];
                this.updateFrameData();
                this.src = newSrc;
                this.onPropertyChange('src');
            };
            Sprite.prototype.hitTest = function (x, y, worldScaleFactor, result, recursive) {
                if (recursive === void 0) { recursive = true; }
                if (_super.prototype.hitTest.call(this, x, y, worldScaleFactor, result)) {
                    if (!this.selected && app.Config.pixelHitTest && this.asset && this.asset.ctx && result.part == 'base') {
                        var pixel = this.asset.ctx.getImageData(this.srcX + this.srcWidth * 0.5 + result.x / this.scaleX, this.srcY + this.srcHeight * 0.5 + result.y / this.scaleY, 1, 1).data;
                        if (pixel[3] < 16) {
                            result.node = null;
                            result.part = null;
                            return false;
                        }
                    }
                    return true;
                }
                return false;
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
                if (!this.visible || !this.worldAABB.intersects(viewport))
                    return;
                if (this.selected || this.highlighted) {
                    ctx.save();
                    ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                    ctx.rotate(this.worldRotation);
                    ctx.scale(this.scaleX * worldScale, this.scaleY * worldScale);
                    ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);
                    // Draw a normal and color-dodge so that dark sprites are still visible when highlighted
                    // and other sprites are still brighter
                    ctx.globalAlpha = 0.2;
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(this.src, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0, this.srcWidth, this.srcHeight);
                    if (!this.selected) {
                        ctx.globalAlpha = 0.5;
                        // ctx.globalCompositeOperation = 'overlay';
                        ctx.globalCompositeOperation = 'color-dodge';
                        ctx.drawImage(this.src, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0, this.srcWidth, this.srcHeight);
                    }
                    ctx.restore();
                }
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
            };
            //
            Sprite.prototype.getInstance = function () {
                return new Sprite(this.asset, this.palette, this.frame);
            };
            Sprite.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.palette = this._palette;
                data.spriteSetName = this.asset ? this.asset.spriteSetName : '';
                data.spriteName = this.asset ? this.asset.spriteName : '';
                return data;
            };
            Sprite.prototype.load = function (data) {
                _super.prototype.load.call(this, data);
                this._palette = data.get('palette');
                var spriteSetName = data.get('spriteSetName');
                var spriteName = data.get('spriteName');
                if (spriteSetName != '') {
                    this.loadSprite(spriteSetName, spriteName);
                }
                return this;
            };
            return Sprite;
        }(model.BoxNode));
        model.Sprite = Sprite;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Sprite.js.map