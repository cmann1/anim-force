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
        var VectorKeyframe = (function (_super) {
            __extends(VectorKeyframe, _super);
            function VectorKeyframe(frameIndex, x, y) {
                var _this = _super.call(this, frameIndex) || this;
                _this.prev = null;
                _this.next = null;
                _this.x = x;
                _this.y = y;
                return _this;
            }
            return VectorKeyframe;
        }(anim.Keyframe));
        anim.VectorKeyframe = VectorKeyframe;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=VectorKeyframe.js.map