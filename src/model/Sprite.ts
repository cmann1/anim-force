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

		constructor(asset:app.assets.SpriteAsset, palette:number=0, frame:number=0, name:string=null)
		{
			super(name || (asset ? asset.spriteName : null));

			this.type = 'sprite';

			this.asset = asset;
			this.palette = palette;
			this.frame = frame;

			(asset || SpriteAsset.NULL).setSpriteSource(this);
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(!this.worldAABB.contains(x, y)) return false;

			var dx:number, dy:number;

			const local = MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
			var w = this.srcWidth * 0.5 * this.scaleX;
			var h = this.srcHeight * 0.5 * this.scaleY;
			x = local.x;
			y = local.y;

			if(this.selected)
			{
				// Rotation
				dx = x;
				dy = y + h;
				if(this.hitTestHandle(dx, dy, worldScaleFactor))
				{
					result.initialX = this.rotation;
					result.offset = Math.atan2(y, x) - this.rotation + this.worldRotation;
					result.node = this;
					result.part = 'rotation';

					return true;
				}

				// Scale X
				dx = x - w;
				dy = y;
				if(this.hitTestHandle(dx, dy, worldScaleFactor, true))
				{
					result.x = dx;
					result.y = dy;
					result.offset = this.scaleX;
					result.node = this;
					result.part = 'scaleX';

					return true;
				}

				// Scale Y
				dx = x;
				dy = y - h;
				if(this.hitTestHandle(dx, dy, worldScaleFactor, true))
				{
					result.x = dx;
					result.y = dy;
					result.offset = this.scaleY;
					result.node = this;
					result.part = 'scaleY';

					return true;
				}

				// Scale
				dx = x - w;
				dy = y - h;
				if(this.hitTestHandle(dx, dy, worldScaleFactor, true))
				{
					result.x = dx;
					result.y = dy;
					result.initialX = this.scaleX;
					result.initialY = this.scaleY;
					result.offset = Math.sqrt(x * x + y * y);
					result.node = this;
					result.part = 'scale';

					return true;
				}
			}

			w = Math.abs(w);
			h = Math.abs(h);
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
			if(interaction.part == 'scale' || interaction.part == 'scaleX' || interaction.part == 'scaleY')
			{
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);

				if(interaction.part == 'scale' && interaction.constrain)
				{
					var scale = Math.sqrt(local.x * local.x + local.y * local.y) / interaction.offset;
					this.scaleX = interaction.initialX * scale;
					this.scaleY = interaction.initialY * scale;
				}
				else
				{
					if(interaction.part == 'scale' || interaction.part == 'scaleX')
					{
						this.scaleX = (local.x) / (this.srcWidth * 0.5 * interaction.offset) * interaction.offset;
					}
					if(interaction.part == 'scale' || interaction.part == 'scaleY')
					{
						this.scaleY = (local.y) / (this.srcHeight * 0.5 * interaction.offset) * interaction.offset;
					}
				}

				return true;
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const scaleX = Math.abs(this.scaleX);
			const scaleY = Math.abs(this.scaleY);
			const cosR = Math.abs(Math.cos(this.worldRotation));
			const sinR = Math.abs(Math.sin(this.worldRotation));
			var w = (this.srcHeight * scaleY * sinR + this.srcWidth * scaleX * cosR) * 0.5;
			var h = (this.srcWidth * scaleX * sinR  + this.srcHeight * scaleY * cosR) * 0.5;

			if(this.selected)
			{
				w += Config.handleClick / worldScale;
				h += Config.handleClick / worldScale;
			}

			this.worldAABB.x1 = this.worldX - w;
			this.worldAABB.y1 = this.worldY - h;
			this.worldAABB.x2 = this.worldX + w;
			this.worldAABB.y2 = this.worldY + h;

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

			if(this.selected)
			{
				// Rotation
				this.drawHandle(ctx, w * scaleX, 0, null, Config.handle);
				// Scale X/Y
				this.drawHandle(ctx, this.srcWidth * scaleX, h * scaleY, null, Config.handle, true);
				this.drawHandle(ctx, w * scaleX, this.srcHeight * scaleY, null, Config.handle, true);
				this.drawHandle(ctx, this.srcWidth * scaleX, this.srcHeight * scaleY, null, Config.handle, true);
			}

			ctx.restore();

			if(Config.drawAABB)
			{
				this.worldAABB.draw(ctx, worldScale);
			}
		}

	}

}