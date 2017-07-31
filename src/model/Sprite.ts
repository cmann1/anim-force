///<reference path='Node.ts'/>
///<reference path='Bone.ts'/>
///<reference path='DrawList.ts'/>
///<reference path='../assets/SpriteAsset.ts'/>

namespace app.model
{

	import SpriteFrame = app.assets.SpriteFrame;

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
			super(name || asset.spriteName);

			this.asset = asset;
			this.palette = palette;
			this.frame = frame;

			asset.setSpriteSource(this);
		}

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList)
		{
			const offset = Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
			worldX += offset.x;
			worldY += offset.y;

			this.worldX = worldX;
			this.worldY = worldY;

			worldRotation += this.rotation;
			this.worldRotation = worldRotation;

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

			ctx.strokeStyle = '#F00';
			ctx.beginPath();
			ctx.rect(0, 0, this.srcWidth, this.srcHeight);
			ctx.stroke();

			ctx.restore();
		}

	}

}