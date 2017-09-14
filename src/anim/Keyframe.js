var app;
(function (app) {
    var anim;
    (function (anim) {
        var Keyframe = (function () {
            function Keyframe(frameIndex) {
                this.prev = null;
                this.next = null;
                this.frameIndex = frameIndex;
            }
            Keyframe.prototype.save = function () {
                return {
                    frameIndex: this.frameIndex
                };
            };
            Keyframe.prototype.load = function (data) {
                // frameIndex must be set when the keyframe is created.
                throw new Error('Keyframe.load not implemented');
            };
            return Keyframe;
        }());
        anim.Keyframe = Keyframe;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Keyframe.js.map