namespace app.timeline.tree
{

	import Bone = app.model.Bone;
	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;

	export class RootTreeNode extends ContainerTreeNode
	{

		constructor(tree:TimelineTree, nodeType:string, node:ContainerNode)
		{
			super(tree, nodeType, node, false);
		}

		public handleDragOver(treeNode:TreeNode, x:number, y:number, recurse:boolean=true):boolean
		{
			if(treeNode == this) return false;

			if(y < this.$item.height() * 0.5)
			{
				return false;
			}

			return super.handleDragOver(treeNode, x, y, true, true);
		}

		protected canHide():boolean
		{
			return true;
		}

		protected canLock():boolean
		{
			return true;
		}

	}

}