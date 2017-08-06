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
var events;
(function (events) {
    var StructureChangeEvent = (function (_super) {
        __extends(StructureChangeEvent, _super);
        function StructureChangeEvent(type, parent, target, index, other) {
            var _this = _super.call(this, type, null) || this;
            _this.parent = parent;
            _this.target = target;
            _this.index = index;
            _this.other = other;
            return _this;
        }
        return StructureChangeEvent;
    }(events.Event));
    events.StructureChangeEvent = StructureChangeEvent;
})(events || (events = {}));
//# sourceMappingURL=StructureChangeEvent.js.map