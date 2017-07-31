///<reference path="Bone.ts"/>
///<reference path='DrawList.ts'/>
var app;
(function (app) {
    var model;
    (function (model) {
        var Model = (function () {
            function Model() {
                this.name = 'Unnamed Model';
                this.rootBones = [];
                this.rootBoneCount = 0;
                this.drawList = new model.DrawList();
            }
            Model.prototype.addRootBone = function (bone) {
                if (bone.model == this && bone.parent == null) {
                    return bone;
                }
                if (bone.parent) {
                    bone.parent.removeChild(bone);
                }
                bone.setModel(this);
                this.rootBones.push(bone);
                this.rootBoneCount++;
                return bone;
            };
            Model.prototype.removeRootBone = function (bone) {
                if (bone.model == this && bone.parent == null) {
                    bone.setModel(null);
                    this.rootBones.splice(this.rootBones.indexOf(bone), 1);
                    this.rootBoneCount--;
                }
                return bone;
            };
            Model.prototype.prepareForDrawing = function () {
                for (var _i = 0, _a = this.rootBones; _i < _a.length; _i++) {
                    var bone = _a[_i];
                    bone.prepareForDrawing(0, 0, 1, 1, 0, this.drawList);
                }
            };
            Model.prototype.draw = function (ctx) {
                this.drawList.clear();
                this.prepareForDrawing();
                ctx.save();
                var drawList = this.drawList.list;
                drawList.sort(Model.nodeDrawOrder);
                for (var _i = 0, drawList_1 = drawList; _i < drawList_1.length; _i++) {
                    var node = drawList_1[_i];
                    node.draw(ctx);
                }
                ctx.restore();
                ctx.save();
                for (var _a = 0, _b = this.rootBones; _a < _b.length; _a++) {
                    var bone = _b[_a];
                    bone.drawControls(ctx);
                }
                ctx.restore();
            };
            Model.nodeDrawOrder = function (a, b) {
                if (a.layer < b.layer) {
                    return -1;
                }
                if (a.layer > b.layer) {
                    return 1;
                }
                if (a.subLayer < b.subLayer) {
                    return -1;
                }
                if (a.subLayer > b.subLayer) {
                    return 1;
                }
                return a.drawIndex - b.drawIndex;
            };
            return Model;
        }());
        model.Model = Model;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Model.js.map