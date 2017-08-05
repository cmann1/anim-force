var events;
(function (events) {
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._eventHandlers = [];
        }
        EventDispatcher.prototype.on = function (callback) {
            if (callback && this._eventHandlers.indexOf(callback) == -1) {
                this._eventHandlers.push(callback);
            }
        };
        EventDispatcher.prototype.off = function (callback) {
            var index = this._eventHandlers.indexOf(callback);
            if (index != -1) {
                this._eventHandlers.splice(index, 1);
            }
        };
        EventDispatcher.prototype.clear = function () {
            this._eventHandlers = [];
        };
        EventDispatcher.prototype.dispatch = function (sender, event) {
            for (var _i = 0, _a = this._eventHandlers; _i < _a.length; _i++) {
                var handler = _a[_i];
                handler(sender, event);
            }
        };
        return EventDispatcher;
    }());
    events.EventDispatcher = EventDispatcher;
})(events || (events = {}));
//# sourceMappingURL=EventDispatcher.js.map