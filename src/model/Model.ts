namespace app.model
{

	import EventDispatcher = events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;
	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Model extends ContainerNode
	{

		private selectedNode:Node = null;
		private highlightedNode:Node = null;

		protected drawList:DrawList = new DrawList();

		/// Events

		public selectionChange:EventDispatcher<Model> = new EventDispatcher<Model>();

		constructor()
		{
			super('Unnamed Model');
			this.model = this;
			this.type = 'model';
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number)
		{
			console.error('Use drawModel instead');
		}

		public drawModel(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			this.drawList.clear();

			var i = 0;
			for(var child of this.children)
			{
				child.prepareForDrawing(0, 0, worldScale, 1, 1, 0, this.drawList, viewport);

				if(i++ == 0)
				{
					this.childrenWorldAABB.from(child.worldAABB);
				}
				else
				{
					this.childrenWorldAABB.union(child.worldAABB);
				}
			}

			this.worldAABB.from(this.childrenWorldAABB);

			ctx.save();
			var drawList:Node[] = this.drawList.list;
			drawList.sort(this.nodeDrawOrder);
			for(var node of drawList)
			{
				node.draw(ctx, worldScale);
			}
			ctx.restore();

			ctx.save();

			for(var child of this.children)
			{
				if(child != this.selectedNode)
				{
					child.drawControls(ctx, worldScale, viewport);
				}
			}

			if(this.selectedNode)
			{
				this.selectedNode.drawControls(ctx, worldScale, viewport);
			}

			if(Config.drawAABB)
			{
				// this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
				this.worldAABB.draw(ctx, worldScale, '#0FF');
			}

			ctx.restore();
		}

		public setHighlighted(highlighted:boolean)
		{
			if(highlighted)
			{
				this.setHighlightedNode(null);
			}
		}

		public setHighlightedNode(node:Node)
		{
			if(this.highlightedNode == node) return;

			if(this.highlightedNode)
			{
				this.highlightedNode.highlighted = false;
			}

			if((this.highlightedNode = node))
			{
				this.highlightedNode.highlighted = true;
			}

			this.selectionChange.dispatch(this, new SelectionEvent('highlight', node));
		}

		public setSelected(selected:boolean)
		{
			if(selected)
			{
				this.setSelectedNode(null);
			}
		}

		public setSelectedNode(node:Node)
		{
			if(this.selectedNode == node) return;

			if(this.selectedNode)
			{
				this.selectedNode.selected = false;
			}

			if((this.selectedNode = <Node>node))
			{
				this.selectedNode.selected = true;
			}

			this.selectionChange.dispatch(this, new SelectionEvent('selection', <Node>node));
		}

		public getSelectedNode():Node
		{
			return this.selectedNode;
		}

		public clear():void
		{
			this.selectedNode = null;
			this.highlightedNode = null;

			super.clear();
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.selectedNode && this.selectedNode.hitTest(x, y, worldScaleFactor, result))
			{
				return true;
			}

			return super.hitTest(x, y, worldScaleFactor, result);
		}

		protected nodeDrawOrder = (a:Node, b:Node):number =>
		{
			if(a.layer < b.layer || b == this.selectedNode)
			{
				return -1;
			}
			if(a.layer > b.layer || a == this.selectedNode)
			{
				return 1;
			}

			if(a.subLayer < b.subLayer || b == this.selectedNode)
			{
				return -1;
			}
			if(a.subLayer > b.subLayer || a == this.selectedNode)
			{
				return 1;
			}

			return a.drawIndex - b.drawIndex;
		};

		/*
		 * Events
		 */

		public onStructureChange(type:string, parent:ContainerNode, source:Node, index:number, other:Node)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index, other));
		}
	}

}