namespace app.model
{

	import Node = app.model.Node;
	import EventDispatcher = app.events.EventDispatcher;
	import LoadData = app.projects.LoadData;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class EventNode extends BoxNode
	{

		public event:string = null;

		constructor(name:string=null)
		{
			super(name, false, false);
			this.boxWidth = this.boxHeight = 50;

			this.type = 'event';
		}

		get name():string
		{
			return this._name || 'Events-' + this.id;
		}
		set name(value:string)
		{
			this.setName(value);
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.visible || !this.worldAABB.intersects(viewport)) return;

			ctx.save();

			const w = this.boxWidth * 0.5;

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.translate(-w * worldScale, -w * worldScale);

			ctx.scale(worldScale, worldScale);
			ctx.font = '42px FontAwesome';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('\uf0ae', w, w + 2);

			ctx.restore();

			super.drawControls(ctx, worldScale, viewport);
		}

		public setEvent(event:string)
		{
			if(this.event == event) return;

			this.event = event;
			this.onPropertyChange('event');
		}

		//

		protected getInstance():Node
		{
			return null;
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