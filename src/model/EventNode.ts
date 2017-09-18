namespace app.model
{

	import Node = app.model.Node;
	import EventDispatcher = app.events.EventDispatcher;
	import LoadData = app.projects.LoadData;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class EventNode extends Node
	{

		protected size = 25;

		public event:string = null;

		constructor(name:string=null)
		{
			super(name);

			this.type = 'event';
		}

		get name():string
		{
			return this._name || 'Events-' + this.id;
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(!Config.showControls || !this.worldAABB.contains(x, y)) return false;

			if(this.hitTestHandles(x, y, worldScaleFactor, result))
			{
				return true;
			}

			x -= this.worldX;
			y -= this.worldY;
			const w = this.size;

			if(x >= -w && x <= w && y >= -w && y <= w)
			{
				result.x = x;
				result.y = y;
				result.offset = this.rotation;
				result.node = this;
				result.part = 'base';
				return true;
			}

			return false;
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			this.worldX = this.offsetX;
			this.worldY = this.offsetY;

			this.worldRotation = 0;

			this.prepareAABB(worldScale);

			this.worldAABB.unionF(
				this.worldX - this.size, this.worldY - this.size,
				this.worldX + this.size, this.worldY + this.size
			);

			if(drawList && this.worldAABB.intersects(viewport))
			{
				drawList.add(this);
			}
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.visible || !this.worldAABB.intersects(viewport)) return;

			ctx.save();

			const w = this.size;
			const size = this.size * 2 * worldScale;

			ctx.translate(this.worldX * worldScale, this.worldY * worldScale);
			ctx.translate(-w * worldScale, -w * worldScale);

			ctx.save();
			ctx.scale(worldScale, worldScale);
			ctx.font = '42px FontAwesome';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('\uf0ae', w, w + 2);
			ctx.restore();

			ctx.setLineDash([2, 2]);
			ctx.strokeStyle = this.selected ? Config.selected : (this.highlighted ? Config.highlighted : Config.control);
			ctx.lineWidth = this.selected ? 3 : 1;
			ctx.beginPath();
			ctx.rect(0, 0, size, size);
			ctx.stroke();

			ctx.restore();

			super.drawControls(ctx, worldScale, viewport);

			if(Config.drawAABB)
			{
				this.worldAABB.draw(ctx, worldScale);
			}
		}

		//

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