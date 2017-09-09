/*
// TODO: Tree: Shift tab not working correctly
// TODO: Hiding node controls
// TODO: Timeline:
// TODO: - Copy/Cut/paste frames
// TODO: - Dragging keyframes + keyboard shortcuts
// TODO: Separate edit and animate modes
// TODO: - Edit mode:
// TODO: - - Replace stretch handle with length handle
// TODO: - - Force frame to stay at zero
// TODO: - - Don't allow deleting keyframes
// TODO: - - Don't allow dragging timeline  frame
// TODO: - Animate mode:
// TODO: - - ? Disable adding, removing in the timeline.
// TODO: Manually change animation length
// TODO: Add, remove, and rename animations
// TODO: Show/hide controls
// TODO: Loading sprites
// TODO: Export to AngelScript
// TODO: Add bone as next sibling if selected node doesn't allow children (ctrl forces sibling)
// TODO: Allow sprite frames to be animated
// TODO: Animation events
// TODO: Sprite Selector:
// TODO: - Use different modal script
// TODO: - Improve all-round
// TODO: - Lazy load/create groups
// TODO: - Auto show when adding a sprite
// TODO: - - Auto set sprite node name to sprite name
// TODO: - Add cancel button
// TODO: Ghosts
// TODO: Show loading sprite when changing sprites
// TODO: Keyboard shortcuts from changing layer and sublayer

// TODO: Viewport:
// TODO: - ???
// TODO: Property panel:
// TODO: - ????
// TODO: Help?
// TODO: - List of shortcut keys
 */
var app;
(function (app) {
    var Ticker = app.ticker.Ticker;
    var Splitter = app.ui.Splitter;
    var SpriteManager = app.assets.SpriteManager;
    var Model = app.model.Model;
    var SpriteSelector = app.ui.SpriteSelector;
    var App = (function () {
        function App() {
            var _this = this;
            this.model = new Model();
            this.spriteSelector = null;
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
            this.viewport.timeline = this.timeline.viewport;
            this.timeline.viewport.viewport = this.viewport;
            this.fpsDisplay = new app.Fps.Display(this.ticker.getFps);
            new jBox('Tooltip', {
                attach: '.tooltip',
                theme: 'TooltipDark'
            });
        };
        Object.defineProperty(App.prototype, "spriteManager", {
            get: function () {
                return this._spriteManager;
            },
            enumerable: true,
            configurable: true
        });
        App.prototype.showSpriteSelector = function (callback) {
            if (callback === void 0) { callback = null; }
            if (this.spriteSelector == null) {
                this.spriteSelector = new SpriteSelector();
            }
            this.spriteSelector.show(callback);
        };
        return App;
    }());
    // Used for debugging
    //noinspection JSUnusedLocalSymbols
    app.main = new App();
})(app || (app = {}));
//# sourceMappingURL=AnimForce.js.map