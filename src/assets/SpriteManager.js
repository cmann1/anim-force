var app;
(function (app) {
    var assets;
    (function (assets) {
        var SpriteManager = (function () {
            function SpriteManager(basePath) {
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
                            var spriteName = _b[_a];
                            sprites[spriteName] = { asset: null };
                        }
                        _this.spriteSets[spriteSet.name] = {
                            sprites: sprites,
                            spriteList: spriteSet.sprites
                        };
                    }
                    _this.ready = true;
                };
                this.basePath = basePath;
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
            return SpriteManager;
        }());
        assets.SpriteManager = SpriteManager;
    })(assets = app.assets || (app.assets = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteManager.js.map