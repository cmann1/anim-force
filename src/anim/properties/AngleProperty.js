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
        var AngleProperty = (function (_super) {
            __extends(AngleProperty, _super);
            function AngleProperty(track, propertyName) {
                return _super.call(this, track, propertyName, anim.NumberKeyframe, anim.TrackPropertyType.ANGLE) || this;
            }
            AngleProperty.prototype.updateNode = function (node, interpolation, prev, current, next) {
                if (prev === void 0) { prev = this.prev; }
                if (current === void 0) { current = this.current; }
                if (next === void 0) { next = this.next; }
                var value;
                if (current) {
                    value = current.value;
                }
                else if (prev && next) {
                    var t = this.getT(interpolation, prev, next);
                    var delta = Math.normalizeAngle(next.value - prev.value);
                    value = prev.value * (1 - t) + (prev.value + delta) * t;
                }
                else if (prev) {
                    value = prev.value;
                }
                else if (next) {
                    value = next.value;
                }
                else {
                    value = node[this.propertyName];
                }
                node[this.propertyName] = value;
            };
            return AngleProperty;
        }(anim.TrackProperty));
        anim.AngleProperty = AngleProperty;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=AngleProperty.js.map