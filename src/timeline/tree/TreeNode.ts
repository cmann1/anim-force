namespace app.timeline.tree
{

	import Node = app.model.Node;
	import Model = app.model.Model;
	import Key = KeyCodes.Key;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;

	export class TreeNode
	{
		private static $renameInput:JQuery;
		private static renameNode:TreeNode;

		public tree:TimelineTree;
		public node:Node;

		public parent:ContainerTreeNode = null;

		public $element:JQuery;
		public $item:JQuery;
		public $label:JQuery = null;

		constructor(tree:TimelineTree, nodeType:string, node:Node)
		{
			this.tree = tree;
			this.node = node;
			this.node.propertyChange.on(this.onNodePropertyChange);

			this.$element = $(
				'<div class="model-node">' +
					'<div class="item">' +
						'<i class="icon"></i>' +
						'<label> ' + node.name  + '</label>' +
					'</div>' +
				'</div>'
			)
				.data('tree-node', this);

			this.$label = this.$element.find('label')
				.on('dblclick', this.onLabelDblClick);

			this.$element.addClass(nodeType);
			this.$item = this.$element.find('.item')
				.on('mousedown', this.onMouseDown)
				.on('mouseenter', this.onMouseEnter)
				.on('mouseleave', this.onMouseExit);
		}

		get highlighted():boolean
		{
			return this.$item.hasClass('highlighted');
		}

		set highlighted(value:boolean)
		{

			this.$item.toggleClass('highlighted', value);
		}

		get selected():boolean
		{
			return this.$item.hasClass('selected');
		}

		set selected(value:boolean)
		{
			this.$item.toggleClass('selected', value);
		}

		//

		public deleteNode()
		{
			this.node.parent.removeChild(this.node);
		}

		public startRename()
		{
			if(TreeNode.renameNode == this) return;

			if(!TreeNode.$renameInput)
			{
				TreeNode.$renameInput = $('<input type="text" class="rename" />')
					.on('blur', TreeNode.onRenameInputBlur)
					.on('keydown', TreeNode.onRenameKeyDown);
			}

			if(TreeNode.renameNode)
			{
				TreeNode.renameNode.stopRename(false);
			}

			this.$label.after(TreeNode.$renameInput).detach();
			TreeNode.$renameInput
				.focus()
				.val(this.node.name);
			TreeNode.$renameInput.select();
			TreeNode.renameNode = this;
		}

		public stopRename(accept=true)
		{
			if(TreeNode.renameNode != this) return;

			if(accept)
			{
				this.node.name = TreeNode.$renameInput.val();
			}

			TreeNode.renameNode = null;
			TreeNode.$renameInput.after(this.$label).detach();

			this.tree.focus();
		}

		public handleDragOver(treeNode:TreeNode, x:number, y:number, recurse:boolean=true):boolean
		{
			if(treeNode == this) return false;

			if(y < this.$item.height() * 0.5)
			{
				this.$element.before(treeNode.$element);
			}
			else
			{
				this.$element.after(treeNode.$element);
			}

			return true;
		}

		/*
		 * Events
		 */

		protected onNodePropertyChange = (sender:Node, event:PropertyChangeEvent) =>
		{
			const property:string = event.type;

			if(property == 'name')
			{
				this.$label.text(this.node.name);
			}
		};

		protected onLabelDblClick = (event) =>
		{
			this.startRename();
			event.preventDefault();
			return false;
		};

		protected onMouseDown = (event) =>
		{
			if(TreeNode.renameNode == this) return;

			this.node.setSelected(true);
			this.tree.waitForDrag(this, event);

			// event.preventDefault();
			// return false;
		};

		protected onMouseEnter = (event) =>
		{
			this.node.setHighlighted(true);
		};

		protected onMouseExit = (event) =>
		{
			this.node.setHighlighted(false);
		};

		private static onRenameInputBlur(event)
		{
			if(TreeNode.renameNode)
			{
				TreeNode.renameNode.stopRename(false);
			}
		}

		private static onRenameKeyDown(event)
		{
			const keyCode = event.keyCode;

			if(keyCode == Key.Enter)
			{
				TreeNode.renameNode.stopRename(true);
			}

			else if(keyCode == Key.Escape)
			{
				TreeNode.renameNode.stopRename(false);
			}

			else if(keyCode == Key.Tab)
			{
				const treeNode:TreeNode = TreeNode.renameNode;
				TreeNode.renameNode.stopRename(true);
				const nextNode:Node = event.shiftKey ? treeNode.node.previous() : treeNode.node.next();

				if(nextNode)
				{
					treeNode.tree.initiateRenameForNode(nextNode);
				}

				event.preventDefault();
				return false;
			}
		}

	}

}