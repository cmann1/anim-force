///<reference path='../assets/SpriteAsset.ts'/>

namespace app.armature
{

	import SpriteFrame = app.assets.SpriteFrame;

	export class Sprite
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

		public x:number = 0;
		public y:number = 0;
		public rotation:number = 0;
		public scaleX:number = 1;
		public scaleY:number = 1;

		constructor(asset:app.assets.SpriteAsset, palette:number=0, frame:number=0)
		{
			this.asset = asset;
			this.palette = palette;
			this.frame = frame;

			asset.setSpriteSource(this);
		}

		public draw(ctx:CanvasRenderingContext2D)
		{
			ctx.save();

			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.scale(this.scaleX, this.scaleY);
			ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);

			// ctx.fillStyle = '#FF0000';
			// ctx.rect(0, 0, this.srcWidth, this.srcHeight);
			// ctx.fill();
			ctx.drawImage(this.src,
				this.srcX, this.srcY, this.srcWidth, this.srcHeight,
				0, 0, this.srcWidth, this.srcHeight);

			ctx.restore();
		}

	}

}