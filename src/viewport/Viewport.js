var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        var EditMode = app.model.EditMode;
        var Anchor = app.model.Anchor;
        var Viewport = /** @class */ (function (_super) {
            __extends(Viewport, _super);
            function Viewport(elementId, model) {
                var _this = _super.call(this, elementId) || this;
                _this.scales = [0.1, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 6, 8, 12, 16, 24, 32];
                _this.scale = 1;
                _this.scaleIndex = 9;
                _this.cameraX = 0;
                _this.cameraY = 0;
                _this.cameraVelX = 0;
                _this.cameraVelY = 0;
                _this.cameraFriction = 0.9;
                _this.prevCameraX = 0;
                _this.prevCameraY = 0;
                _this.flickTolerance = 4;
                _this.flickFactor = 2;
                _this.viewportAABB = new viewport.AABB();
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
                _this.selectMouseX = NaN;
                _this.selectMouseY = NaN;
                _this.interaction = new viewport.Interaction();
                _this.highlightInteraction = new viewport.Interaction();
                _this.layers = [];
                /*
                 * Model Events
                 */
                _this.onAnimationChange = function (animation, event) {
                    var type = event.type;
                    // if(type == 'position')
                    // {
                    // 	this.showMessage('Frame: ' + (this.model.getActiveAnimation().getPosition() + 1));
                    // }
                    _this.requiresUpdate = true;
                };
                _this.onConfigChange = function (obj, event) {
                    var type = event.type;
                    if (type == 'showFps') {
                        _this.toggleFps(app.Config.showFps);
                    }
                };
                _this.onModelChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelSelectionChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelStructureChange = function (model, event) {
                    _this.requiresUpdate = true;
                };
                _this.onModelAnimationChange = function (animation, event) {
                    var type = event.type;
                    if (type == 'setAnimation') {
                        animation.change.on(_this.onAnimationChange);
                        _this.requiresUpdate = true;
                    }
                };
                _this.onModelModeChange = function (model, event) {
                    _this.mode = model.mode;
                    if (_this.mode == EditMode.PLAYBACK) {
                        _this.interaction.reset();
                    }
                };
                // TODO: REMOVE
                _this.onSpritesSelect = function (spriteGroup, spriteName) {
                    var node = _this.model.getSelectedNode();
                    if (node instanceof Sprite) {
                        node.loadSprite(spriteGroup, spriteName);
                    }
                };
                _this.onZoomComplete = function () {
                    _this.anchorToScreen(_this.mouseX, _this.mouseY, _this.stageAnchorX, _this.stageAnchorY);
                    _this.stageAnchorX = NaN;
                    _this.stageAnchorY = NaN;
                };
                for (var layer = 0; layer <= MAX_LAYER; layer++) {
                    for (var subLayer = 0; subLayer <= MAX_SUB_LAYER + 1; subLayer++) {
                        _this.layers[((layer & 0xFFFF) << 16) | (subLayer & 0xFFFF)] = new viewport.Layer(layer, subLayer - 1);
                    }
                }
                _this.setModel(model);
                _this.$message = $('<div class="viewport-message"></div>');
                _this.$container.append(_this.$message);
                _this.$message.hide();
                _this.fpsDisplay = new app.Fps.Display(app.main.ticker.getFps);
                if (!app.Config.showFps) {
                    _this.fpsDisplay.hide();
                }
                new viewport.SettingsDlg(_this, _this.$container);
                new viewport.LayerPalette(_this);
                app.Config.change.on(_this.onConfigChange);
                return _this;
            }
            Viewport.prototype.getLayer = function (layer, subLayer) {
                var index = ((layer & 0xFFFF) << 16) | ((subLayer + 1) & 0xFFFF);
                var layerInstance = this.layers[index];
                if (!layerInstance) {
                    layerInstance = this.layers[index] = new viewport.Layer(layer, subLayer);
                }
                return layerInstance;
            };
            //
            Viewport.prototype.step = function (deltaTime, timestamp) {
                if (this.mode == EditMode.PLAYBACK) {
                    this.model.animateStep(deltaTime);
                }
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
                    this.requiresUpdate = true;
                }
                var viewWidth = this.width / this.scale;
                var viewHeight = this.height / this.scale;
                this.viewLeft = this.cameraX - viewWidth * 0.5;
                this.viewRight = this.viewLeft + viewWidth;
                this.viewTop = this.cameraY - viewHeight * 0.5;
                this.viewBottom = this.viewTop + viewHeight;
                this.viewportAABB.x1 = this.viewLeft;
                this.viewportAABB.y1 = this.viewTop;
                this.viewportAABB.x2 = this.viewRight;
                this.viewportAABB.y2 = this.viewBottom;
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
                ctx.translate(Math.floor(this.centreX - this.cameraX * this.scale), Math.floor(this.centreY - this.cameraY * this.scale));
                this.model.drawModel(this.ctx, this.scale, this.viewportAABB);
                // this.viewportAABB.draw(ctx, this.scale);
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
                if (app.Config.drawGrid) {
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
                }
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
            //
            Viewport.prototype.anchorToScreen = function (screenX, screenY, stageX, stageY) {
                this.cameraX = stageX - (screenX - this.centreX) / this.scale;
                this.cameraY = stageY - (screenY - this.centreY) / this.scale;
            };
            Viewport.prototype.reset = function () {
                this.cameraX = 0;
                this.cameraY = 0;
                this.scale = 1;
                this.scaleIndex = this.scales.indexOf(this.scale);
                this.requiresUpdate = true;
            };
            Viewport.prototype.screenToStage = function (x, y, out) {
                out.x = this.cameraX + (x - this.centreX) / this.scale;
                out.y = this.cameraY + (y - this.centreY) / this.scale;
            };
            Viewport.prototype.setModel = function (model) {
                this.model = model;
                this.mode = model.mode;
                model.setAnimationListeners(this.onAnimationChange);
                model.change.on(this.onModelChange);
                model.animationChange.on(this.onModelAnimationChange);
                model.modeChange.on(this.onModelModeChange);
                model.selectionChange.on(this.onModelSelectionChange);
                model.structureChange.on(this.onModelStructureChange);
                this.requiresUpdate = true;
            };
            Viewport.prototype.stageXToScreen = function (x) {
                return (x - this.cameraX) * this.scale + this.centreX;
            };
            Viewport.prototype.stageYToScreen = function (y) {
                return (y - this.cameraY) * this.scale + this.centreY;
            };
            Viewport.prototype.showMessage = function (message, duration) {
                if (duration === void 0) { duration = 1000; }
                this.$message.html(message).show().stop(true).fadeTo(duration, 1).fadeOut(250);
            };
            Viewport.prototype.toggleFps = function (show) {
                if (show) {
                    this.fpsDisplay.show();
                }
                else {
                    this.fpsDisplay.hide();
                }
            };
            //
            Viewport.prototype.save = function () {
                return {
                    scale: this.scale,
                    cameraX: this.cameraX,
                    cameraY: this.cameraY
                };
            };
            Viewport.prototype.load = function (data) {
                this.cameraVelX = 0;
                this.cameraVelY = 0;
                this.scale = data.get('scale');
                this.scaleIndex = this.scales.indexOf(this.scale);
                if (this.scaleIndex == -1) {
                    this.scaleIndex = this.scales.indexOf(this.scale = 1);
                }
                this.cameraX = this.prevCameraX = data.get('cameraX');
                this.cameraY = this.prevCameraY = data.get('cameraY');
                this.requiresUpdate = true;
            };
            //
            Viewport.prototype.zoom = function (direction) {
                var _this = this;
                if (direction === void 0) { direction = 1; }
                this.scaleIndex += direction;
                if (this.scaleIndex < 0)
                    this.scaleIndex = 0;
                else if (this.scaleIndex >= this.scales.length)
                    this.scaleIndex = this.scales.length - 1;
                var scale = this.scales[this.scaleIndex];
                createjs.Tween.get(this, { override: true })
                    .to({ scale: scale }, 50)
                    .call(this.onZoomComplete)
                    .addEventListener('change', function () { _this.requiresUpdate = true; });
                this.stageAnchorX = this.stageMouse.x;
                this.stageAnchorY = this.stageMouse.y;
                this.showMessage("Zoom: " + scale);
                this.requiresUpdate = true;
            };
            /*
             * Events
             */
            Viewport.prototype.onKeyDown = function (event) {
                if (this.timeline.commonKey(event))
                    return;
                if (this.commonKey(event))
                    return;
                // console.log(keyCode);
                var keyCode = event.keyCode;
                var altKey = event.altKey;
                var shiftKey = event.shiftKey;
                var selectedNode = this.model.getSelectedNode();
                if (keyCode == Key.Home) {
                    this.reset();
                }
                // Zoom in
                else if (keyCode == Key.Add || keyCode == Key.Equals) {
                    this.zoom(1);
                }
                // Zoom out
                else if (keyCode == Key.Subtract || keyCode == Key.Dash) {
                    this.zoom(-1);
                }
                // Toggle draw grid
                else if (keyCode == Key.G && !altKey) {
                    app.Config.set('drawGrid', !app.Config.drawGrid);
                }
                // Toggle AAB draw
                else if (keyCode == Key.Zero) {
                    app.Config.set('drawAABB', !app.Config.drawAABB);
                }
                else if (this.mode != EditMode.PLAYBACK) {
                    if (!this.interaction.success) {
                        // Delete node
                        if (keyCode == Key.Delete) {
                            if (selectedNode) {
                                selectedNode.parent.removeChild(selectedNode);
                            }
                        }
                        // Duplicate
                        else if (keyCode == Key.D) {
                            var node = this.model.duplicateSelected(!shiftKey);
                            if (node) {
                                this.interaction.x = 0;
                                this.interaction.y = 0;
                                this.interaction.offset = node.rotation;
                                this.interaction.node = node;
                                this.interaction.part = 'base';
                                this.interaction.node.setSelected(true);
                                this.interaction.success = true;
                                this.interaction.node.updateInteraction(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.interaction);
                                this.requiresUpdate = true;
                            }
                        }
                        // Change layer/sublayer
                        else if (keyCode == Key.PageDown || keyCode == Key.PageUp) {
                            if (selectedNode) {
                                this.model.increaseSelectedNodeLayer(keyCode == Key.PageDown ? -1 : 1, altKey, shiftKey);
                                this.showMessage("Layer: " + selectedNode.layer + "." + selectedNode.subLayer);
                            }
                        }
                        // Change sprite frame
                        else if (keyCode == Key.Numpad8 || keyCode == Key.Numpad2) {
                            if (selectedNode instanceof Sprite) {
                                selectedNode.setFrame(Math.round(selectedNode.frame) + (keyCode == Key.Numpad8 ? 1 : -1));
                                this.showMessage('Frame: ' + (Math.round(selectedNode.frame) + 1) + '/' + selectedNode.frameCount);
                            }
                        }
                        // Change palette
                        else if (keyCode == Key.Numpad4 || keyCode == Key.Numpad6) {
                            if (selectedNode instanceof Sprite) {
                                selectedNode.setPalette(selectedNode.palette + (keyCode == Key.Numpad6 ? 1 : -1));
                                this.showMessage('Palette: ' + (selectedNode.palette + 1) + '/' + selectedNode.paletteCount);
                            }
                        }
                        // Reset to bind pose
                        else if (keyCode == Key.B && altKey) {
                            if (selectedNode)
                                selectedNode.resetToBindPose(shiftKey);
                        }
                        // Reset offset
                        else if (keyCode == Key.G && altKey) {
                            if (selectedNode)
                                selectedNode.resetOffset();
                        }
                        // Reset scale
                        else if (keyCode == Key.S && altKey) {
                            if (selectedNode)
                                selectedNode.resetScale();
                        }
                        // Reset rotation
                        else if (keyCode == Key.R && altKey) {
                            if (selectedNode)
                                selectedNode.resetRotation();
                        }
                        // Reset length
                        else if (keyCode == Key.L && altKey) {
                            if (selectedNode)
                                selectedNode.resetLength();
                        }
                        // Toggle anchor rotation and scaling
                        else if (keyCode == Key.One || keyCode == Key.Two) {
                            if (selectedNode && selectedNode instanceof Anchor) {
                                if (keyCode == Key.One)
                                    selectedNode.allowRotation = !selectedNode.allowRotation;
                                else
                                    selectedNode.allowScale = !selectedNode.allowScale;
                            }
                        }
                        // Flip
                        else if (keyCode == Key.Y) {
                            if (selectedNode) {
                                if (shiftKey)
                                    selectedNode.flipY();
                                else
                                    selectedNode.flipX();
                            }
                        }
                        // TODO: REMOVE
                        else if (keyCode == Key.Enter) {
                            app.main.showSpriteSelector(this.onSpritesSelect);
                        }
                    }
                }
            };
            Viewport.prototype.commonKey = function (event) {
                var keyCode = event.keyCode;
                // if(this.mode == EditMode.PLAYBACK) return false;
                if (keyCode == Key.Eight) {
                    app.Config.set('drawOutlines', !app.Config.drawOutlines);
                    this.requiresUpdate = true;
                }
                else if (keyCode == Key.Nine) {
                    app.Config.set('showControls', !app.Config.showControls);
                    this.requiresUpdate = true;
                }
                return false;
            };
            Viewport.prototype.onKeyUp = function (event) {
            };
            Viewport.prototype.onMouseDown = function (event) {
                this.$canvas.focus();
                if (event.button == 0) {
                    if (this.mode != EditMode.PLAYBACK) {
                        this.interaction.reset();
                        if (this.model.hitTest(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.interaction)) {
                            this.interaction.node.setSelected(true);
                            this.interaction.success = true;
                            this.interaction.selectUnderneath = true;
                        }
                        else {
                            this.model.setSelectedNode(null);
                        }
                    }
                }
                else if (event.button == 2) {
                    if (!this.interaction.success) {
                        this.mouseGrabX = this.stageMouse.x;
                        this.mouseGrabY = this.stageMouse.y;
                        this.cameraVelX = 0;
                        this.cameraVelY = 0;
                    }
                }
            };
            Viewport.prototype.onMouseUp = function (event) {
                if (event.button == 0) {
                    this.interaction.reset();
                }
                else if (event.button == 2) {
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
                }
            };
            Viewport.prototype.onMouseWheel = function (event) {
                if (!this.interaction.success) {
                    this.zoom(event.originalEvent.wheelDelta > 0 ? 1 : -1);
                }
            };
            Viewport.prototype.onMouseMove = function (event) {
                if (!isNaN(this.mouseGrabX)) {
                    this.prevCameraX = this.cameraX;
                    this.prevCameraY = this.cameraY;
                    this.anchorToScreen(this.mouseX, this.mouseY, this.mouseGrabX, this.mouseGrabY);
                    this.showMessage(Math.floor(this.cameraX) + ", " + Math.floor(this.cameraY));
                }
                if (this.interaction.success) {
                    this.interaction.constrain = event.shiftKey;
                    this.interaction.node.updateInteraction(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.interaction);
                }
                else if (this.mode != EditMode.PLAYBACK) {
                    if (this.model.hitTest(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.highlightInteraction)) {
                        this.highlightInteraction.node.setHighlighted(true);
                    }
                    else {
                        this.model.setHighlightedNode(null);
                    }
                }
                this.screenToStage(this.mouseX, this.mouseY, this.stageMouse);
                this.interaction.selectUnderneath = false;
            };
            return Viewport;
        }(app.Canvas));
        viewport.Viewport = Viewport;
    })(viewport = app.viewport || (app.viewport = {}));
})(app || (app = {}));
//# sourceMappingURL=Viewport.js.map