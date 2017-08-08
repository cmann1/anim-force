var app;
(function (app) {
    var MathUtils;
    (function (MathUtils) {
        function dot(x1, y1, x2, y2) {
            return x1 * x2 + y1 * y2;
        }
        MathUtils.dot = dot;
        function rotate(x, y, angle) {
            return {
                x: Math.cos(angle) * x - Math.sin(angle) * y,
                y: Math.sin(angle) * x + Math.cos(angle) * y
            };
        }
        MathUtils.rotate = rotate;
        function project(ax, ay, bx, by) {
            var dp = dot(ax, ay, bx, by);
            return {
                x: (dp / (bx * bx + by * by)) * bx,
                y: (dp / (bx * bx + by * by)) * by
            };
        }
        MathUtils.project = project;
    })(MathUtils = app.MathUtils || (app.MathUtils = {}));
})(app || (app = {}));
//# sourceMappingURL=MathUtils.js.map