namespace app.assets
{

	export class SpriteFrame
	{
		public x:number;
		public y:number;
		public width:number;
		public height:number;
		public dfOriginX:number;
		public dfOriginY:number;

		constructor(data:number[])
		{
			this.x = data[0];
			this.y = data[1];
			this.width = data[2];
			this.height = data[3];
			this.dfOriginX = data[4];
			this.dfOriginY = data[5];
		}

	}

}