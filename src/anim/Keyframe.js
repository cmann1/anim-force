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
            return Keyframe;
        }());
        anim.Keyframe = Keyframe;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=Keyframe.js.map