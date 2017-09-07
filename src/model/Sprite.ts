namespace app.model
{

	import SpriteFrame = app.assets.SpriteFrame;
	import SpriteAsset = app.assets.SpriteAsset;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Sprite extends Node
	{
		public asset:app.assets.SpriteAsset;
		public frameData:SpriteFrame;
		public palette:number;
		public frame:number;

		public src:HTMLImageElement = null;
		public srcX:number = 0;
		public srcY:number = 0;
		public srcWidth:number = 0;
		public srcHeight:number = 0;

		public rotationHandle:Handle;
		public scaleHandle:Handle;
		public scaleXHandle:Handle;
		public scaleYHandle:Handle;

		constructor(asset:app.assets.SpriteAsset, palette:number=0, frame:number=0, name:string=null)
		{
			super(name || (asset ? asset.spriteName : null));

			this.type = 'sprite';

			this.asset = asset;
			this.palette = palette;
			this.frame = frame;

			(asset || SpriteAsset.NULL).setSpriteSource(this);

			this.rotationHandle = new Handle(this, 'rotation', Config.handleRadius, HandleShape.CIRCLE, HandleType.ROTATION, Config.handle);
			this.scaleHandle = new Handle(this, 'scale', Config.handleRadius, HandleShape.SQUARE, HandleType.SCALE, Config.handle);
			this.scaleXHandle = new Handle(this, 'scaleX', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);
			this.scaleYHandle = new Handle(this, 'scaleY', Config.handleRadius, HandleShape.SQUARE, HandleType.AXIS, Config.handle);

			this.handles.push(this.rotationHandle);
			this.handles.push(this.scaleHandle);
			this.handles.push(this.scaleXHandle);
			this.handles.push(this.scaleYHandle);
		}

		public loadSprite(spriteGroup:string, spriteName:string)
		{
			this.asset = app.main.spriteManager.loadSprite(spriteGroup, spriteName);
			this.asset.setSpriteSource(this);
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(!this.worldAABB.contains(x, y)) return false;

			if(this.hitTestHandles(x, y, worldScaleFactor, result))
			{
				return true;
			}

			const local = MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
			const w = Math.abs(this.srcWidth * 0.5 * this.scaleX);
			const h = Math.abs(this.srcHeight * 0.5 * this.scaleY);
			x = local.x;
			y = local.y;

			if(x >= -w && x <= w && y >= -h && y <= h)
			{
				result.x = x;
				result.y = y;
				result.offset = this.rotation;
				result.node = this;
				result.part = 'base';
				return true;
			}

			return false;
		}

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			const part = interaction.part;

			if(part == 'scale' || part == 'scaleX' || part == 'scaleY')
			{
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);

				if(part == 'scale' && interaction.constrain)
				{
					var scale = Math.sqrt(local.x * local.x + local.y * local.y) / interaction.offset;
					this.scaleX = interaction.initialX * scale;
					this.scaleY = interaction.initialY * scale;
					this.onPropertyChange('scale');
				}
				else
				{
					if(part == 'scale' || part == 'scaleX')
					{
						this.scaleX = local.x / (this.srcWidth * 0.5);
					}
					if(part == 'scale' || part == 'scaleY')
					{
						this.scaleY = local.y / (this.srcHeight * 0.5);
					}

					if(part == 'scale')
					{
						this.onPropertyChange('scale');
					}
					else if(part == 'scaleX')
					{
						this.onPropertyChange('scaleX');
					}
					else
					{
						this.onPropertyChange('scaleY');
					}
				}

				return true;
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const x = this.worldX;
			const y = this.worldY;
			const w = this.srcWidth * 0.5 * this.scaleX;
			const h = this.srcHeight * 0.5 * this.scaleY;

			this.rotationHandle.active = this.selected;
			this.scaleHandle.active = this.selected;
			this.scaleXHandle.active = this.selected;
			this.scaleYHandle.active = this.selected;
			this.scaleHandle.rotation = this.scaleXHandle.rotation = this.scaleYHandle.rotation = this.worldRotation;

			var local = MathUtils.rotate(0, -h, this.worldRotation);
			this.rotationHandle.x = x + local.x;
			this.rotationHandle.y = y + local.y;
			var local = MathUtils.rotate(w, h, this.worldRotation);
			this.scaleHandle.x = x + local.x;
			this.scaleHandle.y = y + local.y;
			var local = MathUtils.rotate(w, 0, this.worldRotation);
			this.scaleXHandle.x = x + local.x;
			this.scaleXHandle.y = y + local.y;
			var local = MathUtils.rotate(0, h, this.worldRotation);
			this.scaleYHandle.x = x + local.x;
			this.scaleYHandle.y = y + local.y;

			this.prepareAABB(worldScale);

			const scaleX = Math.abs(this.scaleX);
			const scaleY = Math.abs(this.scaleY);
			const cosR = Math.abs(Math.cos(this.worldRotation));
			const sinR = Math.abs(Math.sin(this.worldRotation));
			var w1 = (this.srcHeight * scaleY * sinR + this.srcWidth * scaleX * cosR) * 0.5;
			var h1 = (this.srcWidth * scaleX * sinR  + this.srcHeight * scaleY * cosR) * 0.5;

			this.worldAABB.unionF(
				this.worldX - w1, this.worldY - h1,
				this.worldX + w1, this.worldY + h1
			);

			if(this.worldAABB.intersects(viewport))
			{
				drawList.add(this);
			}
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number)
		{
			ctx.save();

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.rotate(this.worldRotation);
			ctx.scale(this.scaleX * worldScale, this.scaleY * worldScale);
			ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);

			ctx.drawImage(this.src,
				this.srcX, this.srcY, this.srcWidth, this.srcHeight,
				0, 0, this.srcWidth, this.srcHeight);

			ctx.restore();
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.worldAABB.intersects(viewport)) return;

			ctx.save();

			const scaleX = this.scaleX * worldScale;
			const scaleY = this.scaleY * worldScale;
			const w = this.srcWidth * 0.5;
			const h = this.srcHeight * 0.5;

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.rotate(this.worldRotation);
			ctx.translate(-w * scaleX, -h * scaleY);

			ctx.setLineDash([2, 2]);
			ctx.strokeStyle = this.selected ? Config.selected : (this.highlighted ? Config.highlighted : Config.control);
			ctx.lineWidth = this.selected ? 3 : 1;
			ctx.beginPath();
			ctx.rect(0, 0, this.srcWidth * scaleX, this.srcHeight * scaleY);
			ctx.stroke();

			ctx.restore();

			super.drawControls(ctx, worldScale, viewport);

			if(Config.drawAABB)
			{
				this.worldAABB.draw(ctx, worldScale);
			}
		}

	}

}