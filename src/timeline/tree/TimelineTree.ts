namespace app.timeline.tree
{

	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import StructureChangeEvent = events.StructureChangeEvent;
	import SelectionEvent = events.SelectionEvent;

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

			this.$container.append((this.rootNode = new TreeNode('model', this.model, true)).$element);
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.nodeMap[this.model.id] = this.rootNode;

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
				const target = event.target;
				const targetNode = target ? this.nodeMap[target.id] : this.rootNode;

				if(targetNode == this.selectedNode) return;

				if(this.selectedNode) this.selectedNode.selected = false;

				if((this.selectedNode = targetNode)) this.selectedNode.selected = true;

				this.updateToolbar();
			}
		};

		private onModelStructureChange = (model:Model, event:StructureChangeEvent) =>
		{
			const type = event.type;
			const target = event.target;

			if(type == 'clear')
			{
				this.rootNode.clear();
			}
			else if(type == 'addChild')
			{
				let parent:TreeNode = this.nodeMap[target.parent.id];
				parent.addChild(this.nodeMap[target.id] = new TreeNode(target.type, target, target.canHaveChildren));
			}
			else if(type == 'removeChild')
			{
				let node:TreeNode = this.nodeMap[target.id];

				if(node == this.selectedNode)
				{
					console.log(event.parent.getChildAt(event.index));
					(event.parent.getChildAt(event.index) || event.parent).setSelected(true);
					// this.model.setSelected(true);
				}

				node.parent.removeChild(node);
				delete this.nodeMap[target.id];
			}
			else if(type == 'reparent')
			{
				// TODO: IMPLEMENT THIS
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

			if(type == 'Add Bone')
			{
				this.selectedNode.node.addChild(new Bone()).setSelected(true);
			}
			else if(type == 'Add Sprite')
			{
				this.selectedNode.node.addChild(new Sprite(null)).setSelected(true);
			}
			else if(type == 'Delete')
			{
				this.selectedNode.node.parent.removeChild(this.selectedNode.node);
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