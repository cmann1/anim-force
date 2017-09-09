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
        var ContainerNode = app.model.ContainerNode;
        var AngelScriptExporter = (function (_super) {
            __extends(AngelScriptExporter, _super);
            function AngelScriptExporter() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            AngelScriptExporter.prototype.exportModel = function (model) {
                var className = model.name.toVarName();
                var spriteNodes = [];
                var spriteGroupList = [];
                var spriteNameList = [];
                var spriteLayers = [];
                var spriteSubLayers = [];
                var spritePalettes = [];
                var nodes = model.children.slice();
                var nodeCount = nodes.length;
                var i = 0;
                while (i < nodeCount) {
                    var node = nodes[i];
                    if (node instanceof Sprite) {
                        var sprite = node;
                        spriteNodes.push(node);
                        spriteGroupList.push(sprite.asset.spriteSetName);
                        spriteNameList.push(sprite.asset.spriteName);
                        spriteLayers.push(sprite.layer);
                        spriteSubLayers.push(sprite.subLayer);
                        spritePalettes.push(sprite.palette);
                    }
                    else if (node instanceof ContainerNode) {
                        nodes = nodes.concat(node.children);
                        nodeCount += node.childCount;
                    }
                    i++;
                }
                var anims = [model.bindPose]; // TODO: TEMP
                var animFrameCount = [];
                var animFps = [];
                var animLoop = [];
                var outFrames = [];
                var outX = [];
                var outY = [];
                var outRotation = [];
                var outScaleX = [];
                var outScaleY = [];
                for (var _i = 0, anims_1 = anims; _i < anims_1.length; _i++) {
                    var anim = anims_1[_i];
                    anim.suppressEvents = true;
                    var currentFrame = anim.getPosition();
                    var frameCount = anim.getLength();
                    anim.setPosition(0);
                    model.prepareChildren();
                    animFrameCount.push(frameCount);
                    animFps.push(anim.fps / 60);
                    animLoop.push(anim.loop);
                    var animFrames = [];
                    var animX = [];
                    var animY = [];
                    var animRotation = [];
                    var animScaleX = [];
                    var animScaleY = [];
                    for (var i = 0; i < frameCount; i++) {
                        for (var _a = 0, spriteNodes_1 = spriteNodes; _a < spriteNodes_1.length; _a++) {
                            var sprite = spriteNodes_1[_a];
                            var frame = sprite.frameData;
                            var x = (sprite.srcWidth * 0.5 + frame.dfOriginX) * sprite.scaleX;
                            var y = (sprite.srcHeight * 0.5 + frame.dfOriginY) * sprite.scaleY;
                            var worldX = sprite.worldX - (Math.cos(sprite.worldRotation) * x - Math.sin(sprite.worldRotation) * y);
                            var worldY = sprite.worldY - (Math.sin(sprite.worldRotation) * x + Math.cos(sprite.worldRotation) * y);
                            animFrames.push(sprite.frame);
                            animX.push(exporters.Exporter.num(worldX));
                            animY.push(exporters.Exporter.num(worldY));
                            animRotation.push(exporters.Exporter.num(sprite.worldRotation * Math.RAD_TO_DEG));
                            animScaleX.push(exporters.Exporter.num(sprite.scaleX));
                            animScaleY.push(exporters.Exporter.num(sprite.scaleY));
                        }
                        anim.gotoNextFrame();
                        model.prepareChildren();
                    }
                    outFrames.push(animFrames.join(','));
                    outX.push(animX.join(','));
                    outY.push(animY.join(','));
                    outRotation.push(animRotation.join(','));
                    outScaleX.push(animScaleX.join(','));
                    outScaleY.push(animScaleY.join(','));
                    anim.setPosition(currentFrame);
                    anim.suppressEvents = false;
                }
                return "class " + className + " : trigger_base{\n\tscene@ g;\n\tscript@ script;\n\tscripttrigger@ self;\n\n\t[hidden] int _sprite_count = " + spriteGroupList.length + ";\n\t[hidden] array<string> _sprite_sets = {'" + spriteGroupList.join("','") + "'};\n\t[hidden] array<string> _sprite_names = {'" + spriteNameList.join("','") + "'};\n\t[hidden] array<sprites@> _sprite_list(_sprite_count);\n\t[hidden] array<int> _layers = {" + spriteLayers.join(',') + "};\n\t[hidden] array<int> _sub_layers = {" + spriteSubLayers.join(',') + "};\n\t[hidden] array<int> _palettes = {" + spritePalettes.join(',') + "};\n\t\n\t// Animations\n\t[hidden] array<int> _frame_count = {" + animFrameCount.join(',') + "};\n\t[hidden] array<float> _fps_step = {" + animFps.join(',') + "};\n\t[hidden] array<bool> _loop = {" + animLoop.join(',') + "};\n\t[hidden] array<array<int>> _frames = {{" + outFrames.join('},{') + "}};\n\t[hidden] array<array<float>> _x = {{" + outX.join('},{') + "}};\n\t[hidden] array<array<float>> _y = {{" + outY.join('},{') + "}};\n\t[hidden] array<array<float>> _rotation = {{" + outRotation.join('},{') + "}};\n\t[hidden] array<array<float>> _scale_x = {{" + outScaleX.join('},{') + "}};\n\t[hidden] array<array<float>> _scale_y = {{" + outScaleY.join('},{') + "}};\n\t[hidden] dictionary _names = {{'__bind__', 0}};\n\t\n\t// Current animation\n\t[hidden] float _anim_frame = 0;\n\t[hidden] int _anim_frame_count = _frame_count[0];\n\t[hidden] float _anim_fps_step = _fps_step[0];\n\t[hidden] bool _anim_loop = _loop[0];\n\t[hidden] array<int>@ _anim_frames = @_frames[0];\n\t[hidden] array<float>@ _anim_x = @_x[0];\n\t[hidden] array<float>@ _anim_y = @_y[0];\n\t[hidden] array<float>@ _anim_rotation = @_rotation[0];\n\t[hidden] array<float>@ _anim_scale_x = @_scale_x[0];\n\t[hidden] array<float>@ _anim_scale_y = @_scale_y[0];\n\t\n\t" + className + "(){\n\t\t@g = get_scene();\n\t\t\n\t\tfor(int i = 0; i < _sprite_count; i++){\n\t\t\tsprites@ spr = @_sprite_list[i] = create_sprites();\n\t\t\tspr.add_sprite_set(_sprite_sets[i]);\n\t\t}\n\t}\n\t\n\tvoid init(script@ script, scripttrigger@ self)\n\t{\n\t\t@this.script = @script;\n\t\t@this.self = @self;\n\t}\n\t\n\tvoid step(){\n\t\t_anim_frame += _anim_fps_step;\n\t\t\n\t\tif(_anim_frame > _anim_frame_count - 1){\n\t\t\t_anim_frame = _anim_loop ? 0 : _anim_frame_count - 1;\n\t\t}\n\t}\n\t\n\tvoid draw(float sub_frame){\n\t\tconst float x = self.x();\n\t\tconst float y = self.y();\n\t\t\n\t\tconst uint colour = 0xFFFFFFFF;\n\t\t\n\t\tconst int fi = int(_anim_frame) * _sprite_count;\n\t\t\n\t\tfor(int i = 0; i < _sprite_count; i++){\n\t\t\t_sprite_list[i].draw_world(\n\t\t\t\t_layers[i], _sub_layers[i], _sprite_names[i],\n\t\t\t\t_anim_frames[fi + i], _palettes[i],\n\t\t\t\tx + _anim_x[fi + i], y + _anim_y[fi + i], _anim_rotation[fi + i],\n\t\t\t\t_anim_scale_x[fi + i], _anim_scale_y[fi + i], colour);\n\t\t\tg.draw_rectangle_world(22, 20, x + _anim_x[fi + i]-4, y + _anim_y[fi + i]-4, x + _anim_x[fi + i]+4, y + _anim_y[fi + i]+4, 0, i >= 2 ? 0xFF0000FF : (i == 1 ? 0xFF00FF00 : 0xFFFF0000));\n\t\t}\n\t\t\n\t\tg.draw_rectangle_world(22, 20, x-4, y-4, x+4, y+4, 0, 0xFFFF0000);\n\t}\n\t\n\tvoid editor_draw(float sub_frame){\n\t\tdraw(sub_frame);\n\t}\n}";
            };
            return AngelScriptExporter;
        }(exporters.Exporter));
        exporters.AngelScriptExporter = AngelScriptExporter;
    })(exporters = app.exporters || (app.exporters = {}));
})(app || (app = {}));
//# sourceMappingURL=AngelScriptExporter.js.map