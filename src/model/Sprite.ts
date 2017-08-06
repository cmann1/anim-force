namespace app.model
{

	import SpriteFrame = app.assets.SpriteFrame;
	import SpriteAsset = app.assets.SpriteAsset;

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

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList)
		{
			this.scaleX = Math.sin(app.main.runningTime * 0.025) * 0.5 + 1; // TODO: REMOVE

			super.prepareForDrawing(worldX, worldY, stretchX, stretchY, worldRotation, drawList);

			drawList.add(this);
		}

		public draw(ctx:CanvasRenderingContext2D)
		{
			ctx.save();

			ctx.translate(this.worldX, this.worldY);
			ctx.rotate(this.worldRotation);
			ctx.scale(this.scaleX, this.scaleY);
			ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);

			ctx.drawImage(this.src,
				this.srcX, this.srcY, this.srcWidth, this.srcHeight,
				0, 0, this.srcWidth, this.srcHeight);

			ctx.restore();
		}

		public drawControls(ctx:CanvasRenderingContext2D)
		{
			ctx.save();

			ctx.translate(this.worldX, this.worldY);
			ctx.rotate(this.worldRotation);
			ctx.scale(this.scaleX, this.scaleY);
			ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);

			ctx.strokeStyle = this.selected ? ColourConfig.selected : (this.highlighted ? ColourConfig.highlighted : '#888');
			ctx.beginPath();
			ctx.rect(0, 0, this.srcWidth, this.srcHeight);
			ctx.stroke();

			ctx.restore();
		}

	}

}