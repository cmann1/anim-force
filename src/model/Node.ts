namespace app.model
{

	import EventDispatcher = events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import PropertyChangeEvent = events.PropertyChangeEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Node
	{
		static nextId:number = 0;

		public id:number;
		public type:string;
		public canHaveChildren:boolean = false;
		protected _name:string;

		public model:Model;
		public parent:ContainerNode;

		/// Events

		public propertyChange:EventDispatcher<Node> = new EventDispatcher<Node>();
		public structureChange:EventDispatcher<Node> = new EventDispatcher<Node>();

		/// Properties

		public offsetX:number = 0;
		public offsetY:number = 0;
		public rotation:number = 0;
		public scaleX:number = 1;
		public scaleY:number = 1;

		public layer:number = 17;
		public subLayer:number = 19;

		/// Rendering related

		public worldAABB:AABB = new AABB();
		public worldX:number = 0;
		public worldY:number = 0;
		public worldRotation:number = 0;
		public drawIndex:number = 0;

		public selected:boolean = false;
		public highlighted:boolean = false;

		/// UI

		public collapsed:boolean = false;

		///

		constructor(name:string)
		{
			this.id = Node.nextId++;
			this._name = name;
		}

		public setModel(model:Model)
		{
			this.model = model;
		}

		public setSelected(selected:boolean)
		{
			this.model.setSelectedNode(selected ? this : null);
		}

		public setHighlighted(highlighted:boolean)
		{
			this.model.setHighlightedNode(highlighted ? this : null);
		}

		public previous(node:Node=null)
		{
			if(node) return node;
			if(!this.parent) return this;

			return this.parent.previous(this);
		}

		public next(node:Node=null)
		{
			if(node) return node;
			if(!this.parent) return this;

			return this.parent.next(this);
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean { return false; }

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			if(interaction.part == 'base')
			{
				const worldCentreX = this.parent ? this.parent.worldEndPointX : 0;
				const worldCentreY = this.parent ? this.parent.worldEndPointY : 0;
				const worldRotation = this.parent ? this.parent.worldRotation : 0;
				this.offsetX = x - worldCentreX;
				this.offsetY = y - worldCentreY;
				const local = Node.rotate(this.offsetX, this.offsetY, -worldRotation);
				const localOffset = Node.rotate(interaction.x, interaction.y, interaction.offset);
				this.offsetX = local.x - localOffset.x;
				this.offsetY = local.y - localOffset.y;

				return true;
			}

			return false;
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			const offset = Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);

			this.worldX = worldX + offset.x;
			this.worldY = worldY + offset.y;

			this.worldRotation = worldRotation + this.rotation;
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number) { }

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB) { }

		get name():string
		{
			return this._name || 'Untitled ' + this.type.toTitleCase() + ' ' + this.id;
		}

		set name(value:string)
		{
			value = $.trim(value);

			if(value == this._name) return;

			this._name = value;
			this.onPropertyChange('name');
		}

		static rotate(x, y, angle)
		{
			return {
				x: Math.cos(angle) * x - Math.sin(angle) * y,
				y: Math.sin(angle) * x + Math.cos(angle) * y
			}
		}

		/*
		 * Events
		 */

		protected onStructureChange(type:string, parent:ContainerNode, target:Node, index:number, other:Node)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, target, index, other));

			if(this.parent)
			{
				this.parent.onStructureChange(type, parent, target, index, other);
			}
			else if(this.model)
			{
				this.model.onStructureChange(type, parent, target, index, other);
			}
		}

		protected onPropertyChange(type:string)
		{
			this.propertyChange.dispatch(this, new PropertyChangeEvent(type));
		}

	}

}