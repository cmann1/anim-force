namespace app.model
{

	import EventDispatcher = events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;

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
		}

		public prepareForDrawing()
		{
			for(var child of this.children)
			{
				child.prepareForDrawing(0, 0, 1, 1, 0, this.drawList);
			}
		}

		public draw(ctx:CanvasRenderingContext2D)
		{
			this.drawList.clear();
			this.prepareForDrawing();

			ctx.save();
			var drawList:Node[] = this.drawList.list;
			drawList.sort(Model.nodeDrawOrder);
			for(var node of drawList)
			{
				node.draw(ctx);
			}
			ctx.restore();

			ctx.save();
			for(var child of this.children)
			{
				child.drawControls(ctx);
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

		protected static nodeDrawOrder(a:Node, b:Node):number
		{
			if(a.layer < b.layer)
			{
				return -1;
			}
			if(a.layer > b.layer)
			{
				return 1;
			}

			if(a.subLayer < b.subLayer)
			{
				return -1;
			}
			if(a.subLayer > b.subLayer)
			{
				return 1;
			}

			return a.drawIndex - b.drawIndex;
		}

		/*
		 * Events
		 */

		public onStructureChange(type:string, parent:Node, source:Node, index:number)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, parent, source, index));
		}
	}

}