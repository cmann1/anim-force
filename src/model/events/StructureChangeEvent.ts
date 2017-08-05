namespace events
{

	import Node = app.model.Node;

	export class StructureChangeEvent extends Event
	{
		public target:Node;
		public index:number;

		constructor(type:string, target:Node, index:number)
		{
			super(type, null);

			this.target = target;
			this.index = index;
		}

	}

}