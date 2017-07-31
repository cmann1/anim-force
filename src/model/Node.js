///<reference path="Model.ts"/>
///<reference path="Bone.ts"/>
var app;
(function (app) {
    var model;
    (function (model_1) {
        var Node = (function () {
            function Node(name) {
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
                /// UI
                this.collapsed = false;
                this.name = name;
            }
            Node.prototype.setModel = function (model) {
                this.model = model;
            };
            Node.prototype.prepareForDrawing = function (worldX, worldY, stretchX, stretchY, worldRotation, drawList) { };
            Node.prototype.draw = function (ctx) { };
            Node.prototype.drawControls = function (ctx) { };
            Node.rotate = function (x, y, angle) {
                return {
                    x: Math.cos(angle) * x - Math.sin(angle) * y,
                    y: Math.sin(angle) * x + Math.cos(angle) * y
                };
            };
            return Node;
        }());
        model_1.Node = Node;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=Node.js.map