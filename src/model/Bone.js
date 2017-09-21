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
                _this.type = 'bone';
                _this.baseHandle = new model.Handle(_this, 'base');
                _this.endPointHandle = new model.Handle(_this, 'rotation', app.Config.handleRadius, model.HandleShape.CIRCLE, model.HandleType.ROTATION);
                _this.boneHandle = new model.Handle(_this, 'base', app.Config.boneThickness, model.HandleShape.LINE);
                _this.stretchHandle = new model.Handle(_this, 'stretchY', app.Config.subHandleRadius, model.HandleShape.SQUARE, model.HandleType.AXIS);
                _this.lengthHandle = new model.Handle(_this, 'length', app.Config.subHandleRadius, model.HandleShape.TRI, model.HandleType.AXIS);
                _this.handles.push(_this.boneHandle);
                _this.handles.push(_this.baseHandle);
                _this.handles.push(_this.endPointHandle);
                _this.handles.push(_this.stretchHandle);
                _this.handles.push(_this.lengthHandle);
                _this.layer = MAX_LAYER;
                _this.subLayer = MAX_SUB_LAYER;
                _this.updateLayer();
                return _this;
            }
            Bone.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                if (interaction.part == 'stretchY') {
                    var local = app.MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
                    this.stretchY = (-local.y - app.Config.boneStretchHandleDist * worldScaleFactor) / this.length;
                    this.onPropertyChange('stretchY');
                }
                else if (interaction.part == 'length') {
                    var local = app.MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
                    this.length = Math.max(0, -local.y - app.Config.boneStretchHandleDist * worldScaleFactor);
                    this.onPropertyChange('length');
                }
                return _super.prototype.updateInteraction.call(this, x, y, worldScaleFactor, interaction);
            };
            Bone.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                var endPoint = app.MathUtils.rotate(0, -this.length * this.stretchY, this.worldRotation);
                this.worldEndPointX = this.worldX + endPoint.x;
                this.worldEndPointY = this.worldY + endPoint.y;
                this.stretchHandle.active = this.selected && this.model.mode == model.EditMode.ANIMATE;
                this.lengthHandle.active = this.selected && this.model.mode == model.EditMode.EDIT;
                this.baseHandle.x = this.boneHandle.x = this.worldX;
                this.baseHandle.y = this.boneHandle.y = this.worldY;
                this.endPointHandle.x = this.boneHandle.x2 = this.worldEndPointX;
                this.endPointHandle.y = this.boneHandle.y2 = this.worldEndPointY;
                this.stretchHandle.x = this.lengthHandle.x = this.worldEndPointX + Math.cos(this.worldRotation - Math.PI * 0.5) * (app.Config.boneStretchHandleDist / worldScale);
                this.stretchHandle.y = this.lengthHandle.y = this.worldEndPointY + Math.sin(this.worldRotation - Math.PI * 0.5) * (app.Config.boneStretchHandleDist / worldScale);
                this.stretchHandle.rotation = this.lengthHandle.rotation = this.worldRotation;
                this.prepareAABB(worldScale);
                this.childrenWorldAABB.reset();
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretchY, this.worldRotation, drawList, viewport);
                    if (child.visible)
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
                if (!this.visible)
                    return;
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
                    this.controlWorldAABB.draw(ctx, worldScale, app.Config.boneAABB);
                    this.childrenWorldAABB.draw(ctx, worldScale, app.Config.childrenAABB);
                    this.worldAABB.draw(ctx, worldScale);
                }
                ctx.restore();
            };
            //
            Bone.prototype.resetLength = function () {
                if (this.model.mode == model.EditMode.EDIT) {
                    if (this.length != 100) {
                        this.length = 100;
                        this.onPropertyChange('length');
                        return;
                    }
                }
                _super.prototype.resetLength.call(this);
            };
            Bone.prototype.flipX = function () { };
            Bone.prototype.flipY = function () { };
            //
            Bone.prototype.getInstance = function () {
                return new Bone();
            };
            Bone.prototype.copyFrom = function (from, recursive) {
                if (recursive === void 0) { recursive = true; }
                _super.prototype.copyFrom.call(this, from, recursive);
                this.length = from.length;
                return this;
            };
            Bone.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.length = this.length;
                return data;
            };
            Bone.prototype.load = function (data) {
                _super.prototype.load.call(this, data);
                this.length = data.get('length');
                return this;
            };
            return Bone;
        }(model.ContainerNode));
        model.Bone = Bone;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Bone.js.map