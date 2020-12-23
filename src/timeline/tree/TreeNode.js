var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree_1) {
            var Key = KeyCodes.Key;
            var TreeNode = /** @class */ (function () {
                function TreeNode(tree, nodeType, node) {
                    var _this = this;
                    this.parent = null;
                    this.$label = null;
                    this.$actionBar = null;
                    /*
                     * Events
                     */
                    this.onActionButtonClick = function (event) {
                        var action = $(event.currentTarget).data('action');
                        if (action == 'visible') {
                            _this.node.setVisible(!_this.node.visible, event.shiftKey);
                        }
                        else if (action == 'lock') {
                            _this.node.setLocked(!_this.node.locked, event.shiftKey);
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
                        else if (property == 'locked') {
                            _this.updateLockIcon();
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
                        this.$visibilityButton = this.addAction('eye', 'visible');
                        this.updateVisibilityIcon();
                    }
                    if (this.canLock()) {
                        this.$lockButton = this.addAction('unlock-alt', 'lock');
                        this.updateLockIcon();
                    }
                }
                Object.defineProperty(TreeNode.prototype, "highlighted", {
                    get: function () {
                        return this.$item.hasClass('highlighted');
                    },
                    set: function (value) {
                        this.$item.toggleClass('highlighted', value);
                    },
                    enumerable: false,
                    configurable: true
                });
                Object.defineProperty(TreeNode.prototype, "selected", {
                    get: function () {
                        return this.$item.hasClass('selected');
                    },
                    set: function (value) {
                        this.$item.toggleClass('selected', value);
                    },
                    enumerable: false,
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
                TreeNode.prototype.addAction = function (icon, action) {
                    if (!this.$actionBar) {
                        this.$item.append('<div class="flex-filler min"></div>');
                        this.$item.append(this.$actionBar = $('<div class="actions"></div>'));
                    }
                    var $btn = $("<i class=\"fa fa-" + icon + " btn btn-" + action + "\" data-action=\"" + action + "\"></i>");
                    this.$actionBar.append($btn);
                    return $btn;
                };
                TreeNode.prototype.canHide = function () {
                    return true;
                };
                TreeNode.prototype.canLock = function () {
                    return true;
                };
                TreeNode.prototype.updateLockIcon = function () {
                    if (!this.$lockButton)
                        return;
                    this.$lockButton.toggleClass('fa-lock', this.node.locked);
                    this.$lockButton.toggleClass('fa-unlock-alt inactive', !this.node.locked);
                };
                TreeNode.prototype.updateVisibilityIcon = function () {
                    if (!this.$visibilityButton)
                        return;
                    this.$visibilityButton.toggleClass('fa-eye inactive', this.node.visible);
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