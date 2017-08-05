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
        var Key = KeyCodes.Key;
        var Sprite = app.model.Sprite;
        var Bone = app.model.Bone;
        var Viewport = (function (_super) {
            __extends(Viewport, _super);
            function Viewport(elementId, model) {
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
                /*
                 * Model Events
                 */
                _this.onModelSelectionChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelStructureChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.t = 0;
                _this.onKeyDown = function (event) {
                    // console.log(event.keyCode);
                    var keyCode = event.keyCode;
                    if (keyCode == Key.Home) {
                        _this.cameraX = 0;
                        _this.cameraY = 0;
                    }
                    else if (keyCode == Key.A) {
                        var spriteAsset = app.main.spriteManager.loadSprite('props6', 'npc_1'); // leaf
                        var spriteAsset2 = app.main.spriteManager.loadSprite('props6', 'npc_2'); // maid
                        var spriteAsset3 = app.main.spriteManager.loadSprite('props6', 'npc_5'); // sci
                        _this.model.clear();
                        _this.model
                            .addChild(_this.bone = new Bone())
                            .addChild(_this.sprite = new Sprite(spriteAsset, 0, 0));
                        _this.sprite3 = new Sprite(spriteAsset3, 0, 0); // sci
                        _this.sprite3.rotation = Math.PI * 0.25;
                        _this.bone.addChild(_this.sprite3);
                        _this.bone2 = new Bone();
                        _this.bone2.offsetX = -50;
                        _this.bone.addChild(_this.bone2);
                        _this.bone2.addChild(_this.sprite2 = new Sprite(spriteAsset2, 0, 0));
                        _this.sprite.offsetY = _this.bone.length / 2;
                        _this.sprite2.offsetY = _this.bone2.length / 2;
                        _this.sprite3.offsetX = 50;
                        _this.sprite3.offsetY = 50;
                    }
                };
                _this.onKeyUp = function (event) {
                };
                _this.onZoomComplete = function () {
                    _this.anchorToScreen(_this.mouseX, _this.mouseY, _this.stageAnchorX, _this.stageAnchorY);
                    _this.stageAnchorX = NaN;
                    _this.stageAnchorY = NaN;
                };
                _this.model = model;
                model.structureChange.on(_this.onModelStructureChange);
                model.selectionChange.on(_this.onModelSelectionChange);
                _this.$container.on('resize', _this.onResize);
                _this.$container.parent().on('resize', _this.onResize);
                _this.$message = $('<div class="viewport-message"></div>');
                _this.$container.append(_this.$message);
                _this.$message.hide();
                _this.$canvas
                    .on('keydown', _this.onKeyDown)
                    .on('keyup', _this.onKeyUp);
                return _this;
            }
            Viewport.prototype.step = function (deltaTime, timestamp) {
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
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
                if (!this.requiresUpdate && document.activeElement != this.canvas)
                    return;
                var ctx = this.ctx;
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.save();
                this.drawGrid();
                ctx.translate(this.centreX, this.centreY);
                ctx.scale(this.scale, this.scale);
                ctx.translate(-this.cameraX, -this.cameraY);
                if (this.bone2) {
                    this.bone.rotation = Math.sin(this.t * 0.4 + 2) * 0.5;
                    this.bone2.rotation += 0.02;
                    this.bone.stretch = this.sprite.scaleY = (Math.sin(this.t) * 0.5 + 0.5);
                    this.sprite3.scaleX = (Math.sin(this.t + 1) * 0.5 + 1);
                    this.t += 0.04;
                }
                for (var _i = 0, _a = this.model.rootBones; _i < _a.length; _i++) {
                    var b = _a[_i];
                    b.rotation += 0.02;
                    for (var _b = 0, _c = b.children; _b < _c.length; _b++) {
                        var c = _c[_b];
                        c.rotation += 0.02;
                    }
                }
                this.model.draw(this.ctx);
                ctx.restore();
                this.requiresUpdate = false;
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
                    ctx.lineDashOffset = cameraY * scale - this.centreY;
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
                    ctx.lineDashOffset = cameraX * scale - this.centreX;
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
                this.requiresUpdate = true;
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