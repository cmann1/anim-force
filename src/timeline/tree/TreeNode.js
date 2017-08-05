var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree) {
            var TreeNode = (function () {
                function TreeNode(nodeType, node, allow_children) {
                    var _this = this;
                    this.parent = null;
                    this.$children = null;
                    this.$foldIcon = null;
                    this.childrenVisible = true;
                    /*
                     * Events
                     */
                    this.onMouseDown = function (event) {
                        _this.node.setSelected(true);
                    };
                    this.onMouseEnter = function (event) {
                        _this.node.setHighlighted(true);
                    };
                    this.onMouseExit = function (event) {
                        _this.node.setHighlighted(false);
                    };
                    this.onToggleChildren = function (event) {
                        _this.childrenVisible = !_this.childrenVisible;
                        if (_this.childrenVisible) {
                            _this.$children.slideDown(50);
                        }
                        else {
                            _this.$children.slideUp(50);
                        }
                        _this.$foldIcon.toggleClass('collapsed', !_this.childrenVisible);
                    };
                    this.node = node;
                    this.$element = $('<div class="model-node">' +
                        '<div class="item">' +
                        '<i class="icon"></i>' +
                        '<label> ' + node.name + '</label>' +
                        '</div>' +
                        '</div>');
                    this.$element.addClass(nodeType);
                    this.$item = this.$element.find('.item')
                        .on('mousedown', this.onMouseDown)
                        .on('mouseenter', this.onMouseEnter)
                        .on('mouseleave', this.onMouseExit);
                    if (allow_children) {
                        this.children = [];
                        this.$element.append(this.$children = $('<div class="children"></div>'));
                        this.$item.prepend(this.$foldIcon = $('<i class="fa fold-icon"></i>').on('click', this.onToggleChildren));
                    }
                }
                TreeNode.prototype.clear = function () {
                    this.$children.empty();
                    this.children = [];
                };
                TreeNode.prototype.addChild = function (node) {
                    if (node.parent == this)
                        return;
                    if (node.parent)
                        node.parent.removeChild(node);
                    node.parent = this;
                    this.children.push(node);
                    this.$children.append(node.$element);
                };
                TreeNode.prototype.removeChild = function (node) {
                    if (node.parent != this)
                        return;
                    node.$element.remove();
                    node.parent = null;
                    this.children.splice(this.children.indexOf(node), 1);
                };
                Object.defineProperty(TreeNode.prototype, "selected", {
                    get: function () {
                        return this.$item.hasClass('selected');
                    },
                    set: function (value) {
                        this.$item.toggleClass('selected', value);
                    },
                    enumerable: true,
                    configurable: true
                });
                return TreeNode;
            }());
            tree.TreeNode = TreeNode;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TreeNode.js.map