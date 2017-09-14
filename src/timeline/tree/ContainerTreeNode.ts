namespace app.timeline.tree
{

	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;

	export class ContainerTreeNode extends TreeNode
	{

		public node:ContainerNode;

		public $children:JQuery = null;
		public $foldIcon:JQuery = null;

		public children:TreeNode[] = [];
		public childrenVisible:boolean = true;

		constructor(tree:TimelineTree, nodeType:string, node:Node, allowFold=true)
		{
			super(tree, nodeType, node);

			this.$element.append(this.$children = $('<div class="children"></div>'));
			if(allowFold)
			{
				this.$item.prepend(
					this.$foldIcon = $('<i class="fa fold-icon"></i>')
						.on('mousedown', this.onFoldIconMouseDown)
						.on('click', this.onToggleChildren)
				);
			}

			for(var child of this.node.children)
			{
				this.addChild(tree.addTreeNode(TimelineTree.fromNode(tree, child)));
			}
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
			(<ContainerNode> this.node).collapsed = !this.childrenVisible;
			this.tree.onNodeCollapse(this);
		}

		public clear()
		{
			this.$children.empty();
			this.children = [];
		}

		public addChild(node:TreeNode)
		{
			if(node.parent) node.parent.removeChild(node);

			node.parent = this;
			this.children.push(node);
			this.$children.append(node.$element);
		}

		public addChildBefore(node:TreeNode, sibling:TreeNode)
		{
			if(!sibling) this.addChild(node);
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
			this.node.addChild(node);

			return node;
		}

		public addNodeAfter(node:Node, sibling:TreeNode):Node
		{
			(<ContainerNode> this.node).addChildAfter(node, sibling.node);

			return node;
		}

		public handleDragOver(treeNode:TreeNode, x:number, y:number, recurse:boolean=true, forceLast:boolean=false):boolean
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

					if(y >= childY1 && y <= childY2 || (forceLast && i == $children.length - 1))
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

		protected onFoldIconMouseDown = (event) =>
		{
			event.stopPropagation();
			event.preventDefault();
			return false;
		};

		protected onToggleChildren = (event) =>
		{
			this.setOpen(!this.childrenVisible);

			event.stopPropagation();
			event.preventDefault();
			return false;
		};

	}

}