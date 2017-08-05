namespace events
{

	import Node = app.model.Node;

	export class StructureChangeEvent extends Event
	{
		public parent:Node;
		public target:Node;
		public index:number;

		constructor(type:string, parent:Node, target:Node, index:number)
		{
			super(type, null);

			this.parent = parent;
			this.target = target;
			this.index = index;
		}

	}

}