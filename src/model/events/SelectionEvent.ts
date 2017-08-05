namespace events
{

	import Node = app.model.Node;

	export class SelectionEvent extends Event
	{
		public target:Node;

		constructor(type:string, target:Node)
		{
			super(type, null);
			this.target = target;
		}

	}

}