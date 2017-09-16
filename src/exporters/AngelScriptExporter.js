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
                var nodes = model.getNodeList();
                for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                    var node = nodes_1[_i];
                    if (node instanceof Sprite) {
                        var sprite = node;
                        if (sprite.asset) {
                            spriteNodes.push(node);
                            spriteGroupList.push(sprite.asset.spriteSetName);
                            spriteNameList.push(sprite.asset.spriteName);
                            spriteLayers.push(sprite.layer);
                            spriteSubLayers.push(sprite.subLayer);
                            spritePalettes.push(sprite.palette);
                        }
                    }
                }
                var animIndex = 0;
                var anims = model.getAllAnimations();
                var animFrameCount = [];
                var animFps = [];
                var animLoop = [];
                var animNames = [];
                var outFrames = [];
                var outX = [];
                var outY = [];
                var outRotation = [];
                var outScaleX = [];
                var outScaleY = [];
                for (var _a = 0, anims_1 = anims; _a < anims_1.length; _a++) {
                    var anim = anims_1[_a];
                    anim.suppressEvents = true;
                    var currentFrame = anim.getPosition();
                    var frameCount = Math.max(1, anim.getLength() - (anim.skipLastFrame ? 1 : 0));
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
                        for (var _b = 0, spriteNodes_1 = spriteNodes; _b < spriteNodes_1.length; _b++) {
                            var sprite = spriteNodes_1[_b];
                            var frame = sprite.frameData;
                            var x = (sprite.srcWidth * 0.5 + frame.dfOriginX) * sprite.scaleX;
                            var y = (sprite.srcHeight * 0.5 + frame.dfOriginY) * sprite.scaleY;
                            var worldX = sprite.worldX - (Math.cos(sprite.worldRotation) * x - Math.sin(sprite.worldRotation) * y);
                            var worldY = sprite.worldY - (Math.sin(sprite.worldRotation) * x + Math.cos(sprite.worldRotation) * y);
                            animFrames.push(sprite.getFrame());
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
                    animNames.push("'" + anim.name + "'," + animIndex);
                    anim.setPosition(currentFrame);
                    anim.suppressEvents = false;
                    animIndex++;
                }
                return "class " + className + " : trigger_base\n{\n\tscene@ g;\n\tscript@ script;\n\tscripttrigger@ self;\n\t\n\t[text] bool is_playing = true;\n\n\tint sprites_count = " + spriteGroupList.length + ";\n\tarray<string> sprites_sets = {'" + spriteGroupList.join("','") + "'};\n\tarray<string> sprites_names = {'" + spriteNameList.join("','") + "'};\n\tarray<sprites@> sprites_list(sprites_count);\n\tarray<int> sprites_layers = {" + spriteLayers.join(',') + "};\n\tarray<int> sprites_sublayers = {" + spriteSubLayers.join(',') + "};\n\tarray<int> sprites_palettes = {" + spritePalettes.join(',') + "};\n\t\n\t// Animations\n\tarray<int> anims_frame_count = {" + animFrameCount.join(',') + "};\n\tarray<float> anims_fps_step = {" + animFps.join(',') + "};\n\tarray<bool> anims_loop = {" + animLoop.join(',') + "};\n\tarray<array<int>> anims_sprite_frame = {{" + outFrames.join('},{') + "}};\n\tarray<array<float>> anims_x = {{" + outX.join('},{') + "}};\n\tarray<array<float>> anims_y = {{" + outY.join('},{') + "}};\n\tarray<array<float>> anims_rotation = {{" + outRotation.join('},{') + "}};\n\tarray<array<float>> anims_scale_x = {{" + outScaleX.join('},{') + "}};\n\tarray<array<float>> anims_scale_y = {{" + outScaleY.join('},{') + "}};\n\tdictionary anims_name = {{" + animNames.join('},{') + "}};\n\t\n\t// Current animation\n\t[text] string current_anim = \"None\";\n\t[hidden] float current_frame = 0;\n\t[hidden] int current_frame_count = 0;\n\t[hidden] float current_fps_step = 0;\n\t[hidden] bool current_loop = false;\n\t[hidden] array<int>@ current_sprite_frame = @null;\n\t[hidden] array<float>@ current_x = @null;\n\t[hidden] array<float>@ current_y = @null;\n\t[hidden] array<float>@ current_rotation = @null;\n\t[hidden] array<float>@ current_scale_x = @null;\n\t[hidden] array<float>@ current_scale_y = @null;\n\t\n\t" + className + "()\n\t{\n\t\t@g = get_scene();\n\t\t\n\t\tfor(int i = 0; i < sprites_count; i++){\n\t\t\tsprites@ spr = @sprites_list[i] = create_sprites();\n\t\t\tspr.add_sprite_set(sprites_sets[i]);\n\t\t}\n\t}\n\t\n\tvoid init(script@ script, scripttrigger@ self)\n\t{\n\t\t@this.script = @script;\n\t\t@this.self = @self;\n\t\t\n\t\tset_animation(current_anim);\n\t}\n\t\n\tvoid play()\n\t{\n\t\tis_playing = true;\n\t}\n\t\n\tvoid pause()\n\t{\n\t\tis_playing = true;\n\t}\n\t\n\tvoid goto_next_frame()\n\t{\n\t\tcurrent_frame++;\n\t\t\n\t\tif(current_frame > current_frame_count - 1){\n\t\t\tcurrent_frame = current_loop ? 0 : current_frame_count - 1;\n\t\t}\n\t}\n\t\n\tvoid goto_prev_frame()\n\t{\n\t\tcurrent_frame--;\n\t\t\n\t\tif(current_frame < 0){\n\t\t\tcurrent_frame = current_loop ? current_frame_count - 1 : 0;\n\t\t}\n\t}\n\t\n\tvoid set_animation(string name)\n\t{\n\t\tif(!anims_name.exists(name))\n\t\t{\n\t\t\tname = \"None\";\n\t\t}\n\t\n\t\tconst int anim_index = int(anims_name[name]);\n\t\t\n\t\tcurrent_anim = name;\n\t\tcurrent_frame = 0;\n\t\tcurrent_frame_count = anims_frame_count[anim_index];\n\t\tcurrent_fps_step = anims_fps_step[anim_index];\n\t\tcurrent_loop = anims_loop[anim_index];\n\t\t@current_sprite_frame = @anims_sprite_frame[anim_index];\n\t\t@current_x = @anims_x[anim_index];\n\t\t@current_y = @anims_y[anim_index];\n\t\t@current_rotation = @anims_rotation[anim_index];\n\t\t@current_scale_x = @anims_scale_x[anim_index];\n\t\t@current_scale_y = @anims_scale_y[anim_index];\n\t}\n\t\n\tvoid set_position(int frame)\n\t{\n\t\tif(frame < 0) frame = 0;\n\t\telse if(frame >= current_frame_count) frame = current_frame_count - 1;\n\t\t\n\t\tcurrent_frame = frame;\n\t}\n\t\n\tvoid step()\n\t{\n\t\tif(is_playing)\n\t\t{\n\t\t\tcurrent_frame += current_fps_step;\n\t\t}\n\t\t\n\t\tif(current_frame > current_frame_count - 1){\n\t\t\tcurrent_frame = current_loop ? 0 : current_frame_count - 1;\n\t\t}\n\t}\n\t\n\tvoid draw(float sub_frame)\n\t{\n\t\tconst float x = self.x();\n\t\tconst float y = self.y();\n\t\t\n\t\tconst uint colour = 0xFFFFFFFF;\n\t\t\n\t\tconst int fi = int(current_frame) * sprites_count;\n\t\t\n\t\tfor(int i = 0; i < sprites_count; i++){\n\t\t\tsprites_list[i].draw_world(\n\t\t\t\tsprites_layers[i], sprites_sublayers[i], sprites_names[i],\n\t\t\t\tcurrent_sprite_frame[fi + i], sprites_palettes[i],\n\t\t\t\tx + current_x[fi + i], y + current_y[fi + i], current_rotation[fi + i],\n\t\t\t\tcurrent_scale_x[fi + i], current_scale_y[fi + i], colour);\n\t\t\t//g.draw_rectangle_world(22, 20, x + current_x[fi + i]-4, y + current_y[fi + i]-4, x + current_x[fi + i]+4, y + current_y[fi + i]+4, 0, i >= 2 ? 0xFF0000FF : (i == 1 ? 0xFF00FF00 : 0xFFFF0000));\n\t\t}\n\t\t\n\t\t//g.draw_rectangle_world(22, 20, x-4, y-4, x+4, y+4, 0, 0xFFFF0000);\n\t}\n\t\n\tvoid editor_draw(float sub_frame)\n\t{\n\t\tdraw(sub_frame);\n\t}\n}";
            };
            return AngelScriptExporter;
        }(exporters.Exporter));
        exporters.AngelScriptExporter = AngelScriptExporter;
    })(exporters = app.exporters || (app.exporters = {}));
})(app || (app = {}));
//# sourceMappingURL=AngelScriptExporter.js.map