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
    var SelectionEvent = (function (_super) {
        __extends(SelectionEvent, _super);
        function SelectionEvent(type, target) {
            var _this = _super.call(this, type, null) || this;
            _this.target = target;
            return _this;
        }
        return SelectionEvent;
    }(events.Event));
    events.SelectionEvent = SelectionEvent;
})(events || (events = {}));
//# sourceMappingURL=SelectionEvent.js.map