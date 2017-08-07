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
            Node.prototype.setHighlighted = function (selected) {
                this.model.setHighlightedNode(selected ? this : null);
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
            Node.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                var offset = Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
                this.worldX = worldX + offset.x;
                this.worldY = worldY + offset.y;
                this.worldRotation = worldRotation + this.rotation;
            };
            Node.prototype.draw = function (ctx, worldScale) { };
            Node.prototype.drawControls = function (ctx, worldScale, viewport) { };
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
            Node.rotate = function (x, y, angle) {
                return {
                    x: Math.cos(angle) * x - Math.sin(angle) * y,
                    y: Math.sin(angle) * x + Math.cos(angle) * y
                };
            };
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