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
        var EventDispatcher = events.EventDispatcher;
        var StructureChangeEvent = events.StructureChangeEvent;
        var SelectionEvent = events.SelectionEvent;
        var EditMode;
        (function (EditMode) {
            EditMode[EditMode["EDIT"] = 0] = "EDIT";
            EditMode[EditMode["ANIMATE"] = 1] = "ANIMATE";
        })(EditMode = model.EditMode || (model.EditMode = {}));
        var Model = (function (_super) {
            __extends(Model, _super);
            function Model() {
                var _this = _super.call(this, 'Unnamed Model') || this;
                _this.selectedNode = null;
                _this.highlightedNode = null;
                _this.drawList = new model.DrawList();
                _this.mode = EditMode.ANIMATE;
                // TODO: Set to private
                _this.bindPose = new app.anim.Animation('BindPose', _this);
                _this.animations = {};
                /// Events
                _this.selectionChange = new EventDispatcher();
                _this.nodeDrawOrder = function (a, b) {
                    if (a.layer < b.layer || b == _this.selectedNode) {
                        return -1;
                    }
                    if (a.layer > b.layer || a == _this.selectedNode) {
                        return 1;
                    }
                    if (a.subLayer < b.subLayer || b == _this.selectedNode) {
                        return -1;
                    }
                    if (a.subLayer > b.subLayer || a == _this.selectedNode) {
                        return 1;
                    }
                    return a.drawIndex - b.drawIndex;
                };
                _this.model = _this;
                _this.type = 'model';
                _this.bindPose.active = true;
                _this.bindPose.forceKeyframe();
                return _this;
                // TODO: Force a keyframe on bind pose when adding nodes
            }
            Model.prototype.draw = function (ctx, worldScale) {
                console.error('Use drawModel instead');
            };
            Model.prototype.drawModel = function (ctx, worldScale, viewport) {
                this.drawList.clear();
                var i = 0;
                for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    child.prepareForDrawing(0, 0, worldScale, 1, 1, 0, this.drawList, viewport);
                    if (i++ == 0) {
                        this.childrenWorldAABB.from(child.worldAABB);
                    }
                    else {
                        this.childrenWorldAABB.union(child.worldAABB);
                    }
                }
                this.worldAABB.from(this.childrenWorldAABB);
                ctx.save();
                var drawList = this.drawList.list;
                drawList.sort(this.nodeDrawOrder);
                for (var _b = 0, drawList_1 = drawList; _b < drawList_1.length; _b++) {
                    var node = drawList_1[_b];
                    node.draw(ctx, worldScale);
                }
                ctx.restore();
                ctx.save();
                for (var _c = 0, _d = this.children; _c < _d.length; _c++) {
                    var child = _d[_c];
                    if (child != this.selectedNode) {
                        child.drawControls(ctx, worldScale, viewport);
                    }
                }
                if (this.selectedNode) {
                    this.selectedNode.drawControls(ctx, worldScale, viewport);
                }
                if (app.Config.drawAABB) {
                    // this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
                    this.worldAABB.draw(ctx, worldScale, '#0FF');
                }
                ctx.restore();
            };
            Model.prototype.setHighlighted = function (highlighted) {
                if (highlighted) {
                    this.setHighlightedNode(null);
                }
            };
            Model.prototype.setHighlightedNode = function (node) {
                if (this.highlightedNode == node)
                    return;
                if (this.highlightedNode) {
                    this.highlightedNode.highlighted = false;
                }
                if ((this.highlightedNode = node)) {
                    this.highlightedNode.highlighted = true;
                }
                this.selectionChange.dispatch(this, new SelectionEvent('highlight', node));
            };
            Model.prototype.setSelected = function (selected) {
                if (selected) {
                    this.setSelectedNode(null);
                }
            };
            Model.prototype.setSelectedNode = function (node) {
                if (this.selectedNode == node)
                    return;
                if (this.selectedNode) {
                    this.selectedNode.selected = false;
                }
                if ((this.selectedNode = node)) {
                    this.selectedNode.selected = true;
                }
                this.selectionChange.dispatch(this, new SelectionEvent('selection', node));
            };
            Model.prototype.getSelectedNode = function () {
                return this.selectedNode;
            };
            Model.prototype.clear = function () {
                this.selectedNode = null;
                this.highlightedNode = null;
                _super.prototype.clear.call(this);
            };
            Model.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (this.selectedNode && this.selectedNode.hitTest(x, y, worldScaleFactor, result)) {
                    return true;
                }
                return _super.prototype.hitTest.call(this, x, y, worldScaleFactor, result);
            };
            /*
             * Events
             */
            Model.prototype.onStructureChange = function (type, parent, source, index, other) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
            };
            return Model;
        }(model.ContainerNode));
        model.Model = Model;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Model.js.map