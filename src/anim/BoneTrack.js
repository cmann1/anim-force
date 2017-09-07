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
        var BoneTrack = (function (_super) {
            __extends(BoneTrack, _super);
            function BoneTrack(node) {
                var _this = _super.call(this, node) || this;
                _this.properties['length'] = new anim.TrackProperty(anim.TrackPropertyType.NUMBER);
                _this.properties['stretchY'] = new anim.TrackProperty(anim.TrackPropertyType.NUMBER);
                return _this;
            }
            return BoneTrack;
        }(anim.Track));
        anim.BoneTrack = BoneTrack;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=BoneTrack.js.map