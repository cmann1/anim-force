var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree_1) {
            var Key = KeyCodes.Key;
            var TreeNode = (function () {
                function TreeNode(tree, nodeType, node) {
                    var _this = this;
                    this.parent = null;
                    this.$label = null;
                    /*
                     * Events
                     */
                    this.onActionButtonClick = function (event) {
                        var action = $(event.currentTarget).data('action');
                        if (action == 'visible') {
                            _this.node.visible = !_this.node.visible;
                        }
                        event.preventDefault();
                        return false;
                    };
                    this.onActionButtonMouseDown = function (event) {
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        return false;
                    };
                    this.onNodePropertyChange = function (sender, event) {
                        var property = event.type;
                        if (property == 'visible') {
                            _this.updateVisibilityIcon();
                        }
                        else if (property == 'name' || property == 'src') {
                            _this.$label.text(_this.node.name);
                        }
                    };
                    this.onLabelDblClick = function (event) {
                        _this.startRename();
                        event.preventDefault();
                        return false;
                    };
                    this.onMouseDown = function (event) {
                        if (TreeNode.renameNode == _this)
                            return;
                        _this.node.setSelected(true);
                        _this.tree.waitForDrag(_this, event);
                        // event.preventDefault();
                        // return false;
                    };
                    this.onMouseEnter = function (event) {
                        _this.node.setHighlighted(true);
                    };
                    this.onMouseExit = function (event) {
                        _this.node.setHighlighted(false);
                    };
                    this.tree = tree;
                    this.node = node;
                    this.node.propertyChange.on(this.onNodePropertyChange);
                    this.$element = $('<div class="model-node">' +
                        '<div class="item">' +
                        '<i class="icon"></i>' +
                        '<label> ' + node.name + '</label>' +
                        '</div>' +
                        '</div>')
                        .data('tree-node', this);
                    this.$label = this.$element.find('label')
                        .on('dblclick', this.onLabelDblClick);
                    this.$element.addClass(nodeType);
                    this.$item = this.$element.find('.item')
                        .on('mousedown', this.onMouseDown)
                        .on('mouseenter', this.onMouseEnter)
                        .on('mouseleave', this.onMouseExit)
                        .on('click', '.actions i', this.onActionButtonClick)
                        .on('mousedown', '.actions i', this.onActionButtonMouseDown)
                        .on('dblclick', function (event) {
                        // For some reason sometimes click the visibility icon will cause the item mouseexit event to fire
                        // Add this seems to help a little
                        event.preventDefault();
                        return false;
                    });
                    if (this.canHide()) {
                        this.$item.append('<div class="flex-filler min"></div>');
                        this.$item.append('<div class="actions">' +
                            '<i class="fa fa-eye btn btn-visible" data-action="visible"></i>' +
                            '</div>');
                        this.$visibilityButton = this.$item.find('.actions i.btn-visible');
                        this.updateVisibilityIcon();
                    }
                }
                Object.defineProperty(TreeNode.prototype, "highlighted", {
                    get: function () {
                        return this.$item.hasClass('highlighted');
                    },
                    set: function (value) {
                        this.$item.toggleClass('highlighted', value);
                    },
                    enumerable: true,
                    configurable: true
                });
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
                //
                TreeNode.prototype.deleteNode = function () {
                    this.node.parent.removeChild(this.node);
                };
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
                TreeNode.prototype.handleDragOver = function (treeNode, x, y, recurse) {
                    if (recurse === void 0) { recurse = true; }
                    if (treeNode == this)
                        return false;
                    if (y < this.$item.height() * 0.5) {
                        this.$element.before(treeNode.$element);
                    }
                    else {
                        this.$element.after(treeNode.$element);
                    }
                    return true;
                };
                //
                TreeNode.prototype.canHide = function () {
                    return true;
                };
                TreeNode.prototype.updateVisibilityIcon = function () {
                    if (!this.$visibilityButton)
                        return;
                    this.$visibilityButton.toggleClass('fa-eye', this.node.visible);
                    this.$visibilityButton.toggleClass('fa-eye-slash', !this.node.visible);
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