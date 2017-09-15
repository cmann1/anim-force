var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var app;
(function (app) {
    var exporters;
    (function (exporters) {
        var Sprite = app.model.Sprite;
        var SpriteGroupExporter = (function (_super) {
            __extends(SpriteGroupExporter, _super);
            function SpriteGroupExporter() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SpriteGroupExporter.prototype.exportModel = function (model) {
                var varName = model.name.toVarName() + '_spr';
                var alignX = 0.5;
                var alignY = 0.5;
                var nodes = model.getNodeList();
                var output = "sprite_group " + varName + ";\n";
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    if (node instanceof Sprite) {
                        var sprite = node;
                        if (sprite.asset) {
                            output += varName + ".add_sprite(" +
                                ("'" + sprite.asset.spriteSetName + "', '" + sprite.asset.spriteName + "',") +
                                (alignX + ", " + alignY + ",") +
                                (sprite.worldX + ", " + sprite.worldY + ", " + sprite.worldRotation * Math.RAD_TO_DEG + ",") +
                                (sprite.scaleX + ", " + sprite.scaleY + ", 0xFFFFFFFF,") +
                                (sprite.frame + ", " + sprite.palette + ",") +
                                (sprite.layer + ", " + sprite.subLayer + ");\n");
                        }
                    }
                }
                output += varName + ".draw(layer, sub_layer, x, y, rot, scale);\n";
                return output;
            };
            return SpriteGroupExporter;
        }(exporters.Exporter));
        exporters.SpriteGroupExporter = SpriteGroupExporter;
    })(exporters = app.exporters || (app.exporters = {}));
})(app || (app = {}));
//# sourceMappingURL=SpriteGroupExporter.js.map