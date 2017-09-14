namespace app.timeline.tree
{

	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import StructureChangeEvent = app.model.events.StructureChangeEvent;
	import SelectionEvent = app.model.events.SelectionEvent;
	import Node = app.model.Node;
	import Key = KeyCodes.Key;
	import EventDispatcher = app.events.EventDispatcher;
	import ScrollEvent = app.events.ScrollEvent;
	import ContainerNode = app.model.ContainerNode;
	import Event = app.events.Event;

	export class TimelineTree
	{

		private $element:JQuery;
		private $container:JQuery;
		private model:Model;
		private rootNode:RootTreeNode;

		private selectedNode:TreeNode;
		private highlightedNode:TreeNode;

		private nodeMap:{[id:string]:TreeNode} = {};

		private $toolbar:JQuery;
		private $toolbarAddMenu:JQuery;
		private $toolbarAddBtn:JQuery;
		private $toolbarAddBoneBtn:JQuery;
		private $toolbarAddSpriteBtn:JQuery;
		private $toolbarAddDeleteBtn:JQuery;

		private $dragNodeParent:JQuery;
		private $dragNodePrev:JQuery;
		private dragNode:TreeNode = null;
		private dragWait:boolean;
		private dragInitX:number;
		private dragInitY:number;
		private dragX:number;
		private dragY:number;

		/// Events

		public scrollChange:EventDispatcher<TimelineTree> = new EventDispatcher<TimelineTree>();
		public treeNodeUpdate:EventDispatcher<TreeNode> = new EventDispatcher<TreeNode>();

		constructor(elementId, model:Model)
		{
			this.$element = $('#' + elementId);
			this.$container = this.$element.find('#timeline-tree-container');

			this.$element
				.keyup(this.onKeyDown)
				.keyup(this.onKeyUp);
			this.$container.on('click', this.onTreeClick);

			this.setupToolbar();

			this.setModel(model);
		}

		public addTreeNode(treeNode:TreeNode):TreeNode
		{
			this.nodeMap[treeNode.node.id] = treeNode;

			return treeNode;
		}

		public focus()
		{
			this.$element.focus();
		}

		public getContainer()
		{
			return this.$element;
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

		public reset()
		{
			this.rootNode.$children.scrollLeft(0);
			this.rootNode.$children.scrollTop(0);

			this.updateSelection(null);

			if(this.highlightedNode)
			{
				this.highlightedNode.highlighted = false;
				this.highlightedNode = null;
			}
		}

		public setModel(model:Model)
		{
			this.model = model;
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.nodeMap = {};

			this.$container.empty();
			this.$container.append((this.rootNode = <RootTreeNode> this.addTreeNode(TimelineTree.fromNode(this, model))).$element);
			this.rootNode.$children.on('scroll', this.onTreeScroll);
			this.selectedNode = this.rootNode;
			this.selectedNode.selected = true;

			this.updateToolbar();
		}

		public setScroll(scrollY)
		{
			this.rootNode.$children.scrollTop(scrollY);
			this.onTreeScroll(null);
		}

		public startDrag()
		{
			if(!this.dragNode) return;

			this.dragWait = false;
			this.$dragNodeParent = this.dragNode.$element.parent();
			this.$dragNodePrev = this.dragNode.$element.prev().length ? this.dragNode.$element.prev() : null;

			this.focus();
		}

		public stopDrag(cancel=true)
		{
			if(this.dragNode && !this.dragWait)
			{
				if(cancel)
				{
					if(this.$dragNodePrev)
					{
						this.$dragNodePrev.after(this.dragNode.$element);
					}
					else
					{
						this.$dragNodeParent.prepend(this.dragNode.$element);
					}
				}
				else
				{
					const next:TreeNode = this.dragNode.$element.next().data('tree-node');
					const parent:ContainerTreeNode = this.dragNode.$element.parent().closest('.model-node').data('tree-node');

					if(parent)
					{
						parent.node.addChildBefore(this.dragNode.node, next ? next.node : null);
					}
					else
					{
						this.stopDrag(true);
						console.error('Drag and drop error: Cannot find parent node');
					}
				}
			}

			this.dragNode = null;
			this.$dragNodeParent = null;
			this.$dragNodePrev = null;
		}

		public triggerScroll(event)
		{
			this.rootNode.$children.scrollTop(this.rootNode.$children.scrollTop() - event.originalEvent.wheelDelta);
			this.onTreeScroll(event);
		}

		public waitForDrag(node:TreeNode, event)
		{
			if(node == this.rootNode) return;

			const offset = node.$element.offset();

			this.dragNode = node;
			this.dragWait = true;
			this.dragX = (event.clientX - offset.left) - node.$element.width();
			this.dragY = (event.clientY - offset.top) - node.$element.height() / 2;
			this.dragInitX = event.pageX;
			this.dragInitY = event.pageY;

			app.$window
				.on('mousemove', this.onDragWindowMouseMove)
				.on('mouseup', this.onDragWindowMouseUp);
		}

		public static fromNode(tree:TimelineTree, node:Node):TreeNode
		{
			if(node instanceof Model)
			{
				return new RootTreeNode(tree, node.type, node);
			}

			if(node instanceof Bone)
			{
				return new ContainerTreeNode(tree, node.type, node);
			}

			return new TreeNode(tree, node.type, node);
		}

		//

		private scrollTo(treeNode:TreeNode)
		{
			if(!treeNode) return;

			treeNode.$element.scrollintoview({duration: 50});
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

		private showAddMenu(show:boolean)
		{
			// show = show && this.selectedNode.node.canHaveChildren;
			this.$toolbarAddMenu.stop(true).animate({width:show  ? 'show' : 'hide'}, 250);
		}

		private updateToolbar()
		{
			const isRoot = this.selectedNode == this.rootNode;
			// const allowChildren = this.selectedNode.node.canHaveChildren;
			this.$toolbarAddBtn.toggleClass('disabled', false);
			this.$toolbarAddBoneBtn.toggleClass('disabled', false);
			this.$toolbarAddSpriteBtn.toggleClass('disabled', false);
			this.$toolbarAddDeleteBtn.toggleClass('disabled', isRoot);

			// if(!allowChildren)
			// {
			// 	this.showAddMenu(false);
			// }
		}

		private updateHighlight(target:Node)
		{
			var targetNode = target ? this.nodeMap[target.id] : this.rootNode;
			if(targetNode == this.rootNode)
			{
				target = null;
				targetNode = null;
			}
			if(targetNode == this.highlightedNode) return;

			if(this.highlightedNode) this.highlightedNode.highlighted = false;
			if((this.highlightedNode = targetNode)) this.highlightedNode.highlighted = true;
		}

		private updateSelection(target:Node)
		{
			const targetNode = target ? this.nodeMap[target.id] : this.rootNode;
			if(targetNode == this.selectedNode) return;

			if(this.selectedNode) this.selectedNode.selected = false;
			if((this.selectedNode = targetNode)) this.selectedNode.selected = true;

			this.scrollTo(this.selectedNode);

			this.updateToolbar();
		}

		/*
		 * Events
		 */

		public onNodeCollapse(node:ContainerTreeNode)
		{
			this.treeNodeUpdate.dispatch(node, new Event('nodeCollapse', null));
		}

		private onDragWindowMouseMove = (event) =>
		{
			if(this.dragNode)
			{
				if(this.dragWait)
				{
					var dx = this.dragInitX - event.pageX;
					var dy = this.dragInitY - event.pageY;
					var dragDistance = dx * dx + dy * dy;

					if(dragDistance >= 5 * 5)
					{
						this.startDrag();
					}
				}

				if(!this.dragWait)
				{
					const $target = $(event.target).closest('.model-node');
					if(!$target.length || $.contains(this.dragNode.$element[0], $target[0])) return;

					const treeNode:TreeNode = $target.data('tree-node');
					if(!treeNode || treeNode == this.dragNode) return;

					const $item = $target.find('> .item');
					const offset = $item.offset();
					const offsetX = (event.clientX - offset.left);
					const offsetY = (event.clientY - offset.top);

					treeNode.handleDragOver(this.dragNode, offsetX, offsetY);

					this.scrollTo(this.dragNode);
				}
			}
		};

		private onDragWindowMouseUp = (event) =>
		{
			if(this.dragNode)
			{
				this.stopDrag(false);
			}

			app.$window
				.off('mousemove', this.onDragWindowMouseMove)
				.off('mouseup', this.onDragWindowMouseUp)
		};

		private onKeyDown = (event) =>
		{
			const keyCode = event.keyCode;
			// console.log(keyCode);

			if(keyCode == Key.Escape)
			{
				if(this.dragNode)
				{
					this.stopDrag(true);
				}
			}

			else if(keyCode == Key.UpArrow)
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

		private onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			if(event.type == 'highlight')
			{
				// this.updateHighlight(event.target);
			}

			else if(event.type == 'selection')
			{
				this.updateSelection(event.target);
			}
		};

		private onModelStructureChange = (model:Model, event:StructureChangeEvent) =>
		{
			const type = event.type;
			const parent = event.parent;
			const target = event.target;
			const other = event.other;
			const parentTree:ContainerTreeNode = (parent ? this.nodeMap[parent.id] : null) as ContainerTreeNode;
			const targetTree:TreeNode = target ? this.nodeMap[target.id] : null;

			if(type == 'clear')
			{
				this.reset();
				parentTree.clear();
			}
			else if(type == 'addChild')
			{
				// Reparent an existing node
				if(targetTree)
				{
					if(other)
					{
						parentTree.addChildBefore(targetTree, this.nodeMap[other.id]);
					}
					else
					{
						parentTree.addChild(targetTree);
					}
				}
				// Add a new node
				else
				{
					var newTree = this.addTreeNode(TimelineTree.fromNode(this, target));

					if(other)
					{
						parentTree.addChildBefore(newTree, this.nodeMap[other.id]);
					}
					else
					{
						parentTree.addChild(newTree);
					}
				}
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
		};

		private onTreeClick = (event) =>
		{
			if(event.target == this.$container[0])
			{
				this.model.setSelected(true);
			}
		};

		private onTreeScroll = (event) =>
		{
			this.scrollChange.dispatch(this, new ScrollEvent(this.rootNode.$children.scrollLeft(), this.rootNode.$children.scrollTop(), event))
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
					newNode = new Bone();
				else if(type == 'Add Sprite')
					newNode = new Sprite(null);

				if(newNode)
				{
					if(this.selectedNode instanceof ContainerTreeNode && (!event.ctrlKey || this.selectedNode == this.rootNode))
						this.selectedNode.addNode(newNode);
					else
						this.selectedNode.parent.addNodeAfter(newNode, this.selectedNode);
				}

				if(newNode && !event.shiftKey)
				{
					newNode.setSelected(true);
				}
			}
			else if(type == 'Delete')
			{
				if(this.selectedNode != this.rootNode)
				{
					this.selectedNode.deleteNode();
				}
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