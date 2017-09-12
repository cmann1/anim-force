var app;
(function (app) {
    var model;
    (function (model_1) {
        var EventDispatcher = app.events.EventDispatcher;
        var StructureChangeEvent = model_1.events.StructureChangeEvent;
        var PropertyChangeEvent = model_1.events.PropertyChangeEvent;
        var AABB = app.viewport.AABB;
        var Node = (function () {
            ///
            function Node(name) {
                this.canHaveChildren = false;
                this.handles = [];
                /// Events
                this.propertyChange = new EventDispatcher();
                this.structureChange = new EventDispatcher();
                /// Properties
                this.offsetX = 0;
                this.offsetY = 0;
                this.rotation = 0;
                this.scaleX = 1;
                this.scaleY = 1;
                this.stretchX = 1;
                this.stretchY = 1;
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
            Node.prototype.hitTestHandles = function (x, y, worldScaleFactor, result) {
                if (app.Config.drawControls) {
                    // Do it in reverse order so that handles in front are checked first
                    for (var i = this.handles.length - 1; i >= 0; i--) {
                        var handle = this.handles[i];
                        if (!handle.active)
                            continue;
                        if (handle.hitTest(x, y, worldScaleFactor, result)) {
                            return true;
                        }
                    }
                }
                return false;
            };
            Node.prototype.globalToLocal = function (x, y) {
                return app.MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
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
                    if (this.parent) {
                        this.offsetX /= this.parent.stretchX;
                        this.offsetY /= this.parent.stretchY;
                    }
                    this.onPropertyChange('offset');
                    return true;
                }
                if (interaction.part == 'rotation') {
                    var dx = x - this.worldX;
                    var dy = y - this.worldY;
                    this.rotation = Math.atan2(dy, dx) - interaction.offset;
                    if (interaction.constrain) {
                        this.rotation = Math.round((this.rotation - interaction.initialX) / (Math.PI * 0.25)) * (Math.PI * 0.25) + interaction.initialX;
                    }
                    this.onPropertyChange('rotation');
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
            Node.prototype.prepareAABB = function (worldScale) {
                this.worldAABB.x1 = this.worldX;
                this.worldAABB.y1 = this.worldY;
                this.worldAABB.x2 = this.worldX;
                this.worldAABB.y2 = this.worldY;
                for (var _i = 0, _a = this.handles; _i < _a.length; _i++) {
                    var handle = _a[_i];
                    if (!handle.active)
                        continue;
                    handle.expand(this.worldAABB, worldScale);
                }
            };
            Node.prototype.draw = function (ctx, worldScale) { };
            Node.prototype.drawControls = function (ctx, worldScale, viewport) {
                for (var _i = 0, _a = this.handles; _i < _a.length; _i++) {
                    var handle = _a[_i];
                    if (handle.active) {
                        handle.draw(ctx, worldScale, this.selected, this.highlighted);
                    }
                }
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