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
    var anim;
    (function (anim) {
        var TrackPropertyType = app.anim.TrackPropertyType;
        var NodeTrack = /** @class */ (function (_super) {
            __extends(NodeTrack, _super);
            function NodeTrack(type, animation, node) {
                var _this = _super.call(this, type, animation, node) || this;
                _this.addProperty('offset', TrackPropertyType.VECTOR);
                _this.addProperty('rotation', TrackPropertyType.ANGLE);
                _this.addProperty('scaleX', TrackPropertyType.NUMBER);
                _this.addProperty('scaleY', TrackPropertyType.NUMBER);
                return _this;
            }
            return NodeTrack;
        }(anim.Track));
        anim.NodeTrack = NodeTrack;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=NodeTrack.js.map