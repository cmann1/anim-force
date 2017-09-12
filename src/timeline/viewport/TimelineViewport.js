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
                _this.nodeList = [];
                _this.scrollX = 0;
                _this.scrollY = 0;
                _this.currentFrame = 0;
                _this.selectedTrack = null;
                _this.selectedFrame = -1;
                _this.dragFrameIndicator = false;
                _this.dragKeyframeNode = null;
                _this.dragKeyframeIndex = -1;
                _this.dragKeyframeTargetNode = null;
                _this.dragKeyframeTargetIndex = -1;
                _this.dragKeyframeInitiated = false;
                _this.deselectKeyframe = false;
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
                _this.keyframeDisabledColour = '#fff4be';
                _this.keyframeDisabledBorderColour = '#dacd8f';
                _this.selectedFrameColour = '#fdf4a8';
                /*
                 * Events
                 */
                _this.onModelAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'updateAnimationList' || type == 'newAnimation') {
                        if (type == 'newAnimation') {
                            animation.change.on(_this.onAnimationChange);
                        }
                    }
                    if (type == 'setAnimation' || type == 'updateAnimationList') {
                        _this.setSelectedFrame(null, -1);
                        _this.animation = animation;
                        _this.currentFrame = _this.animation.getPosition();
                        _this.toolbar.updateFrameLabel();
                        _this.requiresUpdate = true;
                    }
                };
                _this.onAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'position' || type == 'clear') {
                        _this.setFrame(animation.getPosition());
                    }
                    else if (type == 'length') {
                        _this.setSelectedFrame(_this.selectedTrack, _this.selectedFrame);
                    }
                    _this.requiresUpdate = true;
                };
                _this.onModelSelectionChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelStructureChange = function (model, event) {
                    _this.updateNodeList();
                    _this.requiresUpdate = true;
                };
                _this.onModelModeChange = function (model, event) {
                    _this.mode = model.mode;
                    _this.requiresUpdate = true;
                    _this.toolbar.updateToolbarButtons();
                };
                _this.onTreeNodeUpdate = function (node, event) {
                    var type = event.type;
                    if (type == 'nodeCollapse') {
                        _this.updateNodeList();
                    }
                    _this.requiresUpdate = true;
                };
                _this.onTreeScroll = function (tree, event) {
                    _this.scrollY = event.scrollY;
                    _this.requiresUpdate = true;
                };
                _this.model = model;
                _this.tree = tree;
                _this.mode = model.mode;
                _this.animation = model.getActiveAnimation();
                _this.animation.change.on(_this.onAnimationChange);
                model.animationChange.on(_this.onModelAnimationChange);
                model.structureChange.on(_this.onModelStructureChange);
                model.selectionChange.on(_this.onModelSelectionChange);
                model.modeChange.on(_this.onModelModeChange);
                tree.scrollChange.on(_this.onTreeScroll);
                tree.treeNodeUpdate.on(_this.onTreeNodeUpdate);
                _this.$container.on('resize', _this.onResize);
                _this.$container.parent().on('resize', _this.onResize);
                _this.$container.parent().parent().parent().on('resize', _this.onResize);
                app.$window.on('resize', _this.onResize);
                _this.toolbar = new timeline.TimelineToolbar(model, _this, _this.$container.parent().find('#timeline-toolbar'));
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
                var keyframeColour = this.mode != EditMode.EDIT ? this.keyframeColour : this.keyframeDisabledColour;
                var keyframeBorderColour = this.mode != EditMode.EDIT ? this.keyframeBorderColour : this.keyframeDisabledBorderColour;
                var firstFrame = Math.floor(left / frameWidth);
                var lastFrame = Math.ceil(right / frameWidth);
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                this.drawHeader();
                ctx.beginPath();
                ctx.rect(0, nodeHeight, this.width, this.height - nodeHeight);
                ctx.clip();
                ctx.translate(-this.scrollX, -this.scrollY + nodeHeight);
                var y = 0;
                for (var _i = 0, _a = this.nodeList; _i < _a.length; _i++) {
                    var node = _a[_i];
                    if (y <= bottom && y + nodeHeight >= top) {
                        ctx.fillStyle = app.Config.node;
                        ctx.fillRect(this.scrollX, y, this.width, nodeHeight);
                        ctx.fillStyle = app.Config.nodeBorder;
                        ctx.fillRect(this.scrollX, y + nodeHeight - 1, this.width, 1);
                        var lastKeyframe = -1;
                        var track = animation.tracks[node.id];
                        var onScreenFrameCount = 0;
                        var selectedFrame = this.selectedTrack == node ? this.selectedFrame : -1;
                        var dragFrame = this.dragKeyframeNode == node ? this.dragKeyframeIndex : -1;
                        var dropTargetFrame = this.dragKeyframeTargetNode == node ? this.dragKeyframeTargetIndex : -1;
                        // Draw the background (selection and borders)
                        for (var j = firstFrame, x = firstFrame * frameWidth; j < lastFrame; j++) {
                            if (j == selectedFrame || j == dropTargetFrame) {
                                ctx.fillStyle = this.selectedFrameColour;
                                ctx.fillRect(x, y, frameWidth - 1, nodeHeight - 1);
                                if (j == dragFrame) {
                                    ctx.fillStyle = this.keyframeBorderColour;
                                    ctx.fillRect(x, y, 1, nodeHeight - 1);
                                    ctx.fillRect(x + frameWidth - 2, y, 1, nodeHeight - 1);
                                    ctx.fillRect(x + 1, y, frameWidth - 3, 1);
                                    ctx.fillRect(x + 1, y + nodeHeight - 2, frameWidth - 3, 1);
                                }
                            }
                            var prev = null;
                            var next = null;
                            var arrowCount = 0;
                            var cx = x + frameCX;
                            var cy = y + frameCY;
                            if (j < animationLength) {
                                ctx.fillStyle = app.Config.nodeBorder;
                                ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);
                            }
                            x += frameWidth;
                        }
                        // Draw keyframes
                        for (var j = firstFrame, x = firstFrame * frameWidth; j < lastFrame; j++) {
                            var prev = null;
                            var next = null;
                            var arrowCount = 0;
                            var cx = x + frameCX;
                            var cy = y + frameCY;
                            if (j < animationLength) {
                                var keyframe = track.getKeyFrame(j);
                                if (keyframe) {
                                    onScreenFrameCount++;
                                    // Keyframe diamond
                                    ctx.fillStyle = keyframeColour;
                                    ctx.strokeStyle = keyframeBorderColour;
                                    ctx.beginPath();
                                    ctx.moveTo(cx - keyframeSize, cy);
                                    ctx.lineTo(cx, cy - keyframeSize);
                                    ctx.lineTo(cx + keyframeSize, cy);
                                    ctx.lineTo(cx, cy + keyframeSize);
                                    ctx.closePath();
                                    ctx.fill();
                                    ctx.stroke();
                                    // There needs to be an arrow connecting keyframes
                                    if (keyframe.next && keyframe.next.frameIndex > keyframe.frameIndex + 1) {
                                        lastKeyframe = j;
                                        prev = keyframe;
                                        next = keyframe.next;
                                        arrowCount++;
                                        if (prev.prev && prev.prev.frameIndex < firstFrame) {
                                            arrowCount++;
                                        }
                                    }
                                    else if (keyframe.prev && keyframe.prev.frameIndex != lastKeyframe && keyframe.prev.frameIndex < keyframe.frameIndex - 1) {
                                        lastKeyframe = j;
                                        prev = keyframe.prev;
                                        next = keyframe;
                                        arrowCount++;
                                    }
                                }
                            }
                            // Connect two keyframes outside of the drawing range
                            if (onScreenFrameCount == 0 && j + 1 == lastFrame) {
                                var tmp = { prev: null, current: null, next: null };
                                this.animation.getClosestKeyframes(j, tmp, node);
                                if (tmp.prev && tmp.next) {
                                    prev = tmp.prev;
                                    next = tmp.next;
                                    arrowCount++;
                                }
                            }
                            // Draw keyframe connection arrows
                            while (arrowCount--) {
                                cx = next.frameIndex * frameWidth - 3;
                                ctx.strokeStyle = keyframeBorderColour;
                                ctx.beginPath();
                                ctx.moveTo(prev.frameIndex * frameWidth + frameWidth + 2, cy);
                                ctx.lineTo(cx, cy);
                                ctx.lineTo(cx - 4, cy - 4);
                                ctx.moveTo(cx, cy);
                                ctx.lineTo(cx - 4, cy + 4);
                                ctx.stroke();
                                if (arrowCount > 0) {
                                    prev = prev.prev;
                                    next = prev.next;
                                }
                            }
                            x += frameWidth;
                        }
                    } // End if
                    y += nodeHeight;
                }
                var currentFrameX = currentFrame * frameWidth;
                if (this.mode != EditMode.EDIT && currentFrameX <= right && currentFrameX + frameWidth >= left) {
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
                    if (frameIndex == currentFrame && this.mode != EditMode.EDIT) {
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
            TimelineViewport.prototype.getMode = function () {
                return this.mode;
            };
            TimelineViewport.prototype.focus = function () {
                this.$canvas.focus();
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
            TimelineViewport.prototype.togglePlayback = function () {
                if (this.mode == EditMode.ANIMATE) {
                    this.model.mode = EditMode.PLAYBACK;
                }
                else if (this.mode == EditMode.PLAYBACK) {
                    this.model.mode = EditMode.ANIMATE;
                }
            };
            TimelineViewport.prototype.updateNodeList = function () {
                var nodes = [];
                var nodeQueue = [];
                var i = -1;
                for (var j = this.model.childCount - 1; j >= 0; j--)
                    nodeQueue[++i] = this.model.children[j];
                while (i >= 0) {
                    var node = nodeQueue[i--];
                    if (node instanceof ContainerNode && !node.collapsed) {
                        for (var j = node.childCount - 1; j >= 0; j--)
                            nodeQueue[++i] = node.children[j];
                    }
                    nodes.push(node);
                }
                this.nodeList = nodes;
            };
            TimelineViewport.prototype.setFrame = function (frame) {
                if (this.currentFrame == frame)
                    return;
                this.animation.setPosition(frame);
                this.currentFrame = this.animation.getPosition();
                this.toolbar.updateFrameLabel();
                this.scrollIntoView(null, this.currentFrame);
            };
            TimelineViewport.prototype.setSelectedFrame = function (node, frameIndex, toggle) {
                if (frameIndex === void 0) { frameIndex = -1; }
                if (toggle === void 0) { toggle = false; }
                if (frameIndex < 0)
                    node = null;
                if (node == this.selectedTrack && frameIndex == this.selectedFrame) {
                    if (toggle && node) {
                        this.selectedTrack = null;
                        this.selectedFrame = -1;
                    }
                    return false;
                }
                this.selectedTrack = node;
                this.selectedFrame = node ? frameIndex : -1;
                return true;
            };
            TimelineViewport.prototype.getFrameIndexAt = function (x) {
                return Math.floor((x + this.scrollX) / app.Config.frameWidth);
            };
            TimelineViewport.prototype.getNodeAt = function (y) {
                var i = Math.floor((y + this.scrollY) / app.Config.nodeHeight);
                return i < 0 || i >= this.nodeList.length ? null : this.nodeList[i];
            };
            TimelineViewport.prototype.scrollIntoView = function (node, frame) {
                if (node === void 0) { node = null; }
                if (frame === void 0) { frame = NaN; }
                if (node) {
                    var trackY = this.nodeList.indexOf(node) * app.Config.nodeHeight;
                    if (trackY + app.Config.nodeHeight > this.scrollY + this.height - app.Config.nodeHeight) {
                        this.scrollY = Math.floor(Math.max(0, trackY - this.height + app.Config.nodeHeight + app.Config.nodeHeight));
                    }
                    else if (trackY < this.scrollY) {
                        this.scrollY = Math.floor(Math.max(0, trackY));
                    }
                    this.tree.setScroll(this.scrollY);
                }
                if (!isNaN(frame)) {
                    var frameX = frame * app.Config.frameWidth;
                    if (frameX + app.Config.frameWidth > this.scrollX + this.width) {
                        this.scrollX = Math.floor(Math.max(0, frameX - this.width + app.Config.frameWidth));
                    }
                    else if (frameX < this.scrollX) {
                        this.scrollX = Math.floor(Math.max(0, frameX));
                    }
                }
                this.requiresUpdate = true;
            };
            TimelineViewport.prototype.stopKeyframeDrag = function (move, cancel) {
                if (move === void 0) { move = false; }
                if (cancel === void 0) { cancel = true; }
                if (this.dragKeyframeNode) {
                    if (!cancel && this.dragKeyframeTargetNode && (this.dragKeyframeNode != this.dragKeyframeTargetNode || this.dragKeyframeIndex != this.dragKeyframeTargetIndex)) {
                        var frameData = {};
                        this.animation.copyKeyframes(frameData, this.dragKeyframeNode, false, move, this.dragKeyframeIndex);
                        this.animation.pasteKeyframes(frameData, this.dragKeyframeTargetNode, this.dragKeyframeTargetIndex);
                        this.setSelectedFrame(this.dragKeyframeTargetNode, this.dragKeyframeTargetIndex);
                    }
                    this.dragKeyframeNode = null;
                    this.dragKeyframeIndex = -1;
                    this.dragKeyframeInitiated = false;
                    this.dragKeyframeTargetNode = null;
                    this.dragKeyframeTargetIndex = -1;
                }
            };
            TimelineViewport.prototype.onKeyDown = function (event) {
                if (this.viewport.commonKey(event))
                    return;
                if (this.commonKey(event))
                    return;
                if (this.mode == EditMode.PLAYBACK)
                    return;
                var keyCode = event.keyCode;
                var ctrlKey = event.ctrlKey;
                var shiftKey = event.shiftKey;
                var altKey = event.altKey;
                // console.log(keyCode);
                if (this.mode == EditMode.ANIMATE) {
                    if (keyCode == Key.Home) {
                        this.setFrame(0);
                    }
                    else if (keyCode == Key.End) {
                        this.setFrame(this.animation.getLength() - 1);
                    }
                    else if (ctrlKey && (keyCode == Key.C || keyCode == Key.X)) {
                        var frameData = {};
                        var frameCount = this.animation.copyKeyframes(frameData, this.selectedTrack || this.model.getSelectedNode(), altKey, keyCode == Key.X, this.selectedFrame);
                        app.Clipboard.setData('keyframes', frameData);
                        this.viewport.showMessage("Copied " + frameCount + " frames");
                        if (keyCode == Key.X) {
                            this.setSelectedFrame(null);
                        }
                    }
                    else if (ctrlKey && keyCode == Key.V) {
                        var frameCount = this.animation.pasteKeyframes(app.Clipboard.getData('keyframes'), this.selectedTrack, this.selectedFrame);
                        this.viewport.showMessage("Pasted " + frameCount + " frames");
                        this.setSelectedFrame(null);
                    }
                    else if (keyCode == Key.Delete) {
                        if (this.selectedTrack) {
                            this.animation.deleteKeyframe(this.selectedTrack, this.selectedFrame);
                            this.setSelectedFrame(null);
                        }
                    }
                    else if (keyCode == Key.Escape) {
                        if (this.dragKeyframeNode) {
                            this.stopKeyframeDrag();
                        }
                    }
                }
            };
            TimelineViewport.prototype.commonKey = function (event) {
                var keyCode = event.keyCode;
                var shiftKey = event.shiftKey;
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
                    else if (keyCode == Key.D) {
                        this.animation.deleteKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
                        return true;
                    }
                    else if (keyCode == Key.I) {
                        this.animation.forceKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
                        return true;
                    }
                    else if (keyCode == Key.T && shiftKey) {
                        var length = this.animation.getLength();
                        this.animation.trimLength();
                        this.viewport.showMessage("Trimmed " + (length - this.animation.getLength()) + " frames");
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
                if (this.mode == EditMode.ANIMATE) {
                    // Clicked on header
                    if (this.mouseY <= app.Config.nodeHeight) {
                        if (event.button == 0) {
                            this.setFrame(this.getFrameIndexAt(this.mouseX));
                            this.dragFrameIndicator = true;
                        }
                    }
                    else {
                        if (!this.setSelectedFrame(this.getNodeAt(this.mouseY - app.Config.nodeHeight), this.getFrameIndexAt(this.mouseX))) {
                            this.deselectKeyframe = true;
                        }
                        if (this.selectedTrack && this.animation.tracks[this.selectedTrack.id].getKeyFrame(this.selectedFrame)) {
                            this.dragKeyframeNode = this.selectedTrack;
                            this.dragKeyframeIndex = this.selectedFrame;
                        }
                    }
                }
            };
            TimelineViewport.prototype.onMouseUp = function (event) {
                this.dragFrameIndicator = false;
                this.dragView = false;
                if (this.deselectKeyframe) {
                    this.setSelectedFrame(null);
                    this.deselectKeyframe = false;
                }
                this.stopKeyframeDrag(!event.ctrlKey, false);
            };
            TimelineViewport.prototype.onMouseWheel = function (event) {
                this.tree.triggerScroll(event);
            };
            TimelineViewport.prototype.onMouseMove = function (event) {
                if (this.mode == EditMode.PLAYBACK)
                    return;
                if (this.dragFrameIndicator) {
                    this.setFrame(Math.floor((this.mouseX + this.scrollX) / app.Config.frameWidth));
                }
                else if (this.dragView) {
                    this.scrollX = Math.max(0, this.dragViewX - this.mouseX);
                    this.scrollY = Math.max(0, this.dragViewY - this.mouseY);
                    this.tree.setScroll(this.scrollY);
                    this.requiresUpdate = true;
                }
                else if (this.dragKeyframeNode) {
                    this.deselectKeyframe = false;
                    if (!this.dragKeyframeInitiated) {
                        var node = this.getNodeAt(this.mouseY - app.Config.nodeHeight);
                        var frame = this.getFrameIndexAt(this.mouseX);
                        if (node && frame >= 0) {
                            this.dragKeyframeInitiated = true;
                        }
                    }
                    if (this.dragKeyframeInitiated) {
                        this.dragKeyframeTargetNode = this.getNodeAt(this.mouseY - app.Config.nodeHeight);
                        this.dragKeyframeTargetIndex = this.dragKeyframeTargetNode ? this.getFrameIndexAt(this.mouseX) : -1;
                        this.scrollIntoView(this.dragKeyframeTargetNode, this.dragKeyframeTargetIndex);
                    }
                }
            };
            return TimelineViewport;
        }(app.Canvas));
        timeline.TimelineViewport = TimelineViewport;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineViewport.js.map