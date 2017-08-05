var app;
(function (app) {
    var model;
    (function (model_1) {
        var EventDispatcher = events.EventDispatcher;
        var StructureChangeEvent = events.StructureChangeEvent;
        var Node = (function () {
            ///
            function Node(name) {
                this.canHaveChildren = false;
                /// Events
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
            Node.prototype.addChild = function (child) { return null; };
            Node.prototype.removeChild = function (child, triggerEvent) {
                if (triggerEvent === void 0) { triggerEvent = true; }
                return null;
            };
            Node.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) { };
            Node.prototype.draw = function (ctx) { };
            Node.prototype.drawControls = function (ctx) { };
            Object.defineProperty(Node.prototype, "name", {
                get: function () {
                    return this._name || 'Untitled ' + this.type.toTitleCase() + ' ' + this.id;
                },
                set: function (value) {
                    this._name = value;
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
            Node.prototype.onStructureChange = function (type, target, index) {
                this.structureChange.dispatch(this, new StructureChangeEvent(type, target, index));
                if (this.parent) {
                    this.parent.onStructureChange(type, target, index);
                }
                else if (this.model) {
                    this.model.onStructureChange(type, target, index);
                }
            };
            return Node;
        }());
        Node.nextId = 0;
        model_1.Node = Node;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Node.js.map