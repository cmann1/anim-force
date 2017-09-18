namespace app.exporters
{

	import Model = app.model.Model;
	import Node = app.model.Node;
	import Sprite = app.model.Sprite;
	import ContainerNode = app.model.ContainerNode;
	import Animation = app.anim.Animation;
	import SpriteFrame = app.assets.SpriteFrame;
	import EventNode = app.model.EventNode;

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

			var eventNodes:EventNode[] = [];

			var nodes:Node[] = model.getNodeList();

			for(var node of nodes)
			{
				if(node instanceof Sprite)
				{
					var sprite:Sprite = <Sprite> node;
					if(sprite.asset)
					{
						spriteNodes.push(node);
						spriteGroupList.push(sprite.asset.spriteSetName);
						spriteNameList.push(sprite.asset.spriteName);
						spriteLayers.push(sprite.layer);
						spriteSubLayers.push(sprite.subLayer);
						spritePalettes.push(sprite.palette);
					}
				}
				else if(node instanceof EventNode)
				{
					eventNodes.push(node);
				}
			}

			var animIndex = 0;
			var anims:Animation[] = model.getAllAnimations();
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
			var outEvent = [];

			for(var anim of anims)
			{
				anim.suppressEvents = true;
				const currentFrame = anim.getPosition();
				const frameCount = Math.max(1, anim.getLength() - (anim.skipLastFrame ? 1 : 0));

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
				var animEvent = [];

				for(var i = 0; i < frameCount; i++)
				{
					for(var sprite of spriteNodes)
					{
						var frame:SpriteFrame = sprite.frameData;
						var x = (sprite.srcWidth * 0.5 + frame.dfOriginX) * sprite.scaleX;
						var y = (sprite.srcHeight * 0.5 + frame.dfOriginY) * sprite.scaleY;
						var worldX = sprite.worldX - (Math.cos(sprite.worldRotation) * x - Math.sin(sprite.worldRotation) * y);
						var worldY = sprite.worldY - (Math.sin(sprite.worldRotation) * x + Math.cos(sprite.worldRotation) * y);

						animFrames.push(sprite.getFrame());
						animX.push(Exporter.num(worldX));
						animY.push(Exporter.num(worldY));
						animRotation.push(Exporter.num(sprite.worldRotation * Math.RAD_TO_DEG));
						animScaleX.push(Exporter.num(sprite.scaleX));
						animScaleY.push(Exporter.num(sprite.scaleY));
					}

					var eventName:string = null;
					for(var event of eventNodes)
					{
						if(event.event)
							eventName = event.event;
					}

					if(eventName)
						animEvent.push(`${i},'${eventName}'`);

					anim.gotoNextFrame();
					model.prepareChildren();
				}

				outFrames.push(animFrames.join(','));
				outX.push(animX.join(','));
				outY.push(animY.join(','));
				outRotation.push(animRotation.join(','));
				outScaleX.push(animScaleX.join(','));
				outScaleY.push(animScaleY.join(','));
				outEvent.push(animEvent.length ? '{' + animEvent.join('},{') + '}' : '');
				animNames.push(`'${anim.name}',${animIndex}`);

				anim.setPosition(currentFrame);
				anim.suppressEvents = false;
				animIndex++;
			}


			return `funcdef void EventCallback(string);

class ${className} : trigger_base
{
	scene@ g;
	script@ script;
	scripttrigger@ self;
	
	[text] bool is_playing = true;

	int sprites_count = ${spriteGroupList.length};
	array<string> sprites_sets = {'${spriteGroupList.join("','")}'};
	array<string> sprites_names = {'${spriteNameList.join("','")}'};
	array<sprites@> sprites_list(sprites_count);
	array<int> sprites_layers = {${spriteLayers.join(',')}};
	array<int> sprites_sublayers = {${spriteSubLayers.join(',')}};
	array<int> sprites_palettes = {${spritePalettes.join(',')}};
	
	// Animations
	array<int> anims_frame_count = {${animFrameCount.join(',')}};
	array<float> anims_fps_step = {${animFps.join(',')}};
	array<bool> anims_loop = {${animLoop.join(',')}};
	array<array<int>> anims_sprite_frame = {{${outFrames.join('},{')}}};
	array<array<float>> anims_x = {{${outX.join('},{')}}};
	array<array<float>> anims_y = {{${outY.join('},{')}}};
	array<array<float>> anims_rotation = {{${outRotation.join('},{')}}};
	array<array<float>> anims_scale_x = {{${outScaleX.join('},{')}}};
	array<array<float>> anims_scale_y = {{${outScaleY.join('},{')}}};
	array<dictionary> anims_event = {{${outEvent.join('},{')}}};
	dictionary anims_name = {{${animNames.join('},{')}}};
	
	// Current animation
	[text] string current_anim = "None";
	[hidden] float current_frame = 0;
	[hidden] int current_whole_frame = 0;
	[hidden] int current_frame_count = 0;
	[hidden] float current_fps_step = 0;
	[hidden] bool current_loop = false;
	[hidden] array<int>@ current_sprite_frame = @null;
	[hidden] array<float>@ current_x = @null;
	[hidden] array<float>@ current_y = @null;
	[hidden] array<float>@ current_rotation = @null;
	[hidden] array<float>@ current_scale_x = @null;
	[hidden] array<float>@ current_scale_y = @null;
	[hidden] dictionary@ current_event = @null;
	
	EventCallback@ event_callback = null;
	
	${className}()
	{
		@g = get_scene();
		
		for(int i = 0; i < sprites_count; i++){
			sprites@ spr = @sprites_list[i] = create_sprites();
			spr.add_sprite_set(sprites_sets[i]);
		}
	}
	
	void init(script@ script, scripttrigger@ self)
	{
		@this.script = @script;
		@this.self = @self;
		
		set_animation(current_anim);
	}
	
	void play()
	{
		is_playing = true;
	}
	
	void pause()
	{
		is_playing = true;
	}
	
	void goto_next_frame()
	{
		current_frame++;
		
		if(current_frame > current_frame_count - 1){
			current_frame = current_loop ? 0 : current_frame_count - 1;
		}
		
		check_event();
	}
	
	void goto_prev_frame()
	{
		current_frame--;
		
		if(current_frame < 0){
			current_frame = current_loop ? current_frame_count - 1 : 0;
		}
		
		check_event();
	}
	
	void set_animation(string name)
	{
		if(!anims_name.exists(name))
		{
			name = "None";
		}
	
		const int anim_index = int(anims_name[name]);
		
		current_anim = name;
		current_frame = 0;
		current_frame_count = anims_frame_count[anim_index];
		current_fps_step = anims_fps_step[anim_index];
		current_loop = anims_loop[anim_index];
		@current_sprite_frame = @anims_sprite_frame[anim_index];
		@current_x = @anims_x[anim_index];
		@current_y = @anims_y[anim_index];
		@current_rotation = @anims_rotation[anim_index];
		@current_scale_x = @anims_scale_x[anim_index];
		@current_scale_y = @anims_scale_y[anim_index];
		@current_event = @anims_event[anim_index];
		
		check_event();
	}
	
	void set_position(int frame)
	{
		if(frame < 0) frame = 0;
		else if(frame >= current_frame_count) frame = current_frame_count - 1;
		
		current_frame = frame;
		check_event();
	}

	string get_event()
	{
		const string frame = current_whole_frame + "";
		if(current_event.exists(frame))
		{
			return string(current_event[frame]);
		}
		
		return '';
	}
	
	void step()
	{
		if(is_playing)
		{
			current_frame += current_fps_step;
			
			if(current_frame > current_frame_count - 1){
				current_frame = current_loop ? 0 : current_frame_count - 1;
			}
			
			check_event();
		}
	}
	
	void check_event()
	{
		const int whole_frame = int(floor(current_frame));
		if(current_whole_frame != whole_frame)
		{
			current_whole_frame = whole_frame;
			
			if(@event_callback != null)
			{
				const string frame = current_whole_frame + "";
				if(current_event.exists(frame))
					event_callback(string(current_event[frame]));
			}
		}
	}
	
	void draw(float sub_frame)
	{
		const float x = self.x();
		const float y = self.y();
		
		const uint colour = 0xFFFFFFFF;
		
		const int fi = int(current_frame) * sprites_count;
		
		for(int i = 0; i < sprites_count; i++){
			sprites_list[i].draw_world(
				sprites_layers[i], sprites_sublayers[i], sprites_names[i],
				current_sprite_frame[fi + i], sprites_palettes[i],
				x + current_x[fi + i], y + current_y[fi + i], current_rotation[fi + i],
				current_scale_x[fi + i], current_scale_y[fi + i], colour);
			//g.draw_rectangle_world(22, 20, x + current_x[fi + i]-4, y + current_y[fi + i]-4, x + current_x[fi + i]+4, y + current_y[fi + i]+4, 0, i >= 2 ? 0xFF0000FF : (i == 1 ? 0xFF00FF00 : 0xFFFF0000));
		}
		
		//g.draw_rectangle_world(22, 20, x-4, y-4, x+4, y+4, 0, 0xFFFF0000);
	}
	
	void editor_draw(float sub_frame)
	{
		draw(sub_frame);
	}
}`;
		}
	}

}