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
        var ContainerNode = app.model.ContainerNode;
        var TimelineViewport = (function (_super) {
            __extends(TimelineViewport, _super);
            function TimelineViewport(elementId, model, tree) {
                var _this = _super.call(this, elementId) || this;
                _this.scrollX = 0;
                _this.scrollY = 0;
                /*
                 * Events
                 */
                // TODO: Implement
                _this.onActiveAnimationChange = function (node, event) {
                    console.log(node, event);
                    _this.requiresUpdate = true;
                };
                _this.onModelSelectionChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelStructureChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onTreeNodeUpdate = function (node, event) {
                    _this.requiresUpdate = true;
                };
                _this.onTreeScroll = function (tree, event) {
                    _this.scrollY = event.scrollY;
                    _this.requiresUpdate = true;
                };
                _this.model = model;
                _this.tree = tree;
                _this.animation = model.getActiveAnimation();
                model.activeAnimationChange.on(_this.onActiveAnimationChange);
                model.structureChange.on(_this.onModelStructureChange);
                model.selectionChange.on(_this.onModelSelectionChange);
                tree.scrollChange.on(_this.onTreeScroll);
                tree.treeNodeUpdate.on(_this.onTreeNodeUpdate);
                _this.$container.on('resize', _this.onResize);
                _this.$container.parent().on('resize', _this.onResize);
                _this.$container.parent().parent().parent().on('resize', _this.onResize);
                _this.$canvas
                    .on('keydown', _this.onKeyDown)
                    .on('keyup', _this.onKeyUp);
                _this.setupToolbar();
                return _this;
            }
            TimelineViewport.prototype.step = function (deltaTime, timestamp) {
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
            };
            TimelineViewport.prototype.draw = function () {
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
                var ctx = this.ctx;
                var nodeHeight = 29;
                var top = this.scrollY;
                var bottom = top + this.height;
                var left = this.scrollX;
                var right = left + this.width;
                var animation = this.animation;
                var animationLength = animation.getLength();
                var frameWidth = app.Config.frameWidth;
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                ctx.translate(-this.scrollX, -this.scrollY);
                var nodes = [this.model];
                var nodeCount = nodes.length;
                var i = 0;
                var y = 0;
                while (i < nodeCount) {
                    var node = nodes[i];
                    if (node instanceof ContainerNode && !node.collapsed) {
                        nodes = nodes.concat(node.children);
                        nodeCount += node.childCount;
                    }
                    if (y <= bottom && y + nodeHeight >= top) {
                        ctx.fillStyle = app.Config.node;
                        ctx.fillRect(0, y, this.width, nodeHeight);
                        ctx.fillStyle = app.Config.nodeBorder;
                        ctx.fillRect(0, y + nodeHeight - 1, this.width, 1);
                        if (i > 0) {
                            var track = animation.tracks[node.id];
                            var j = Math.floor(left / frameWidth);
                            var x = j * frameWidth;
                            for (; j < animationLength; j++) {
                                if (x > right)
                                    break;
                                ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);
                                x += frameWidth;
                            }
                        }
                    }
                    y += nodeHeight;
                    i++;
                }
                ctx.restore();
                this.requiresUpdate = false;
            };
            TimelineViewport.prototype.setupToolbar = function () {
                this.$toolbar = this.$container.parent().find('#timeline-toolbar');
                // this.$toolbar
                // 	.on('click', 'i', this.onToolbarButtonClick)
                // 	.on('mousewheel', this.onToolbarMouseWheel);
                // this.$toolbar.find('.fa-plus').parent()
                // 	.on('mouseenter', this.onToolbarAddHover)
                // 	.on('mouseleave', this.onToolbarAddLeave);
                // this.$toolbarAddMenu = this.$toolbar.find('.add-menu');
                //
                // this.$toolbarAddBtn = this.$toolbar.find('i.btn-add');
                // this.$toolbarAddBoneBtn = this.$toolbar.find('i.btn-add-bone');
                // this.$toolbarAddSpriteBtn = this.$toolbar.find('i.btn-add-sprite');
                // this.$toolbarAddDeleteBtn = this.$toolbar.find('i.btn-delete');
                tippy(this.$toolbar.find('i').toArray());
                // this.$toolbarAddMenu.hide();
            };
            TimelineViewport.prototype.onKeyDown = function (event) {
                var keyCode = event.keyCode;
                console.log(keyCode);
            };
            TimelineViewport.prototype.onKeyUp = function (event) {
            };
            TimelineViewport.prototype.onMouseDown = function (event) {
            };
            TimelineViewport.prototype.onMouseUp = function (event) {
            };
            TimelineViewport.prototype.onMouseWheel = function (event) {
            };
            TimelineViewport.prototype.onMouseMove = function (event) {
            };
            return TimelineViewport;
        }(app.Canvas));
        timeline.TimelineViewport = TimelineViewport;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineViewport.js.map