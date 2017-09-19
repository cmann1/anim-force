namespace app.model
{

	import Node = app.model.Node;
	import EventDispatcher = app.events.EventDispatcher;
	import LoadData = app.projects.LoadData;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Anchor extends BoxNode
	{

		// TODO: Provide an interface for enabling/disabling rotation and scale for anchor nodes

		constructor(name:string=null)
		{
			super(name, false, false);
			this.drawOutline = false;

			this.type = 'anchor';
			this.boxWidth = this.boxHeight = 40;

			this.hitRadius = this.boxWidth * 0.5 * 0.75;
		}

		get name():string
		{
			return this._name || 'anchor-' + this.id;
		}
		set name(value:string)
		{
			this.setName(value);
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.visible || !this.worldAABB.intersects(viewport)) return;

			ctx.save();

			const scaleX = this.scaleX * worldScale;
			const scaleY = this.scaleY * worldScale;
			const w = this.boxWidth * 0.5;
			const h = this.boxHeight * 0.5;

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.rotate(this.worldRotation);

			ctx.fillStyle = Config.control;
			ctx.beginPath();
			ctx.arc(0, 0, this.hitRadius, 0, Math.PI * 2);
			ctx.moveTo(-w * scaleX, 0);
			ctx.lineTo(w * scaleX, 0);
			ctx.moveTo(0, -h * scaleY);
			ctx.lineTo(0, h * scaleY);
			ctx.stroke();

			ctx.restore();

			super.drawControls(ctx, worldScale, viewport);
		}

		//

		protected getInstance():Node
		{
			return new Anchor();
		}

		public save():any
		{
			var data = super.save();

			data.allowRotation = this.allowRotation;
			data.allowScale = this.allowScale;

			return data;
		}

		public load(data:LoadData):Anchor
		{
			super.load(data);

			this.allowRotation = data.get('allowRotation');
			this.allowScale = data.get('allowScale');

			return this;
		}

	}

}