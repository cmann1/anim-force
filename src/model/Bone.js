///<reference path="Node.ts"/>
///<reference path='DrawList.ts'/>
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
    (function (model_1) {
        var Bone = (function (_super) {
            __extends(Bone, _super);
            function Bone(name, parent) {
                if (name === void 0) { name = 'Unnamed Bone'; }
                if (parent === void 0) { parent = null; }
                var _this = _super.call(this, name) || this;
                _this.length = 100;
                _this.stretch = 1;
                _this.children = [];
                _this.childCount = 0;
                _this.worldEndPointX = 0;
                _this.worldEndPointY = 0;
                return _this;
            }
            Bone.prototype.addChild = function (child) {
                if (child.parent == this) {
                    return this;
                }
                if (child.parent) {
                    child.parent.removeChild(child);
                }
                child.model = this.model;
                this.children.push(child);
                this.childCount++;
                return child;
            };
            Bone.prototype.removeChild = function (child) {
                if (child.parent == this) {
                    child.setModel(null);
                    child.parent = null;
                    this.children.splice(this.children.indexOf(child), 1);
                    this.childCount--;
                }
                return child;
            };
            Bone.prototype.setModel = function (model) {
                _super.prototype.setModel.call(this, model);
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.setModel(model);
                }
            };
            Bone.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) {
                var offset = model_1.Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
                worldX += offset.x;
                worldY += offset.y;
                this.worldX = worldX;
                this.worldY = worldY;
                worldRotation += this.rotation;
                var endPoint = model_1.Node.rotate(0, -this.length * this.stretch, worldRotation);
                worldX += endPoint.x;
                worldY += endPoint.y;
                this.worldEndPointX = worldX;
                this.worldEndPointY = worldY;
                this.worldRotation = worldRotation;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.prepareForDrawing(worldX, worldY, 1, this.stretch, worldRotation, drawList);
                }
            };
            Bone.prototype.drawControls = function (ctx) {
                ctx.save();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#0F0';
                ctx.beginPath();
                ctx.moveTo(this.worldX, this.worldY);
                ctx.lineTo(this.worldEndPointX, this.worldEndPointY);
                ctx.stroke();
                ctx.restore();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.drawControls(ctx);
                }
            };
            return Bone;
        }(model_1.Node));
        model_1.Bone = Bone;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Bone.js.map