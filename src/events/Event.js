var app;
(function (app) {
    var events;
    (function (events) {
        var Event = /** @class */ (function () {
            function Event(type, nativeEvent) {
                if (nativeEvent === void 0) { nativeEvent = null; }
                this.type = type;
                this.nativeEvent = nativeEvent;
            }
            return Event;
        }());
        events.Event = Event;
    })(events = app.events || (app.events = {}));
})(app || (app = {}));
//# sourceMappingURL=Event.js.map