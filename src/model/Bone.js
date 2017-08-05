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
    var model;
    (function (model) {
        var Bone = (function (_super) {
            __extends(Bone, _super);
            function Bone(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
                _this.length = 100;
                _this.stretch = 1;
                _this.worldEndPointX = 0;
                _this.worldEndPointY = 0;
                _this.type = 'bone';
                return _this;
            }
            Bone.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) {
                this.rotation += 0.01; // TODO: REMOVE
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, stretchX, stretchY, worldRotation, drawList);
                var endPoint = model.Node.rotate(0, -this.length * this.stretch, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, 1, this.stretch, this.worldRotation, drawList);
                }
            };
            Bone.prototype.drawControls = function (ctx) {
                ctx.save();
                ctx.lineWidth = 4;
                ctx.strokeStyle = this.selected ? app.ColourConfig.selected : (this.highlighted ? app.ColourConfig.highlighted : '#888');
                ctx.beginPath();
                ctx.moveTo(this.worldX, this.worldY);
                ctx.lineTo(this.worldEndPointX, this.worldEndPointY);
                ctx.stroke();
                ctx.restore();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.drawControls(ctx);
                }
            };
            return Bone;
        }(model.ContainerNode));
        model.Bone = Bone;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Bone.js.map