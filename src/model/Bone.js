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
                _this.stretch = 1;
                _this.boneWorldAABB = new AABB();
                _this.type = 'bone';
                return _this;
            }
            Bone.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (this.boneWorldAABB.contains(x, y)) {
                    var dx, dy;
                    result.offset = this.parent ? -this.parent.worldRotation : 0;
                    result.node = this;
                    dx = x - this.worldEndPointX;
                    dy = y - this.worldEndPointY;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor)) {
                        dx = x - this.worldX;
                        dy = y - this.worldY;
                        result.offset = Math.atan2(dy, dx) - this.rotation;
                        result.part = 'rotation';
                        return true;
                    }
                    dx = x - this.worldX;
                    dy = y - this.worldY;
                    if (this.hitTestHandle(dx, dy, worldScaleFactor)) {
                        result.x = dx;
                        result.y = dy;
                        result.part = 'base';
                        return true;
                    }
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
                if (interaction.part == 'endPoint') {
                    // var dx = x - this.worldX;
                    // var dy = y - this.worldY;
                    //
                    // this.rotation = Math.atan2(dy, dx) - interaction.offset;
                    //
                    // return true;
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Bone.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var endPoint = app.MathUtils.rotate(0, -this.length * this.stretch, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                this.boneWorldAABB.x1 = Math.min(this.worldX - app.Config.handleRadius, this.worldEndPointX - app.Config.handleRadius);
                this.boneWorldAABB.y1 = Math.min(this.worldY - app.Config.handleRadius, this.worldEndPointY - app.Config.handleRadius);
                this.boneWorldAABB.x2 = Math.max(this.worldX + app.Config.handleRadius, this.worldEndPointX + app.Config.handleRadius);
                this.boneWorldAABB.y2 = Math.max(this.worldY + app.Config.handleRadius, this.worldEndPointY + app.Config.handleRadius);
                var x1 = NaN;
                var y1 = NaN;
                var x2 = NaN;
                var y2 = NaN;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretch, this.worldRotation, drawList, viewport);
                    if (isNaN(x1)) {
                        x1 = child.worldAABB.x1;
                        y1 = child.worldAABB.y1;
                        x2 = child.worldAABB.x2;
                        y2 = child.worldAABB.y2;
                    }
                    else {
                        x1 = Math.min(x1, child.worldAABB.x1);
                        y1 = Math.min(y1, child.worldAABB.y1);
                        x2 = Math.max(x2, child.worldAABB.x2);
                        y2 = Math.max(y2, child.worldAABB.y2);
                    }
                }
                this.childrenWorldAABB.x1 = x1;
                this.childrenWorldAABB.y1 = y1;
                this.childrenWorldAABB.x2 = x2;
                this.childrenWorldAABB.y2 = y2;
                if (isNaN(x1)) {
                    this.worldAABB.x1 = this.boneWorldAABB.x1;
                    this.worldAABB.y1 = this.boneWorldAABB.y1;
                    this.worldAABB.x2 = this.boneWorldAABB.x2;
                    this.worldAABB.y2 = this.boneWorldAABB.y2;
                }
                else {
                    this.worldAABB.fromCombined(this.boneWorldAABB, this.childrenWorldAABB);
                }
            };
            Bone.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.worldAABB.intersects(viewport))
                    return;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.drawControls(ctx, worldScale, viewport);
                }
                ctx.save();
                var colour = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                var x = this.worldX * worldScale;
                var y = this.worldY * worldScale;
                var eX = this.worldEndPointX * worldScale;
                var eY = this.worldEndPointY * worldScale;
                /// Bone
                // Outline
                ctx.lineWidth = app.Config.boneThickness + 2;
                ctx.strokeStyle = app.Config.outline;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(eX, eY);
                ctx.stroke();
                // Centre
                ctx.lineWidth = app.Config.boneThickness;
                ctx.strokeStyle = colour;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(eX, eY);
                ctx.stroke();
                this.drawHandle(ctx, x, y);
                this.drawHandle(ctx, eX, eY);
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