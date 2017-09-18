namespace app.model
{

	import Node = app.model.Node;
	import EventDispatcher = app.events.EventDispatcher;
	import LoadData = app.projects.LoadData;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;

	export class EventNode extends Node
	{

		public event:string = null;

		// TODO: Prevent event node positions from being keyframed
		constructor(name:string=null)
		{
			super(name);

			this.type = 'event';
		}

		get name():string
		{
			return this._name || 'Events-' + this.id;
		}

		public save():any
		{
			var data = super.save();

			data.offsetX = this.offsetX;
			data.offsetY = this.offsetY;

			return data;
		}

		public load(data:LoadData):EventNode
		{
			super.load(data);

			this.offsetX = data.get('offsetX');
			this.offsetY = data.get('offsetY');

			return this;
		}

	}

}