///<reference path='../../lib/jquery.d.ts'/>
///<reference path='../model/Sprite.ts'/>
///<reference path='SpriteFrame.ts'/>

namespace app.assets
{

	export class SpriteAsset
	{
		private static SPRITE_LOADING_IMG:HTMLImageElement;
		private static SPRITE_ERROR_IMG:HTMLImageElement;
		private static NULL_FRAME:SpriteFrame;

		public path:String;
		public sheet:HTMLImageElement;
		public spriteSetName:string;
		public spriteName:string;

		private error = false;
		private loaded = 2;
		private queuedSprites:app.model.Sprite[] = [];

		private palettes:SpriteFrame[][];
		private paletteCount:number;
		private frameCount:number;

		constructor(spriteSetName:string, spriteName:string, path:string)
		{
			this.spriteSetName = spriteSetName;
			this.spriteName = spriteName;

			if(!SpriteAsset.SPRITE_LOADING_IMG)
			{
				SpriteAsset.SPRITE_LOADING_IMG = new Image();
				SpriteAsset.SPRITE_LOADING_IMG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzE5NUZDOTY3NUVCMTFFNzlGRThEMzhGNTkzQzFBRUIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzE5NUZDOTU3NUVCMTFFNzlGRThEMzhGNTkzQzFBRUIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6M2RjOWExMDgtNzQwMS1lMjRhLTgzZDctNTI5ZmMzOGZmODc5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PmB2ns4AAAH0SURBVHja7JrdbYMwFIUNYoH2kcd0hDACWaEjJCOQFTJCGKErhBGaEcJbeWUEci27ahXZBhH8E3yudIXIL+e7x742SfLD2MAijpRFHtEDyB7Ok0h0D3AAAAAAAKgmQWuRM7ahw55yK5PH28PLesqW8kpZd+JoNZKHhVCysOiSDhUTxznBgRwJRG2rC1gBkAvRlaLCc4M74bMT7ggbQC5sfrbgVu6GYiEIL7kO4G66vHoX4FXk43lH+UHVTH6Tn1OemLnCG3LYV9CToGYI1HIy6xcaRsWTHcLZEDjJCh+miufR/blEF/vQh0AthR/nfgC9t2H69lcGOwQsLJ5uqrmEAL2vvgvIltdrOkI0e4He5ocHDSAXld4onmpjcUCleXz9AP7tHlXRrLoLSOt/a+z/bAcIuwvIyuvE8zgu+X1pYOK3I+Kbpe8NpAGJL6V4XY9vO/Py+HUByM3PZWQtsLPx3Wkg4s+OboSEBWCC+NameB6ZR/HbieKtLoUzjwYw3dm5kvDCxUWknqpfjbS6wtW1+JoD9obK71xeiC8AuuofXF9I6sH+pWGhc109AEP1Wx9WDGkvED0ABgAAAAAA4DqC/mXIYuB/ggAAAADgbTN0phwUeYMDAAAAAAAAAAAAsBnCZghDAAAAwFVkuskBDgCAOOIuwAD/HoCRjA3nLwAAAABJRU5ErkJggg==';
				SpriteAsset.SPRITE_ERROR_IMG = new Image();
				SpriteAsset.SPRITE_ERROR_IMG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTVFQkQxOTk3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTVFQkQxOTg3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OGRkNmM0M2MtNmE1MS1mODQ2LWE0OTUtMjU4M2RlNzU1YTMzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PugcXkUAAAHZSURBVHja7NuLToMwGIbh8oUrdXJVE+/O60BnIGvI6In/WNZkMdG4+T7DhrbZ8BPCEi48EC4+3gAH35/Xnw2dPLA2FQPc/h739Ze9j2FtuZUAfHeG8Cp+TgF8doRwFD+lAJZOEFLxS24O8I5QHJ+aBL0iVMXn7gO8IVTHP8aYedIN4TE+IoSQe2KF+K/obyyKL70TtH4lNMfX3ApbRTgVX7sWsIZwOr5lMWQFgSS+dTWojUAWf2Y5rIVAGn92P0AagTyeYkNECoElnmpHiBuBLZ5yS4wLgTWeEoADgT2eGoASQSSeA4ACQSyeC+AMgmg8J0ALgng8N0ANgkp8yYYIJcLRpkrQipcCyCEMWvH/L747HeZezb261INC/CI1B5TMCSrvvBaAuSENkPoXUNleg3L8HJS310bl+PigUuXcYVSO3wLVDl9gIF5iU0UFoPb2VgUBRuLVEGAoXgUBxuLFEWAwXhQBRuPFEGA4XgQBxuPZEeAgnhUBTuLZEOAongUBzuLJEeAwnhQBTuPJEOA4ngQBzuP3CHMtAjqIjxGmWgR0Et+MgI7imxDGzuL3CFt8/HVKAfQQX4LwfMcTH531HL+/qos/Ntdb/NGcUHQFXGK8T4evDvArwAChrzwgBRnVsAAAAABJRU5ErkJggg==';
				SpriteAsset.NULL_FRAME = new SpriteFrame([0, 0, 0, 0, 0, 0]);
			}

			this.path = path;
			this.sheet = new Image();
			this.sheet.onload = this.onImageLoad;
			this.sheet.onerror = this.onImageError;
			this.sheet.src = path + '.png';

			$.ajax({
				dataType: 'json',
				url: path + '.json',
				success: this.onDataLoad,
				error: this.onDataError
			});
		}

		public setSpriteSource(sprite:app.model.Sprite)
		{
			var src;

			if(this.error || this.loaded > 0)
			{
				sprite.src = this.error ? SpriteAsset.SPRITE_ERROR_IMG : SpriteAsset.SPRITE_LOADING_IMG;
				sprite.frameData = SpriteAsset.NULL_FRAME;
				sprite.srcX = 0;
				sprite.srcY = 0;
				sprite.srcWidth = sprite.src.width;
				sprite.srcHeight = sprite.src.height;

				if(!this.error)
				{
					this.queuedSprites.push(sprite);
				}
			}
			else
			{
				const paletteIndex = sprite.palette < 0 || sprite.palette >= this.paletteCount ? 0 : sprite.palette;
				const frameIndex = sprite.frame < 0 || sprite.frame >= this.frameCount ? 0 : sprite.frame;
				const frame = this.palettes[paletteIndex][frameIndex];

				sprite.src = this.sheet;
				sprite.frameData = frame;
				sprite.srcX = frame.x;
				sprite.srcY = frame.y;
				sprite.srcWidth = frame.width;
				sprite.srcHeight = frame.height;
			}
		}

		protected load()
		{
			if(--this.loaded == 0)
			{
				for(var sprite of this.queuedSprites)
				{
					this.setSpriteSource(sprite);
				}

				this.queuedSprites = null;
			}
		}

		/*
		 * Events
		 */

		protected onImageLoad = () =>
		{
			this.load();
		};

		protected onImageError = () =>
		{
			this.error = true;
			this.load();
		};

		protected onDataLoad = (data) =>
		{
			this.palettes = [];
			this.paletteCount = data.palettes.length;

			for(var paletteData of data.palettes)
			{
				this.frameCount = paletteData.length;

				var frames:SpriteFrame[] = [];
				this.palettes.push(frames);

				for(var frameData of paletteData)
				{
					frames.push(new SpriteFrame(<number[]>frameData));
				}
			}

			this.load();
		};

		protected onDataError = () =>
		{
			this.error = true;
			this.load();
		};

	}

}