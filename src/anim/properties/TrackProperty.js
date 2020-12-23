var app;
(function (app) {
    var anim;
    (function (anim) {
        var KEYFRAME_DATA = {
            prev: null,
            current: null,
            next: null,
        };
        var TrackPropertyType;
        (function (TrackPropertyType) {
            TrackPropertyType[TrackPropertyType["NUMBER"] = 0] = "NUMBER";
            TrackPropertyType[TrackPropertyType["ANGLE"] = 1] = "ANGLE";
            TrackPropertyType[TrackPropertyType["VECTOR"] = 2] = "VECTOR";
            TrackPropertyType[TrackPropertyType["STRING"] = 3] = "STRING";
        })(TrackPropertyType = anim.TrackPropertyType || (anim.TrackPropertyType = {}));
        var TrackProperty = /** @class */ (function () {
            function TrackProperty(track, propertyName, KeyFrameClass, type) {
                this.frameIndex = 0;
                this.frames = null;
                this.frameList = [];
                this.length = 1;
                this.current = null;
                this.prev = null;
                this.next = null;
                this.last = null;
                this.KeyFrameClass = KeyFrameClass;
                this.track = track;
                this.propertyName = propertyName;
                this.type = type;
            }
            TrackProperty.create = function (track, propertyName, type) {
                if (type == TrackPropertyType.NUMBER) {
                    return new anim.NumberProperty(track, propertyName);
                }
                if (type == TrackPropertyType.ANGLE) {
                    return new anim.AngleProperty(track, propertyName);
                }
                if (type == TrackPropertyType.VECTOR) {
                    return new anim.VectorProperty(track, propertyName);
                }
                if (type == TrackPropertyType.STRING) {
                    return new anim.StringProperty(track, propertyName);
                }
                throw new Error('Unknown track property type');
            };
            TrackProperty.prototype.gotoNextFrame = function () {
                this.frameIndex++;
                if (this.next && this.next.frameIndex == this.frameIndex) {
                    this.current = this.next;
                    this.next = this.current.next;
                    this.prev = this.current.prev;
                    return;
                }
                if (this.current) {
                    this.prev = this.current;
                    this.current = null;
                    return;
                }
            };
            TrackProperty.prototype.gotoPrevFrame = function () {
                if (this.frameIndex <= 0)
                    return;
                this.frameIndex--;
                if (this.prev && this.prev.frameIndex == this.frameIndex) {
                    this.current = this.prev;
                    this.prev = this.current.prev;
                    this.next = this.current.next;
                    return;
                }
                if (this.current) {
                    this.next = this.current;
                    this.current = null;
                    return;
                }
            };
            TrackProperty.prototype.setPosition = function (frameIndex) {
                if (frameIndex < 0)
                    frameIndex = 0;
                if (frameIndex == this.frameIndex)
                    return;
                var length = this.length;
                if (frameIndex >= length) {
                    this.prev = this.last;
                    this.current = null;
                    this.next = null;
                }
                else if (this.frameList[frameIndex]) {
                    this.current = this.frameList[frameIndex];
                    this.prev = this.current.prev;
                    this.next = this.current.next;
                }
                else if (this.frames) {
                    this.current = null;
                    this.prev = null;
                    this.next = null;
                    var groupCheckCount = 20;
                    var i1 = frameIndex - 1;
                    var i2 = frameIndex + 1;
                    while (i1 >= 0 || i2 < length) {
                        if (i1 >= 0) {
                            for (var iMin = Math.max(0, i1 - groupCheckCount); i1 >= iMin; i1--) {
                                var frame = this.frameList[i1];
                                if (frame) {
                                    this.prev = frame;
                                    this.next = frame.next;
                                    i1 = -1;
                                    i2 = length;
                                    break;
                                }
                            }
                        }
                        if (i2 < length) {
                            for (var iMax = Math.min(length - 1, i2 + groupCheckCount); i2 <= iMax; i2++) {
                                var frame = this.frameList[i2];
                                if (frame) {
                                    this.next = frame;
                                    this.prev = frame.prev;
                                    i1 = -1;
                                    i2 = length;
                                    break;
                                }
                            }
                        }
                    }
                }
                this.frameIndex = frameIndex;
            };
            TrackProperty.prototype.deleteKeyframe = function (frameIndex) {
                if (frameIndex === void 0) { frameIndex = -1; }
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var key = this.frameList[frameIndex];
                if (!key)
                    return false;
                if (key == this.next)
                    this.next = key.next;
                if (key == this.prev)
                    this.prev = key.prev;
                if (key == this.current)
                    this.current = null;
                if (key == this.last)
                    this.last = this.last.prev;
                if (key.prev)
                    key.prev.next = key.next;
                if (key.next)
                    key.next.prev = key.prev;
                this.frameList[frameIndex] = null;
                if (this.frames == key)
                    this.frames = null;
                return true;
            };
            TrackProperty.prototype.trimLength = function () {
                this.length = this.last ? this.last.frameIndex + 1 : 1;
                return this.length;
            };
            TrackProperty.prototype.copy = function (frameData, forceAll, frameIndex) {
                if (forceAll === void 0) { forceAll = false; }
                if (frameIndex === void 0) { frameIndex = -1; }
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var frame = this.frameList[frameIndex];
                if (frame) {
                    this.updateNode(frameData[this.propertyName] = {}, this.track.interpolation, frame.prev, frame, frame.next);
                    return true;
                }
                else if (forceAll) {
                    this.getKeyFrameAt(frameIndex, KEYFRAME_DATA);
                    this.updateNode(frameData[this.propertyName] = {}, this.track.interpolation, KEYFRAME_DATA.prev, KEYFRAME_DATA.current, KEYFRAME_DATA.next);
                    return true;
                }
                return false;
            };
            TrackProperty.prototype.updateFrame = function (node, frameIndex, createKeyframe, copyFrom) {
                if (frameIndex === void 0) { frameIndex = -1; }
                if (createKeyframe === void 0) { createKeyframe = true; }
                if (copyFrom === void 0) { copyFrom = null; }
                if (frameIndex < 0)
                    frameIndex = this.frameIndex;
                var frame = this.frameList[frameIndex];
                var copyFrame = copyFrom ? copyFrom.frameList[frameIndex] : null;
                if (!frame && createKeyframe) {
                    this.insert(frame = new this.KeyFrameClass(frameIndex));
                }
                if (frame) {
                    frame.set(this.propertyName, node, copyFrame);
                }
            };
            TrackProperty.prototype.updateNode = function (node, interpolation, prev, current, next) {
                if (prev === void 0) { prev = this.prev; }
                if (current === void 0) { current = this.current; }
                if (next === void 0) { next = this.next; }
                throw new Error('TrackProperty.update not implemented');
            };
            TrackProperty.prototype.getKeyFrameAt = function (frameIndex, out) {
                var current = null;
                var prev = null;
                var next = null;
                if (this.frameList[frameIndex]) {
                    current = this.frameList[frameIndex];
                    prev = out.current.prev;
                    next = out.current.next;
                }
                else {
                    if (this.frames && frameIndex < this.frames.frameIndex) {
                        next = this.frames;
                    }
                    else if (this.last && frameIndex > this.last.frameIndex) {
                        prev = this.last;
                    }
                    else {
                        for (var i = frameIndex - 1; i >= 0; i--) {
                            if (prev = this.frameList[i])
                                break;
                        }
                        if (!prev) {
                            for (var i = frameIndex + 1; i < this.length; i++) {
                                if (next = this.frameList[i])
                                    break;
                            }
                        }
                        else {
                            next = prev.next;
                        }
                    }
                }
                out.current = current;
                out.prev = prev;
                out.next = next;
                return out;
            };
            //
            TrackProperty.prototype.copyFrom = function (property) {
                var frame = property.frames;
                var prev = null;
                this.frames = null;
                this.frameList = [];
                while (frame) {
                    var frameIndex = frame.frameIndex;
                    var newFrame = new this.KeyFrameClass(frameIndex);
                    newFrame.set(null, null, frame);
                    this.frameList[frameIndex] = newFrame;
                    if (!this.frames)
                        this.frames = newFrame;
                    newFrame.prev = prev;
                    if (prev)
                        prev.next = newFrame;
                    prev = newFrame;
                    this.last = newFrame;
                    frame = frame.next;
                }
                this.frameIndex = property.frameIndex;
                this.length = property.length;
                this.current = property.current ? this.frameList[property.current.frameIndex] : null;
                this.prev = property.prev ? this.frameList[property.prev.frameIndex] : null;
                this.next = property.next ? this.frameList[property.next.frameIndex] : null;
            };
            TrackProperty.prototype.save = function () {
                var data = {
                    type: this.type,
                    frameIndex: this.frameIndex,
                    length: this.length,
                    frames: [],
                    current: this.current ? this.current.frameIndex : -1,
                    prev: this.prev ? this.prev.frameIndex : -1,
                    next: this.next ? this.next.frameIndex : -1
                };
                var frame = this.frames;
                while (frame) {
                    data.frames.push(frame.save());
                    frame = frame.next;
                }
                return data;
            };
            TrackProperty.prototype.load = function (data) {
                if (data.get('type') != this.type) {
                    throw new Error('Invalid animation property data');
                }
                this.frameIndex = data.get('frameIndex');
                this.length = data.get('length');
                var frames = data.get('frames');
                var prevKey = null;
                for (var _i = 0, frames_1 = frames; _i < frames_1.length; _i++) {
                    var frameData = frames_1[_i];
                    frameData = data.asLoadData(frameData);
                    var frameIndex = frameData.get('frameIndex');
                    var key = new this.KeyFrameClass(frameIndex);
                    key.load(frameData);
                    this.frameList[frameIndex] = key;
                    if (!this.frames) {
                        this.frames = key;
                    }
                    if (prevKey) {
                        prevKey.next = key;
                        key.prev = prevKey;
                    }
                    prevKey = key;
                }
                this.last = prevKey;
                var current = data.get('current');
                var prev = data.get('prev');
                var next = data.get('next');
                if (current != -1) {
                    // if(!this.frameList[current])
                    // 	throw new Error(`Invalid frame index (current:${current}) id[${this.track.node.id}.${this.propertyName}]`);
                    this.current = this.frameList[current];
                }
                if (prev != -1) {
                    // if(!this.frameList[prev])
                    // 	throw new Error(`Invalid frame index (prev:${prev}) id[${this.track.node.id}.${this.propertyName}]`);
                    this.prev = this.frameList[prev];
                }
                if (next != -1) {
                    // if(!this.frameList[next])
                    // 	throw new Error(`Invalid frame index (next:${next}) id[${this.track.node.id}.${this.propertyName}]`);
                    this.next = this.frameList[next];
                }
                return this;
            };
            //
            TrackProperty.prototype.insert = function (key) {
                var frameIndex = key.frameIndex;
                if (this.frameList[frameIndex])
                    return;
                this.getKeyFrameAt(frameIndex, KEYFRAME_DATA);
                var prev = KEYFRAME_DATA.prev;
                var next = KEYFRAME_DATA.next;
                if (prev) {
                    key.prev = prev;
                    prev.next = key;
                }
                if (next) {
                    key.next = next;
                    next.prev = key;
                }
                if (!key.prev) {
                    this.frames = key;
                }
                if (!key.next) {
                    this.last = key;
                }
                if (frameIndex == this.frameIndex) {
                    this.current = key;
                    this.prev = key.prev;
                    this.next = key.next;
                }
                else {
                    if (prev == this.prev && (next == this.current || next == this.next) ||
                        next == this.next && (prev == this.current || prev == this.prev)) {
                        if (key.frameIndex > this.frameIndex)
                            this.next = key;
                        else
                            this.prev = key;
                    }
                }
                if (frameIndex >= this.length) {
                    this.length = key.frameIndex + 1;
                    this.track.extendLength(this.length);
                }
                this.frameList[frameIndex] = key;
            };
            TrackProperty.prototype.getT = function (interpolation, prev, next) {
                var t = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);
                if (interpolation == anim.Interpolation.COSINE) {
                    return (1 - Math.cos(t * Math.PI)) / 2;
                }
                return t;
            };
            return TrackProperty;
        }());
        anim.TrackProperty = TrackProperty;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=TrackProperty.js.map