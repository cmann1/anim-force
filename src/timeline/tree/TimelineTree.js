var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree) {
            var Bone = app.model.Bone;
            var Sprite = app.model.Sprite;
            var Key = KeyCodes.Key;
            var TimelineTree = (function () {
                function TimelineTree(elementId, model) {
                    var _this = this;
                    this.nodeMap = {};
                    /*
                     * Events
                     */
                    this.onTreeClick = function (event) {
                        if (event.target == _this.$container[0]) {
                            _this.model.setSelected(true);
                        }
                    };
                    this.onModelSelectionChange = function (model, event) {
                        if (event.type == 'selection') {
                            _this.updateSelection(event.target);
                        }
                    };
                    this.onModelStructureChange = function (model, event) {
                        var type = event.type;
                        var parent = event.parent;
                        var target = event.target;
                        var parentTree = parent ? _this.nodeMap[parent.id] : null;
                        var targetTree = target ? _this.nodeMap[target.id] : null;
                        if (type == 'clear') {
                            parentTree.clear();
                        }
                        else if (type == 'addChild') {
                            parentTree.addChild(_this.nodeMap[target.id] = new tree.TreeNode(_this, target.type, target, target.canHaveChildren));
                        }
                        else if (type == 'removeChild') {
                            var node = _this.nodeMap[target.id];
                            if (targetTree == _this.selectedNode) {
                                // Select the sibling or parent node
                                (event.parent.getChildAt(event.index) || event.parent).setSelected(true);
                            }
                            parentTree.removeChild(node);
                            delete _this.nodeMap[target.id];
                        }
                        else if (type == 'reparent') {
                            // TODO: IMPLEMENT THIS
                        }
                    };
                    this.onMouseEnter = function (event) {
                        if (!$.contains(_this.$element[0], document.activeElement)) {
                            _this.$element.focus();
                        }
                    };
                    this.onKeyDown = function (event) {
                        var keyCode = event.keyCode;
                        if (keyCode == Key.UpArrow) {
                            if (!_this.selectedNode)
                                return;
                            _this.selectedNode.node.previous().setSelected(true);
                        }
                        else if (keyCode == Key.DownArrow) {
                            if (!_this.selectedNode)
                                return;
                            _this.selectedNode.node.next().setSelected(true);
                        }
                    };
                    this.onKeyUp = function (event) {
                        var keyCode = event.keyCode;
                        if (keyCode == Key.Delete) {
                            if (document.activeElement == _this.$element[0] && _this.selectedNode && _this.selectedNode != _this.rootNode) {
                                _this.selectedNode.deleteNode();
                            }
                        }
                        else if (keyCode == Key.F2) {
                            if (_this.selectedNode) {
                                _this.selectedNode.startRename();
                            }
                        }
                    };
                    /*
                     * Toolbar Events
                     */
                    this.onToolbarButtonClick = function (event) {
                        var $btn = $(event.target);
                        if ($btn.hasClass('disabled'))
                            return;
                        var type = $btn.prop('title') != '' ? $btn.prop('title') : $btn.data('original-title');
                        if (type.substr(0, 3) == 'Add') {
                            var newNode = void 0;
                            if (type == 'Add Bone')
                                newNode = _this.selectedNode.addNode(new Bone());
                            else if (type == 'Add Sprite')
                                newNode = _this.selectedNode.addNode(new Sprite(null));
                            if (newNode && !event.shiftKey) {
                                newNode.setSelected(true);
                            }
                        }
                        else if (type == 'Delete') {
                            _this.selectedNode.deleteNode();
                        }
                    };
                    this.onToolbarMouseWheel = function (event) {
                        _this.$toolbar.scrollLeft(_this.$toolbar.scrollLeft() - event.originalEvent.wheelDelta);
                    };
                    this.onToolbarAddHover = function (event) {
                        _this.showAddMenu(true);
                    };
                    this.onToolbarAddLeave = function (event) {
                        _this.showAddMenu(false);
                    };
                    this.model = model;
                    this.$element = $('#' + elementId);
                    this.$container = this.$element.find('#timeline-tree-container');
                    this.setupToolbar();
                    this.$container.append((this.rootNode = new tree.TreeNode(this, 'model', this.model, true)).$element);
                    model.structureChange.on(this.onModelStructureChange);
                    model.selectionChange.on(this.onModelSelectionChange);
                    this.nodeMap[this.model.id] = this.rootNode;
                    this.$element
                        .on('mouseenter', this.onMouseEnter)
                        .keyup(this.onKeyDown)
                        .keyup(this.onKeyUp);
                    this.$container.on('click', this.onTreeClick);
                    this.selectedNode = this.rootNode;
                    this.selectedNode.selected = true;
                    this.updateToolbar();
                }
                TimelineTree.prototype.getContainer = function () {
                    return this.$element;
                };
                TimelineTree.prototype.setupToolbar = function () {
                    this.$toolbar = this.$element.find('#timeline-tree-toolbar');
                    this.$toolbar
                        .on('click', 'i', this.onToolbarButtonClick)
                        .on('mousewheel', this.onToolbarMouseWheel);
                    this.$toolbar.find('.fa-plus').parent()
                        .on('mouseenter', this.onToolbarAddHover)
                        .on('mouseleave', this.onToolbarAddLeave);
                    this.$toolbarAddMenu = this.$toolbar.find('.add-menu');
                    this.$toolbarAddBtn = this.$toolbar.find('i.btn-add');
                    this.$toolbarAddBoneBtn = this.$toolbar.find('i.btn-add-bone');
                    this.$toolbarAddSpriteBtn = this.$toolbar.find('i.btn-add-sprite');
                    this.$toolbarAddDeleteBtn = this.$toolbar.find('i.btn-delete');
                    tippy(this.$toolbar.find('i').toArray());
                    this.$toolbarAddMenu.hide();
                };
                TimelineTree.prototype.updateToolbar = function () {
                    var isRoot = this.selectedNode == this.rootNode;
                    var allowChildren = this.selectedNode.node.canHaveChildren;
                    this.$toolbarAddBtn.toggleClass('disabled', !allowChildren);
                    this.$toolbarAddBoneBtn.toggleClass('disabled', !allowChildren);
                    this.$toolbarAddSpriteBtn.toggleClass('disabled', isRoot || !allowChildren);
                    this.$toolbarAddDeleteBtn.toggleClass('disabled', isRoot);
                    if (!allowChildren) {
                        this.showAddMenu(false);
                    }
                };
                TimelineTree.prototype.showAddMenu = function (show) {
                    show = show && this.selectedNode.node.canHaveChildren;
                    this.$toolbarAddMenu.stop(true).animate({ width: show ? 'show' : 'hide' }, 250);
                };
                TimelineTree.prototype.updateSelection = function (target) {
                    var targetNode = target ? this.nodeMap[target.id] : this.rootNode;
                    if (targetNode == this.selectedNode)
                        return;
                    if (this.selectedNode)
                        this.selectedNode.selected = false;
                    if ((this.selectedNode = targetNode))
                        this.selectedNode.selected = true;
                    this.selectedNode.$element.scrollintoview({ duration: 50 });
                    this.updateToolbar();
                };
                TimelineTree.prototype.focus = function () {
                    this.$element.focus();
                };
                TimelineTree.prototype.initiateRenameForNode = function (node) {
                    if (node) {
                        var treeNode = this.nodeMap[node.id];
                        treeNode.node.setSelected(true);
                        treeNode.startRename();
                    }
                };
                return TimelineTree;
            }());
            tree.TimelineTree = TimelineTree;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineTree.js.map