var app;
(function (app) {
    var EventDispatcher = app.events.EventDispatcher;
    var Event = app.events.Event;
    var Config = /** @class */ (function () {
        function Config() {
        }
        Config.init = function (callback) {
            var db = Config.settingsDb = new PouchDB('app-settings', { adapter: 'idb', revs_limit: 1, auto_compaction: true });
            db.allDocs({ include_docs: true }).then(function (results) {
                for (var _i = 0, _a = results.rows; _i < _a.length; _i++) {
                    var data = _a[_i];
                    Config[data.id] = data.doc.value;
                }
                Config.isLoaded = true;
            }).then(callback).catch(callback);
        };
        Config.set = function (name, value) {
            if (Config[name] == value)
                return value;
            Config.settingsDb.get(name).catch(function (err) {
                if (err.name === 'not_found') {
                    return { _id: name, value: value };
                }
                else { // hm, some other error
                    throw err;
                }
            }).then(function (doc) {
                doc.value = value;
                Config.settingsDb.put(doc);
            });
            Config[name] = value;
            Config.change.dispatch(null, new Event(name));
            return value;
        };
        Config.change = new EventDispatcher();
        Config.isLoaded = false;
        // Misc
        Config.activeProject = null;
        Config.activeProjectName = null;
        Config.loadLastProjectOnStartUp = true;
        Config.appendNameOnCopy = false;
        // Viewport settings
        Config.showFps = true;
        Config.showControls = true;
        Config.drawAABB = false;
        Config.drawGrid = true;
        Config.drawOutlines = true;
        Config.pixelHitTest = true;
        Config.showLayerPalette = false;
        // UI style
        Config.text = '#444';
        Config.font = 'monospace';
        Config.control = '#333';
        Config.handle = '#5c7ecd';
        Config.selected = '#CD3D51';
        Config.highlighted = '#de7777';
        Config.outline = '#eee';
        Config.link = '#999';
        Config.AABB = '#F00';
        Config.childrenAABB = '#0F0';
        Config.boneAABB = '#00F';
        Config.anchor = '#ffc78c';
        Config.interactionTolerance = 2;
        Config.boneThickness = 3;
        Config.boneStretchHandleDist = 20;
        Config.handleRadius = 5;
        Config.subHandleRadius = 4;
        Config.node = '#FBFBFB';
        Config.nodeBottom = '#F0F0F0';
        Config.nodeBorder = '#DCDCDC';
        Config.line = '#999';
        Config.nodeHeight = 29;
        Config.frameWidth = 15;
        return Config;
    }());
    app.Config = Config;
})(app || (app = {}));
//# sourceMappingURL=Config.js.map