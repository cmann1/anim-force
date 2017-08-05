var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree_1) {
            var Key = KeyCodes.Key;
            var TreeNode = (function () {
                function TreeNode(tree, nodeType, node, allow_children) {
                    var _this = this;
                    this.parent = null;
                    this.$children = null;
                    this.$foldIcon = null;
                    this.$label = null;
                    this.childrenVisible = true;
                    /*
                     * Events
                     */
                    this.onNodePropertyChange = function (sender, event) {
                        var property = event.type;
                        if (property == 'name') {
                            _this.$label.text(_this.node.name);
                        }
                    };
                    this.onLabelDblClick = function (event) {
                        _this.startRename();
                        event.preventDefault();
                        return false;
                    };
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
                    this.tree = tree;
                    this.node = node;
                    this.node.propertyChange.on(this.onNodePropertyChange);
                    this.$element = $('<div class="model-node">' +
                        '<div class="item">' +
                        '<i class="icon"></i>' +
                        '<label> ' + node.name + '</label>' +
                        '</div>' +
                        '</div>');
                    this.$label = this.$element.find('label')
                        .on('dblclick', this.onLabelDblClick);
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
                TreeNode.prototype.addNode = function (node) {
                    this.node.addChild(node);
                    return node;
                };
                TreeNode.prototype.deleteNode = function () {
                    this.node.parent.removeChild(this.node);
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
                TreeNode.prototype.startRename = function () {
                    if (TreeNode.renameNode == this)
                        return;
                    if (!TreeNode.$renameInput) {
                        TreeNode.$renameInput = $('<input type="text" class="rename" />')
                            .on('blur', TreeNode.onRenameInputBlur)
                            .on('keydown', TreeNode.onRenameKeyDown);
                    }
                    if (TreeNode.renameNode) {
                        TreeNode.renameNode.stopRename(false);
                    }
                    this.$label.after(TreeNode.$renameInput).detach();
                    TreeNode.$renameInput
                        .focus()
                        .val(this.node.name);
                    TreeNode.$renameInput.select();
                    TreeNode.renameNode = this;
                };
                TreeNode.prototype.stopRename = function (accept) {
                    if (accept === void 0) { accept = true; }
                    if (TreeNode.renameNode != this)
                        return;
                    if (accept) {
                        this.node.name = TreeNode.$renameInput.val();
                    }
                    TreeNode.renameNode = null;
                    TreeNode.$renameInput.after(this.$label).detach();
                    this.tree.focus();
                };
                TreeNode.onRenameInputBlur = function (event) {
                    if (TreeNode.renameNode) {
                        TreeNode.renameNode.stopRename(false);
                    }
                };
                TreeNode.onRenameKeyDown = function (event) {
                    var keyCode = event.keyCode;
                    if (keyCode == Key.Enter) {
                        TreeNode.renameNode.stopRename(true);
                    }
                    else if (keyCode == Key.Escape) {
                        TreeNode.renameNode.stopRename(false);
                    }
                    else if (keyCode == Key.Tab) {
                        var treeNode = TreeNode.renameNode;
                        TreeNode.renameNode.stopRename(true);
                        var nextNode = event.shiftKey ? treeNode.node.previous() : treeNode.node.next();
                        if (nextNode) {
                            treeNode.tree.initiateRenameForNode(nextNode);
                        }
                        event.preventDefault();
                        return false;
                    }
                };
                return TreeNode;
            }());
            tree_1.TreeNode = TreeNode;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TreeNode.js.map