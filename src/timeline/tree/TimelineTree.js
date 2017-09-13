var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree) {
            var Model = app.model.Model;
            var Bone = app.model.Bone;
            var Sprite = app.model.Sprite;
            var Key = KeyCodes.Key;
            var EventDispatcher = app.events.EventDispatcher;
            var ScrollEvent = app.events.ScrollEvent;
            var Event = app.events.Event;
            var TimelineTree = (function () {
                function TimelineTree(elementId, model) {
                    var _this = this;
                    this.nodeMap = {};
                    this.dragNode = null;
                    /// Events
                    this.scrollChange = new EventDispatcher();
                    this.treeNodeUpdate = new EventDispatcher();
                    this.onDragWindowMouseMove = function (event) {
                        if (_this.dragNode) {
                            if (_this.dragWait) {
                                var dx = _this.dragInitX - event.pageX;
                                var dy = _this.dragInitY - event.pageY;
                                var dragDistance = dx * dx + dy * dy;
                                if (dragDistance >= 5 * 5) {
                                    _this.startDrag();
                                }
                            }
                            if (!_this.dragWait) {
                                var $target = $(event.target).closest('.model-node');
                                if (!$target.length || $.contains(_this.dragNode.$element[0], $target[0]))
                                    return;
                                var treeNode = $target.data('tree-node');
                                if (!treeNode || treeNode == _this.dragNode)
                                    return;
                                var $item = $target.find('> .item');
                                var offset = $item.offset();
                                var offsetX = (event.clientX - offset.left);
                                var offsetY = (event.clientY - offset.top);
                                treeNode.handleDragOver(_this.dragNode, offsetX, offsetY);
                                _this.scrollTo(_this.dragNode);
                            }
                        }
                    };
                    this.onDragWindowMouseUp = function (event) {
                        if (_this.dragNode) {
                            _this.stopDrag(false);
                        }
                        app.$window
                            .off('mousemove', _this.onDragWindowMouseMove)
                            .off('mouseup', _this.onDragWindowMouseUp);
                    };
                    this.onKeyDown = function (event) {
                        var keyCode = event.keyCode;
                        // console.log(keyCode);
                        if (keyCode == Key.Escape) {
                            if (_this.dragNode) {
                                _this.stopDrag(true);
                            }
                        }
                        else if (keyCode == Key.UpArrow) {
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
                    this.onModelSelectionChange = function (model, event) {
                        if (event.type == 'highlight') {
                            // this.updateHighlight(event.target);
                        }
                        else if (event.type == 'selection') {
                            _this.updateSelection(event.target);
                        }
                    };
                    this.onModelStructureChange = function (model, event) {
                        var type = event.type;
                        var parent = event.parent;
                        var target = event.target;
                        var other = event.other;
                        var parentTree = (parent ? _this.nodeMap[parent.id] : null);
                        var targetTree = target ? _this.nodeMap[target.id] : null;
                        if (type == 'clear') {
                            _this.reset();
                            parentTree.clear();
                        }
                        else if (type == 'addChild') {
                            // Reparent an existing node
                            if (targetTree) {
                                if (other) {
                                    parentTree.addChildBefore(targetTree, _this.nodeMap[other.id]);
                                }
                                else {
                                    parentTree.addChild(targetTree);
                                }
                            }
                            else {
                                var newTree = _this.nodeMap[target.id] = _this.fromNode(target);
                                if (other) {
                                    parentTree.addChildBefore(newTree, _this.nodeMap[other.id]);
                                }
                                else {
                                    parentTree.addChild(newTree);
                                }
                            }
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
                    };
                    this.onTreeClick = function (event) {
                        if (event.target == _this.$container[0]) {
                            _this.model.setSelected(true);
                        }
                    };
                    this.onTreeScroll = function (event) {
                        _this.scrollChange.dispatch(_this, new ScrollEvent(_this.rootNode.$children.scrollLeft(), _this.rootNode.$children.scrollTop(), event));
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
                                newNode = new Bone();
                            else if (type == 'Add Sprite')
                                newNode = new Sprite(null);
                            if (newNode) {
                                if (_this.selectedNode instanceof tree.ContainerTreeNode && (!event.ctrlKey || _this.selectedNode == _this.rootNode))
                                    _this.selectedNode.addNode(newNode);
                                else
                                    _this.selectedNode.parent.addNodeAfter(newNode, _this.selectedNode);
                            }
                            if (newNode && !event.shiftKey) {
                                newNode.setSelected(true);
                            }
                        }
                        else if (type == 'Delete') {
                            if (_this.selectedNode != _this.rootNode) {
                                _this.selectedNode.deleteNode();
                            }
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
                    this.$element = $('#' + elementId);
                    this.$container = this.$element.find('#timeline-tree-container');
                    this.$element
                        .keyup(this.onKeyDown)
                        .keyup(this.onKeyUp);
                    this.$container.on('click', this.onTreeClick);
                    this.setupToolbar();
                    this.setModel(model);
                }
                TimelineTree.prototype.focus = function () {
                    this.$element.focus();
                };
                TimelineTree.prototype.getContainer = function () {
                    return this.$element;
                };
                TimelineTree.prototype.initiateRenameForNode = function (node) {
                    if (node) {
                        var treeNode = this.nodeMap[node.id];
                        treeNode.node.setSelected(true);
                        treeNode.startRename();
                    }
                };
                TimelineTree.prototype.reset = function () {
                    this.rootNode.$children.scrollLeft(0);
                    this.rootNode.$children.scrollTop(0);
                    this.updateSelection(null);
                    if (this.highlightedNode) {
                        this.highlightedNode.highlighted = false;
                        this.highlightedNode = null;
                    }
                };
                TimelineTree.prototype.setModel = function (model) {
                    // TODO: A model may already have children when set here.
                    // TODO: Create the tree from existing model nodes
                    this.model = model;
                    model.structureChange.on(this.onModelStructureChange);
                    model.selectionChange.on(this.onModelSelectionChange);
                    this.$container.empty();
                    this.$container.append((this.rootNode = this.fromNode(model)).$element);
                    this.rootNode.$children.on('scroll', this.onTreeScroll);
                    this.selectedNode = this.rootNode;
                    this.selectedNode.selected = true;
                    this.nodeMap = {};
                    this.nodeMap[this.model.id] = this.rootNode;
                    this.updateToolbar();
                };
                TimelineTree.prototype.setScroll = function (scrollY) {
                    this.rootNode.$children.scrollTop(scrollY);
                    this.onTreeScroll(null);
                };
                TimelineTree.prototype.startDrag = function () {
                    if (!this.dragNode)
                        return;
                    this.dragWait = false;
                    this.$dragNodeParent = this.dragNode.$element.parent();
                    this.$dragNodePrev = this.dragNode.$element.prev().length ? this.dragNode.$element.prev() : null;
                    this.focus();
                };
                TimelineTree.prototype.stopDrag = function (cancel) {
                    if (cancel === void 0) { cancel = true; }
                    if (this.dragNode && !this.dragWait) {
                        if (cancel) {
                            if (this.$dragNodePrev) {
                                this.$dragNodePrev.after(this.dragNode.$element);
                            }
                            else {
                                this.$dragNodeParent.prepend(this.dragNode.$element);
                            }
                        }
                        else {
                            var next = this.dragNode.$element.next().data('tree-node');
                            var parent_1 = this.dragNode.$element.parent().closest('.model-node').data('tree-node');
                            if (parent_1) {
                                parent_1.node.addChildBefore(this.dragNode.node, next ? next.node : null);
                            }
                            else {
                                this.stopDrag(true);
                                console.error('Drag and drop error: Cannot find parent node');
                            }
                        }
                    }
                    this.dragNode = null;
                    this.$dragNodeParent = null;
                    this.$dragNodePrev = null;
                };
                TimelineTree.prototype.triggerScroll = function (event) {
                    this.rootNode.$children.scrollTop(this.rootNode.$children.scrollTop() - event.originalEvent.wheelDelta);
                    this.onTreeScroll(event);
                };
                TimelineTree.prototype.waitForDrag = function (node, event) {
                    if (node == this.rootNode)
                        return;
                    var offset = node.$element.offset();
                    this.dragNode = node;
                    this.dragWait = true;
                    this.dragX = (event.clientX - offset.left) - node.$element.width();
                    this.dragY = (event.clientY - offset.top) - node.$element.height() / 2;
                    this.dragInitX = event.pageX;
                    this.dragInitY = event.pageY;
                    app.$window
                        .on('mousemove', this.onDragWindowMouseMove)
                        .on('mouseup', this.onDragWindowMouseUp);
                };
                //
                TimelineTree.prototype.fromNode = function (node) {
                    if (node instanceof Model) {
                        return new tree.RootTreeNode(this, node.type, node);
                    }
                    if (node instanceof Bone) {
                        return new tree.ContainerTreeNode(this, node.type, node);
                    }
                    return new tree.TreeNode(this, node.type, node);
                };
                TimelineTree.prototype.scrollTo = function (treeNode) {
                    if (!treeNode)
                        return;
                    treeNode.$element.scrollintoview({ duration: 50 });
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
                TimelineTree.prototype.showAddMenu = function (show) {
                    // show = show && this.selectedNode.node.canHaveChildren;
                    this.$toolbarAddMenu.stop(true).animate({ width: show ? 'show' : 'hide' }, 250);
                };
                TimelineTree.prototype.updateToolbar = function () {
                    var isRoot = this.selectedNode == this.rootNode;
                    var allowChildren = this.selectedNode.node.canHaveChildren;
                    this.$toolbarAddBtn.toggleClass('disabled', false);
                    this.$toolbarAddBoneBtn.toggleClass('disabled', false);
                    this.$toolbarAddSpriteBtn.toggleClass('disabled', false);
                    this.$toolbarAddDeleteBtn.toggleClass('disabled', isRoot);
                    // if(!allowChildren)
                    // {
                    // 	this.showAddMenu(false);
                    // }
                };
                TimelineTree.prototype.updateHighlight = function (target) {
                    var targetNode = target ? this.nodeMap[target.id] : this.rootNode;
                    if (targetNode == this.rootNode) {
                        target = null;
                        targetNode = null;
                    }
                    if (targetNode == this.highlightedNode)
                        return;
                    if (this.highlightedNode)
                        this.highlightedNode.highlighted = false;
                    if ((this.highlightedNode = targetNode))
                        this.highlightedNode.highlighted = true;
                };
                TimelineTree.prototype.updateSelection = function (target) {
                    var targetNode = target ? this.nodeMap[target.id] : this.rootNode;
                    if (targetNode == this.selectedNode)
                        return;
                    if (this.selectedNode)
                        this.selectedNode.selected = false;
                    if ((this.selectedNode = targetNode))
                        this.selectedNode.selected = true;
                    this.scrollTo(this.selectedNode);
                    this.updateToolbar();
                };
                /*
                 * Events
                 */
                TimelineTree.prototype.onNodeCollapse = function (node) {
                    this.treeNodeUpdate.dispatch(node, new Event('nodeCollapse', null));
                };
                return TimelineTree;
            }());
            tree.TimelineTree = TimelineTree;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineTree.js.map