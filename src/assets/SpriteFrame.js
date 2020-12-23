var app;
(function (app) {
    var assets;
    (function (assets) {
        var SpriteFrame = /** @class */ (function () {
            function SpriteFrame(data) {
                this.x = data[0];
                this.y = data[1];
                this.width = data[2];
                this.height = data[3];
                this.dfOriginX = data[4];
                this.dfOriginY = data[5];
            }
            return SpriteFrame;
        }());
        assets.SpriteFrame = SpriteFrame;
    })(assets = app.assets || (app.assets = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteFrame.js.map