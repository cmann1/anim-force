var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
        var events;
        (function (events) {
            var Event = app.events.Event;
            var SelectionEvent = /** @class */ (function (_super) {
                __extends(SelectionEvent, _super);
                function SelectionEvent(type, target) {
                    var _this = _super.call(this, type, null) || this;
                    _this.target = target;
                    return _this;
                }
                return SelectionEvent;
            }(Event));
            events.SelectionEvent = SelectionEvent;
        })(events = model.events || (model.events = {}));
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=SelectionEvent.js.map