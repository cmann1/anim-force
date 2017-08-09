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
        var AABB = app.viewport.AABB;
        var Bone = (function (_super) {
            __extends(Bone, _super);
            function Bone(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
                _this.length = 100;
                _this.boneWorldAABB = new AABB();
                _this.baseHandle = new model.Handle('base');
                _this.endPointHandle = new model.Handle('rotation');
                _this.boneHandle = new model.Handle('base', app.Config.boneThickness, model.HandleShape.LINE);
                _this.stretchHandle = new model.Handle('stretch', app.Config.subHandleRadius, model.HandleShape.SQUARE);
                _this.type = 'bone';
                _this.handles.push(_this.boneHandle);
                _this.handles.push(_this.baseHandle);
                _this.handles.push(_this.endPointHandle);
                _this.handles.push(_this.stretchHandle);
                return _this;
            }
            Bone.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                // TODO: Auto hit testing using handles
                if (this.boneWorldAABB.contains(x, y)) {
                    var dx, dy;
                    result.offset = this.parent ? -this.parent.worldRotation : 0;
                    result.node = this;
                    // End point
                    dx = x - this.worldEndPointX;
                    dy = y - this.worldEndPointY;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor)) {
                        dx = x - this.worldX;
                        dy = y - this.worldY;
                        result.initialX = this.rotation;
                        result.offset = Math.atan2(dy, dx) - this.rotation;
                        result.part = 'rotation';
                        return true;
                    }
                    // Base
                    dx = x - this.worldX;
                    dy = y - this.worldY;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor)) {
                        result.x = dx;
                        result.y = dy;
                        result.part = 'base';
                        return true;
                    }
                    // Stretch
                    var hx = this.worldEndPointX + ((this.worldEndPointX - this.worldX) / (this.length * this.stretchY)) * (app.Config.boneStretchHandleDist * worldScaleFactor);
                    var hy = this.worldEndPointY + ((this.worldEndPointY - this.worldY) / (this.length * this.stretchY)) * (app.Config.boneStretchHandleDist * worldScaleFactor);
                    dx = x - hx;
                    dy = y - hy;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor, true, app.Config.subHandleClick)) {
                        result.x = dx;
                        result.y = dy;
                        result.offset = this.stretchY;
                        result.part = 'stretchY';
                        return true;
                    }
                    // Bone
                    var boneHit = this.getClosestPointOnBone(x, y);
                    dx = x - boneHit.x;
                    dy = y - boneHit.y;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor, false, app.Config.boneClick)) {
                        result.x = x - this.worldX;
                        result.y = y - this.worldY;
                        result.part = 'base';
                        return true;
                    }
                }
                return _super.prototype.hitTest.call(this, x, y, worldScaleFactor, result);
            };
            Bone.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                if (interaction.part == 'stretchY') {
                    var local = app.MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
                    this.stretchY = (-local.y - app.Config.boneStretchHandleDist * worldScaleFactor) / this.length;
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Bone.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var endPoint = app.MathUtils.rotate(0, -this.length * this.stretchY, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                this.stretchHandle.active = this.selected;
                this.baseHandle.x = this.boneHandle.x = this.worldX;
                this.baseHandle.y = this.boneHandle.y = this.worldY;
                this.endPointHandle.x = this.boneHandle.x2 = this.worldEndPointX;
                this.endPointHandle.y = this.boneHandle.y2 = this.worldEndPointY;
                this.stretchHandle.x = this.worldEndPointX + ((this.worldEndPointX - this.worldX) / (this.length * this.stretchY)) * (app.Config.boneStretchHandleDist / worldScale);
                this.stretchHandle.y = this.worldEndPointY + ((this.worldEndPointY - this.worldY) / (this.length * this.stretchY)) * (app.Config.boneStretchHandleDist / worldScale);
                this.stretchHandle.rotation = this.worldRotation;
                this.prepareAABB(worldScale);
                this.boneWorldAABB.from(this.worldAABB);
                this.childrenWorldAABB.reset();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretchY, this.worldRotation, drawList, viewport);
                    this.childrenWorldAABB.union(child.worldAABB);
                }
                this.worldAABB.union(this.childrenWorldAABB);
            };
            Bone.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.worldAABB.intersects(viewport))
                    return;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.drawControls(ctx, worldScale, viewport);
                }
                ctx.save();
                var x = this.worldX * worldScale;
                var y = this.worldY * worldScale;
                // Parent connector
                if (this.parent && this.parent != this.model) {
                    ctx.setLineDash([2, 2]);
                    ctx.strokeStyle = app.Config.link;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(this.parent.worldEndPointX * worldScale, this.parent.worldEndPointY * worldScale);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
                if (app.Config.drawAABB) {
                    this.boneWorldAABB.draw(ctx, worldScale, app.Config.boneAABB);
                    this.childrenWorldAABB.draw(ctx, worldScale, app.Config.childrenAABB);
                    this.worldAABB.draw(ctx, worldScale);
                }
                ctx.restore();
            };
            Bone.prototype.getClosestPointOnBone = function (x, y) {
                var dx = this.worldEndPointX - this.worldX;
                var dy = this.worldEndPointY - this.worldY;
                var u = ((x - this.worldX) * dx + (y - this.worldY) * dy) / (dx * dx + dy * dy);
                var lineX, lineY;
                if (u < 0) {
                    lineX = this.worldX;
                    lineY = this.worldY;
                }
                else if (u > 1) {
                    lineX = this.worldEndPointX;
                    lineY = this.worldEndPointY;
                }
                else {
                    lineX = this.worldX + u * dx;
                    lineY = this.worldY + u * dy;
                }
                return { x: lineX, y: lineY };
            };
            return Bone;
        }(model.ContainerNode));
        model.Bone = Bone;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Bone.js.map