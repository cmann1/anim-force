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
    var anim;
    (function (anim) {
        var TrackPropertyType = app.anim.TrackPropertyType;
        var SpriteTrack = (function (_super) {
            __extends(SpriteTrack, _super);
            function SpriteTrack(animation, node) {
                var _this = _super.call(this, 'sprite', animation, node) || this;
                _this.addProperty('frame', TrackPropertyType.NUMBER);
                return _this;
            }
            return SpriteTrack;
        }(anim.NodeTrack));
        anim.SpriteTrack = SpriteTrack;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteTrack.js.map