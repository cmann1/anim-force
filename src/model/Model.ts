namespace app.model
{

	import EventDispatcher = events.EventDispatcher;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;

	export class Model extends Node
	{

		public rootBones:Bone[] = [];
		public rootBoneCount = 0;

		private selectedNode:Node = null;
		private highlightedNode:Node = null;

		protected drawList:DrawList = new DrawList();

		/// Events

		public selectionChange:EventDispatcher<Model> = new EventDispatcher<Model>();

		constructor()
		{
			super('Unnamed Model');
			this.canHaveChildren = true;
		}

		public addChild(bone:Bone):Bone
		{
			if(bone.parent == this)
			{
				return bone;
			}

			if(bone.parent)
			{
				bone.parent.removeChild(bone);
			}

			bone.parent = this;
			bone.setModel(this);
			this.rootBones.push(bone);
			this.rootBoneCount++;

			this.onStructureChange('addChild', bone, this.rootBoneCount - 1);

			return bone;
		}

		public removeChild(bone:Bone):Bone
		{
			if(bone.parent == this)
			{
				const index = this.rootBones.indexOf(bone);

				bone.parent = null;
				bone.setModel(null);
				this.rootBones.splice(index, 1);
				this.rootBoneCount--;

				this.onStructureChange('removeChild', bone, index);
			}

			return bone;
		}

		public clear():void
		{
			for(let bone of this.rootBones)
			{
				bone.setModel(null);
			}

			this.setSelected(null);

			this.rootBones = [];
			this.rootBoneCount--;

			this.onStructureChange('clear', null, -1);
		}

		public prepareForDrawing()
		{
			for(var bone of this.rootBones)
			{
				bone.prepareForDrawing(0, 0, 1, 1, 0, this.drawList);
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
			for(var bone of this.rootBones)
			{
				bone.drawControls(ctx);
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

		public onStructureChange(type:string, source:Node, index:number)
		{
			this.structureChange.dispatch(this, new StructureChangeEvent(type, source, index));
		}
	}

}