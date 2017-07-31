///<reference path='../lib/jquery.d.ts'/>
///<reference path='../lib/createjs-lib.d.ts'/>
///<reference path='Ticker.ts'/>
///<reference path='FpsDisplay.ts'/>
///<reference path='viewport/Viewport.ts'/>
///<reference path='ui/Splitter.ts'/>
/*
// TODO: Load sprite set sprite sheet and render
// TODO: Armature, bone, and forward kinematics
 */
var app;
(function (app) {
    var Ticker = app.ticker.Ticker;
    var Splitter = app.ui.Splitter;
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
                $(window)
                    .on('focus', _this.onWindowFocus)
                    .on('blur', _this.onWindowBlur)
                    .focus();
                _this.ticker = new Ticker(_this.onTick);
                _this.ticker.start();
                _this.initUI();
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
        App.prototype.initUI = function () {
            this.viewport = new app.viewport.Viewport('viewport');
            new Splitter($('#col-left'), $('#properties-panel'), 1 /* HORIZONTAL */, 200, 1 /* SECOND */, 'properties');
            new Splitter(this.viewport.getContainer(), $('#timeline-container'), 0 /* VERTICAL */, 200, 1 /* SECOND */, 'timeline');
            this.viewport.updateCanvasSize();
            this.fpsDisplay = new app.Fps.Display(this.ticker.getFps);
        };
        return App;
    }());
    // Used for debugging
    //noinspection JSUnusedLocalSymbols
    app.main = new App();
})(app || (app = {}));
//# sourceMappingURL=AnimForce.js.map