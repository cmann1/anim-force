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

		constructor(elementId, model:Model)
		{
			this.model = model;
			this.$element = $('#' + elementId);
			this.$container = this.$element.find('#timeline-tree-container');

			this.setupToolbar();

			this.$container.append((this.rootNode = this.fromNode(this.model)).$element);
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.nodeMap[this.model.id] = this.rootNode;

			this.$element
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
			this.$toolbarAddSpriteBtn.toggleClass('disabled', !allowChildren);
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

		private scrollTo(treeNode:TreeNode)
		{
			if(!treeNode) return;

			treeNode.$element.scrollintoview({duration: 50});
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
					const parent = this.dragNode.$element.parent().closest('.model-node').data('tree-node');

					if(parent)
					{
						parent.node.addChildBefore(this.dragNode.node, next ? next.node : null);
					}
					else
					{
						console.error('Drag and drop error: Cannot find parent node');
					}
				}
			}

			this.dragNode = null;
			this.$dragNodeParent = null;
			this.$dragNodePrev = null;
		}

		private fromNode(node:Node):TreeNode
		{
			if(node instanceof Model)
			{
				return new RootTreeNode(this, node.type, node);
			}

			if(node instanceof Bone)
			{
				return new ContainerTreeNode(this, node.type, node);
			}

			return new TreeNode(this, node.type, node);
		}

		/*
		 * Events
		 */

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

		private onTreeClick = (event) =>
		{
			if(event.target == this.$container[0])
			{
				this.model.setSelected(true);
			}
		};

		private onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			if(event.type == 'highlight')
			{
				this.updateHighlight(event.target);
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
				parentTree.clear();
			}
			else if(type == 'addChild')
			{
				if(this.nodeMap[target.id])
				{
					if(other)
					{
						parentTree.addChildBefore(this.nodeMap[target.id], this.nodeMap[other.id]);
					}
					else
					{
						parentTree.addChild(this.nodeMap[target.id]);
					}
				}
				else
				{
					parentTree.addChild(this.nodeMap[target.id] = this.fromNode(target));
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
				if(this.selectedNode instanceof ContainerTreeNode)
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