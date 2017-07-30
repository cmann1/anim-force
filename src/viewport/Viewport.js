///<reference path='../Canvas.ts'/>
///<reference path='../../lib/createjs-lib.d.ts'/>
///<reference path='../../lib/tweenjs.d.ts'/>
///<reference path="../../lib/easeljs.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var app;
(function (app) {
    var viewport;
    (function (viewport) {
        var Viewport = (function (_super) {
            __extends(Viewport, _super);
            function Viewport(elementId) {
                var _this = _super.call(this, elementId) || this;
                _this.scales = [0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16, 32];
                _this.scale = 1;
                _this.scaleIndex = 3;
                _this.cameraX = 0;
                _this.cameraY = 0;
                _this.cameraVelX = 0;
                _this.cameraVelY = 0;
                _this.cameraFriction = 0.9;
                _this.prevCameraX = 0;
                _this.prevCameraY = 0;
                _this.flickTolerance = 4;
                _this.flickFactor = 10;
                _this.gridSize = 48 * 4;
                _this.gridSubdivisions = 4;
                _this.gridLineWidth = 1;
                _this.gridColour = '#999';
                _this.gridDash = [];
                _this.gridSubColour = '#999';
                _this.gridSubDash = [5, 5];
                _this.gridSubMinScale = 0.25;
                _this.gridXColour = '#F44';
                _this.gridYColour = '#4F4';
                _this.stageMouse = { x: 0, y: 0 };
                _this.mouseGrabX = NaN;
                _this.mouseGrabY = NaN;
                _this.stageAnchorX = NaN;
                _this.stageAnchorY = NaN;
                _this.onZoomComplete = function () {
                    _this.anchorToScreen(_this.mouseX, _this.mouseY, _this.stageAnchorX, _this.stageAnchorY);
                    _this.stageAnchorX = NaN;
                    _this.stageAnchorY = NaN;
                };
                _this.$container = _this.$canvas.parent();
                _this.$message = $('<div class="viewport-message"></div>');
                _this.$container.append(_this.$message);
                _this.$message.hide();
                return _this;
            }
            Viewport.prototype.step = function (deltaTime, timestamp) {
                if (this.cameraVelX != 0 || this.cameraVelY != 0) {
                    this.cameraX += this.cameraVelX;
                    this.cameraY += this.cameraVelY;
                    this.cameraVelX *= this.cameraFriction;
                    this.cameraVelY *= this.cameraFriction;
                    if (Math.abs(this.cameraVelX) < 0.01)
                        this.cameraVelX = 0;
                    if (Math.abs(this.cameraVelY) < 0.01)
                        this.cameraVelY = 0;
                }
                var viewWidth = this.width / this.scale;
                var viewHeight = this.height / this.scale;
                this.viewLeft = this.cameraX - viewWidth * 0.5;
                this.viewRight = this.viewLeft + viewWidth;
                this.viewTop = this.cameraY - viewHeight * 0.5;
                this.viewBottom = this.viewTop + viewHeight;
                if (!isNaN(this.stageAnchorX)) {
                    this.anchorToScreen(this.mouseX, this.mouseY, this.stageAnchorX, this.stageAnchorY);
                }
                this.screenToStage(this.mouseX, this.mouseY, this.stageMouse);
                this.mousePrevX = this.mouseX;
                this.mousePrevY = this.mouseY;
            };
            Viewport.prototype.draw = function () {
                var ctx = this.ctx;
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                // ctx.translate(Math.floor(-this.cameraX + this.centreX), Math.floor(-this.cameraY + this.centreY));
                this.drawGrid();
                // ctx.scale(this.scale, this.scale);
                ctx.restore();
            };
            Viewport.prototype.drawGrid = function () {
                var ctx = this.ctx;
                var width = this.width;
                var height = this.height;
                var scale = this.scale;
                var viewLeft = this.viewLeft;
                var viewRight = this.viewRight;
                var viewTop = this.viewTop;
                var viewBottom = this.viewBottom;
                var gridSize = this.gridSize;
                var gridSubSize = gridSize / this.gridSubdivisions;
                var cameraX = this.cameraX;
                var cameraY = this.cameraY;
                var centreX = this.centreX;
                var centreY = this.centreY;
                var x;
                var y;
                ctx.save();
                ctx.lineWidth = this.gridLineWidth;
                // Subdivisions
                //
                if (scale > this.gridSubMinScale) {
                    ctx.setLineDash(this.gridSubDash);
                    ctx.strokeStyle = this.gridSubColour;
                    ctx.lineDashOffset = cameraY * scale;
                    ctx.beginPath();
                    x = Math.floor(Math.ceil(viewLeft / gridSubSize) * gridSubSize);
                    while (x < viewRight) {
                        if (x % gridSize) {
                            var sx = Math.floor(this.stageXToScreen(x)) - 0.5;
                            ctx.moveTo(sx, 0);
                            ctx.lineTo(sx, height);
                        }
                        x += gridSubSize;
                    }
                    ctx.stroke();
                    ctx.lineDashOffset = cameraX * scale;
                    ctx.beginPath();
                    y = Math.floor(Math.ceil(viewTop / gridSubSize) * gridSubSize);
                    while (y < viewBottom) {
                        if (y % gridSize) {
                            var sy = Math.floor(this.stageYToScreen(y)) - 0.5;
                            ctx.moveTo(0, sy);
                            ctx.lineTo(width, sy);
                        }
                        y += gridSubSize;
                    }
                    ctx.stroke();
                }
                // Grid
                //
                ctx.setLineDash(this.gridDash);
                ctx.strokeStyle = this.gridColour;
                ctx.beginPath();
                x = Math.floor(Math.ceil(viewLeft / gridSize) * gridSize);
                while (x < viewRight) {
                    var sx = Math.floor(this.stageXToScreen(x)) - 0.5;
                    ctx.moveTo(sx, 0);
                    ctx.lineTo(sx, height);
                    x += gridSize;
                }
                y = Math.floor(Math.ceil(viewTop / gridSize) * gridSize);
                while (y < viewBottom) {
                    var sy = Math.floor(this.stageYToScreen(y)) - 0.5;
                    ctx.moveTo(0, sy);
                    ctx.lineTo(width, sy);
                    y += gridSize;
                }
                ctx.stroke();
                // Axes
                //
                if (viewLeft < 0 && viewRight > 0) {
                    ctx.strokeStyle = this.gridYColour;
                    ctx.beginPath();
                    var sx = Math.floor(this.stageXToScreen(0)) - 0.5;
                    ctx.moveTo(sx, 0);
                    ctx.lineTo(sx, height);
                    ctx.stroke();
                }
                if (viewTop < 0 && viewBottom > 0) {
                    ctx.strokeStyle = this.gridXColour;
                    ctx.beginPath();
                    var sy = Math.floor(this.stageYToScreen(0)) - 0.5;
                    ctx.moveTo(0, sy);
                    ctx.lineTo(width, sy);
                    ctx.stroke();
                }
                ctx.restore();
            };
            Viewport.prototype.screenToStage = function (x, y, out) {
                out.x = this.cameraX + (x - this.centreX) / this.scale;
                out.y = this.cameraY + (y - this.centreY) / this.scale;
            };
            Viewport.prototype.stageXToScreen = function (x) {
                return (x - this.cameraX) * this.scale + this.centreX;
            };
            Viewport.prototype.stageYToScreen = function (y) {
                return (y - this.cameraY) * this.scale + this.centreY;
            };
            Viewport.prototype.anchorToScreen = function (screenX, screenY, stageX, stageY) {
                this.cameraX = stageX - (screenX - this.centreX) / this.scale;
                this.cameraY = stageY - (screenY - this.centreY) / this.scale;
            };
            Viewport.prototype.showMessage = function (message, duration) {
                if (duration === void 0) { duration = 1000; }
                this.$message.html(message).show().stop(true).fadeTo(duration, 1).fadeOut(250);
            };
            /*
             * Events
             */
            Viewport.prototype.onMouseDown = function (event) {
                if (event.button == 2) {
                    this.mouseGrabX = this.stageMouse.x;
                    this.mouseGrabY = this.stageMouse.y;
                }
            };
            Viewport.prototype.onMouseUp = function (event) {
                if (!isNaN(this.mouseGrabX)) {
                    this.mouseGrabX = NaN;
                    this.mouseGrabY = NaN;
                    var dx = this.mousePrevX - this.mouseX;
                    var dy = this.mousePrevY - this.mouseY;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist >= this.flickTolerance) {
                        this.cameraVelX = dx / this.scale * this.flickFactor;
                        this.cameraVelY = dy / this.scale * this.flickFactor;
                    }
                }
            };
            Viewport.prototype.onMouseWheel = function (event) {
                this.scaleIndex += event.originalEvent.wheelDelta > 0 ? 1 : -1;
                if (this.scaleIndex < 0)
                    this.scaleIndex = 0;
                else if (this.scaleIndex >= this.scales.length)
                    this.scaleIndex = this.scales.length - 1;
                var scale = this.scales[this.scaleIndex];
                createjs.Tween.get(this, { override: true }).to({ scale: scale }, 50).call(this.onZoomComplete);
                this.stageAnchorX = this.stageMouse.x;
                this.stageAnchorY = this.stageMouse.y;
                this.showMessage("Zoom: " + scale);
            };
            Viewport.prototype.onMouseMove = function (event) {
                if (!isNaN(this.mouseGrabX)) {
                    this.prevCameraX = this.cameraX;
                    this.prevCameraY = this.cameraY;
                    this.anchorToScreen(this.mouseX, this.mouseY, this.mouseGrabX, this.mouseGrabY);
                    this.showMessage(Math.floor(this.cameraX) + ", " + Math.floor(this.cameraY));
                }
                this.screenToStage(this.mouseX, this.mouseY, this.stageMouse);
            };
            return Viewport;
        }(app.Canvas));
        viewport.Viewport = Viewport;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Viewport.js.map