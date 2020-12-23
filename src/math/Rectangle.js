var math;
(function (math) {
    var Rectangle = /** @class */ (function () {
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Rectangle.prototype.set = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        };
        return Rectangle;
    }());
    math.Rectangle = Rectangle;
})(math || (math = {}));
//# sourceMappingURL=Rectangle.js.map