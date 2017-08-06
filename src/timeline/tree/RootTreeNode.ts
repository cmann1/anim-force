namespace app.timeline.tree
{

	import Bone = app.model.Bone;

	export class RootTreeNode extends ContainerTreeNode
	{

		public handleDragOver(treeNode:TreeNode, x:number, y:number, recurse:boolean=true):boolean
		{
			if(treeNode == this) return false;

			if(y < this.$item.height() * 0.5)
			{
				return false;
			}

			return super.handleDragOver(treeNode, x, y);
		}

	}

}