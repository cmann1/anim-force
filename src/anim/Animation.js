var app;
(function (app) {
    var anim;
    (function (anim) {
        var ContainerNode = app.model.ContainerNode;
        var Bone = app.model.Bone;
        var Sprite = app.model.Sprite;
        var EventDispatcher = app.events.EventDispatcher;
        var Event = app.events.Event;
        var EventNode = app.model.EventNode;
        var Animation = (function () {
            function Animation(name, model, readOnly, forceKeyframe) {
                if (readOnly === void 0) { readOnly = false; }
                if (forceKeyframe === void 0) { forceKeyframe = true; }
                var _this = this;
                this.active = false;
                this.fps = 30;
                this.loop = true;
                this.skipLastFrame = false;
                this.tracks = {};
                this.readOnly = false;
                this.accumulatedTime = 0;
                this.frameIndex = 0;
                this.length = 1;
                this.suppressEvents = false;
                // UI
                this.scrollX = 0;
                /// Events
                this.change = new EventDispatcher();
                /*
                 * Events
                 */
                this.onNodePropertyChange = function (node, event) {
                    if (!_this.active)
                        return;
                    var track = _this.tracks[node.id];
                    if (track && track.onNodePropertyChange(node, event.type)) {
                        _this.dispatchChange('keyframe');
                    }
                };
                this.onModelStructureChange = function (model, event) {
                    var type = event.type;
                    var target = event.target;
                    if (type == 'clear') {
                        _this.tracks = {};
                    }
                    else if (type == 'addChild') {
                        var track = _this.tracks[target.id];
                        if (!track) {
                            _this.initNodes([target]);
                        }
                        else if (_this.active) {
                            track.updateKeyframe();
                        }
                    }
                    else if (type == 'removeChild') {
                        _this.removeNodeRecursive(target);
                    }
                    _this.dispatchChange('updateTracks');
                };
                this.name = name;
                this.model = model;
                this.readOnly = readOnly;
                model.structureChange.on(this.onModelStructureChange);
                this.initTracksFromModel(forceKeyframe);
            }
            Animation.prototype.initTracksFromModel = function (forceKeyframe) {
                if (forceKeyframe === void 0) { forceKeyframe = true; }
                this.initNodes(this.model.children, this.model.getBindPose(), forceKeyframe);
            };
            Animation.prototype.initNodes = function (nodes, copyFrom, forceKeyframe) {
                if (copyFrom === void 0) { copyFrom = null; }
                if (forceKeyframe === void 0) { forceKeyframe = true; }
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    this.tracks[node.id] = this.createTrack(node, copyFrom ? copyFrom.tracks[node.id] : null, forceKeyframe);
                    if (node instanceof ContainerNode) {
                        this.initNodes(node.children, copyFrom, forceKeyframe);
                    }
                }
            };
            Animation.prototype.removeNodeRecursive = function (target) {
                var a = 0;
                var nodes = [target];
                while (a < nodes.length) {
                    var node = nodes[a++];
                    if (node instanceof ContainerNode) {
                        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                            var child = _a[_i];
                            nodes.push(child);
                        }
                    }
                    if (this.tracks[node.id]) {
                        delete this.tracks[node.id];
                        node.propertyChange.off(this.onNodePropertyChange);
                    }
                }
            };
            Animation.prototype.createTrack = function (target, copyFrom, forceKeyframe) {
                if (copyFrom === void 0) { copyFrom = null; }
                if (forceKeyframe === void 0) { forceKeyframe = true; }
                var track = null;
                if (target instanceof Bone) {
                    track = new anim.BoneTrack(this, target);
                }
                else if (target instanceof Sprite) {
                    track = new anim.SpriteTrack(this, target);
                }
                else if (target instanceof EventNode) {
                    track = new anim.EventTrack(this, target);
                }
                target.propertyChange.on(this.onNodePropertyChange);
                if (!track) {
                    console.error('Cannot create animation track for', target);
                }
                if (forceKeyframe && track.bulkKeyframeOperations) {
                    track.forceKeyframe(0, copyFrom);
                }
                track.setPosition(this.frameIndex);
                return track;
            };
            Animation.prototype.clear = function () {
                this.frameIndex = 0;
                this.length = 1;
                this.fps = 30;
                this.tracks = {};
                this.initTracksFromModel();
                this.dispatchChange('clear');
            };
            Animation.prototype.initForAnimation = function () {
                this.fpsStep = 1 / this.fps;
                this.accumulatedTime = 0;
            };
            Animation.prototype.animateStep = function (deltaTime) {
                this.accumulatedTime += deltaTime;
                while (this.accumulatedTime > this.fpsStep) {
                    this.gotoNextFrame();
                    this.accumulatedTime -= this.fpsStep;
                    if (this.frameIndex >= this.length - (this.skipLastFrame ? 1 : 0)) {
                        this.setPosition(this.frameIndex - this.length);
                    }
                }
            };
            Animation.prototype.forceKeyframe = function (node, frameIndex) {
                if (node === void 0) { node = null; }
                if (frameIndex === void 0) { frameIndex = -1; }
                if (this.readOnly)
                    return;
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                if (node) {
                    var track = this.tracks[node.id];
                    if (track) {
                        track.forceKeyframe(frameIndex);
                    }
                }
                else {
                    for (var trackId in this.tracks) {
                        var track = this.tracks[trackId];
                        if (track.bulkKeyframeOperations)
                            track.forceKeyframe(frameIndex);
                    }
                }
                this.dispatchChange('keyframe');
            };
            Animation.prototype.gotoPrevFrame = function () {
                if (this.readOnly)
                    return;
                if (this.frameIndex <= 0)
                    return;
                this.frameIndex--;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].gotoPrevFrame();
                }
                this.dispatchChange('position');
            };
            Animation.prototype.gotoNextFrame = function () {
                if (this.readOnly)
                    return;
                this.frameIndex++;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].gotoNextFrame();
                }
                this.dispatchChange('position');
            };
            Animation.prototype.getPrevKeyframe = function () {
                var prev = null;
                for (var trackId in this.tracks) {
                    var key = this.tracks[trackId].getPrevKeyframe();
                    if (key && (!prev || key.frameIndex > prev.frameIndex)) {
                        prev = key;
                    }
                }
                return prev;
            };
            Animation.prototype.getNextKeyframe = function () {
                var next = null;
                for (var trackId in this.tracks) {
                    var key = this.tracks[trackId].getNextKeyframe();
                    if (key && (!next || key.frameIndex < next.frameIndex)) {
                        next = key;
                    }
                }
                return next;
            };
            Animation.prototype.gotoPrevKeyframe = function () {
                if (this.readOnly)
                    return;
                var prev = this.getPrevKeyframe();
                if (prev) {
                    this.setPosition(prev.frameIndex);
                }
            };
            Animation.prototype.gotoNextKeyframe = function () {
                if (this.readOnly)
                    return;
                var next = this.getNextKeyframe();
                if (next) {
                    this.setPosition(next.frameIndex);
                }
            };
            Animation.prototype.updateNodes = function () {
                for (var trackId in this.tracks) {
                    this.tracks[trackId].updateNode();
                }
            };
            Animation.prototype.setPosition = function (frameIndex) {
                if (this.readOnly)
                    return;
                if (frameIndex < 0)
                    frameIndex = 0;
                if (frameIndex == this.frameIndex)
                    return;
                if (frameIndex == this.frameIndex + 1) {
                    this.gotoNextFrame();
                    return;
                }
                if (frameIndex == this.frameIndex - 1) {
                    this.gotoPrevFrame();
                    return;
                }
                this.frameIndex = frameIndex;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].setPosition(frameIndex);
                }
                this.dispatchChange('position');
            };
            Animation.prototype.getPosition = function () {
                return this.frameIndex;
            };
            Animation.prototype.deleteKeyframe = function (node, frameIndex) {
                if (node === void 0) { node = null; }
                if (frameIndex === void 0) { frameIndex = -1; }
                if (this.readOnly)
                    return;
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                if (node instanceof anim.Track) {
                    node.deleteKeyframe(frameIndex);
                }
                else if (node && node.id !== undefined) {
                    var track = this.tracks[node.id];
                    if (track) {
                        track.deleteKeyframe(frameIndex);
                    }
                }
                else {
                    for (var trackId in this.tracks) {
                        var track = this.tracks[trackId];
                        if (track.bulkKeyframeOperations)
                            track.deleteKeyframe(frameIndex);
                    }
                }
                this.dispatchChange('deleteKeyframe');
            };
            Animation.prototype.copyKeyframes = function (frameData, node, forceAll, cut, frameIndex) {
                if (node === void 0) { node = null; }
                if (forceAll === void 0) { forceAll = false; }
                if (cut === void 0) { cut = false; }
                if (frameIndex === void 0) { frameIndex = -1; }
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var frameCount = 0;
                var tracks;
                if (node instanceof anim.Track) {
                    tracks = {};
                    tracks[node.node.id] = node;
                }
                else if (node && node.id !== undefined) {
                    tracks = {};
                    var track = this.tracks[node.id];
                    if (track)
                        tracks[node.id] = track;
                }
                else {
                    tracks = this.tracks;
                }
                for (var trackId in tracks) {
                    var trackFrameData = {};
                    var copyCount = this.tracks[trackId].copyKeyframes(trackFrameData, forceAll, cut, frameIndex);
                    if (copyCount > 0) {
                        frameData[trackId] = trackFrameData;
                        frameCount++;
                    }
                }
                if (frameCount && cut) {
                    this.dispatchChange('cut');
                }
                return frameCount;
            };
            Animation.prototype.pasteKeyframes = function (frameData, node, frameIndex) {
                if (node === void 0) { node = null; }
                if (frameIndex === void 0) { frameIndex = -1; }
                if (this.readOnly)
                    return 0;
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var frameCount = 0;
                var intoTrack = node instanceof anim.Track ? node : null;
                var intoNode = !(node instanceof anim.Track) && node && node.id !== undefined ? node : null;
                for (var nodeId in frameData) {
                    if (!frameData.hasOwnProperty(nodeId))
                        continue;
                    var track = intoTrack ? intoTrack : this.tracks[intoNode ? intoNode.id : nodeId];
                    if (track) {
                        track.pasteKeyframes(frameData[nodeId], frameIndex);
                        frameCount++;
                        if (intoTrack || intoNode)
                            break;
                    }
                }
                if (frameCount) {
                    this.dispatchChange('paste');
                }
                return frameCount;
            };
            Animation.prototype.getClosestKeyframes = function (frameIndex, out, node) {
                if (node === void 0) { node = null; }
                if (node instanceof anim.Track) {
                    node.getClosestKeyframes(frameIndex, out);
                    return;
                }
                else if (node && node.id !== undefined) {
                    this.tracks[node.id].getClosestKeyframes(frameIndex, out);
                    return;
                }
                for (var trackId in this.tracks) {
                    this.tracks[trackId].getClosestKeyframes(frameIndex, out);
                }
            };
            Animation.prototype.getLength = function () {
                return this.length;
            };
            Animation.prototype.extendLength = function (newLength) {
                if (this.readOnly)
                    return;
                if (newLength > this.length) {
                    this.length = newLength;
                    this.dispatchChange('length');
                }
            };
            Animation.prototype.trimLength = function () {
                var newLength = 1;
                for (var trackId in this.tracks) {
                    newLength = Math.max(newLength, this.tracks[trackId].trimLength());
                }
                if (newLength != this.length) {
                    this.length = newLength;
                    this.dispatchChange('length');
                }
            };
            //
            Animation.prototype.save = function () {
                var data = {
                    name: this.name,
                    readOnly: this.readOnly,
                    fps: this.fps,
                    loop: this.loop,
                    skipLastFrame: this.skipLastFrame,
                    frameIndex: this.frameIndex,
                    length: this.length,
                    tracks: {},
                    scrollX: this.scrollX
                };
                for (var trackId in this.tracks) {
                    data.tracks[trackId] = this.tracks[trackId].save();
                }
                return data;
            };
            Animation.prototype.load = function (data) {
                this.name = data.get('name');
                this.readOnly = data.get('readOnly');
                this.fps = data.get('fps');
                this.loop = data.get('loop');
                this.skipLastFrame = data.get('skipLastFrame');
                this.frameIndex = data.get('frameIndex');
                this.length = data.get('length');
                this.scrollX = data.get('scrollX');
                var tracks = data.get('tracks');
                for (var trackId in tracks) {
                    if (!tracks.hasOwnProperty(trackId))
                        continue;
                    var node = this.model.getNode(trackId);
                    var track = this.tracks[trackId];
                    if (!node || !track) {
                        throw new Error('Invalid node id: ' + trackId);
                    }
                    node.propertyChange.on(this.onNodePropertyChange);
                    track.load(data.asLoadData(tracks[trackId]));
                }
                return this;
            };
            //
            Animation.prototype.dispatchChange = function (type) {
                if (!this.suppressEvents) {
                    this.change.dispatch(this, new Event(type));
                }
            };
            return Animation;
        }());
        anim.Animation = Animation;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Animation.js.map