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
})(events || (events = {}));
//# sourceMappingURL=Event.js.map