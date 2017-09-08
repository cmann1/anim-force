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
                this.addProperty('offset', TrackPropertyType.VECTOR);
                this.addProperty('rotation', TrackPropertyType.ANGLE);
            }
            Track.prototype.addProperty = function (propertyName, type) {
                this.properties[propertyName] = new TrackProperty(this, propertyName, type);
            };
            Track.prototype.forceKeyframe = function () {
                for (var propertyName in this.properties) {
                    this.properties[propertyName].updateFrame(this.node);
                }
            };
            Track.prototype.gotoNextFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoNextFrame();
                    property.updateNode(this.node);
                }
            };
            Track.prototype.gotoPrevFrame = function () {
                for (var propertyName in this.properties) {
                    var property = this.properties[propertyName];
                    property.gotoPrevFrame();
                    property.updateNode(this.node);
                }
            };
            Track.prototype.onNodePropertyChange = function (node, propertyName) {
                // const property:TrackProperty = this.properties[propertyName];
                //
                // if(property)
                // {
                // 	property.updateFrame(node);
                // }
                for (var propertyName in this.properties) {
                    this.properties[propertyName].updateFrame(this.node);
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
            function TrackProperty(track, propertyName, type) {
                this.frameIndex = 0;
                this.frames = null;
                this.length = 1;
                this.current = null;
                this.prev = null;
                this.next = null;
                this.track = track;
                this.propertyName = propertyName;
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
            TrackProperty.prototype.updateFrame = function (node) {
                if (this.type == TrackPropertyType.VECTOR) {
                    if (this.current) {
                        this.current.x = node[this.propertyName + 'X'];
                        this.current.y = node[this.propertyName + 'Y'];
                    }
                    else {
                        this.insert(new anim.VectorKeyframe(this.frameIndex, node[this.propertyName + 'X'], node[this.propertyName + 'Y']));
                    }
                }
                else if (this.type == TrackPropertyType.NUMBER || this.type == TrackPropertyType.ANGLE) {
                    if (this.current) {
                        this.current.value = node[this.propertyName];
                    }
                    else {
                        this.insert(new anim.NumberKeyframe(this.frameIndex, node[this.propertyName]));
                    }
                }
            };
            TrackProperty.prototype.updateNode = function (node) {
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
                    node[this.propertyName + 'X'] = x;
                    node[this.propertyName + 'Y'] = y;
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
                    node[this.propertyName] = value;
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