var app;
(function (app) {
    var assets;
    (function (assets) {
        var SpriteManager = /** @class */ (function () {
            function SpriteManager(basePath, readyCallback) {
                var _this = this;
                this.spriteSets = {};
                this.spriteSetsList = null;
                this.ready = false;
                /*
                 * Events
                 */
                this.onSpritesDataLoad = function (data) {
                    _this.spriteSetsList = data;
                    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                        var spriteSet = data_1[_i];
                        var sprites = {};
                        for (var _a = 0, _b = spriteSet.sprites; _a < _b.length; _a++) {
                            var spriteData = _b[_a];
                            sprites[spriteData.name] = { asset: null };
                        }
                        _this.spriteSets[spriteSet.name] = {
                            sprites: sprites,
                            spriteList: spriteSet.sprites
                        };
                    }
                    _this.ready = true;
                    if (_this.readyCallback) {
                        _this.readyCallback();
                    }
                };
                this.basePath = basePath;
                this.readyCallback = readyCallback;
                assets.SpriteAsset.init();
                $.ajax({
                    dataType: 'json',
                    url: this.basePath + 'sprites.json',
                    success: this.onSpritesDataLoad
                });
            }
            SpriteManager.prototype.isReady = function () {
                return this.ready;
            };
            SpriteManager.prototype.loadSprite = function (spriteSetName, spriteName) {
                var spriteSet = this.spriteSets[spriteSetName];
                if (!spriteSet)
                    return null;
                var sprite = spriteSet.sprites[spriteName];
                if (!sprite)
                    return null;
                if (sprite.asset) {
                    return sprite.asset;
                }
                return sprite.asset = new assets.SpriteAsset(spriteSetName, spriteName, "" + this.basePath + spriteSetName + "/" + spriteName);
            };
            SpriteManager.prototype.getSpriteList = function () {
                return this.spriteSetsList;
            };
            return SpriteManager;
        }());
        assets.SpriteManager = SpriteManager;
    })(assets = app.assets || (app.assets = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteManager.js.map