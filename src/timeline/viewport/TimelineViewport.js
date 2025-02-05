var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        var Key = KeyCodes.Key;
        var EditMode = app.model.EditMode;
        var PromptDlg = app.ui.PromptDlg;
        var EventTrack = app.anim.EventTrack;
        var TimelineViewport = /** @class */ (function (_super) {
            __extends(TimelineViewport, _super);
            function TimelineViewport(elementId, model, tree) {
                var _this = _super.call(this, elementId) || this;
                _this.trackList = [];
                _this.eventEditTrack = null;
                _this.eventEditFrame = -1;
                _this.scrollX = 0;
                _this.scrollY = 0;
                _this.currentFrame = 0;
                _this.selectedTrack = null;
                _this.selectedFrame = -1;
                _this.dragFrameIndicator = false;
                _this.dragKeyframeTrack = null;
                _this.dragKeyframeIndex = -1;
                _this.dragKeyframeTargetTrack = null;
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
                _this.selectedFrameColour = '#fdf4a8';
                _this.labelFontSize = '12px';
                /*
                 * Events
                 */
                _this.onCanvasDblClick = function (event) {
                    if (_this.mode == EditMode.ANIMATE) {
                        if (_this.mouseY > app.Config.nodeHeight) {
                            if (event.button == 0) {
                                var track = _this.getNodeAt(_this.mouseY - app.Config.nodeHeight);
                                if (track instanceof EventTrack) {
                                    var frame = _this.getFrameIndexAt(_this.mouseX);
                                    _this.showEventPrompt(track, _this.getFrameIndexAt(_this.mouseX));
                                }
                            }
                        }
                    }
                };
                _this.onEventConfirm = function (name, value) {
                    value = $.trim(value);
                    if (value == '') {
                        _this.animation.deleteKeyframe(_this.eventEditTrack.node, _this.eventEditFrame);
                    }
                    else {
                        _this.eventEditTrack.node.event = value;
                        _this.animation.forceKeyframe(_this.eventEditTrack.node, _this.eventEditFrame);
                    }
                    _this.$canvas.focus();
                };
                _this.onEventDlgClose = function (dlg) {
                    _this.$canvas.focus();
                };
                //
                _this.onAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'position' || type == 'clear') {
                        _this.setFrame(animation.getPosition());
                    }
                    else if (type == 'length') {
                        _this.setSelectedFrame(_this.selectedTrack, _this.selectedFrame);
                    }
                    else if (type == 'updateTracks') {
                        _this.updateTrackList();
                    }
                    _this.requiresUpdate = true;
                };
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
                        _this.scrollX = animation.scrollX;
                        _this.updateTrackList();
                        _this.requiresUpdate = true;
                    }
                };
                _this.onModelSelectionChange = function (model, event) {
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
                        _this.updateTrackList();
                    }
                    _this.requiresUpdate = true;
                };
                _this.onTreeScroll = function (tree, event) {
                    _this.scrollY = event.scrollY;
                    _this.requiresUpdate = true;
                };
                _this.tree = tree;
                tree.scrollChange.on(_this.onTreeScroll);
                tree.treeNodeUpdate.on(_this.onTreeNodeUpdate);
                _this.$canvas.on('dblclick', _this.onCanvasDblClick);
                _this.toolbar = new timeline.TimelineToolbar(model, _this, _this.$container.parent().find('#timeline-toolbar'));
                _this.headerGrad = _this.ctx.createLinearGradient(0, 0, 0, app.Config.nodeHeight);
                _this.headerGrad.addColorStop(0, app.Config.node);
                _this.headerGrad.addColorStop(1, app.Config.nodeBottom);
                _this.setModel(model);
                _this.labelCanvas = document.createElement('canvas');
                _this.labelCanvas.width = app.Config.frameWidth * 10;
                _this.labelCanvas.height = app.Config.nodeHeight;
                _this.labelCtx = _this.labelCanvas.getContext('2d');
                return _this;
            }
            //
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
                var firstFrame = Math.floor(left / frameWidth);
                var lastFrame = Math.ceil(right / frameWidth);
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                this.drawHeader();
                ctx.beginPath();
                ctx.rect(0, nodeHeight, this.width, this.height - nodeHeight);
                ctx.clip();
                ctx.translate(-this.scrollX, -this.scrollY + nodeHeight);
                var labelCtx = this.labelCtx;
                labelCtx.font = this.labelFontSize + " " + app.Config.font;
                labelCtx.fillStyle = app.Config.text;
                labelCtx.textAlign = 'left';
                labelCtx.textBaseline = 'middle';
                var y = 0;
                for (var _i = 0, _a = this.trackList; _i < _a.length; _i++) {
                    var track = _a[_i];
                    var keyframeColour = this.mode != EditMode.EDIT ? track.keyframeColour : track.keyframeDisabledColour;
                    var keyframeBorderColour = this.mode != EditMode.EDIT ? track.keyframeBorderColour : track.keyframeDisabledBorderColour;
                    if (y <= bottom && y + nodeHeight >= top) {
                        ctx.fillStyle = app.Config.node;
                        ctx.fillRect(this.scrollX, y, this.width, nodeHeight);
                        ctx.fillStyle = app.Config.nodeBorder;
                        ctx.fillRect(this.scrollX, y + nodeHeight - 1, this.width, 1);
                        var lastKeyframe = -1;
                        var onScreenFrameCount = 0;
                        var selectedFrame = this.selectedTrack == track ? this.selectedFrame : -1;
                        var dragFrame = this.dragKeyframeTrack == track ? this.dragKeyframeIndex : -1;
                        var dropTargetFrame = this.dragKeyframeTargetTrack == track ? this.dragKeyframeTargetIndex : -1;
                        // Draw the background (selection and borders)
                        for (var j = firstFrame, x = firstFrame * frameWidth; j < lastFrame; j++) {
                            if (j == selectedFrame || j == dropTargetFrame) {
                                ctx.fillStyle = this.selectedFrameColour;
                                ctx.fillRect(x, y, frameWidth - 1, nodeHeight - 1);
                                if (j == dragFrame) {
                                    ctx.fillStyle = track.keyframeBorderColour;
                                    ctx.fillRect(x, y, 1, nodeHeight - 1);
                                    ctx.fillRect(x + frameWidth - 2, y, 1, nodeHeight - 1);
                                    ctx.fillRect(x + 1, y, frameWidth - 3, 1);
                                    ctx.fillRect(x + 1, y + nodeHeight - 2, frameWidth - 3, 1);
                                }
                            }
                            if (j < animationLength) {
                                ctx.fillStyle = app.Config.nodeBorder;
                                ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);
                            }
                            x += frameWidth;
                        }
                        // Draw keyframes
                        var labels = [];
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
                                    if (labels.length) {
                                        var label_1 = labels[labels.length - 1];
                                        if (label_1.x + label_1.width > x)
                                            label_1.width = x - label_1.x - 1;
                                    }
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
                                    if (track.keyLabelProperty && (keyframe = track.getKeyFrame(j, track.keyLabelProperty))) {
                                        var label_2 = String(keyframe[track.keyLabelField]);
                                        var labelWidth = labelCtx.measureText(label_2).width;
                                        labels.push({
                                            x: x + frameWidth + 4,
                                            text: label_2,
                                            width: labelWidth
                                        });
                                    }
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
                                this.animation.getClosestKeyframes(j, tmp, track);
                                if (tmp.prev && tmp.next) {
                                    prev = tmp.prev;
                                    next = tmp.next;
                                    arrowCount++;
                                }
                            }
                            // Draw keyframe connection arrows
                            if (track.tweenable) {
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
                            }
                            x += frameWidth;
                        }
                        // Draw keyframe labels
                        if (labels.length) {
                            for (var _b = 0, labels_1 = labels; _b < labels_1.length; _b++) {
                                var label = labels_1[_b];
                                if (label.width < frameWidth - 5)
                                    continue;
                                labelCtx.clearRect(0, 0, this.labelCanvas.width, this.labelCanvas.height);
                                labelCtx.fillText(label.text, 0, frameCY);
                                var sw = Math.min(label.width, this.labelCanvas.width);
                                ctx.drawImage(this.labelCanvas, 0, 0, sw, nodeHeight, label.x, y, sw, nodeHeight);
                            }
                        }
                    } // End if
                    y += nodeHeight;
                }
                var currentFrameX = currentFrame * frameWidth;
                if (this.mode != EditMode.EDIT && currentFrameX <= right && currentFrameX + frameWidth >= left) {
                    ctx.fillStyle = this.scrubColour;
                    ctx.fillRect(currentFrameX + frameWidth * 0.5 - 1, top, 2, bottom - top);
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
            //
            TimelineViewport.prototype.focus = function () {
                this.$canvas.focus();
            };
            TimelineViewport.prototype.getMode = function () {
                return this.mode;
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
            TimelineViewport.prototype.reset = function () {
                this.scrollX = this.animation.scrollX = 0;
                this.scrollY = 0;
                this.requiresUpdate = true;
            };
            TimelineViewport.prototype.setModel = function (model) {
                this.model = model;
                this.mode = model.mode;
                this.animation = model.getActiveAnimation();
                this.updateTrackList();
                model.setAnimationListeners(this.onAnimationChange);
                model.animationChange.on(this.onModelAnimationChange);
                model.modeChange.on(this.onModelModeChange);
                model.selectionChange.on(this.onModelSelectionChange);
                this.currentFrame = this.animation.getPosition();
                this.toolbar.setModel(model);
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
            //
            TimelineViewport.prototype.getFrameIndexAt = function (x) {
                return Math.floor((x + this.scrollX) / app.Config.frameWidth);
            };
            TimelineViewport.prototype.getNodeAt = function (y) {
                var i = Math.floor((y + this.scrollY) / app.Config.nodeHeight);
                return i < 0 || i >= this.trackList.length ? null : this.trackList[i];
            };
            TimelineViewport.prototype.scrollIntoView = function (track, frame) {
                if (track === void 0) { track = null; }
                if (frame === void 0) { frame = NaN; }
                if (track) {
                    var trackY = this.trackList.indexOf(track) * app.Config.nodeHeight;
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
                        this.scrollX = this.animation.scrollX = Math.floor(Math.max(0, frameX - this.width + app.Config.frameWidth));
                    }
                    else if (frameX < this.scrollX) {
                        this.scrollX = this.animation.scrollX = Math.floor(Math.max(0, frameX));
                    }
                }
                this.requiresUpdate = true;
            };
            TimelineViewport.prototype.setFrame = function (frame) {
                if (this.currentFrame == frame)
                    return;
                this.animation.setPosition(frame);
                this.currentFrame = this.animation.getPosition();
                this.toolbar.updateFrameLabel();
                this.scrollIntoView(null, this.currentFrame);
            };
            TimelineViewport.prototype.setSelectedFrame = function (track, frameIndex, toggle) {
                if (frameIndex === void 0) { frameIndex = -1; }
                if (toggle === void 0) { toggle = false; }
                if (frameIndex < 0)
                    track = null;
                if (track == this.selectedTrack && frameIndex == this.selectedFrame) {
                    if (toggle && track) {
                        this.selectedTrack = null;
                        this.selectedFrame = -1;
                    }
                    return false;
                }
                this.selectedTrack = track;
                this.selectedFrame = track ? frameIndex : -1;
                return true;
            };
            TimelineViewport.prototype.showEventPrompt = function (track, frame) {
                if (!this.eventPrompt) {
                    this.eventPrompt = new PromptDlg('Event Name', {
                        target: this.$container,
                        position: { x: 'center', y: 'bottom' },
                        pointer: true,
                        pointTo: 'bottom',
                        buttons: [
                            { label: 'Accept', confirm: true },
                            { label: 'Cancel', cancel: true }
                        ],
                        confirm: this.onEventConfirm,
                        close: this.onEventDlgClose
                    });
                }
                var key = track.getKeyFrame(frame);
                this.eventEditTrack = track;
                this.eventEditFrame = frame;
                var offset = this.eventPrompt.dialog.options.offset;
                offset.x = frame * app.Config.frameWidth - this.scrollX + app.Config.frameWidth * 0.5 - this.width * 0.5;
                offset.y = app.Config.nodeHeight + this.trackList.indexOf(track) * app.Config.nodeHeight - this.scrollY - this.height;
                this.eventPrompt.show(key ? key.value : '');
            };
            TimelineViewport.prototype.stopKeyframeDrag = function (move, cancel) {
                if (move === void 0) { move = false; }
                if (cancel === void 0) { cancel = true; }
                if (this.dragKeyframeTrack) {
                    if (!cancel && this.dragKeyframeTargetTrack && (this.dragKeyframeTrack != this.dragKeyframeTargetTrack || this.dragKeyframeIndex != this.dragKeyframeTargetIndex)) {
                        var frameData = {};
                        this.animation.copyKeyframes(frameData, this.dragKeyframeTrack, false, move, this.dragKeyframeIndex);
                        this.animation.pasteKeyframes(frameData, this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);
                        this.setSelectedFrame(this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);
                    }
                    this.dragKeyframeTrack = null;
                    this.dragKeyframeIndex = -1;
                    this.dragKeyframeInitiated = false;
                    this.dragKeyframeTargetTrack = null;
                    this.dragKeyframeTargetIndex = -1;
                }
            };
            TimelineViewport.prototype.updateTrackList = function () {
                this.trackList = [];
                var nodeList = this.model.getNodeList(true);
                for (var _i = 0, nodeList_1 = nodeList; _i < nodeList_1.length; _i++) {
                    var node = nodeList_1[_i];
                    this.trackList.push(this.animation.tracks[node.id]);
                }
            };
            //
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
                        if (this.dragKeyframeTargetTrack) {
                            this.stopKeyframeDrag();
                        }
                    }
                }
            };
            TimelineViewport.prototype.commonKey = function (event) {
                var keyCode = event.keyCode;
                var ctrlKey = event.ctrlKey;
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
                    // Keyframes
                    else if (!ctrlKey && keyCode == Key.X) {
                        this.animation.deleteKeyframe(shiftKey ? null : this.model.getSelectedNode());
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
                        if (this.selectedTrack && this.selectedTrack.getKeyFrame(this.selectedFrame)) {
                            this.dragKeyframeTrack = this.selectedTrack;
                            this.dragKeyframeIndex = this.selectedFrame;
                        }
                    }
                }
            };
            TimelineViewport.prototype.onMouseUp = function (event) {
                this.dragFrameIndicator = false;
                if (this.dragView) {
                    this.dragView = false;
                    this.animation.scrollX = this.scrollX;
                }
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
                else if (this.dragKeyframeTrack) {
                    this.deselectKeyframe = false;
                    if (!this.dragKeyframeInitiated) {
                        var node = this.getNodeAt(this.mouseY - app.Config.nodeHeight);
                        var frame = this.getFrameIndexAt(this.mouseX);
                        if (node && frame >= 0) {
                            this.dragKeyframeInitiated = true;
                        }
                    }
                    if (this.dragKeyframeInitiated) {
                        this.dragKeyframeTargetTrack = this.getNodeAt(this.mouseY - app.Config.nodeHeight);
                        this.dragKeyframeTargetIndex = this.dragKeyframeTargetTrack ? this.getFrameIndexAt(this.mouseX) : -1;
                        this.scrollIntoView(this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);
                    }
                }
            };
            return TimelineViewport;
        }(app.Canvas));
        timeline.TimelineViewport = TimelineViewport;
    })(timeline = app.timeline || (app.timeline = {}));
})(app || (app = {}));
//# sourceMappingURL=TimelineViewport.js.map