namespace app.assets
{

	export class SpriteManager
	{
		private basePath;
		private spriteSets:any = {};
		private spriteSetsList:any = null;

		private ready = false;
		private readyCallback:() => void;

		constructor(basePath, readyCallback:() => void)
		{
			this.basePath = basePath;
			this.readyCallback = readyCallback;

			SpriteAsset.init();

			$.ajax({
				dataType: 'json',
				url: this.basePath + 'sprites.json',
				success: this.onSpritesDataLoad
			});
		}

		public isReady()
		{
			return this.ready;
		}

		public loadSprite(spriteSetName, spriteName):SpriteAsset
		{
			const spriteSet = this.spriteSets[spriteSetName];
			if(!spriteSet) return null;

			const sprite = spriteSet.sprites[spriteName];
			if(!sprite) return null;

			if(sprite.asset)
			{
				return sprite.asset;
			}

			return sprite.asset = new SpriteAsset(spriteSetName, spriteName, `${this.basePath}${spriteSetName}/${spriteName}`);
		}

		public getSpriteList()
		{
			return this.spriteSetsList;
		}

		/*
		 * Events
		 */

		protected onSpritesDataLoad = (data) =>
		{
			this.spriteSetsList = data;

			for(var spriteSet of data)
			{
				var sprites = {};
				for(var spriteData of spriteSet.sprites)
				{
					sprites[spriteData.name] = {asset: null};
				}

				this.spriteSets[spriteSet.name] = {
					sprites: sprites,
					spriteList: spriteSet.sprites
				}
			}

			this.ready = true;

			if(this.readyCallback)
			{
				this.readyCallback();
			}
		}

	}

}