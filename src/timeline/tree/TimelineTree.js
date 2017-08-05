var app;
(function (app) {
    var timeline;
    (function (timeline) {
        var tree;
        (function (tree) {
            var Bone = app.model.Bone;
            var Sprite = app.model.Sprite;
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
                            var target = event.target;
                            var targetNode = target ? _this.nodeMap[target.id] : _this.rootNode;
                            if (targetNode == _this.selectedNode)
                                return;
                            if (_this.selectedNode)
                                _this.selectedNode.selected = false;
                            if ((_this.selectedNode = targetNode))
                                _this.selectedNode.selected = true;
                            _this.updateToolbar();
                        }
                    };
                    this.onModelStructureChange = function (model, event) {
                        var type = event.type;
                        var target = event.target;
                        if (type == 'clear') {
                            _this.rootNode.clear();
                        }
                        else if (type == 'addChild') {
                            var parent_1 = _this.nodeMap[target.parent.id];
                            parent_1.addChild(_this.nodeMap[target.id] = new tree.TreeNode(target.type, target, target.canHaveChildren));
                        }
                        else if (type == 'removeChild') {
                            var node = _this.nodeMap[target.id];
                            if (node == _this.selectedNode) {
                                _this.model.setSelected(true);
                            }
                            node.parent.removeChild(node);
                            delete _this.nodeMap[target.id];
                        }
                        else if (type == 'reparent') {
                            // TODO: IMPLEMENT THIS
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
                        if (type == 'Add Bone') {
                            _this.selectedNode.node.addChild(new Bone()).setSelected(true);
                        }
                        else if (type == 'Add Sprite') {
                            _this.selectedNode.node.addChild(new Sprite(null)).setSelected(true);
                        }
                        else if (type == 'Delete') {
                            console.log('Delete');
                            _this.selectedNode.node.parent.removeChild(_this.selectedNode.node);
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
                    this.$container.append((this.rootNode = new tree.TreeNode('model', this.model, true)).$element);
                    model.structureChange.on(this.onModelStructureChange);
                    model.selectionChange.on(this.onModelSelectionChange);
                    this.nodeMap[this.model.id] = this.rootNode;
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
                return TimelineTree;
            }());
            tree.TimelineTree = TimelineTree;
        })(tree = timeline.tree || (timeline.tree = {}));
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineTree.js.map