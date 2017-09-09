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
        var Key = KeyCodes.Key;
        var EditMode = app.model.EditMode;
        var TimelineViewport = (function (_super) {
            __extends(TimelineViewport, _super);
            function TimelineViewport(elementId, model, tree) {
                var _this = _super.call(this, elementId) || this;
                _this.scrollX = 0;
                _this.scrollY = 0;
                _this.currentFrame = 0;
                _this.dragFrame = false;
                _this.dragView = false;
                _this.dragViewX = 0;
                _this.dragViewY = 0;
                _this.headerFontSize = '12px';
                _this.headerTickSize = 4;
                _this.headerFrameInterval = 5;
                _this.scrubColour = 'rgba(255, 50, 50, 0.5)';
                _this.keyframeSize = 4;
                _this.keyframeColour = '#f9e26f';
                _this.keyframeBorderColour = '#d4b82d';
                /*
                 * Events
                 */
                // TODO: Implement
                _this.onActiveAnimationChange = function (model, event) {
                    // console.log(model, event);
                    _this.updateFrameLabel();
                    _this.requiresUpdate = true;
                };
                _this.onAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'position' || type == 'clear') {
                        _this.setFrame(animation.getPosition());
                        _this.updateFrameLabel();
                    }
                    else if (type == 'length') {
                        _this.updateFrameLabel();
                    }
                    _this.requiresUpdate = true;
                };
                _this.onModelSelectionChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelStructureChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelModeChange = function (model, event) {
                    _this.mode = model.mode;
                    _this.updateToolbarButtons();
                };
                _this.onTreeNodeUpdate = function (node, event) {
                    _this.requiresUpdate = true;
                };
                _this.onTreeScroll = function (tree, event) {
                    _this.scrollY = event.scrollY;
                    _this.requiresUpdate = true;
                };
                _this.onToolbarButtonClick = function (event) {
                    _this.$canvas.focus();
                    var $btn = $(event.target);
                    if ($btn.hasClass('disabled'))
                        return;
                    var type = $btn.data('action');
                    if (type == 'play' || type == 'pause') {
                        _this.togglePlayback();
                    }
                    else if (type == 'prev-frame') {
                        _this.prevFrame(event.shiftKey);
                    }
                    else if (type == 'next-frame') {
                        _this.nextFrame(event.shiftKey);
                    }
                    else if (type == 'prev-keyframe') {
                        _this.animation.gotoPrevKeyframe();
                    }
                    else if (type == 'next-keyframe') {
                        _this.animation.gotoNextKeyframe();
                    }
                    else if (type == 'insert-keyframe') {
                        _this.animation.forceKeyframe(event.shiftKey ? null : _this.model.getSelectedNode());
                    }
                    else if (type == 'delete-keyframe') {
                        _this.animation.deleteKeyframe(event.shiftKey ? null : _this.model.getSelectedNode());
                    }
                };
                _this.model = model;
                _this.tree = tree;
                _this.mode = model.mode;
                _this.animation = model.getActiveAnimation();
                _this.animation.change.on(_this.onAnimationChange);
                model.activeAnimationChange.on(_this.onActiveAnimationChange);
                model.structureChange.on(_this.onModelStructureChange);
                model.selectionChange.on(_this.onModelSelectionChange);
                model.modeChange.on(_this.onModelModeChange);
                tree.scrollChange.on(_this.onTreeScroll);
                tree.treeNodeUpdate.on(_this.onTreeNodeUpdate);
                _this.$container.on('resize', _this.onResize);
                _this.$container.parent().on('resize', _this.onResize);
                _this.$container.parent().parent().parent().on('resize', _this.onResize);
                app.$window.on('resize', _this.onResize);
                _this.setupToolbar();
                _this.headerGrad = _this.ctx.createLinearGradient(0, 0, 0, app.Config.nodeHeight);
                _this.headerGrad.addColorStop(0, app.Config.node);
                _this.headerGrad.addColorStop(1, app.Config.nodeBottom);
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
                var nodeHeight = app.Config.nodeHeight;
                var top = this.scrollY;
                var bottom = top + this.height;
                var left = this.scrollX;
                var right = left + this.width;
                var animation = this.animation;
                var animationLength = animation.getLength();
                var currentFrame = this.currentFrame;
                var frameWidth = app.Config.frameWidth;
                var frameCX = frameWidth * 0.5;
                var frameCY = nodeHeight * 0.5;
                var keyframeSize = this.keyframeSize;
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                this.drawHeader();
                ctx.beginPath();
                ctx.rect(0, nodeHeight, this.width, this.height - nodeHeight);
                ctx.clip();
                ctx.translate(-this.scrollX, -this.scrollY + nodeHeight);
                var nodes = this.model.children.slice();
                var i = -1;
                for (var j = this.model.childCount - 1; j >= 0; j--)
                    nodes[++i] = this.model.children[i];
                var y = 0;
                while (i >= 0) {
                    var node = nodes[i--];
                    if (node instanceof ContainerNode && !node.collapsed) {
                        for (var j = node.childCount - 1; j >= 0; j--)
                            nodes[++i] = node.children[j];
                    }
                    if (y <= bottom && y + nodeHeight >= top) {
                        ctx.fillStyle = app.Config.node;
                        ctx.fillRect(this.scrollX, y, this.width, nodeHeight);
                        ctx.fillStyle = app.Config.nodeBorder;
                        ctx.fillRect(this.scrollX, y + nodeHeight - 1, this.width, 1);
                        var track = animation.tracks[node.id];
                        var j = Math.floor(left / frameWidth);
                        var x = j * frameWidth;
                        for (; j < animationLength; j++) {
                            if (x > right)
                                break;
                            var keyframe = track.getKeyFrame(j);
                            if (keyframe) {
                                var cx = x + frameCX;
                                var cy = y + frameCY;
                                ctx.fillStyle = this.keyframeColour;
                                ctx.strokeStyle = this.keyframeBorderColour;
                                ctx.beginPath();
                                ctx.moveTo(cx - keyframeSize, cy);
                                ctx.lineTo(cx, cy - keyframeSize);
                                ctx.lineTo(cx + keyframeSize, cy);
                                ctx.lineTo(cx, cy + keyframeSize);
                                ctx.closePath();
                                ctx.fill();
                                ctx.stroke();
                                if (keyframe.prev && keyframe.prev.frameIndex < keyframe.frameIndex - 1) {
                                    cx = keyframe.frameIndex * frameWidth - 3;
                                    ctx.beginPath();
                                    ctx.moveTo(keyframe.prev.frameIndex * frameWidth + frameWidth + 2, cy);
                                    ctx.lineTo(cx, cy);
                                    ctx.lineTo(cx - 4, cy - 4);
                                    ctx.moveTo(cx, cy);
                                    ctx.lineTo(cx - 4, cy + 4);
                                    ctx.stroke();
                                }
                            }
                            ctx.fillStyle = app.Config.nodeBorder;
                            ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);
                            x += frameWidth;
                        }
                    }
                    y += nodeHeight;
                }
                var currentFrameX = currentFrame * frameWidth;
                if (currentFrameX <= right && currentFrameX + frameWidth >= left) {
                    ctx.fillStyle = this.scrubColour;
                    ctx.fillRect(currentFrameX + frameWidth * 0.5 - 1, 0, 2, this.width);
                }
                ctx.restore();
                this.requiresUpdate = false;
            };
            TimelineViewport.prototype.drawHeader = function () {
                var ctx = this.ctx;
                var nodeHeight = app.Config.nodeHeight;
                var headerTickSize = this.headerTickSize;
                var headerFrameInterval = this.headerFrameInterval;
                var left = this.scrollX;
                var right = left + this.width;
                var animation = this.animation;
                var animationLength = animation.getLength();
                var currentFrame = this.currentFrame;
                var frameWidth = app.Config.frameWidth;
                ctx.fillStyle = this.headerGrad;
                ctx.fillRect(0, 0, this.width, nodeHeight);
                ctx.fillStyle = app.Config.nodeBorder;
                ctx.fillRect(0, nodeHeight - 1, this.width, 1);
                ctx.font = this.headerFontSize + " " + app.Config.font;
                var frameIndex = Math.floor(left / frameWidth);
                var x = frameIndex * frameWidth;
                while (x <= right) {
                    var drawX = x - this.scrollX;
                    if (frameIndex == currentFrame) {
                        ctx.fillStyle = this.scrubColour;
                        ctx.fillRect(drawX + 3, 0, frameWidth - 6, nodeHeight - 1);
                    }
                    if (frameIndex % headerFrameInterval == 0) {
                        ctx.fillStyle = app.Config.line;
                        ctx.fillRect(drawX, nodeHeight - headerTickSize - 4, 1, headerTickSize + 2);
                        ctx.fillStyle = app.Config.text;
                        ctx.fillText(String(frameIndex + 1), drawX + 1, nodeHeight - headerTickSize - 6);
                    }
                    else {
                        ctx.fillStyle = app.Config.line;
                        ctx.fillRect(drawX, nodeHeight - headerTickSize - 2, 1, headerTickSize);
                    }
                    frameIndex++;
                    x += frameWidth;
                }
            };
            TimelineViewport.prototype.setupToolbar = function () {
                // TODO: Toolbar buttons
                this.$toolbar = this.$container.parent().find('#timeline-toolbar');
                this.$frameLabel = this.$toolbar.find('.frame-label .value');
                this.$toolbarButtons = this.$toolbar.find('i');
                this.$playButton = this.$toolbar.find('.btn-play');
                this.$pauseButton = this.$toolbar.find('.btn-pause');
                this.$toolbar
                    .on('click', 'i', this.onToolbarButtonClick);
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
                this.updateFrameLabel();
                this.updateToolbarButtons();
            };
            TimelineViewport.prototype.updateFrameLabel = function () {
                this.$frameLabel.text((this.currentFrame + 1) + '/' + this.animation.getLength());
            };
            TimelineViewport.prototype.updateToolbarButtons = function () {
                if (this.mode == EditMode.PLAYBACK) {
                    this.$playButton.hide();
                    this.$pauseButton.show();
                }
                else {
                    this.$playButton.show();
                    this.$pauseButton.hide();
                }
                if (this.mode == EditMode.ANIMATE) {
                    this.$toolbarButtons.removeClass('disabled');
                }
                else {
                    this.$toolbarButtons.addClass('disabled');
                    this.$playButton.removeClass('disabled');
                    this.$pauseButton.removeClass('disabled');
                }
            };
            TimelineViewport.prototype.setFrame = function (frame) {
                if (this.currentFrame == frame)
                    return;
                this.animation.setPosition(frame);
                this.currentFrame = this.animation.getPosition();
                this.updateFrameLabel();
                var frameX = this.currentFrame * app.Config.frameWidth;
                if (frameX + app.Config.frameWidth > this.scrollX + this.width) {
                    this.scrollX = Math.floor(Math.max(0, frameX - this.width + app.Config.frameWidth));
                }
                else if (frameX < this.scrollX) {
                    this.scrollX = Math.floor(Math.max(0, frameX));
                }
                this.requiresUpdate = true;
            };
            TimelineViewport.prototype.togglePlayback = function () {
                if (this.mode == EditMode.ANIMATE) {
                    this.model.mode = EditMode.PLAYBACK;
                }
                else if (this.mode == EditMode.PLAYBACK) {
                    this.model.mode = EditMode.ANIMATE;
                }
            };
            TimelineViewport.prototype.prevFrame = function (shiftKey) {
                if (shiftKey)
                    this.animation.setPosition(this.animation.getPosition() - 5);
                else
                    this.animation.gotoPrevFrame();
            };
            TimelineViewport.prototype.nextFrame = function (shiftKey) {
                if (shiftKey)
                    this.animation.setPosition(this.animation.getPosition() + 5);
                else
                    this.animation.gotoNextFrame();
            };
            TimelineViewport.prototype.onKeyDown = function (event) {
                if (this.viewport.commonKey(event))
                    return;
                if (this.commonKey(event))
                    return;
                if (this.mode == EditMode.PLAYBACK)
                    return;
                var keyCode = event.keyCode;
                // console.log(keyCode);
                if (this.mode == EditMode.ANIMATE) {
                    if (keyCode == Key.Home) {
                        this.setFrame(0);
                    }
                    else if (keyCode == Key.End) {
                        this.setFrame(this.animation.getLength() - 1);
                    }
                }
            };
            TimelineViewport.prototype.commonKey = function (event) {
                var keyCode = event.keyCode;
                if (this.mode == EditMode.ANIMATE || this.mode == EditMode.PLAYBACK) {
                    // Playback
                    if (keyCode == Key.ForwardSlash) {
                        this.togglePlayback();
                        return true;
                    }
                }
                if (this.mode == EditMode.ANIMATE) {
                    // Prev/Next frame
                    if (keyCode == Key.Comma) {
                        this.prevFrame(event.shiftKey);
                        return true;
                    }
                    else if (keyCode == Key.Period) {
                        this.nextFrame(event.shiftKey);
                        return true;
                    }
                    // Prev/Next keyframe
                    if (keyCode == Key.OpenBracket) {
                        this.animation.gotoPrevKeyframe();
                        return true;
                    }
                    else if (keyCode == Key.ClosedBracket) {
                        this.animation.gotoNextKeyframe();
                        return true;
                    }
                    else if (keyCode == Key.X) {
                        this.animation.deleteKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
                        return true;
                    }
                    else if (keyCode == Key.I) {
                        this.animation.forceKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
                        return true;
                    }
                }
                return false;
            };
            TimelineViewport.prototype.onKeyUp = function (event) {
            };
            TimelineViewport.prototype.onMouseDown = function (event) {
                this.$canvas.focus();
                if (this.mode == EditMode.PLAYBACK)
                    return;
                // Drag view
                if (event.button == 2) {
                    this.dragViewX = this.scrollX + this.mouseX;
                    this.dragViewY = this.scrollY + this.mouseY;
                    this.dragView = true;
                    return;
                }
                // Clicked on header
                if (this.mouseY <= app.Config.nodeHeight) {
                    if (event.button == 0) {
                        this.setFrame(Math.floor((this.mouseX + this.scrollX) / app.Config.frameWidth));
                        this.dragFrame = true;
                    }
                }
                else {
                }
            };
            TimelineViewport.prototype.onMouseUp = function (event) {
                this.dragFrame = false;
                this.dragView = false;
            };
            TimelineViewport.prototype.onMouseWheel = function (event) {
                this.tree.triggerScroll(event);
            };
            TimelineViewport.prototype.onMouseMove = function (event) {
                if (this.mode == EditMode.PLAYBACK)
                    return;
                if (this.dragFrame) {
                    this.setFrame(Math.floor((this.mouseX + this.scrollX) / app.Config.frameWidth));
                }
                else if (this.dragView) {
                    this.scrollX = Math.max(0, this.dragViewX - this.mouseX);
                    this.scrollY = Math.max(0, this.dragViewY - this.mouseY);
                    this.tree.setScroll(this.scrollY);
                    this.requiresUpdate = true;
                }
            };
            return TimelineViewport;
        }(app.Canvas));
        timeline.TimelineViewport = TimelineViewport;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineViewport.js.map