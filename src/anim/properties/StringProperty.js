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
        var StringProperty = /** @class */ (function (_super) {
            __extends(StringProperty, _super);
            function StringProperty(track, propertyName) {
                return _super.call(this, track, propertyName, anim.StringKeyframe, anim.TrackPropertyType.STRING) || this;
            }
            StringProperty.prototype.updateNode = function (node, interpolation, prev, current, next) {
                if (prev === void 0) { prev = this.prev; }
                if (current === void 0) { current = this.current; }
                if (next === void 0) { next = this.next; }
                var value;
                if (current) {
                    value = current.value;
                }
                else {
                    value = null;
                }
                node[this.propertyName] = value;
            };
            return StringProperty;
        }(anim.TrackProperty));
        anim.StringProperty = StringProperty;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=StringProperty.js.map