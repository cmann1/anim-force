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

			const local = Node.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
			x = local.x + this.srcWidth * 0.5;
			y = local.y + this.srcHeight * 0.5;

			if(x >=0 && x <= this.srcWidth && y >=0 && y <= this.srcHeight)
			{
				result.x = local.x;
				result.y = local.y;
				result.offset = this.rotation;
				result.node = this;
				result.part = 'base';
				return true;
			}

			return false;
		}

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const cosR = Math.abs(Math.cos(this.worldRotation));
			const sinR = Math.abs(Math.sin(this.worldRotation));
			const w = (this.srcHeight * this.scaleY * sinR + this.srcWidth * this.scaleX * cosR) * 0.5;
			const h = (this.srcWidth * this.scaleX * sinR  + this.srcHeight * this.scaleY * cosR) * 0.5;

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

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.rotate(this.worldRotation);
			ctx.translate(-this.srcWidth * 0.5 * scaleX, -this.srcHeight * 0.5 * scaleY);

			ctx.setLineDash([2, 2]);
			ctx.strokeStyle = this.selected ? Config.selected : (this.highlighted ? Config.highlighted : Config.control);
			ctx.lineWidth = this.selected ? 3 : 1;
			ctx.beginPath();
			ctx.rect(0, 0, this.srcWidth * scaleX, this.srcHeight * scaleY);
			ctx.stroke();

			ctx.restore();

			if(Config.drawAABB)
			{
				this.worldAABB.draw(ctx, worldScale);
			}
		}

	}

}