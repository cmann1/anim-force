var app;
(function (app) {
    var model;
    (function (model_1) {
        var EventDispatcher = app.events.EventDispatcher;
        var StructureChangeEvent = model_1.events.StructureChangeEvent;
        var PropertyChangeEvent = model_1.events.PropertyChangeEvent;
        var AABB = app.viewport.AABB;
        var MAX_LAYER = 22;
        var MAX_SUB_LAYER = 24;
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
                this.layer = 17;
                this.subLayer = 19;
                /// Rendering related
                this.worldAABB = new AABB();
                this.controlWorldAABB = new AABB();
                this.worldX = 0;
                this.worldY = 0;
                this.worldRotation = 0;
                this.drawIndex = 0;
                this.selected = false;
                this.highlighted = false;
                this._visible = true;
                this._locked = false;
                this.id = Node.getNewId();
                this._name = name;
            }
            Node.getNewId = function () {
                return Node.autoId ? Node.nextId++ : Node.nextId;
            };
            Node.getCurrentId = function () {
                return Node.nextId;
            };
            Node.setCurrentId = function (id) {
                Node.nextId = id;
            };
            Node.prototype.setName = function (value) {
                value = $.trim(value);
                if (value == this._name)
                    return;
                this._name = value;
                this.onPropertyChange('name');
            };
            Object.defineProperty(Node.prototype, "locked", {
                get: function () {
                    return this._locked;
                },
                set: function (value) {
                    if (this._locked == value)
                        return;
                    this._locked = value;
                    this.onPropertyChange('locked');
                    if (value && this.selected) {
                        this.setSelected(false);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Node.prototype, "name", {
                get: function () {
                    return this._name || 'Untitled ' + this.type.toTitleCase() + ' ' + this.id;
                },
                set: function (value) {
                    this.setName(value);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Node.prototype, "visible", {
                get: function () {
                    return this._visible;
                },
                set: function (value) {
                    if (this._visible == value)
                        return;
                    this._visible = value;
                    this.onPropertyChange('visible');
                },
                enumerable: true,
                configurable: true
            });
            Node.prototype.setLocked = function (value, recurse) {
                if (recurse === void 0) { recurse = false; }
                this.locked = value;
            };
            Node.prototype.setVisible = function (value, recurse) {
                if (recurse === void 0) { recurse = false; }
                this.visible = value;
            };
            Node.prototype.setModel = function (model) {
                if (model == this.model)
                    return;
                if (this.model) {
                    this.model.removeNode(this);
                }
                if ((this.model = model)) {
                    this.model.addNode(this);
                }
            };
            Node.prototype.setSelected = function (selected) {
                this.model.setSelectedNode(selected ? this : null);
                if (this.highlighted) {
                    this.model.setHighlightedNode(null);
                }
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
            Node.prototype.increaseLayer = function (amount, subLayer, recurse) {
                if (subLayer === void 0) { subLayer = false; }
                if (recurse === void 0) { recurse = false; }
                if (subLayer) {
                    this.subLayer += amount;
                    if (this.subLayer < 0)
                        this.subLayer = 0;
                    else if (this.subLayer > MAX_SUB_LAYER)
                        this.subLayer = MAX_SUB_LAYER;
                }
                else {
                    this.layer += amount;
                    if (this.layer < 0)
                        this.layer = 0;
                    else if (this.layer > MAX_LAYER)
                        this.layer = MAX_LAYER;
                }
            };
            Node.prototype.resetOffset = function () {
                if (this.offsetX != 0 || this.offsetY != 0) {
                    this.offsetX = 0;
                    this.offsetY = 0;
                    this.onPropertyChange('offset');
                }
            };
            Node.prototype.resetScale = function () {
                if (this.scaleX != 1 || this.scaleY != 1) {
                    this.scaleX = 1;
                    this.scaleY = 1;
                    this.onPropertyChange('scaleX');
                    this.onPropertyChange('scaleY');
                }
            };
            Node.prototype.resetRotation = function () {
                if (this.rotation != 0) {
                    this.rotation = 0;
                    this.onPropertyChange('rotation');
                }
            };
            Node.prototype.resetLength = function () {
            };
            Node.prototype.flipX = function () {
                this.scaleX = -this.scaleX;
                this.onPropertyChange('scaleX');
            };
            Node.prototype.flipY = function () {
                this.scaleY = -this.scaleY;
                this.onPropertyChange('scaleY');
            };
            //
            Node.prototype.hitTest = function (x, y, worldScaleFactor, result, recursive) {
                if (recursive === void 0) { recursive = true; }
                return false;
            };
            Node.prototype.hitTestControls = function (x, y, worldScaleFactor, result, recursive) {
                if (recursive === void 0) { recursive = true; }
                if (!this.visible || !this.controlWorldAABB.contains(x, y))
                    return false;
                if (this.hitTestHandles(x, y, worldScaleFactor, result)) {
                    return true;
                }
            };
            Node.prototype.hitTestHandles = function (x, y, worldScaleFactor, result) {
                if (this._visible && app.Config.showControls) {
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
                this.controlWorldAABB.from(this.worldAABB);
            };
            Node.prototype.draw = function (ctx, worldScale) {
            };
            Node.prototype.drawControls = function (ctx, worldScale, viewport) {
                for (var _i = 0, _a = this.handles; _i < _a.length; _i++) {
                    var handle = _a[_i];
                    if (handle.active) {
                        handle.draw(ctx, worldScale, this.selected, this.highlighted);
                    }
                }
            };
            //
            Node.prototype.getInstance = function () {
                throw new Error('Node.getInstance must not implemented');
            };
            Node.prototype.copyFrom = function (from, recursive) {
                if (recursive === void 0) { recursive = true; }
                var name = from.name;
                if (app.Config.appendNameOnCopy) {
                    var match = name.match(/(.+)-copy(\d+)?$/);
                    if (!match)
                        this._name = name + '-copy';
                    else
                        this._name = match[1] + '-copy' + (match[2] !== undefined ? parseInt(match[2]) + 1 : '2');
                }
                else {
                    this._name = name;
                }
                this.offsetX = from.offsetX;
                this.offsetY = from.offsetY;
                this.rotation = from.rotation;
                this.scaleX = from.scaleX;
                this.scaleY = from.scaleY;
                this.layer = from.layer;
                this.subLayer = from.subLayer;
                this.worldX = from.worldX;
                this.worldY = from.worldY;
                this.worldRotation = from.worldRotation;
                this.drawIndex = from.drawIndex;
                this._visible = from._visible;
                return this;
            };
            Node.prototype.clone = function (recursive) {
                if (recursive === void 0) { recursive = true; }
                var copy = this.getInstance();
                return copy ? copy.copyFrom(this, recursive) : null;
            };
            Node.prototype.save = function () {
                return {
                    id: this.id,
                    type: this.type,
                    name: this._name,
                    visible: this._visible,
                    locked: this._locked,
                    layer: this.layer,
                    subLayer: this.subLayer,
                };
            };
            Node.prototype.load = function (data) {
                this.id = data.get('id');
                this._name = data.get('name');
                this._visible = data.get('visible');
                this._locked = data.get('locked');
                this.layer = data.get('layer');
                this.subLayer = data.get('subLayer');
                return this;
            };
            Node.load = function (data) {
                var type = data.get('type');
                var node;
                if (type == 'bone') {
                    node = new model_1.Bone().load(data);
                }
                else if (type == 'sprite') {
                    node = new model_1.Sprite(null).load(data);
                }
                else if (type == 'event') {
                    node = new model_1.EventNode().load(data);
                }
                else if (type == 'anchor') {
                    node = new model_1.Anchor().load(data);
                }
                else {
                    throw new Error('Unexpected node type');
                }
                return node;
            };
            /*
             * Events
             */
            Node.prototype.onPropertyChange = function (type) {
                this.propertyChange.dispatch(this, new PropertyChangeEvent(type));
            };
            Node.prototype.onStructureChange = function (type, parent, target, index, other) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, target, index, other));
                if (this.parent) {
                    this.parent.onStructureChange(type, parent, target, index, other);
                }
                else if (this.model) {
                    this.model.onStructureChange(type, parent, target, index, other);
                }
            };
            return Node;
        }());
        Node.nextId = 0;
        Node.autoId = true;
        model_1.Node = Node;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Node.js.map