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
                if (name === void 0) { name = null; }
                if (parent === void 0) { parent = null; }
                var _this = _super.call(this, name) || this;
                _this.length = 100;
                _this.stretch = 1;
                _this.children = [];
                _this.childCount = 0;
                _this.worldEndPointX = 0;
                _this.worldEndPointY = 0;
                _this.type = 'bone';
                _this.canHaveChildren = true;
                return _this;
            }
            Bone.prototype.addChild = function (child) {
                if (child.parent == this) {
                    return this;
                }
                var eventType = 'addChild';
                if (child.parent) {
                    child.parent.removeChild(child, false);
                    eventType = 'reParent';
                }
                child.model = this.model;
                child.parent = this;
                this.children.push(child);
                this.childCount++;
                this.onStructureChange(eventType, this, child, this.childCount - 1);
                return child;
            };
            Bone.prototype.removeChild = function (child, triggerEvent) {
                if (triggerEvent === void 0) { triggerEvent = true; }
                if (child.parent == this) {
                    var index = this.children.indexOf(child);
                    child.setModel(null);
                    child.parent = null;
                    this.children.splice(index, 1);
                    this.childCount--;
                    if (triggerEvent) {
                        this.onStructureChange('removeChild', this, child, index);
                    }
                }
                return child;
            };
            Bone.prototype.getChildAt = function (index) {
                if (this.childCount == 0)
                    return null;
                if (index < 0)
                    index = 0;
                if (index >= this.childCount)
                    index = this.childCount - 1;
                return this.children[index];
            };
            Bone.prototype.setModel = function (model) {
                _super.prototype.setModel.call(this, model);
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.setModel(model);
                }
            };
            Bone.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) {
                this.rotation += 0.01; // TODO: REMOVE
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, stretchX, stretchY, worldRotation, drawList);
                var endPoint = model_1.Node.rotate(0, -this.length * this.stretch, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, 1, this.stretch, this.worldRotation, drawList);
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