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
            function VectorKeyframe() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.prev = null;
                _this.next = null;
                _this.toString = function () {
                    return "VectorKeyframe[" + _this.frameIndex + "](" + _this.x + ", " + _this.y + ")";
                };
                return _this;
            }
            VectorKeyframe.prototype.set = function (propertyName, node, copyFrame) {
                if (copyFrame) {
                    this.x = copyFrame.x;
                    this.y = copyFrame.y;
                }
                else {
                    this.x = node[propertyName + 'X'];
                    this.y = node[propertyName + 'Y'];
                }
            };
            //
            VectorKeyframe.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.x = this.x;
                data.y = this.y;
                return data;
            };
            VectorKeyframe.prototype.load = function (data) {
                this.x = data.get('x');
                this.y = data.get('y');
                return this;
            };
            return VectorKeyframe;
        }(anim.Keyframe));
        anim.VectorKeyframe = VectorKeyframe;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=VectorKeyframe.js.map