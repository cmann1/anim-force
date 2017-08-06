namespace events
{

	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;

	export class StructureChangeEvent extends Event
	{
		public parent:ContainerNode;
		public target:Node;
		public index:number;
		public other:Node;

		constructor(type:string, parent:ContainerNode, target:Node, index:number, other:Node)
		{
			super(type, null);

			this.parent = parent;
			this.target = target;
			this.index = index;
			this.other = other;
		}

	}

}