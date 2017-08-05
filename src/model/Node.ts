namespace app.model
{

	import EventDispatcher = events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import PropertyChangeEvent = events.PropertyChangeEvent;

	export class Node
	{
		static nextId:number = 0;

		public id:number;
		public type:string;
		public canHaveChildren:boolean = false;
		protected _name:string;

		public model:Model;
		public parent:Node;

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

		public setHighlighted(selected:boolean)
		{
			this.model.setHighlightedNode(selected ? this : null);
		}

		public addChild(child:Node):Node { return null; }
		public removeChild(child:Node, triggerEvent=true):Node { return null; }
		public getChildAt(index:number):Node { return null; }

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

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList)
		{
			const offset = Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);

			this.worldX = worldX + offset.x;
			this.worldY = worldY + offset.y;

			this.worldRotation = worldRotation + this.rotation;
		}

		public draw(ctx:CanvasRenderingContext2D) { }

		public drawControls(ctx:CanvasRenderingContext2D) { }

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

		protected onStructureChange(type:string, parent:Node, target:Node, index:number)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, target, index));

			if(this.parent)
			{
				this.parent.onStructureChange(type, parent, target, index);
			}
			else if(this.model)
			{
				this.model.onStructureChange(type, parent, target, index);
			}
		}

		protected onPropertyChange(type:string)
		{
			this.propertyChange.dispatch(this, new PropertyChangeEvent(type));
		}


	}

}