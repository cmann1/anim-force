namespace app.assets
{

	export class SpriteAsset
	{
		private static SPRITE_LOADING_IMG:HTMLImageElement;
		private static SPRITE_ERROR_IMG:HTMLImageElement;
		private static NULL_FRAME_DATA:SpriteFrame[][];
		private static _NULL:SpriteAsset;

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
			this.path = path;

			if(spriteSetName)
			{
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
		}

		static init()
		{
			SpriteAsset.SPRITE_LOADING_IMG = new Image();
			SpriteAsset.SPRITE_LOADING_IMG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODM1M0VFMkE3NjM0MTFFN0E0MTg5NzU1ODEyMjQ4QUMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODM1M0VFMjk3NjM0MTFFN0E0MTg5NzU1ODEyMjQ4QUMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NThmZjdmMTctMWMxMi1lYzQ5LWJmMDYtYmZlZmQ3N2IxODhjIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuIbq3AAAARvSURBVHja7Fo9SCNREH4ROyXgFRaXQgj+YKOnwUO0OomtRSAiVsKFQLDTwz3vsJIcWmhpiChYqSRgI4IQ0UobjZw2FpqrVNTign/13nzLe8u6F5N4iXp3mQfD7rx582bme5PZySaOMyF0UcKjTJT4KHkAym28o0Ti1jkDGAAGgAFgABgABoABYAAYAAaAAWAAGAAGgAFgAEp1lBe6wVv9dV8qnzscnAHPBgCdbtUL+uInmiByS75G8hqR80UBoMBriGbu7+9/4pptAwelYKGE4Hd2dmLz8/Pa1dVVSoKggY/H4wAhlEX3WTIgRMZDlZWVghwLEQj+xzbQKUv0LJmSj5wunqOjIxEIBMTJyQmmPQR+CPzKyorKjkx6j2ZuvtlbVkDx8xElkCUgcihB5JPOOYk0or1McrnGp0t9YoP2/SsqKiLb29tidHQUbITWfsR+cp+E3BMZGiZySp8+EMWUTfhHtEekqTW/Dfw2aCHwcG5ibm4O5V0nJ4jV/Uom5eFUKqUPDg4aa0C4v7u706WjWiwW0/v6+jLJEbgP90q/vr7eXKvsIVjMTU1NgY8qHjpWPdihMUNUgz3HxsYe2ISOXKNZYjBjfjIASD0YgnGw2FythTF5SlE4jnnoKzkcUieogoBMya32YMO6p+JBCHJ9fd30AYdh9Rly+KXkmIe8WAAEYRy3ltMxAzo4OMCcF/OXl5eGPkidMAKBwzbATP1cACAopH4GH1NdXV2GXGZaGCDkAuBPGiH36empcdPe3o7LBopWS0uLFwwZN4rW9PR0cHh4OOMGFxcXxtXr9Sp9ofRzjdbWVlx+2OfpM+/e3NwUBBjqR5KmvrtcruIVwUyV9fb2FhfMVV1fX5vzh4eHRvBwhk7bAAX39iF1itJrUNBpOn1Bj1HTJ+lf4QAQumZlxcG1tbUZ86urq7hoNB9cW1sz5mpra1UWiLq6OuF2u5MAYXl52dyvo6PDcBY60CXSFhcXC8Ug2d3dLZAF1Du4CYjowsJC4d8FOjs7H/B0kp6lpaUkff49OGV6fhudGwzTZ01UV1dH6DRCCHB8fFwcHx979vf37dvOjoyMaHjO9/T0CKVf4JgdGhryJhIJ0dvba0zAh1zDYfuLjEOmOxBMyabkwUBz1NTUFKDb94R08ObmxphvbGzEyUbodhLPddL/IjNEOJ1O0dDQYGSGZQ26vBD0rfLm5mak8xuSh9GEWex5bPyW8tGi8wl2ld+quaJiKPx+/2f64jSp2pCsACgQYDQDaGnaaEM2FiHLZzhJrWnc0ui4LQ1OGnKsVWv0h/qmHEWR1qTlGnSAaeI3HuGVj+C9aKfpESj6+/uN+oIMRRYgAwHQudw3LwDyHS7xuuPMUqRRo6LRqNjd3TVr0MDAAOrQNwr+q7WTLhoAf9P7APLlncwqlbl4XEZozZb9q8R/CcATBv9HqGivxM4d//Yfy/iVGAPAADAADAADwAAwAAwAA8AAMAAMAAPAADAADAADUGLD/k5Q5wxgAEpr/BJgANhavEN20ss/AAAAAElFTkSuQmCC';
			SpriteAsset.SPRITE_ERROR_IMG = new Image();
			SpriteAsset.SPRITE_ERROR_IMG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZGM5YTEwOC03NDAxLWUyNGEtODNkNy01MjlmYzM4ZmY4NzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTVFQkQxOTk3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTVFQkQxOTg3NUVCMTFFNzhCMzBGMUM2NzkzREIxMzUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OGRkNmM0M2MtNmE1MS1mODQ2LWE0OTUtMjU4M2RlNzU1YTMzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjNkYzlhMTA4LTc0MDEtZTI0YS04M2Q3LTUyOWZjMzhmZjg3OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PugcXkUAAAHZSURBVHja7NuLToMwGIbh8oUrdXJVE+/O60BnIGvI6In/WNZkMdG4+T7DhrbZ8BPCEi48EC4+3gAH35/Xnw2dPLA2FQPc/h739Ze9j2FtuZUAfHeG8Cp+TgF8doRwFD+lAJZOEFLxS24O8I5QHJ+aBL0iVMXn7gO8IVTHP8aYedIN4TE+IoSQe2KF+K/obyyKL70TtH4lNMfX3ApbRTgVX7sWsIZwOr5lMWQFgSS+dTWojUAWf2Y5rIVAGn92P0AagTyeYkNECoElnmpHiBuBLZ5yS4wLgTWeEoADgT2eGoASQSSeA4ACQSyeC+AMgmg8J0ALgng8N0ANgkp8yYYIJcLRpkrQipcCyCEMWvH/L747HeZezb261INC/CI1B5TMCSrvvBaAuSENkPoXUNleg3L8HJS310bl+PigUuXcYVSO3wLVDl9gIF5iU0UFoPb2VgUBRuLVEGAoXgUBxuLFEWAwXhQBRuPFEGA4XgQBxuPZEeAgnhUBTuLZEOAongUBzuLJEeAwnhQBTuPJEOA4ngQBzuP3CHMtAjqIjxGmWgR0Et+MgI7imxDGzuL3CFt8/HVKAfQQX4LwfMcTH531HL+/qos/Ntdb/NGcUHQFXGK8T4evDvArwAChrzwgBRnVsAAAAABJRU5ErkJggg==';
			SpriteAsset.NULL_FRAME_DATA = [[new SpriteFrame([0, 0, 64, 64, 0, 0])]];

			SpriteAsset._NULL = new SpriteAsset(null, null, null);
			SpriteAsset._NULL.error = true;
		}

		public setSpriteSource(sprite:app.model.Sprite)
		{
			if(this.error || this.loaded > 0)
			{
				const src = this.error ? SpriteAsset.SPRITE_ERROR_IMG : SpriteAsset.SPRITE_LOADING_IMG;
				sprite.setSrc(src, SpriteAsset.NULL_FRAME_DATA, 1, 1);

				if(!this.error)
				{
					this.queuedSprites.push(sprite);
				}
			}
			else
			{
				sprite.setSrc(this.sheet, this.palettes, this.paletteCount, this.frameCount);
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

		static get NULL():app.assets.SpriteAsset
		{
			return this._NULL;
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