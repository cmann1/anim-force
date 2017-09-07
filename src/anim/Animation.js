var app;
(function (app) {
    var anim;
    (function (anim) {
        var ContainerNode = app.model.ContainerNode;
        var Bone = app.model.Bone;
        var Sprite = app.model.Sprite;
        var Animation = (function () {
            function Animation(name, model) {
                var _this = this;
                this.tracks = {};
                this.active = false;
                this.fps = 15;
                this.frameIndex = 0;
                this.length = 1;
                /*
                 * Events
                 */
                this.onNodePropertyChange = function (node, event) {
                    if (!_this.active)
                        return;
                    var track = _this.tracks[node.id];
                    if (track) {
                        track.onNodePropertyChange(node, event.type);
                    }
                };
                this.onModelStructureChange = function (model, event) {
                    var type = event.type;
                    var target = event.target;
                    if (type == 'clear') {
                        _this.tracks = {};
                    }
                    else if (type == 'addChild') {
                        if (!_this.tracks[target.id]) {
                            _this.tracks[target.id] = _this.createTrack(target);
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
                    track = new anim.BoneTrack(target);
                }
                if (target instanceof Sprite) {
                    track = new anim.SpriteTrack(target);
                }
                target.propertyChange.on(this.onNodePropertyChange);
                if (!track) {
                    console.error('Cannot create animation track for', target);
                }
                track.forceKeyframe();
                return track;
            };
            Animation.prototype.forceKeyframe = function () {
                for (var trackId in this.tracks) {
                    this.tracks[trackId].forceKeyframe();
                }
            };
            Animation.prototype.gotoNextFrame = function () {
                this.frameIndex++;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].gotoNextFrame();
                }
            };
            Animation.prototype.gotoPrevFrame = function () {
                if (this.frameIndex <= 0)
                    return;
                this.frameIndex--;
                for (var trackId in this.tracks) {
                    this.tracks[trackId].gotoPrevFrame();
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
                // TODO: Seeking to any position
            };
            Animation.prototype.getPosition = function () {
                return this.frameIndex;
            };
            return Animation;
        }());
        anim.Animation = Animation;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Animation.js.map