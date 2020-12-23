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
        var StringKeyframe = /** @class */ (function (_super) {
            __extends(StringKeyframe, _super);
            function StringKeyframe() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.prev = null;
                _this.next = null;
                _this.toString = function () {
                    return "StringKeyframe[" + _this.frameIndex + "](\"" + _this.value + "\")";
                };
                return _this;
            }
            StringKeyframe.prototype.set = function (propertyName, node, copyFrame) {
                this.value = copyFrame
                    ? copyFrame.value
                    : node[propertyName];
            };
            //
            StringKeyframe.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.value = this.value;
                return data;
            };
            StringKeyframe.prototype.load = function (data) {
                this.value = data.get('value');
                return this;
            };
            return StringKeyframe;
        }(anim.Keyframe));
        anim.StringKeyframe = StringKeyframe;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=StringKeyframe.js.map