namespace app.model
{

	import SpriteFrame = app.assets.SpriteFrame;
	import SpriteAsset = app.assets.SpriteAsset;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import LoadData = app.projects.LoadData;

	export class Sprite extends BoxNode
	{

		public asset:app.assets.SpriteAsset;
		public spriteData:SpriteFrame[][];
		public spritePaletteData:SpriteFrame[];
		public frameData:SpriteFrame;
		public paletteCount:number = 0;
		public frameCount:number = 0;
		private _palette:number;
		private _frame:number;

		public src:HTMLCanvasElement = null;
		public srcX:number = 0;
		public srcY:number = 0;
		public srcWidth:number = 0;
		public srcHeight:number = 0;

		constructor(asset:app.assets.SpriteAsset=null, palette:number=0, frame:number=0, name:string=null)
		{
			super(name || (asset ? asset.spriteName : null));

			this.type = 'sprite';

			this.asset = asset;
			this._palette = palette;
			this._frame = frame;

			(asset || SpriteAsset.NULL).setSpriteSource(this);
		}

		private updateFrameData()
		{
			this.srcX = this.frameData.x;
			this.srcY = this.frameData.y;
			this.srcWidth = this.boxWidth = this.frameData.width;
			this.srcHeight = this.boxHeight = this.frameData.height;
		}

		get name():string
		{
			return this._name || (this.asset && this.asset.spriteName) || 'Untitled Sprite ' + this.id;
		}
		set name(value:string)
		{
			this.setName(value);
		}

		get frame():number
		{
			return this._frame;
		}
		set frame(value:number)
		{
			// if(value < 0) value = 0;
			// else if(value > this.frameCount - 1) value = this.frameCount - 1;

			if(this._frame == value) return;

			this._frame = value;
			this.frameData = this.spritePaletteData[this.getFrame()];

			this.updateFrameData();


		}

		get palette():number
		{
			return this.getPalette();
		}
		set palette(value:number)
		{
			if(this._palette == value) return;

			this._palette = value;
			this.spritePaletteData = this.spriteData[this.getPalette()];
			this.frame = this._frame;
			this.frameData = this.spritePaletteData[this.getFrame()];

			this.updateFrameData();
		}

		public loadSprite(spriteGroup:string, spriteName:string)
		{
			this.asset = app.main.spriteManager.loadSprite(spriteGroup, spriteName);
			this.asset.setSpriteSource(this);
		}

		public getFrame():number
		{
			return mod(Math.round(this._frame), this.frameCount);
		}

		public getPalette():number
		{
			return mod(Math.round(this._palette), this.paletteCount);
		}

		public setFrame(newFrame:number)
		{
			const oldFrame = this._frame;
			this.frame = newFrame;

			if(this._frame != oldFrame)
			{
				this.onPropertyChange('frame');
			}
		}

		public setPalette(newPalette:number)
		{
			const oldPalette = this._palette;
			this.palette = newPalette;

			if(this._palette != oldPalette)
			{
				this.onPropertyChange('palette');
			}
		}

		public setSrc(newSrc:HTMLCanvasElement, spriteData:SpriteFrame[][], paletteCount:number, frameCount:number)
		{
			this.paletteCount = paletteCount;
			this.frameCount = frameCount;

			this.spriteData = spriteData;
			this.palette = this._palette;
			this.spritePaletteData = spriteData[this.getPalette()];
			this.frame = this._frame;
			this.frameData = this.spritePaletteData[this.getFrame()];

			this.updateFrameData();

			this.src = newSrc;

			this.onPropertyChange('src');
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction, recursive=true):boolean
		{
			if(super.hitTest(x, y, worldScaleFactor, result))
			{
				if(!this.selected && Config.pixelHitTest && this.asset && this.asset.ctx && result.part == 'base')
				{
					const pixel = this.asset.ctx.getImageData(
						this.srcX + this.srcWidth * 0.5 + result.x / this.scaleX,
						this.srcY + this.srcHeight * 0.5 + result.y / this.scaleY,
						1, 1).data;

					if(pixel[3] < 16)
					{
						result.node = null;
						result.part = null;
						return false;
					}
				}

				return true;
			}

			return false;
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
			if(!this.visible || !this.worldAABB.intersects(viewport)) return;

			if(!this.selected && this.highlighted)
			{
				ctx.save();

				ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
				ctx.rotate(this.worldRotation);
				ctx.scale(this.scaleX * worldScale, this.scaleY * worldScale);
				ctx.translate(-this.srcWidth * 0.5, -this.srcHeight * 0.5);

				// ctx.globalAlpha = 0.75;
				// ctx.globalCompositeOperation = 'overlay';
				ctx.globalCompositeOperation = 'color-dodge';
				ctx.drawImage(this.src,
					this.srcX, this.srcY, this.srcWidth, this.srcHeight,
					0, 0, this.srcWidth, this.srcHeight);

				ctx.restore();
			}

			super.drawControls(ctx, worldScale, viewport);
		}

		//

		protected getInstance():Sprite
		{
			return new Sprite(this.asset, this.palette, this.frame);
		}

		public save():any
		{
			var data = super.save();

			data.palette = this._palette;
			data.spriteSetName = this.asset ? this.asset.spriteSetName : '';
			data.spriteName = this.asset ? this.asset.spriteName : '';

			return data;
		}

		public load(data:LoadData):Sprite
		{
			super.load(data);

			this._palette = data.get('palette');

			var spriteSetName = data.get('spriteSetName');
			var spriteName = data.get('spriteName');

			if(spriteSetName != '')
			{
				this.loadSprite(spriteSetName, spriteName);
			}

			return this;
		}

	}

}