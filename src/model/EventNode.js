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
            // TODO: Prevent event node positions from being keyframed
            function EventNode(name) {
                if (name === void 0) { name = null; }
                var _this = _super.call(this, name) || this;
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