namespace app.timeline.tree
{

	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;

	export class ContainerTreeNode extends TreeNode
	{

		public $children:JQuery = null;
		public $foldIcon:JQuery = null;

		public children:TreeNode[] = [];
		public childrenVisible:boolean = true;

		constructor(tree:TimelineTree, nodeType:string, node:Node)
		{
			super(tree, nodeType, node);

			this.$element.append(this.$children = $('<div class="children"></div>'));
			this.$item.prepend(
				this.$foldIcon = $('<i class="fa fold-icon"></i>').on('click', this.onToggleChildren)
			);
		}

		public setOpen(open:boolean=true)
		{
			if(this.childrenVisible == open) return;

			this.childrenVisible = open;

			if(this.childrenVisible)
			{
				this.$children.slideDown(50);
			}
			else
			{
				this.$children.slideUp(50);
			}

			this.$foldIcon.toggleClass('collapsed', !this.childrenVisible);
		}

		public clear()
		{
			this.$children.empty();
			this.children = [];
		}

		public addChild(node:TreeNode)
		{
			if(node.parent == this) return;

			if(node.parent) node.parent.removeChild(node);

			node.parent = this;
			this.children.push(node);
			this.$children.append(node.$element);
		}

		public addChildBefore(node:TreeNode, sibling:TreeNode)
		{
			if(sibling.parent != this) return;

			if(node.parent) node.parent.removeChild(node);

			node.parent = this;
			this.children.splice(this.children.indexOf(sibling), 0, node);
			sibling.$element.before(node.$element);
		}

		public removeChild(node:TreeNode)
		{
			if(node.parent != this) return;

			node.$element.detach();
			node.parent = null;
			this.children.splice(this.children.indexOf(node), 1);
		}

		public addNode(node:Node):Node
		{
			(<ContainerNode> this.node).addChild(node);

			return node;
		}

		public handleDragOver(treeNode:TreeNode, x:number, y:number, recurse:boolean=true):boolean
		{
			if(treeNode == this) return false;

			if(y < this.$item.height() * 0.5 || (!recurse && y < this.$element.height() * 0.5))
			{
				this.$element.before(treeNode.$element);
			}
			else if(!this.childrenVisible || (!recurse && y >= this.$element.height() * 0.5))
			{
				this.$element.after(treeNode.$element);
			}
			else if(y <= this.$item.height())
			{
				this.setOpen(true);
				this.$children.prepend(treeNode.$element);
			}
			else
			{
				y -= this.$item.height();

				const $children = this.$children.children();
				for(let i =0; i < $children.length; i++)
				{
					const $child = $($children[i]);
					const childPos = $child.position();
					const childY1 = childPos.top;
					const childY2 = childY1 + $child.height();

					if(y >= childY1 && y <= childY2)
					{
						this.setOpen(true);
						return (<TreeNode>$child.data('tree-node')).handleDragOver(treeNode, x, y, x > childPos.left);
					}
				}

				this.$element.after(treeNode.$element);
			}

			return true;
		}

		/*
		 * Events
		 */

		protected onToggleChildren = (event) =>
		{
			this.setOpen(!this.childrenVisible);
		};

	}

}