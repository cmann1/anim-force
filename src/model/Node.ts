namespace app.model
{

	import EventDispatcher = app.events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import PropertyChangeEvent = events.PropertyChangeEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import LoadData = app.projects.LoadData;

	const MAX_LAYER = 22;
	const MAX_SUB_LAYER = 24;

	export class Node
	{
		private static nextId:number = 0;
		public static autoId = true;

		public id:number;
		public type:string;
		protected _name:string;

		public canHaveChildren:boolean = false;

		public model:Model;
		public parent:ContainerNode;

		public handles:Handle[] = [];

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
		protected _visible:boolean = true;

		///

		constructor(name:string)
		{
			this.id = Node.getNewId();
			this._name = name;
		}

		public static getNewId():number
		{
			return Node.autoId ? Node.nextId++ : Node.nextId;
		}

		public static getCurrentId():number
		{
			return Node.nextId;
		}

		public static setCurrentId(id:number)
		{
			Node.nextId = id;
		}

		get name():string
		{
			return this._name || 'Untitled ' + this.type.toTitleCase() + ' ' + this.id;
		}

		set name(value:string)
		{
			this.setName(value);
		}

		protected setName(value:string)
		{
			value = $.trim(value);

			if(value == this._name) return;

			this._name = value;
			this.onPropertyChange('name');
		}

		get visible():boolean
		{
			return this._visible;
		}

		set visible(value:boolean)
		{
			if(this._visible == value) return;
			this._visible = value;
			this.onPropertyChange('visible');
		}

		public setModel(model:Model)
		{
			if(model == this.model) return;

			if(this.model)
			{
				this.model.removeNode(this);
			}

			if((this.model = model))
			{
				this.model.addNode(this);
			}
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

		public increaseLayer(amount:number, subLayer=false)
		{
			if(subLayer)
			{
				this.subLayer += amount;
				if(this.subLayer < 0) this.subLayer = 0;
				else if(this.subLayer > MAX_SUB_LAYER) this.subLayer = MAX_SUB_LAYER;
			}
			else
			{
				this.layer += amount;
				if(this.layer < 0) this.layer = 0;
				else if(this.layer > MAX_LAYER) this.layer = MAX_LAYER;
			}
		}

		public resetOffset()
		{
			if(this.offsetX != 0 || this.offsetY != 0)
			{
				this.offsetX = 0;
				this.offsetY = 0;
				this.onPropertyChange('offset');
			}
		}

		public resetScale()
		{
			if(this.scaleX != 1 || this.scaleY != 1)
			{
				this.scaleX = 1;
				this.scaleY = 1;
				this.onPropertyChange('scaleX');
				this.onPropertyChange('scaleY');
			}
		}

		public resetRotation()
		{
			if(this.rotation != 0)
			{
				this.rotation = 0;
				this.onPropertyChange('rotation');
			}
		}

		public flipX()
		{
			this.scaleX = -this.scaleX;
			this.onPropertyChange('scaleX');
		}

		public flipY()
		{
			this.scaleY = -this.scaleY;
			this.onPropertyChange('scaleY');
		}

		//

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			return false;
		}

		public hitTestHandles(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this._visible && Config.showControls)
			{
				// Do it in reverse order so that handles in front are checked first
				for(var i = this.handles.length - 1; i >= 0; i--)
				{
					var handle = this.handles[i];
					if(!handle.active) continue;

					if(handle.hitTest(x, y, worldScaleFactor, result))
					{
						return true;
					}
				}
			}

			return false;
		}

		public globalToLocal(x:number, y:number):{x:number, y:number}
		{
			return MathUtils.rotate(x - this.worldX, y - this.worldY, -this.worldRotation);
		}

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			if(interaction.part == 'base')
			{
				const worldCentreX = this.parent ? this.parent.worldEndPointX : 0;
				const worldCentreY = this.parent ? this.parent.worldEndPointY : 0;
				const worldRotation = this.parent ? this.parent.worldRotation : 0;
				this.offsetX = x - worldCentreX;
				this.offsetY = y - worldCentreY;
				const local = MathUtils.rotate(this.offsetX, this.offsetY, -worldRotation);
				const localOffset = MathUtils.rotate(interaction.x, interaction.y, interaction.offset);
				this.offsetX = local.x - localOffset.x;
				this.offsetY = local.y - localOffset.y;

				if(this.parent)
				{
					this.offsetX /= this.parent.stretchX;
					this.offsetY /= this.parent.stretchY;
				}

				this.onPropertyChange('offset');

				return true;
			}

			if(interaction.part == 'rotation')
			{
				var dx = x - this.worldX;
				var dy = y - this.worldY;

				this.rotation = Math.atan2(dy, dx) - interaction.offset;

				if(interaction.constrain)
				{
					this.rotation = Math.round((this.rotation - interaction.initialX) / (Math.PI * 0.25)) * (Math.PI * 0.25) + interaction.initialX;
				}

				this.onPropertyChange('rotation');

				return true;
			}

			return false;
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			const offset = MathUtils.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);

			this.worldX = worldX + offset.x;
			this.worldY = worldY + offset.y;

			this.worldRotation = worldRotation + this.rotation;
		}

		protected prepareAABB(worldScale:number)
		{
			this.worldAABB.x1 = this.worldX;
			this.worldAABB.y1 = this.worldY;
			this.worldAABB.x2 = this.worldX;
			this.worldAABB.y2 = this.worldY;

			for(var handle of this.handles)
			{
				if(!handle.active) continue;

				handle.expand(this.worldAABB, worldScale);
			}
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number)
		{

		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			for(var handle of this.handles)
			{
				if(handle.active)
				{
					handle.draw(ctx, worldScale, this.selected, this.highlighted);
				}
			}
		}

		//

		protected getInstance():Node
		{
			throw new Error('Node.getInstance must not implemented');
		}

		protected copyFrom(from:Node, recursive=true):Node
		{
			this._name = from.name + '-copy';

			this.offsetX = from.offsetX;
			this.offsetY = from.offsetY;
			this.rotation = from.rotation;
			this.scaleX = from.scaleX;
			this.scaleY = from.scaleY;

			this.layer = from.layer;
			this.subLayer = from.subLayer;

			this.worldX = from.worldX;
			this.worldY = from.worldY;
			this.worldRotation = from.worldRotation;
			this.drawIndex = from.drawIndex;

			this._visible = from._visible;

			return this;
		}

		public clone(recursive=true):Node
		{
			var copy = this.getInstance();
			return copy ? copy.copyFrom(this, recursive) : null;
		}

		public save():any
		{
			return {
				id: this.id,
				type: this.type,
				name: this._name,
				visible: this._visible,
			};
		}

		public load(data:LoadData):Node
		{
			this.id = data.get('id');
			this._name = data.get('name');
			this._visible = data.get('visible');

			return this;
		}

		public static load(data:LoadData):Node
		{
			const type = data.get('type');
			var node:Node;

			if(type == 'bone')
			{
				node = new Bone().load(data);
			}
			else if(type == 'sprite')
			{
				node = new Sprite(null).load(data);
			}
			else if(type == 'event')
			{
				node = new EventNode().load(data);
			}
			else if(type == 'anchor')
			{
				node = new Anchor().load(data);
			}
			else
			{
				throw new Error('Unexpected node type');
			}

			return node;
		}

		/*
		 * Events
		 */

		protected onPropertyChange(type:string)
		{
			this.propertyChange.dispatch(this, new PropertyChangeEvent(type));
		}

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

	}

}