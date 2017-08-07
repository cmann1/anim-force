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
        var Model = (function (_super) {
            __extends(Model, _super);
            function Model() {
                var _this = _super.call(this, 'Unnamed Model') || this;
                _this.selectedNode = null;
                _this.highlightedNode = null;
                _this.drawList = new model.DrawList();
                /// Events
                _this.selectionChange = new EventDispatcher();
                _this.model = _this;
                _this.type = 'model';
                return _this;
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
                drawList.sort(Model.nodeDrawOrder);
                for (var _b = 0, drawList_1 = drawList; _b < drawList_1.length; _b++) {
                    var node = drawList_1[_b];
                    node.draw(ctx, worldScale);
                }
                ctx.restore();
                ctx.save();
                for (var _c = 0, _d = this.children; _c < _d.length; _c++) {
                    var child = _d[_c];
                    child.drawControls(ctx, worldScale, viewport);
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