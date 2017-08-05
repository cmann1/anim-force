namespace app.timeline.tree
{

	import Node = app.model.Node;
	import Model = app.model.Model;
	import Key = KeyCodes.Key;
	import PropertyChangeEvent = events.PropertyChangeEvent;

	export class TreeNode
	{
		private static $renameInput:JQuery;
		private static renameNode:TreeNode;

		public tree:TimelineTree;
		public node:Node;

		public parent:TreeNode = null;
		public children:TreeNode[];

		public $element:JQuery;
		public $item:JQuery;
		public $children:JQuery = null;
		public $foldIcon:JQuery = null;
		public $label:JQuery = null;
		public childrenVisible:boolean = true;

		constructor(tree:TimelineTree, nodeType:string, node:Node|Model, allow_children:boolean)
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
			);

			this.$label = this.$element.find('label')
				.on('dblclick', this.onLabelDblClick);

			this.$element.addClass(nodeType);
			this.$item = this.$element.find('.item')
				.on('mousedown', this.onMouseDown)
				.on('mouseenter', this.onMouseEnter)
				.on('mouseleave', this.onMouseExit);

			if(allow_children)
			{
				this.children = [];
				this.$element.append(this.$children = $('<div class="children"></div>'));
				this.$item.prepend(
					this.$foldIcon = $('<i class="fa fold-icon"></i>').on('click', this.onToggleChildren)
				);
			}
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

		public removeChild(node:TreeNode)
		{
			if(node.parent != this) return;

			node.$element.remove();
			node.parent = null;
			this.children.splice(this.children.indexOf(node), 1);
		}

		public addNode(node:Node):Node
		{
			this.node.addChild(node);

			return node;
		}

		public deleteNode()
		{
			this.node.parent.removeChild(this.node);
		}

		get selected():boolean
		{
			return this.$item.hasClass('selected');
		}

		set selected(value:boolean)
		{

			this.$item.toggleClass('selected', value);
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
			this.node.setSelected(true);
		};

		protected onMouseEnter = (event) =>
		{
			this.node.setHighlighted(true);
		};

		protected onMouseExit = (event) =>
		{
			this.node.setHighlighted(false);
		};

		protected onToggleChildren = (event) =>
		{
			this.childrenVisible = !this.childrenVisible;

			if(this.childrenVisible)
			{
				this.$children.slideDown(50);
			}
			else
			{
				this.$children.slideUp(50);
			}

			this.$foldIcon.toggleClass('collapsed', !this.childrenVisible);
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