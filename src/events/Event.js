var app;
(function (app) {
    var events;
    (function (events) {
        var Event = (function () {
            function Event(type, nativeEvent) {
                this.type = type;
                this.nativeEvent = nativeEvent;
            }
            return Event;
        }());
        events.Event = Event;
    })(events = app.events || (app.events = {}));
})(app || (app = {}));
//# sourceMappingURL=Event.js.map