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
    var model;
    (function (model) {
        var Node = app.model.Node;
        var EventNode = (function (_super) {
            __extends(EventNode, _super);
            function EventNode(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
                _this.size = 25;
                _this.event = null;
                _this.type = 'event';
                return _this;
            }
            Object.defineProperty(EventNode.prototype, "name", {
                get: function () {
                    return this._name || 'Events-' + this.id;
                },
                enumerable: true,
                configurable: true
            });
            EventNode.prototype.hitTest = function (x, y, worldScaleFactor, result) {
                if (!app.Config.showControls || !this.worldAABB.contains(x, y))
                    return false;
                if (this.hitTestHandles(x, y, worldScaleFactor, result)) {
                    return true;
                }
                x -= this.worldX;
                y -= this.worldY;
                var w = this.size;
                if (x >= -w && x <= w && y >= -w && y <= w) {
                    result.x = x;
                    result.y = y;
                    result.offset = this.rotation;
                    result.node = this;
                    result.part = 'base';
                    return true;
                }
                return false;
            };
            EventNode.prototype.prepareForDrawing = function (worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport) {
                _super.prototype.prepareForDrawing.call(this, worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);
                this.worldX = this.offsetX;
                this.worldY = this.offsetY;
                this.worldRotation = 0;
                this.prepareAABB(worldScale);
                this.worldAABB.unionF(this.worldX - this.size, this.worldY - this.size, this.worldX + this.size, this.worldY + this.size);
                if (drawList && this.worldAABB.intersects(viewport)) {
                    drawList.add(this);
                }
            };
            EventNode.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.visible || !this.worldAABB.intersects(viewport))
                    return;
                ctx.save();
                var w = this.size;
                var size = this.size * 2 * worldScale;
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                ctx.translate(-w * worldScale, -w * worldScale);
                ctx.save();
                ctx.scale(worldScale, worldScale);
                ctx.font = '42px FontAwesome';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\uf0ae', w, w + 2);
                ctx.restore();
                ctx.setLineDash([2, 2]);
                ctx.strokeStyle = this.selected ? app.Config.selected : (this.highlighted ? app.Config.highlighted : app.Config.control);
                ctx.lineWidth = this.selected ? 3 : 1;
                ctx.beginPath();
                ctx.rect(0, 0, size, size);
                ctx.stroke();
                ctx.restore();
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
                if (app.Config.drawAABB) {
                    this.worldAABB.draw(ctx, worldScale);
                }
            };
            EventNode.prototype.setEvent = function (event) {
                if (this.event == event)
                    return;
                this.event = event;
                this.onPropertyChange('event');
            };
            //
            EventNode.prototype.save = function () {
                var data = _super.prototype.save.call(this);
                data.offsetX = this.offsetX;
                data.offsetY = this.offsetY;
                return data;
            };
            EventNode.prototype.load = function (data) {
                _super.prototype.load.call(this, data);
                this.offsetX = data.get('offsetX');
                this.offsetY = data.get('offsetY');
                return this;
            };
            return EventNode;
        }(Node));
        model.EventNode = EventNode;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=EventNode.js.map