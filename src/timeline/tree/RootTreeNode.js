var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree_1) {
            var RootTreeNode = /** @class */ (function (_super) {
                __extends(RootTreeNode, _super);
                function RootTreeNode(tree, nodeType, node) {
                    return _super.call(this, tree, nodeType, node, false) || this;
                }
                RootTreeNode.prototype.handleDragOver = function (treeNode, x, y, recurse) {
                    if (recurse === void 0) { recurse = true; }
                    if (treeNode == this)
                        return false;
                    if (y < this.$item.height() * 0.5) {
                        return false;
                    }
                    return _super.prototype.handleDragOver.call(this, treeNode, x, y, true, true);
                };
                RootTreeNode.prototype.canHide = function () {
                    return true;
                };
                RootTreeNode.prototype.canLock = function () {
                    return true;
                };
                return RootTreeNode;
            }(tree_1.ContainerTreeNode));
            tree_1.RootTreeNode = RootTreeNode;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=RootTreeNode.js.map