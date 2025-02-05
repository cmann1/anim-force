/*
 Ordered To-Do's:
 ---------------------------------------------------------------
 TODO: Recursive delete, insert, and copy keyframes

 TODO: ?Multiple selection
 TODO: ?Groups
 TODO: ?Emitter nodes
 TODO: - Check how emitter entities work in game
 TODO: - How will rotation be handled?
 TODO: - Export to AngelScript
 TODO: ?Sound nodes
 TODO: - Export to AngelScript

 TODO: Sprite Selector:
 TODO: - Improve all-round / Completely redo
 TODO: - Remember state, scroll position, etc.
 TODO: - Lazy load/create groups
 TODO: - ? Auto show when adding a sprite
 TODO: - - Auto set sprite node name to sprite name
 TODO: - Add cancel button
 TODO: Property panel:
 TODO: - ????
 ---------------------------------------------------------------

 TODO: ? Ghosts
 TODO: ? Save layer states with project
 TODO: ? Keyframe easing
 TODO: Export options:
 TODO: - sprite_group: Option to not use sprite layers and sublayers
 TODO: - AngelScript: Selected animations only
 TODO: Timeline:
 TODO: - Somehow indicate that a keyframe is selected - it might not be obvious (esp. if the selected keyframe is not in view)
 TODO: - ???
 TODO: Viewport:
 TODO: - ???
 TODO: Help
 TODO: - List of shortcut keys
 */
var MAX_LAYER = 22;
var MAX_SUB_LAYER = 24;
var DEFAULT_LAYER = 17;
var DEFAULT_SUB_LAYER = 19;
var app;
(function (app) {
    var Ticker = app.ticker.Ticker;
    var Splitter = app.ui.Splitter;
    var SpriteManager = app.assets.SpriteManager;
    var Model = app.model.Model;
    var SpriteSelector = app.ui.SpriteSelector;
    var ProjectManager = app.projects.ProjectManager;
    var App = /** @class */ (function () {
        function App() {
            var _this = this;
            this.model = new Model(); // A blank model so things work before a project is loaded
            this.spriteSelector = null;
            this.loadCount = 0;
            this.validationId = 0;
            this.validationQueue = [];
            this.validationQueueSize = 0;
            //
            this.step = function (deltaTime, timestamp) {
                for (var i = 0; i < _this.validationQueueSize; i++) {
                    _this.validationQueue[i]();
                }
                _this.validationQueueSize = 0;
                _this.viewport.step(deltaTime, timestamp);
                _this.timeline.step(deltaTime, timestamp);
                _this.draw();
            };
            this.onLoadQueue = function () {
                if (app.Config.isLoaded && !_this.viewport) {
                    _this.initUI();
                }
                if (!_this.projectManager && _this._spriteManager.isReady() && app.Config.isLoaded && app.$body) {
                    _this.loadCount++;
                    _this.projectManager = new ProjectManager();
                    _this.projectManager.init(_this.onProjectManagerReady);
                }
                // Loading complete
                if (--_this.loadCount == 0) {
                    app.$window
                        .on('focus', _this.onWindowFocus)
                        .on('blur', _this.onWindowBlur)
                        .focus();
                    $('#app-loading-screen').remove();
                    if (_this.pendingProject) {
                        _this.setProject(_this.pendingProject);
                        _this.pendingProject = null;
                    }
                    _this.ticker.start();
                }
            };
            this.requestValidation = function (callback) {
                _this.validationQueue[_this.validationQueueSize++] = callback;
                return _this.validationId++;
            };
            /*
            * Events
            */
            this.onProjectManagerReady = function () {
                _this.onLoadQueue();
            };
            this.onWindowLoad = function () {
                app.$body = $(document.body);
                app.$window = $(window);
                _this.onLoadQueue();
            };
            this.onWindowResize = function () {
                _this.viewport.updateCanvasSize();
                _this.step(0, 0);
            };
            this.onWindowBlur = function () {
                _this.ticker.stop();
            };
            this.onWindowFocus = function () {
                _this.ticker.start();
            };
            App.instance = this;
            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            this.ticker = new Ticker(this.step);
            this.loadCount++;
            this._spriteManager = new SpriteManager('assets/sprites/', this.onLoadQueue);
            this.loadCount++;
            app.Config.init(this.onLoadQueue);
            this.loadCount++;
            window.addEventListener('DOMContentLoaded', this.onWindowLoad);
            window.addEventListener('resize', this.onWindowResize);
        }
        //
        App.getViewport = function () {
            return App.instance.viewport;
        };
        App.notice = function (content, colour, time) {
            if (colour === void 0) { colour = 'white'; }
            if (time === void 0) { time = 3500; }
            new jBox('Notice', {
                content: content,
                color: colour,
                autoClose: time,
                attributes: { x: 'left', y: 'top' }
            });
        };
        App.prototype.draw = function () {
            this.viewport.draw();
            this.timeline.draw();
        };
        App.prototype.initUI = function () {
            this.viewport = new app.viewport.Viewport('viewport', this.model);
            this.timeline = new app.timeline.TimelinePanel(this.model);
            this.propertiesPanel = new app.properties.PropertiesPanel(this.model);
            new Splitter($('#col-left'), $('#properties-panel'), 1 /* HORIZONTAL */, 200, 1 /* SECOND */, 'properties');
            new Splitter(this.viewport.getContainer(), this.timeline.getContainer(), 0 /* VERTICAL */, 200, 1 /* SECOND */, 'timeline');
            this.timeline.init();
            this.viewport.focus();
            this.viewport.timeline = this.timeline.viewport;
            this.timeline.viewport.viewport = this.viewport;
            new jBox('Tooltip', {
                attach: '.tooltip',
                theme: 'TooltipDark'
            });
        };
        //
        App.prototype.setProject = function (project) {
            if (this.loadCount) {
                this.pendingProject = project;
                return;
            }
            this.project = this.projectManager.getActiveProject();
            this.model = this.project.activeModel;
            if (project.isNew) {
                this.viewport.reset();
                this.timeline.reset();
            }
            this.viewport.setModel(project.activeModel);
            this.timeline.setModel(project.activeModel);
            this.propertiesPanel.setModel(project.activeModel);
            this.viewport && this.viewport.focus();
        };
        Object.defineProperty(App.prototype, "spriteManager", {
            get: function () {
                return this._spriteManager;
            },
            enumerable: false,
            configurable: true
        });
        // TODO: remove
        App.prototype.showSpriteSelector = function (callback) {
            if (callback === void 0) { callback = null; }
            if (this.spriteSelector == null) {
                this.spriteSelector = new SpriteSelector();
            }
            this.spriteSelector.show(callback);
        };
        return App;
    }());
    app.App = App;
    // Used for debugging
    //noinspection JSUnusedLocalSymbols
    app.main = new App();
})(app || (app = {}));
//# sourceMappingURL=AnimForce.js.map