///<reference path='../lib/jquery.d.ts'/>
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
            this.canvasRightMouseDown = false;
            this.onCanvasMouseDown = function (event) {
                if (event.button == 2) {
                    _this.canvasRightMouseDown = true;
                }
                _this.onMouseDown(event);
            };
            this.onCanvasMouseUp = function (event) {
                _this.onMouseUp(event);
            };
            this.onCanvasMouseWheel = function (event) {
                _this.onMouseWheel(event);
            };
            this.onWindowContextMenu = function (event) {
                if (_this.canvasRightMouseDown || event.target == _this.canvas) {
                    _this.canvasRightMouseDown = false;
                    event.preventDefault();
                    return false;
                }
            };
            this.onWindowMouseMove = function (event) {
                _this.mousePrevX = _this.mouseX;
                _this.mousePrevY = _this.mouseY;
                var offset = _this.$canvas.offset();
                _this.mouseX = event.pageX - offset.left;
                _this.mouseY = event.pageY - offset.top;
                _this.onMouseMove(event);
            };
            this.canvas = document.getElementById(elementId);
            this.updateCanvasSize();
            if (!this.canvas) {
                console.error("Cannot find canvas with id \"" + elementId + "\"");
                return;
            }
            this.ctx = this.canvas.getContext('2d');
            this.$canvas = $(this.canvas);
            this.$canvas
                .on('mousedown', this.onCanvasMouseDown)
                .on('wheel', this.onCanvasMouseWheel);
            $(window)
                .on('mousemove', this.onWindowMouseMove)
                .on('mouseup', this.onCanvasMouseUp)
                .on('contextmenu', this.onWindowContextMenu)
                .focus();
        }
        Canvas.prototype.updateCanvasSize = function () {
            this.width = this.canvas.width = this.canvas.clientWidth;
            this.height = this.canvas.height = this.canvas.clientHeight;
            this.centreX = this.width / 2;
            this.centreY = this.height / 2;
        };
        /*
         * Events
         */
        Canvas.prototype.onMouseDown = function (event) { };
        Canvas.prototype.onMouseUp = function (event) { };
        Canvas.prototype.onMouseMove = function (event) { };
        Canvas.prototype.onMouseWheel = function (event) { };
        return Canvas;
    }());
    app.Canvas = Canvas;
})(app || (app = {}));
//# sourceMappingURL=Canvas.js.map