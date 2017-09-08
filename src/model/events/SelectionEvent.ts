namespace app.model.events
{

	import Node = app.model.Node;
	import Event = app.events.Event;

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