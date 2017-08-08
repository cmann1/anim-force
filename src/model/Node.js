var app;
(function (app) {
    var model;
    (function (model_1) {
        var EventDispatcher = events.EventDispatcher;
        var StructureChangeEvent = events.StructureChangeEvent;
        var PropertyChangeEvent = events.PropertyChangeEvent;
        var AABB = app.viewport.AABB;
        var Node = (function () {
            ///
            function Node(name) {
                this.canHaveChildren = false;
                /// Events
                this.propertyChange = new EventDispatcher();
                this.structureChange = new EventDispatcher();
                /// Properties
                this.offsetX = 0;
                this.offsetY = 0;
                this.rotation = 0;
                this.scaleX = 1;
                this.scaleY = 1;
                this.layer = 17;
                this.subLayer = 19;
                /// Rendering related
                this.worldAABB = new AABB();
                this.worldX = 0;
                this.worldY = 0;
                this.worldRotation = 0;
                this.drawIndex = 0;
                this.selected = false;
                this.highlighted = false;
                /// UI
                this.collapsed = false;
                this.id = Node.nextId++;
                this._name = name;
            }
            Node.prototype.setModel = function (model) {
                this.model = model;
            };
            Node.prototype.setSelected = function (selected) {
                this.model.setSelectedNode(selected ? this : null);
            };
            Node.prototype.setHighlighted = function (highlighted) {
                this.model.setHighlightedNode(highlighted ? this : null);
            };
            Node.prototype.previous = function (node) {
                if (node === void 0) { node = null; }
                if (node)
                    return node;
                if (!this.parent)
                    return this;
                return this.parent.previous(this);
            };
            Node.prototype.next = function (node) {
                if (node === void 0) { node = null; }
                if (node)
                    return node;
                if (!this.parent)
                    return this;
                return this.parent.next(this);
            };
            Node.prototype.hitTest = function (x, y, worldScaleFactor, result) { return false; };
            Node.prototype.hitTestHandle = function (dx, dy, worldScaleFactor, square, radius) {
                if (square === void 0) { square = false; }
                if (radius === void 0) { radius = app.Config.handleClick; }
                if (square) {
                    return dx >= -radius && dx <= radius && dy >= -radius && dy <= radius;
                }
                return Math.sqrt(dx * dx + dy * dy) <= radius * worldScaleFactor;
            };
            Node.prototype.updateInteraction = function (x, y, worldScaleFactor, interaction) {
                if (interaction.part == 'base') {
                    var worldCentreX = this.parent ? this.parent.worldEndPointX : 0;
                    var worldCentreY = this.parent ? this.parent.worldEndPointY : 0;
                    var worldRotation = this.parent ? this.parent.worldRotation : 0;
                    this.offsetX = x - worldCentreX;
                    this.offsetY = y - worldCentreY;
                    var local = app.MathUtils.rotate(this.offsetX, this.offsetY, -worldRotation);
                    var localOffset = app.MathUtils.rotate(interaction.x, interaction.y, interaction.offset);
                    this.offsetX = local.x - localOffset.x;
                    this.offsetY = local.y - localOffset.y;
                    return true;
                }
                if (interaction.part == 'rotation') {
                    var dx = x - this.worldX;
                    var dy = y - this.worldY;
                    this.rotation = Math.atan2(dy, dx) - interaction.offset;
                    return true;
                }
                return false;
            };
            Node.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                var offset = app.MathUtils.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
                this.worldX = worldX + offset.x;
                this.worldY = worldY + offset.y;
                this.worldRotation = worldRotation + this.rotation;
            };
            Node.prototype.draw = function (ctx, worldScale) { };
            Node.prototype.drawControls = function (ctx, worldScale, viewport) { };
            Node.prototype.drawHandle = function (ctx, x, y, outline, colour, square) {
                if (outline === void 0) { outline = null; }
                if (colour === void 0) { colour = null; }
                if (square === void 0) { square = false; }
                if (outline == null) {
                    outline = app.Config.outline;
                }
                if (colour == null) {
                    colour = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                }
                // Outline
                ctx.beginPath();
                ctx.fillStyle = outline;
                if (square) {
                    ctx.rect(x - app.Config.handleRadius - 1, y - app.Config.handleRadius - 1, (app.Config.handleRadius + 1) * 2, (app.Config.handleRadius + 1) * 2);
                }
                else {
                    ctx.arc(x, y, app.Config.handleRadius + 1, 0, Math.PI * 2);
                }
                ctx.fill();
                // Centre
                ctx.beginPath();
                ctx.fillStyle = colour;
                if (square) {
                    ctx.rect(x - app.Config.handleRadius, y - app.Config.handleRadius, app.Config.handleRadius * 2, app.Config.handleRadius * 2);
                }
                else {
                    ctx.arc(x, y, app.Config.handleRadius, 0, Math.PI * 2);
                }
                ctx.fill();
            };
            Object.defineProperty(Node.prototype, "name", {
                get: function () {
                    return this._name || 'Untitled ' + this.type.toTitleCase() + ' ' + this.id;
                },
                set: function (value) {
                    value = $.trim(value);
                    if (value == this._name)
                        return;
                    this._name = value;
                    this.onPropertyChange('name');
                },
                enumerable: true,
                configurable: true
            });
            /*
             * Events
             */
            Node.prototype.onStructureChange = function (type, parent, target, index, other) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, target, index, other));
                if (this.parent) {
                    this.parent.onStructureChange(type, parent, target, index, other);
                }
                else if (this.model) {
                    this.model.onStructureChange(type, parent, target, index, other);
                }
            };
            Node.prototype.onPropertyChange = function (type) {
                this.propertyChange.dispatch(this, new PropertyChangeEvent(type));
            };
            return Node;
        }());
        Node.nextId = 0;
        model_1.Node = Node;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Node.js.map