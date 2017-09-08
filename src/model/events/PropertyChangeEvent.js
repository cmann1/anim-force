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
        var events;
        (function (events) {
            var Event = app.events.Event;
            var PropertyChangeEvent = (function (_super) {
                __extends(PropertyChangeEvent, _super);
                function PropertyChangeEvent(type) {
                    return _super.call(this, type, null) || this;
                }
                return PropertyChangeEvent;
            }(Event));
            events.PropertyChangeEvent = PropertyChangeEvent;
        })(events = model.events || (model.events = {}));
    })(model = app.model || (app.model = {}));
})(app || (app = {}));
//# sourceMappingURL=PropertyChangeEvent.js.map