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
    Config.boneClick = Config.boneThickness + Config.interactionTolerance;
    Config.boneStretchHandleDist = 20;
    Config.handleRadius = 4;
    Config.handleClick = Config.handleRadius + Config.interactionTolerance;
    Config.subHandleRadius = 3;
    Config.subHandleClick = Config.subHandleRadius + Config.interactionTolerance;
    app.Config = Config;
})(app || (app = {}));
//# sourceMappingURL=Config.js.map