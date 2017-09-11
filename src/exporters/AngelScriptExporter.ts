namespace app.exporters
{

	import Model = app.model.Model;
	import Node = app.model.Node;
	import Sprite = app.model.Sprite;
	import ContainerNode = app.model.ContainerNode;
	import Animation = app.anim.Animation;
	import SpriteFrame = app.assets.SpriteFrame;

	export class AngelScriptExporter extends Exporter
	{
		public exportModel(model:Model):string
		{
			const className = model.name.toVarName();

			var spriteNodes:Sprite[] = [];
			var spriteGroupList:string[] = [];
			var spriteNameList:string[] = [];
			var spriteLayers:number[] = [];
			var spriteSubLayers:number[] = [];
			var spritePalettes:number[] = [];

			var nodes:Node[] = model.children.slice();
			var nodeCount = nodes.length;
			var i = 0;

			while(i < nodeCount)
			{
				var node:Node = nodes[i];

				if(node instanceof Sprite)
				{
					var sprite:Sprite = <Sprite> node;
					spriteNodes.push(node);
					spriteGroupList.push(sprite.asset.spriteSetName);
					spriteNameList.push(sprite.asset.spriteName);
					spriteLayers.push(sprite.layer);
					spriteSubLayers.push(sprite.subLayer);
					spritePalettes.push(sprite.palette);
				}
				else if(node instanceof ContainerNode)
				{
					nodes = nodes.concat(node.children);
					nodeCount += node.childCount;
				}

				i++;
			}

			var anims:Animation[] = [model.getBindPose()]; // TODO: TEMP
			var animFrameCount = [];
			var animFps = [];
			var animLoop = [];
			var outFrames = [];
			var outX = [];
			var outY = [];
			var outRotation = [];
			var outScaleX = [];
			var outScaleY = [];

			for(var anim of anims)
			{
				anim.suppressEvents = true;
				const currentFrame = anim.getPosition();
				const frameCount = anim.getLength();

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

				for(var i = 0; i < frameCount; i++)
				{
					for(var sprite of spriteNodes)
					{
						var frame:SpriteFrame = sprite.frameData;
						var x = (sprite.srcWidth * 0.5 + frame.dfOriginX) * sprite.scaleX;
						var y = (sprite.srcHeight * 0.5 + frame.dfOriginY) * sprite.scaleY;
						var worldX = sprite.worldX - (Math.cos(sprite.worldRotation) * x - Math.sin(sprite.worldRotation) * y);
						var worldY = sprite.worldY - (Math.sin(sprite.worldRotation) * x + Math.cos(sprite.worldRotation) * y);

						animFrames.push(sprite.frame);
						animX.push(Exporter.num(worldX));
						animY.push(Exporter.num(worldY));
						animRotation.push(Exporter.num(sprite.worldRotation * Math.RAD_TO_DEG));
						animScaleX.push(Exporter.num(sprite.scaleX));
						animScaleY.push(Exporter.num(sprite.scaleY));
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


return `class ${className} : trigger_base{
	scene@ g;
	script@ script;
	scripttrigger@ self;

	[hidden] int _sprite_count = ${spriteGroupList.length};
	[hidden] array<string> _sprite_sets = {'${spriteGroupList.join("','")}'};
	[hidden] array<string> _sprite_names = {'${spriteNameList.join("','")}'};
	[hidden] array<sprites@> _sprite_list(_sprite_count);
	[hidden] array<int> _layers = {${spriteLayers.join(',')}};
	[hidden] array<int> _sub_layers = {${spriteSubLayers.join(',')}};
	[hidden] array<int> _palettes = {${spritePalettes.join(',')}};
	
	// Animations
	[hidden] array<int> _frame_count = {${animFrameCount.join(',')}};
	[hidden] array<float> _fps_step = {${animFps.join(',')}};
	[hidden] array<bool> _loop = {${animLoop.join(',')}};
	[hidden] array<array<int>> _frames = {{${outFrames.join('},{')}}};
	[hidden] array<array<float>> _x = {{${outX.join('},{')}}};
	[hidden] array<array<float>> _y = {{${outY.join('},{')}}};
	[hidden] array<array<float>> _rotation = {{${outRotation.join('},{')}}};
	[hidden] array<array<float>> _scale_x = {{${outScaleX.join('},{')}}};
	[hidden] array<array<float>> _scale_y = {{${outScaleY.join('},{')}}};
	[hidden] dictionary _names = {{'__bind__', 0}};
	
	// Current animation
	[hidden] float _anim_frame = 0;
	[hidden] int _anim_frame_count = _frame_count[0];
	[hidden] float _anim_fps_step = _fps_step[0];
	[hidden] bool _anim_loop = _loop[0];
	[hidden] array<int>@ _anim_frames = @_frames[0];
	[hidden] array<float>@ _anim_x = @_x[0];
	[hidden] array<float>@ _anim_y = @_y[0];
	[hidden] array<float>@ _anim_rotation = @_rotation[0];
	[hidden] array<float>@ _anim_scale_x = @_scale_x[0];
	[hidden] array<float>@ _anim_scale_y = @_scale_y[0];
	
	${className}(){
		@g = get_scene();
		
		for(int i = 0; i < _sprite_count; i++){
			sprites@ spr = @_sprite_list[i] = create_sprites();
			spr.add_sprite_set(_sprite_sets[i]);
		}
	}
	
	void init(script@ script, scripttrigger@ self)
	{
		@this.script = @script;
		@this.self = @self;
	}
	
	void step(){
		_anim_frame += _anim_fps_step;
		
		if(_anim_frame > _anim_frame_count - 1){
			_anim_frame = _anim_loop ? 0 : _anim_frame_count - 1;
		}
	}
	
	void draw(float sub_frame){
		const float x = self.x();
		const float y = self.y();
		
		const uint colour = 0xFFFFFFFF;
		
		const int fi = int(_anim_frame) * _sprite_count;
		
		for(int i = 0; i < _sprite_count; i++){
			_sprite_list[i].draw_world(
				_layers[i], _sub_layers[i], _sprite_names[i],
				_anim_frames[fi + i], _palettes[i],
				x + _anim_x[fi + i], y + _anim_y[fi + i], _anim_rotation[fi + i],
				_anim_scale_x[fi + i], _anim_scale_y[fi + i], colour);
			g.draw_rectangle_world(22, 20, x + _anim_x[fi + i]-4, y + _anim_y[fi + i]-4, x + _anim_x[fi + i]+4, y + _anim_y[fi + i]+4, 0, i >= 2 ? 0xFF0000FF : (i == 1 ? 0xFF00FF00 : 0xFFFF0000));
		}
		
		g.draw_rectangle_world(22, 20, x-4, y-4, x+4, y+4, 0, 0xFFFF0000);
	}
	
	void editor_draw(float sub_frame){
		draw(sub_frame);
	}
}`;
		}
	}

}