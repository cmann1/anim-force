namespace app.timeline.tree
{

	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;
	import Node = app.model.Node;
	import Key = KeyCodes.Key;

	export class TimelineTree
	{

		private $element:JQuery;
		private $container:JQuery;
		private model:Model;
		private rootNode:TreeNode;

		private selectedNode:TreeNode;

		private nodeMap:{[id:string]:TreeNode} = {};

		private $toolbar:JQuery;
		private $toolbarAddMenu:JQuery;
		private $toolbarAddBtn:JQuery;
		private $toolbarAddBoneBtn:JQuery;
		private $toolbarAddSpriteBtn:JQuery;
		private $toolbarAddDeleteBtn:JQuery;

		constructor(elementId, model:Model)
		{
			this.model = model;
			this.$element = $('#' + elementId);
			this.$container = this.$element.find('#timeline-tree-container');

			this.setupToolbar();

			this.$container.append((this.rootNode = new TreeNode(this, 'model', this.model, true)).$element);
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.nodeMap[this.model.id] = this.rootNode;

			this.$element
				.on('mouseenter', this.onMouseEnter)
				.keyup(this.onKeyDown)
				.keyup(this.onKeyUp);
			this.$container.on('click', this.onTreeClick);

			this.selectedNode = this.rootNode;
			this.selectedNode.selected = true;

			this.updateToolbar();
		}

		public getContainer()
		{
			return this.$element;
		}

		private setupToolbar()
		{
			this.$toolbar = this.$element.find('#timeline-tree-toolbar');
			this.$toolbar
				.on('click', 'i', this.onToolbarButtonClick)
				.on('mousewheel', this.onToolbarMouseWheel);
			this.$toolbar.find('.fa-plus').parent()
				.on('mouseenter', this.onToolbarAddHover)
				.on('mouseleave', this.onToolbarAddLeave);
			this.$toolbarAddMenu = this.$toolbar.find('.add-menu');

			this.$toolbarAddBtn = this.$toolbar.find('i.btn-add');
			this.$toolbarAddBoneBtn = this.$toolbar.find('i.btn-add-bone');
			this.$toolbarAddSpriteBtn = this.$toolbar.find('i.btn-add-sprite');
			this.$toolbarAddDeleteBtn = this.$toolbar.find('i.btn-delete');

			tippy(this.$toolbar.find('i').toArray());

			this.$toolbarAddMenu.hide();
		}

		private updateToolbar()
		{
			const isRoot = this.selectedNode == this.rootNode;
			const allowChildren = this.selectedNode.node.canHaveChildren;
			this.$toolbarAddBtn.toggleClass('disabled', !allowChildren);
			this.$toolbarAddBoneBtn.toggleClass('disabled', !allowChildren);
			this.$toolbarAddSpriteBtn.toggleClass('disabled', isRoot || !allowChildren);
			this.$toolbarAddDeleteBtn.toggleClass('disabled', isRoot);

			if(!allowChildren)
			{
				this.showAddMenu(false);
			}
		}
		
		private showAddMenu(show:boolean)
		{
			show = show && this.selectedNode.node.canHaveChildren;
			this.$toolbarAddMenu.stop(true).animate({width:show  ? 'show' : 'hide'}, 250);
		}

		private updateSelection(target:Node)
		{
			const targetNode = target ? this.nodeMap[target.id] : this.rootNode;
			if(targetNode == this.selectedNode) return;

			if(this.selectedNode) this.selectedNode.selected = false;
			if((this.selectedNode = targetNode)) this.selectedNode.selected = true;

			this.selectedNode.$element.scrollintoview({duration: 50});

			this.updateToolbar();
		}

		public focus()
		{
			this.$element.focus();
		}

		public initiateRenameForNode(node:Node)
		{
			if(node)
			{
				const treeNode:TreeNode = this.nodeMap[node.id];
				treeNode.node.setSelected(true);
				treeNode.startRename();
			}
		}

		/*
		 * Events
		 */

		private onTreeClick = (event) =>
		{
			if(event.target == this.$container[0])
			{
				this.model.setSelected(true);
			}
		};

		private onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			if(event.type == 'selection')
			{
				this.updateSelection(event.target);
			}
		};

		private onModelStructureChange = (model:Model, event:StructureChangeEvent) =>
		{
			const type = event.type;
			const parent = event.parent;
			const target = event.target;
			const parentTree:TreeNode = parent ? this.nodeMap[parent.id] : null;
			const targetTree:TreeNode = target ? this.nodeMap[target.id] : null;

			if(type == 'clear')
			{
				parentTree.clear();
			}
			else if(type == 'addChild')
			{
				parentTree.addChild(this.nodeMap[target.id] = new TreeNode(this, target.type, target, target.canHaveChildren));
			}
			else if(type == 'removeChild')
			{
				let node:TreeNode = this.nodeMap[target.id];

				if(targetTree == this.selectedNode)
				{
					// Select the sibling or parent node
					(event.parent.getChildAt(event.index) || event.parent).setSelected(true);
				}

				parentTree.removeChild(node);
				delete this.nodeMap[target.id];
			}
			else if(type == 'reparent')
			{
				// TODO: IMPLEMENT THIS
			}
		};

		private onMouseEnter = (event) =>
		{
			if(!$.contains(this.$element[0], document.activeElement))
			{
				this.$element.focus();
			}
		};

		private onKeyDown = (event) =>
		{
			const keyCode = event.keyCode;

			if(keyCode == Key.UpArrow)
			{
				if(!this.selectedNode) return;

				this.selectedNode.node.previous().setSelected(true);
			}

			else if(keyCode == Key.DownArrow)
			{
				if(!this.selectedNode) return;

				this.selectedNode.node.next().setSelected(true);
			}
		};

		private onKeyUp = (event) =>
		{
			const keyCode = event.keyCode;

			if(keyCode == Key.Delete)
			{
				if(document.activeElement ==  this.$element[0] && this.selectedNode && this.selectedNode != this.rootNode)
				{
					this.selectedNode.deleteNode();
				}
			}
			else if(keyCode == Key.F2)
			{
				if(this.selectedNode)
				{
					this.selectedNode.startRename();
				}
			}
		};

		/*
		 * Toolbar Events
		 */
		private onToolbarButtonClick = (event) =>
		{
			var $btn = $(event.target);
			if($btn.hasClass('disabled')) return;

			const type = $btn.prop('title') != '' ? $btn.prop('title') : $btn.data('original-title');

			if(type.substr(0, 3) == 'Add')
			{
				let newNode:Node;

				if(type == 'Add Bone')
					newNode = this.selectedNode.addNode(new Bone());
				else if(type == 'Add Sprite')
					newNode = this.selectedNode.addNode(new Sprite(null));

				if(newNode && !event.shiftKey)
				{
					newNode.setSelected(true);
				}
			}
			else if(type == 'Delete')
			{
				this.selectedNode.deleteNode();
			}
		};

		private onToolbarMouseWheel = (event) =>
		{
			this.$toolbar.scrollLeft(this.$toolbar.scrollLeft() - event.originalEvent.wheelDelta);
		};

		private onToolbarAddHover = (event) =>
		{
			this.showAddMenu(true);
		};

		private onToolbarAddLeave = (event) =>
		{
			this.showAddMenu(false);
		};

	}

}