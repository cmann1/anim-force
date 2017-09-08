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
    var events;
    (function (events) {
        var ScrollEvent = (function (_super) {
            __extends(ScrollEvent, _super);
            function ScrollEvent(scrollX, scrollY, nativeEvent) {
                var _this = _super.call(this, 'scroll', nativeEvent) || this;
                _this.scrollX = scrollX;
                _this.scrollY = scrollY;
                return _this;
            }
            return ScrollEvent;
        }(events.Event));
        events.ScrollEvent = ScrollEvent;
    })(events = app.events || (app.events = {}));
})(app || (app = {}));
//# sourceMappingURL=ScrollEvent.js.map