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
                _this.worldEndPointX = 0;
                _this.worldEndPointY = 0;
                _this.boneWorldAABB = new AABB();
                _this.type = 'bone';
                return _this;
            }
            Bone.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                this.rotation += 0.005; // TODO: REMOVE
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var endPoint = model.Node.rotate(0, -this.length * this.stretch, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                this.boneWorldAABB.x1 = Math.min(this.worldX - app.Config.boneEndPointRadius * 2, this.worldEndPointX - app.Config.boneEndPointRadius * 2);
                this.boneWorldAABB.y1 = Math.min(this.worldY - app.Config.boneEndPointRadius * 2, this.worldEndPointY - app.Config.boneEndPointRadius * 2);
                this.boneWorldAABB.x2 = Math.max(this.worldX + app.Config.boneEndPointRadius * 2, this.worldEndPointX + app.Config.boneEndPointRadius * 2);
                this.boneWorldAABB.y2 = Math.max(this.worldY + app.Config.boneEndPointRadius * 2, this.worldEndPointY + app.Config.boneEndPointRadius * 2);
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
                ctx.strokeStyle = app.Config.bone;
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
                /// End points
                // Outline
                ctx.beginPath();
                ctx.fillStyle = app.Config.bone;
                ctx.arc(x, y, app.Config.boneEndPointRadius + 1, 0, Math.PI * 2);
                ctx.fill();
                // Centre
                ctx.beginPath();
                ctx.fillStyle = colour;
                ctx.arc(x, y, app.Config.boneEndPointRadius, 0, Math.PI * 2);
                ctx.fill();
                // Outline
                ctx.beginPath();
                ctx.fillStyle = app.Config.bone;
                ctx.arc(eX, eY, app.Config.boneEndPointRadius + 1, 0, Math.PI * 2);
                ctx.fill();
                // Centre
                ctx.beginPath();
                ctx.fillStyle = colour;
                ctx.arc(eX, eY, app.Config.boneEndPointRadius, 0, Math.PI * 2);
                ctx.fill();
                if (app.Config.drawAABB) {
                    this.boneWorldAABB.draw(ctx, worldScale, app.Config.boneAABB);
                    this.childrenWorldAABB.draw(ctx, worldScale, app.Config.childrenAABB);
                    this.worldAABB.draw(ctx, worldScale);
                }
                ctx.restore();
            };
            return Bone;
        }(model.ContainerNode));
        model.Bone = Bone;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Bone.js.map