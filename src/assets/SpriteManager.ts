namespace app.assets
{

	export class SpriteManager
	{
		private basePath;
		private spriteSets:any = {};
		private spriteSetsList:any = null;

		private ready = false;

		constructor(basePath)
		{
			this.basePath = basePath;

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

		/*
		 * Events
		 */

		protected onSpritesDataLoad = (data) =>
		{
			this.spriteSetsList = data;

			for(var spriteSet of data)
			{
				var sprites = {};
				for(var spriteName of spriteSet.sprites)
				{
					sprites[spriteName] = {asset: null};
				}

				this.spriteSets[spriteSet.name] = {
					sprites: sprites,
					spriteList: spriteSet.sprites
				}
			}

			this.ready = true;
		}

	}

}