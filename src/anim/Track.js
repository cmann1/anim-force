var app;
(function (app) {
    var anim;
    (function (anim) {
        var Interpolation;
        (function (Interpolation) {
            Interpolation[Interpolation["LINEAR"] = 0] = "LINEAR";
            Interpolation[Interpolation["COSINE"] = 1] = "COSINE";
        })(Interpolation = anim.Interpolation || (anim.Interpolation = {}));
        var KEYFRAME_DATA = {
            prev: null,
            current: null,
            next: null,
        };
        var TrackProperty = app.anim.TrackProperty;
        var Track = /** @class */ (function () {
            function Track(type, animation, node) {
                this.type = null;
                this.properties = {};
                this.bulkKeyframeOperations = true;
                this.tweenable = true;
                this.keyLabelProperty = null;
                this.keyLabelField = null;
                this.length = 1;
                this.interpolation = Interpolation.LINEAR;
                this.keyframeColour = '#f9e26f';
                this.keyframeBorderColour = '#d4b82d';
                this.keyframeDisabledColour = '#fff4be';
                this.keyframeDisabledBorderColour = '#dacd8f';
                this.type = type;
                this.animation = animation;
                this.node = node;
            }
            Track.prototype.addProperty = function (propertyName, type) {
                this.properties[propertyName] = TrackProperty.create(this, propertyName, type);
            };
            Track.prototype.forceKeyframe = function (frameIndex, copyFrom) {
                if (frameIndex === void 0) { frameIndex = -1; }
                if (copyFrom === void 0) { copyFrom = null; }
                for (var propertyName in this.properties) {
                    this.properties[propertyName].updateFrame(this.node, frameIndex, true, copyFrom ? copyFrom.properties[propertyName] : null);
                }
            };
            Track.prototype.updateKeyframe = function (frameIndex) {
                if (frameIndex === void 0) { frameIndex = -1; }
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.updateFrame(this.node, frameIndex, false);
                    property.updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.gotoPrevFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoPrevFrame();
                    property.updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.gotoNextFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoNextFrame();
                    property.updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.getKeyFrame = function (frameIndex, from) {
                if (from === void 0) { from = null; }
                for (var propertyName in this.properties) {
                    var property = this.properties[from || propertyName];
                    if (frameIndex < property.length && property.frameList[frameIndex]) {
                        return property.frameList[frameIndex];
                    }
                    if (from)
                        return null;
                }
                return null;
            };
            Track.prototype.getClosestKeyframes = function (frameIndex, out) {
                for (var propertyName in this.properties) {
                    this.properties[propertyName].getKeyFrameAt(frameIndex, KEYFRAME_DATA);
                    if (KEYFRAME_DATA.prev && (!out.prev || KEYFRAME_DATA.prev.frameIndex > out.prev.frameIndex)) {
                        out.prev = KEYFRAME_DATA.prev;
                    }
                    if (KEYFRAME_DATA.next && (!out.next || KEYFRAME_DATA.next.frameIndex < out.next.frameIndex)) {
                        out.next = KEYFRAME_DATA.next;
                    }
                }
            };
            Track.prototype.getPrevKeyframe = function () {
                var prev = null;
                for (var propertyName in this.properties) {
                    var key = this.properties[propertyName].prev;
                    if (key && (!prev || key.frameIndex > prev.frameIndex)) {
                        prev = key;
                    }
                }
                return prev;
            };
            Track.prototype.getNextKeyframe = function () {
                var next = null;
                for (var propertyName in this.properties) {
                    var key = this.properties[propertyName].next;
                    if (key && (!next || key.frameIndex < next.frameIndex)) {
                        next = key;
                    }
                }
                return next;
            };
            Track.prototype.deleteKeyframe = function (frameIndex) {
                if (frameIndex === void 0) { frameIndex = -1; }
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.deleteKeyframe(frameIndex);
                    property.updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.copyKeyframes = function (frameData, forceAll, cut, frameIndex) {
                if (forceAll === void 0) { forceAll = false; }
                if (cut === void 0) { cut = false; }
                if (frameIndex === void 0) { frameIndex = -1; }
                var frameCount = 0;
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    if (property.copy(frameData, forceAll, frameIndex)) {
                        frameCount++;
                    }
                    if (cut && property.deleteKeyframe(frameIndex)) {
                        property.updateNode(this.node, this.interpolation);
                    }
                }
                return frameCount;
            };
            Track.prototype.pasteKeyframes = function (frameData, frameIndex) {
                for (var propertyName in frameData) {
                    if (!frameData.hasOwnProperty(propertyName))
                        continue;
                    var property = this.properties[propertyName];
                    if (property) {
                        property.updateFrame(frameData[propertyName], frameIndex);
                        property.updateNode(this.node, this.interpolation);
                    }
                }
            };
            Track.prototype.setPosition = function (frameIndex) {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.setPosition(frameIndex);
                    property.updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.updateNode = function () {
                for (var propertyName in this.properties) {
                    this.properties[propertyName].updateNode(this.node, this.interpolation);
                }
            };
            Track.prototype.onNodePropertyChange = function (node, propertyName) {
                if (!this.properties[propertyName])
                    return false;
                for (var propertyName in this.properties) {
                    this.properties[propertyName].updateFrame(this.node);
                }
                return true;
            };
            Track.prototype.extendLength = function (newLength) {
                if (newLength > this.length) {
                    this.length = newLength;
                    this.animation.extendLength(newLength);
                }
            };
            Track.prototype.trimLength = function () {
                var newLength = 1;
                for (var propertyName in this.properties) {
                    newLength = Math.max(newLength, this.properties[propertyName].trimLength());
                }
                return this.length = newLength;
            };
            //
            Track.prototype.copyFrom = function (track) {
                this.length = track.length;
                this.interpolation = track.interpolation;
                for (var propertyName in track.properties) {
                    this.properties[propertyName].copyFrom(track.properties[propertyName]);
                }
            };
            Track.prototype.save = function () {
                var data = {
                    type: this.type,
                    nodeId: this.node.id,
                    length: this.length,
                    interpolation: this.interpolation,
                    properties: {}
                };
                for (var propertyName in this.properties) {
                    data.properties[propertyName] = this.properties[propertyName].save();
                }
                return data;
            };
            Track.prototype.load = function (data) {
                var type = data.get('type');
                var nodeId = data.get('nodeId');
                if (type != this.type) {
                    throw new Error('Mismatched animation track type');
                }
                if (nodeId != this.node.id) {
                    throw new Error('Mismatched animation track id');
                }
                // Properties are auto inserting keyframe when loading
                this.length = data.get('length');
                this.interpolation = data.get('interpolation');
                var properties = data.get('properties');
                for (var propertyName in properties) {
                    if (!properties.hasOwnProperty(propertyName))
                        continue;
                    var property = this.properties[propertyName];
                    if (!property) {
                        throw new Error('Invalid animation property');
                    }
                    property.load(data.asLoadData(properties[propertyName]));
                }
                return this;
            };
            return Track;
        }());
        anim.Track = Track;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Track.js.map