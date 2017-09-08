var app;
(function (app) {
    var Config = (function () {
        function Config() {
        }
        return Config;
    }());
    Config.drawAABB = false;
    Config.control = '#333';
    Config.handle = '#5c7ecd';
    Config.selected = '#CD3D51';
    Config.highlighted = '#de7777';
    Config.outline = '#eee';
    Config.link = '#999';
    Config.AABB = '#F00';
    Config.childrenAABB = '#0F0';
    Config.boneAABB = '#00F';
    Config.interactionTolerance = 2;
    Config.boneThickness = 3;
    Config.boneStretchHandleDist = 20;
    Config.handleRadius = 5;
    Config.subHandleRadius = 4;
    Config.node = '#FBFBFB';
    Config.nodeBorder = '#DCDCDC';
    Config.frameWidth = 15;
    app.Config = Config;
})(app || (app = {}));
//# sourceMappingURL=Config.js.map