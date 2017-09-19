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
        var EventNode = (function (_super) {
            __extends(EventNode, _super);
            function EventNode(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name, false, false) || this;
                _this.event = null;
                _this.boxWidth = _this.boxHeight = 50;
                _this.type = 'event';
                return _this;
            }
            Object.defineProperty(EventNode.prototype, "name", {
                get: function () {
                    return this._name || 'Events-' + this.id;
                },
                set: function (value) {
                    this.setName(value);
                },
                enumerable: true,
                configurable: true
            });
            EventNode.prototype.drawControls = function (ctx, worldScale, viewport) {
                if (!this.visible || !this.worldAABB.intersects(viewport))
                    return;
                ctx.save();
                var w = this.boxWidth * 0.5;
                ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
                ctx.translate(-w * worldScale, -w * worldScale);
                ctx.scale(worldScale, worldScale);
                ctx.font = '42px FontAwesome';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\uf0ae', w, w + 2);
                ctx.restore();
                _super.prototype.drawControls.call(this, ctx, worldScale, viewport);
            };
            EventNode.prototype.setEvent = function (event) {
                if (this.event == event)
                    return;
                this.event = event;
                this.onPropertyChange('event');
            };
            //
            EventNode.prototype.getInstance = function () {
                return null;
            };
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
        }(model.BoxNode));
        model.EventNode = EventNode;
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=EventNode.js.map