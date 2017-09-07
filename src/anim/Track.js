var app;
(function (app) {
    var anim;
    (function (anim) {
        var Track = (function () {
            function Track(animation, node) {
                this.properties = {};
                this.length = 1;
                this.animation = animation;
                this.node = node;
                this.properties['offset'] = new TrackProperty(this, TrackPropertyType.VECTOR);
                this.properties['rotation'] = new TrackProperty(this, TrackPropertyType.ANGLE);
            }
            Track.prototype.forceKeyframe = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    if (property.type == TrackPropertyType.VECTOR) {
                        property.setVector(this.node[propertyName + 'X'], this.node[propertyName + 'Y']);
                    }
                    else if (property.type == TrackPropertyType.NUMBER || property.type == TrackPropertyType.ANGLE) {
                        property.setNumber(this.node[propertyName]);
                    }
                }
            };
            Track.prototype.gotoNextFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoNextFrame();
                    property.updateNode(this.node, propertyName);
                }
            };
            Track.prototype.gotoPrevFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoPrevFrame();
                    property.updateNode(this.node, propertyName);
                }
            };
            Track.prototype.onNodePropertyChange = function (node, propertyName) {
                var property = this.properties[propertyName];
                if (property) {
                    property.updateFrame(node, propertyName);
                }
            };
            Track.prototype.extendLength = function (newLength) {
                if (newLength > this.length) {
                    this.length = newLength;
                    this.animation.extendLength(newLength);
                }
            };
            return Track;
        }());
        anim.Track = Track;
        var TrackProperty = (function () {
            function TrackProperty(track, type) {
                this.frameIndex = 0;
                this.frames = null;
                this.length = 1;
                this.current = null;
                this.prev = null;
                this.next = null;
                this.track = track;
                this.type = type;
            }
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
            TrackProperty.prototype.setNumber = function (value) {
                if (this.current) {
                    this.current.value = value;
                    return;
                }
                this.insert(new anim.NumberKeyframe(this.frameIndex, value));
            };
            TrackProperty.prototype.setVector = function (x, y) {
                if (this.current) {
                    this.current.x = x;
                    this.current.y = y;
                    return;
                }
                this.insert(new anim.VectorKeyframe(this.frameIndex, x, y));
            };
            TrackProperty.prototype.updateFrame = function (node, propertyName) {
                if (this.type == TrackPropertyType.VECTOR) {
                    if (this.current) {
                        this.current.x = node[propertyName + 'X'];
                        this.current.y = node[propertyName + 'Y'];
                    }
                    else {
                        this.insert(new anim.VectorKeyframe(this.frameIndex, node[propertyName + 'X'], node[propertyName + 'Y']));
                    }
                }
                else if (this.type == TrackPropertyType.NUMBER || this.type == TrackPropertyType.ANGLE) {
                    if (this.current) {
                        this.current.value = node[propertyName];
                    }
                    else {
                        this.insert(new anim.NumberKeyframe(this.frameIndex, node[propertyName]));
                    }
                }
            };
            TrackProperty.prototype.updateNode = function (node, propertyName) {
                var type = this.type;
                if (this.type == TrackPropertyType.VECTOR) {
                    var x;
                    var y;
                    var prev = this.prev;
                    var next = this.next;
                    var current = this.current;
                    if (current) {
                        x = this.current.x;
                        y = this.current.y;
                    }
                    else if (prev && next) {
                        var t = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);
                        x = prev.x + (next.x - prev.x) * t;
                        y = prev.y + (next.y - prev.y) * t;
                    }
                    else if (prev) {
                        x = prev.x;
                        y = prev.y;
                    }
                    else if (next) {
                        x = next.x;
                        y = next.y;
                    }
                    node[propertyName + 'X'] = x;
                    node[propertyName + 'Y'] = y;
                }
                else if (this.type == TrackPropertyType.NUMBER || this.type == TrackPropertyType.ANGLE) {
                    var value;
                    var prev = this.prev;
                    var next = this.next;
                    var current = this.current;
                    if (current) {
                        value = current.value;
                    }
                    else if (prev && next) {
                        var t = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);
                        var delta = (next.value - prev.value);
                        if (this.type == TrackPropertyType.ANGLE) {
                            // delta += (delta > Math.PI) ? -Math.PI * 2 : (delta < -Math.PI) ? Math.PI * 2 : 0;
                            delta = Math.normalizeAngle(delta);
                        }
                        value = prev.value + delta * t;
                    }
                    else if (prev) {
                        value = prev.value;
                    }
                    else if (next) {
                        value = next.value;
                    }
                    node[propertyName] = value;
                }
            };
            TrackProperty.prototype.insert = function (key) {
                if (!this.frames) {
                    this.frames = key;
                    if (this.frameIndex == key.frameIndex) {
                        this.current = key;
                    }
                }
                else {
                    if (this.next) {
                        if (this.next.prev == this.frames) {
                            this.frames = key;
                        }
                        this.next.prev = key;
                        key.next = this.next;
                    }
                    if (this.prev) {
                        this.prev.next = key;
                        key.prev = this.prev;
                    }
                    this.current = key;
                }
                if (key.frameIndex + 1 > this.length) {
                    this.length = key.frameIndex + 1;
                    this.track.extendLength(this.length);
                }
            };
            return TrackProperty;
        }());
        anim.TrackProperty = TrackProperty;
        var TrackPropertyType;
        (function (TrackPropertyType) {
            TrackPropertyType[TrackPropertyType["NUMBER"] = 0] = "NUMBER";
            TrackPropertyType[TrackPropertyType["ANGLE"] = 1] = "ANGLE";
            TrackPropertyType[TrackPropertyType["VECTOR"] = 2] = "VECTOR";
        })(TrackPropertyType = anim.TrackPropertyType || (anim.TrackPropertyType = {}));
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Track.js.map