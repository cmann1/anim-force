var app;
(function (app) {
    var anim;
    (function (anim) {
        var ContainerNode = app.model.ContainerNode;
        var Bone = app.model.Bone;
        var Sprite = app.model.Sprite;
        var EventDispatcher = app.events.EventDispatcher;
        var Event = app.events.Event;
        var Animation = (function () {
            function Animation(name, model) {
                var _this = this;
                this.tracks = {};
                this.active = false;
                this.fps = 30;
                this.loop = true;
                this.accumulatedTime = 0;
                this.frameIndex = 0;
                this.length = 1;
                this.suppressEvents = false;
                /// Events
                this.change = new EventDispatcher();
                /*
                 * Events
                 */
                this.onNodePropertyChange = function (node, event) {
                    if (!_this.active)
                        return;
                    var track = _this.tracks[node.id];
                    if (track) {
                        track.onNodePropertyChange(node, event.type);
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
                            _this.tracks[target.id] = _this.createTrack(target);
                        }
                        else {
                            track.updateKeyframe();
                        }
                    }
                    else if (type == 'removeChild') {
                        _this.removeNodeRecursive(target);
                    }
                };
                this.name = name;
                this.model = model;
                model.structureChange.on(this.onModelStructureChange);
            }
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
            Animation.prototype.createTrack = function (target) {
                var track = null;
                if (target instanceof Bone) {
                    track = new anim.BoneTrack(this, target);
                }
                if (target instanceof Sprite) {
                    track = new anim.SpriteTrack(this, target);
                }
                target.propertyChange.on(this.onNodePropertyChange);
                if (!track) {
                    console.error('Cannot create animation track for', target);
                }
                track.forceKeyframe();
                track.setPosition(this.frameIndex);
                return track;
            };
            Animation.prototype.clear = function () {
                this.frameIndex = 0;
                this.length = 1;
                this.fps = 30;
                this.tracks = {};
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
                    if (this.frameIndex >= this.length) {
                        this.setPosition(this.frameIndex - this.length);
                    }
                }
            };
            Animation.prototype.forceKeyframe = function (node, frameIndex) {
                if (node === void 0) { node = null; }
                if (frameIndex === void 0) { frameIndex = -1; }
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
                        this.tracks[trackId].forceKeyframe(frameIndex);
                    }
                }
                this.dispatchChange('keyframe');
            };
            Animation.prototype.gotoPrevFrame = function () {
                if (this.frameIndex <= 0)
                    return;
                this.frameIndex--;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].gotoPrevFrame();
                }
                this.dispatchChange('position');
            };
            Animation.prototype.gotoNextFrame = function () {
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
                var prev = this.getPrevKeyframe();
                if (prev) {
                    this.setPosition(prev.frameIndex);
                }
            };
            Animation.prototype.gotoNextKeyframe = function () {
                var next = this.getNextKeyframe();
                if (next) {
                    this.setPosition(next.frameIndex);
                }
            };
            Animation.prototype.setPosition = function (frameIndex) {
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
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                if (node) {
                    var track = this.tracks[node.id];
                    if (track) {
                        track.deleteKeyframe(frameIndex);
                    }
                }
                else {
                    for (var trackId in this.tracks) {
                        this.tracks[trackId].deleteKeyframe(frameIndex);
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
                if (node) {
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
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var frameCount = 0;
                for (var nodeId in frameData) {
                    if (!frameData.hasOwnProperty(nodeId))
                        continue;
                    var track = this.tracks[node ? node.id : nodeId];
                    if (track) {
                        track.pasteKeyframes(frameData[nodeId], frameIndex);
                        frameCount++;
                        if (node)
                            break;
                    }
                }
                if (frameCount) {
                    this.dispatchChange('paste');
                }
                return frameCount;
            };
            Animation.prototype.getLength = function () {
                return this.length;
            };
            Animation.prototype.extendLength = function (newLength) {
                if (newLength > this.length) {
                    this.length = newLength;
                    this.dispatchChange('length');
                }
            };
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