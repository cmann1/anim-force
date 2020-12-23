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
    var anim;
    (function (anim) {
        var TrackPropertyType = app.anim.TrackPropertyType;
        var EventTrack = /** @class */ (function (_super) {
            __extends(EventTrack, _super);
            function EventTrack(animation, node) {
                var _this = _super.call(this, 'event', animation, node) || this;
                _this.bulkKeyframeOperations = false;
                _this.tweenable = false;
                _this.keyLabelProperty = 'event';
                _this.keyLabelField = 'value';
                _this.addProperty('event', TrackPropertyType.STRING);
                _this.keyframeColour = '#719ef9';
                _this.keyframeBorderColour = '#2b63d4';
                _this.keyframeDisabledColour = '#bdd8ff';
                _this.keyframeDisabledBorderColour = '#90afda';
                return _this;
            }
            return EventTrack;
        }(anim.Track));
        anim.EventTrack = EventTrack;
    })(anim = app.anim || (app.anim = {}));
})(app || (app = {}));
//# sourceMappingURL=EventTrack.js.map