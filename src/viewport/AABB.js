var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var AABB = (function () {
            function AABB(x1, y1, x2, y2) {
                if (x1 === void 0) { x1 = 0; }
                if (y1 === void 0) { y1 = 0; }
                if (x2 === void 0) { x2 = 0; }
                if (y2 === void 0) { y2 = 0; }
                var _this = this;
                this.toString = function () {
                    return "<" + _this.x1 + ", " + _this.y1 + "> <" + _this.x2 + ", " + _this.y2 + ">";
                };
                this.x1 = x1;
                this.y1 = y1;
                this.x2 = x2;
                this.y2 = y2;
            }
            AABB.prototype.intersects = function (other) {
                return this.x1 <= other.x2 && this.x2 >= other.x1 && this.y1 <= other.y2 && this.y2 >= other.y1;
            };
            AABB.prototype.contains = function (x, y) {
                return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
            };
            AABB.prototype.fromCombined = function (a, b) {
                this.x1 = Math.min(a.x1, b.x1);
                this.y1 = Math.min(a.y1, b.y1);
                this.x2 = Math.max(a.x2, b.x2);
                this.y2 = Math.max(a.y2, b.y2);
            };
            AABB.prototype.from = function (a) {
                this.x1 = a.x1;
                this.y1 = a.y1;
                this.x2 = a.x2;
                this.y2 = a.y2;
            };
            AABB.prototype.union = function (a) {
                if (a.x1 < this.x1)
                    this.x1 = a.x1;
                if (a.y1 < this.y1)
                    this.y1 = a.y1;
                if (a.x2 > this.x2)
                    this.x2 = a.x2;
                if (a.y2 > this.y2)
                    this.y2 = a.y2;
            };
            AABB.prototype.draw = function (ctx, worldScale, colour) {
                if (colour === void 0) { colour = null; }
                ctx.strokeStyle = colour || app.Config.AABB;
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.rect(this.x1 * worldScale, this.y1 * worldScale, (this.x2 - this.x1) * worldScale, (this.y2 - this.y1) * worldScale);
                ctx.stroke();
            };
            return AABB;
        }());
        viewport.AABB = AABB;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=AABB.js.map