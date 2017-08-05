/*
// TODO: Timeline:
// TODO: - Drag to reorder
// TODO: - Undo/Redo - Before it's too late! But it's gonna be tough
// TODO: -
// TODO: Viewport:
// TODO: - Interaction - election, dragging, rotating, etc
// TODO: Draw controls:
// TODO: - Independent of zoom and scale
// TODO: - Mouse interaction
// TODO: Help?
// TODO: - List of shortcut keys

// TODO: Organise CSS
 */
var app;
(function (app) {
    var Ticker = app.ticker.Ticker;
    var Splitter = app.ui.Splitter;
    var SpriteManager = app.assets.SpriteManager;
    var Model = app.model.Model;
    var App = (function () {
        function App() {
            var _this = this;
            this.model = new Model();
            this.runningTime = 0;
            /*
            * Events
            */
            this.onTick = function (deltaTime, timestamp) {
                _this.runningTime++;
                _this.step(deltaTime, timestamp);
                _this.draw();
            };
            this.onWindowLoad = function () {
                app.$body = $(document.body);
                app.$window = $(window);
                app.$window
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
            this._spriteManager = new SpriteManager('assets/sprites/');
            window.addEventListener('DOMContentLoaded', this.onWindowLoad);
            window.addEventListener('resize', this.onWindowResize);
        }
        App.prototype.step = function (deltaTime, timestamp) {
            this.viewport.step(deltaTime, timestamp);
            this.timeline.step(deltaTime, timestamp);
        };
        App.prototype.draw = function () {
            this.viewport.draw();
            this.timeline.draw();
        };
        App.prototype.initUI = function () {
            this.viewport = new app.viewport.Viewport('viewport', this.model);
            this.timeline = new app.timeline.TimelinePanel(this.model);
            new Splitter($('#col-left'), $('#properties-panel'), 1 /* HORIZONTAL */, 200, 1 /* SECOND */, 'properties');
            new Splitter(this.viewport.getContainer(), this.timeline.getContainer(), 0 /* VERTICAL */, 200, 1 /* SECOND */, 'timeline');
            this.timeline.init();
            this.viewport.focus();
            this.fpsDisplay = new app.Fps.Display(this.ticker.getFps);
        };
        Object.defineProperty(App.prototype, "spriteManager", {
            get: function () {
                return this._spriteManager;
            },
            enumerable: true,
            configurable: true
        });
        return App;
    }());
    // Used for debugging
    //noinspection JSUnusedLocalSymbols
    app.main = new App();
})(app || (app = {}));
//# sourceMappingURL=AnimForce.js.map