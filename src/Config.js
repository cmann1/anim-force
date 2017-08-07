var app;
(function (app) {
    var Config = (function () {
        function Config() {
        }
        return Config;
    }());
    Config.drawAABB = false;
    Config.control = '#333';
    Config.selected = '#CD3D51';
    Config.highlighted = '#de7777';
    Config.interactionTolerance = 2;
    Config.bone = '#eee';
    Config.boneThickness = 3;
    Config.boneEndPointRadius = 4;
    Config.AABB = '#F00';
    Config.childrenAABB = '#0F0';
    Config.boneAABB = '#00F';
    Config.boneClick = Config.boneThickness + Config.interactionTolerance;
    Config.boneEndPointClick = Config.boneEndPointRadius + Config.interactionTolerance;
    app.Config = Config;
})(app || (app = {}));
//# sourceMappingURL=Config.js.map