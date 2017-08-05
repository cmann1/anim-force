var app;
(function (app) {
    /*
     * Wraps thr html canvas, providing commonly used functionality such as mouse and keyboard events
     */
    var Canvas = (function () {
        function Canvas(elementId) {
            var _this = this;
            this.mousePrevX = 0;
            this.mousePrevY = 0;
            this.mouseX = 0;
            this.mouseY = 0;
            this.requiresUpdate = false;
            this.canvasMouseDown = false;
            this.canvasRightMouseDown = false;
            this.onCanvasKeyDown = function (event) {
                _this.onKeyDown(event);
            };
            this.onCanvasKeyUp = function (event) {
                _this.onKeyUp(event);
            };
            this.onCanvasMouseDown = function (event) {
                if (event.button == 2) {
                    _this.canvasRightMouseDown = true;
                }
                _this.canvasMouseDown = true;
                _this.onMouseDown(event);
                event.preventDefault();
                return false;
            };
            this.onCanvasMouseUp = function (event) {
                _this.canvasMouseDown = false;
                _this.onMouseUp(event);
            };
            this.onCanvasMouseWheel = function (event) {
                _this.onMouseWheel(event);
            };
            this.onCanvasMouseMove = function (event, force) {
                if (force === void 0) { force = false; }
                if (!force && _this.canvasMouseDown)
                    return;
                _this.requiresUpdate = true;
                _this.mousePrevX = _this.mouseX;
                _this.mousePrevY = _this.mouseY;
                var offset = _this.$canvas.offset();
                _this.mouseX = event.pageX - offset.left;
                _this.mouseY = event.pageY - offset.top;
                _this.onMouseMove(event);
            };
            this.onWindowContextMenu = function (event) {
                if (_this.canvasRightMouseDown || event.target == _this.canvas) {
                    _this.canvasRightMouseDown = false;
                    event.preventDefault();
                    return false;
                }
            };
            this.onWindowMouseMove = function (event) {
                if (_this.canvasMouseDown) {
                    _this.onCanvasMouseMove(event, true);
                }
            };
            this.onResize = function () {
                _this.updateCanvasSize();
            };
            this.canvas = document.getElementById(elementId);
            if (!this.canvas) {
                console.error("Cannot find canvas with id \"" + elementId + "\"");
                return;
            }
            this.ctx = this.canvas.getContext('2d');
            this.$canvas = $(this.canvas);
            this.$canvas
                .on('mousedown', this.onCanvasMouseDown)
                .on('wheel', this.onCanvasMouseWheel)
                .on('mousemove', this.onCanvasMouseMove)
                .on('keydown', this.onCanvasKeyDown)
                .on('keyup', this.onCanvasKeyUp);
            this.$container = this.$canvas.parent();
            app.$window
                .on('mousemove', this.onWindowMouseMove)
                .on('mouseup', this.onCanvasMouseUp)
                .on('contextmenu', this.onWindowContextMenu)
                .focus();
        }
        Canvas.prototype.focus = function () {
            this.$canvas.focus();
        };
        Canvas.prototype.updateCanvasSize = function () {
            this.width = this.canvas.width = this.canvas.clientWidth;
            this.height = this.canvas.height = this.canvas.clientHeight;
            this.centreX = this.width / 2;
            this.centreY = this.height / 2;
            this.requiresUpdate = true;
        };
        Canvas.prototype.getContainer = function () {
            return this.$container;
        };
        /*
         * Events
         */
        Canvas.prototype.onMouseDown = function (event) { };
        Canvas.prototype.onMouseUp = function (event) { };
        Canvas.prototype.onMouseMove = function (event) { };
        Canvas.prototype.onMouseWheel = function (event) { };
        Canvas.prototype.onKeyDown = function (event) { };
        Canvas.prototype.onKeyUp = function (event) { };
        return Canvas;
    }());
    app.Canvas = Canvas;
})(app || (app = {}));
//# sourceMappingURL=Canvas.js.map