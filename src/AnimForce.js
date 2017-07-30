///<reference path='../lib/jquery.d.ts'/>
///<reference path='../lib/createjs-lib.d.ts'/>
///<reference path='Ticker.ts'/>
///<reference path='FpsDisplay.ts'/>
///<reference path='viewport/Viewport.ts'/>
var app;
(function (app) {
    var Ticker = app.ticker.Ticker;
    var App = (function () {
        function App() {
            var _this = this;
            /*
            * Events
            */
            this.onTick = function (deltaTime, timestamp) {
                _this.step(deltaTime, timestamp);
                _this.draw();
            };
            this.onWindowLoad = function () {
                _this.viewport = new app.viewport.Viewport('viewport');
                $(window)
                    .on('focus', _this.onWindowFocus)
                    .on('blur', _this.onWindowBlur)
                    .focus();
                _this.ticker = new Ticker(_this.onTick);
                _this.ticker.start();
                _this.fpsDisplay = new app.Fps.Display(_this.ticker.getFps);
            };
            this.onWindowResize = function () {
                _this.viewport.updateCanvasSize();
                _this.step(0, 0);
                _this.draw();
            };
            this.onWindowBlur = function () {
                _this.ticker.stop();
            };
            this.onWindowFocus = function () {
                _this.ticker.start();
            };
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            window.addEventListener('DOMContentLoaded', this.onWindowLoad);
            window.addEventListener('resize', this.onWindowResize);
        }
        App.prototype.step = function (deltaTime, timestamp) {
            this.viewport.step(deltaTime, timestamp);
        };
        App.prototype.draw = function () {
            this.viewport.draw();
        };
        return App;
    }());
    // Used for debugging
    //noinspection JSUnusedLocalSymbols
    app.main = new App();
})(app || (app = {}));
//# sourceMappingURL=AnimForce.js.map