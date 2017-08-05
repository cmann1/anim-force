namespace app.timeline.tree
{

	import Node = app.model.Node;
	import Model = app.model.Model;

	export class TreeNode
	{
		public node:Node;

		public parent:TreeNode = null;
		public children:TreeNode[];

		public $element:JQuery;
		public $item:JQuery;
		public $children:JQuery = null;
		public $foldIcon:JQuery = null;
		public childrenVisible:boolean = true;

		constructor(nodeType:string, node:Node|Model, allow_children:boolean)
		{
			this.node = node;

			this.$element = $(
				'<div class="model-node">' +
					'<div class="item">' +
						'<i class="icon"></i>' +
						'<label> ' + node.name  + '</label>' +
					'</div>' +
				'</div>'
			);

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

		get selected():boolean
		{
			return this.$item.hasClass('selected');
		}

		set selected(value:boolean)
		{
			this.$item.toggleClass('selected', value);
		}

		/*
		 * Events
		 */

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
		}

	}

}