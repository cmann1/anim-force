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
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree) {
            var RootTreeNode = (function (_super) {
                __extends(RootTreeNode, _super);
                function RootTreeNode() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                RootTreeNode.prototype.handleDragOver = function (treeNode, x, y, recurse) {
                    if (recurse === void 0) { recurse = true; }
                    if (treeNode == this)
                        return false;
                    if (y < this.$item.height() * 0.5) {
                        return false;
                    }
                    return _super.prototype.handleDragOver.call(this, treeNode, x, y);
                };
                return RootTreeNode;
            }(tree.ContainerTreeNode));
            tree.RootTreeNode = RootTreeNode;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=RootTreeNode.js.map