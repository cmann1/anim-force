namespace math
{

	export class Rectangle
	{

		public x:number;
		public y:number;
		public width:number;
		public height:number;

		constructor(x:number=0, y:number=0, width:number=0, height:number=0)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}

		public set(x:number, y:number, width:number, height:number)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}

	}

}