namespace events
{

	import Node = app.model.Node;

	export class PropertyChangeEvent extends Event
	{

		constructor(type:string)
		{
			super(type, null);
		}

	}

}