namespace app.model.events
{

	import Node = app.model.Node;
	import Event = app.events.Event;

	export class PropertyChangeEvent extends Event
	{

		constructor(type:string)
		{
			super(type, null);
		}

	}

}