namespace app.viewport
{

	export class Layer
	{

		public visible = true;
		public locked = false;
		public subLayer:number;
		public layer:number;

		constructor(layer:number, subLayer:number)
		{
			this.layer = layer;
			this.subLayer = subLayer;
		}

	}

}