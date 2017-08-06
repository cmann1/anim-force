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
        (function (tree_1) {
            var ContainerTreeNode = (function (_super) {
                __extends(ContainerTreeNode, _super);
                function ContainerTreeNode(tree, nodeType, node) {
                    var _this = _super.call(this, tree, nodeType, node) || this;
                    _this.$children = null;
                    _this.$foldIcon = null;
                    _this.children = [];
                    _this.childrenVisible = true;
                    /*
                     * Events
                     */
                    _this.onToggleChildren = function (event) {
                        _this.setOpen(!_this.childrenVisible);
                    };
                    _this.$element.append(_this.$children = $('<div class="children"></div>'));
                    _this.$item.prepend(_this.$foldIcon = $('<i class="fa fold-icon"></i>').on('click', _this.onToggleChildren));
                    return _this;
                }
                ContainerTreeNode.prototype.setOpen = function (open) {
                    if (open === void 0) { open = true; }
                    if (this.childrenVisible == open)
                        return;
                    this.childrenVisible = open;
                    if (this.childrenVisible) {
                        this.$children.slideDown(50);
                    }
                    else {
                        this.$children.slideUp(50);
                    }
                    this.$foldIcon.toggleClass('collapsed', !this.childrenVisible);
                };
                ContainerTreeNode.prototype.clear = function () {
                    this.$children.empty();
                    this.children = [];
                };
                ContainerTreeNode.prototype.addChild = function (node) {
                    if (node.parent == this)
                        return;
                    if (node.parent)
                        node.parent.removeChild(node);
                    node.parent = this;
                    this.children.push(node);
                    this.$children.append(node.$element);
                };
                ContainerTreeNode.prototype.addChildBefore = function (node, sibling) {
                    if (sibling.parent != this)
                        return;
                    if (node.parent)
                        node.parent.removeChild(node);
                    node.parent = this;
                    this.children.splice(this.children.indexOf(sibling), 0, node);
                    sibling.$element.before(node.$element);
                };
                ContainerTreeNode.prototype.removeChild = function (node) {
                    if (node.parent != this)
                        return;
                    node.$element.detach();
                    node.parent = null;
                    this.children.splice(this.children.indexOf(node), 1);
                };
                ContainerTreeNode.prototype.addNode = function (node) {
                    this.node.addChild(node);
                    return node;
                };
                ContainerTreeNode.prototype.handleDragOver = function (treeNode, x, y, recurse) {
                    if (recurse === void 0) { recurse = true; }
                    if (treeNode == this)
                        return false;
                    if (y < this.$item.height() * 0.5 || (!recurse && y < this.$element.height() * 0.5)) {
                        this.$element.before(treeNode.$element);
                    }
                    else if (!this.childrenVisible || (!recurse && y >= this.$element.height() * 0.5)) {
                        this.$element.after(treeNode.$element);
                    }
                    else if (y <= this.$item.height()) {
                        this.setOpen(true);
                        this.$children.prepend(treeNode.$element);
                    }
                    else {
                        y -= this.$item.height();
                        var $children = this.$children.children();
                        for (var i = 0; i < $children.length; i++) {
                            var $child = $($children[i]);
                            var childPos = $child.position();
                            var childY1 = childPos.top;
                            var childY2 = childY1 + $child.height();
                            if (y >= childY1 && y <= childY2) {
                                this.setOpen(true);
                                return $child.data('tree-node').handleDragOver(treeNode, x, y, x > childPos.left);
                            }
                        }
                        this.$element.after(treeNode.$element);
                    }
                    return true;
                };
                return ContainerTreeNode;
            }(tree_1.TreeNode));
            tree_1.ContainerTreeNode = ContainerTreeNode;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=ContainerTreeNode.js.map