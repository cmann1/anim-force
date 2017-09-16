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
        var properties;
        (function (properties) {
            var VectorProperty = (function (_super) {
                __extends(VectorProperty, _super);
                function VectorProperty(track, propertyName) {
                    return _super.call(this, track, propertyName, anim.VectorKeyframe, properties.TrackPropertyType.VECTOR) || this;
                }
                VectorProperty.prototype.updateNode = function (node, interpolation, prev, current, next) {
                    if (prev === void 0) { prev = this.prev; }
                    if (current === void 0) { current = this.current; }
                    if (next === void 0) { next = this.next; }
                    var x;
                    var y;
                    if (current) {
                        x = current.x;
                        y = current.y;
                    }
                    else if (prev && next) {
                        var t = this.getT(interpolation, prev, next);
                        x = prev.x * (1 - t) + next.x * t;
                        y = prev.y * (1 - t) + next.y * t;
                    }
                    else if (prev) {
                        x = prev.x;
                        y = prev.y;
                    }
                    else if (next) {
                        x = next.x;
                        y = next.y;
                    }
                    else {
                        x = node[this.propertyName + 'X'];
                        y = node[this.propertyName + 'Y'];
                    }
                    node[this.propertyName + 'X'] = x;
                    node[this.propertyName + 'Y'] = y;
                };
                return VectorProperty;
            }(properties.TrackProperty));
            properties.VectorProperty = VectorProperty;
        })(properties = anim.properties || (anim.properties = {}));
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=VectorProperty.js.map