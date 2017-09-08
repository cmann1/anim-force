namespace app.timeline
{

	import Animation = app.anim.Animation;
	import Model = app.model.Model;
	import Event = events.Event;
	import TimelineTree = app.timeline.tree.TimelineTree;
	import ScrollEvent = app.events.ScrollEvent;
	import SelectionEvent = app.model.events.SelectionEvent;
	import StructureChangeEvent = app.model.events.StructureChangeEvent;
	import TreeNode = app.timeline.tree.TreeNode;
	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;
	import Track = app.anim.Track;

	export class TimelineViewport extends app.Canvas
	{

		private model:Model;
		private tree:TimelineTree;
		private animation:Animation;

		private $toolbar:JQuery;

		private scrollX:number = 0;
		private scrollY:number = 0;

		constructor(elementId, model:Model, tree:TimelineTree)
		{
			super(elementId);

			this.model = model;
			this.tree = tree;

			this.animation = model.getActiveAnimation();
			model.activeAnimationChange.on(this.onActiveAnimationChange);
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);
			tree.scrollChange.on(this.onTreeScroll);
			tree.treeNodeUpdate.on(this.onTreeNodeUpdate);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);
			this.$container.parent().parent().parent().on('resize', this.onResize);

			this.$canvas
				.on('keydown', this.onKeyDown)
				.on('keyup', this.onKeyUp);

			this.setupToolbar();
		}

		public step(deltaTime:number, timestamp:number)
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;
		}

		public draw()
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;

			const ctx = this.ctx;
			const nodeHeight = 29;
			const top  = this.scrollY;
			const bottom = top + this.height;
			const left  = this.scrollX;
			const right = left + this.width;

			const animation = this.animation;
			const animationLength = animation.getLength();
			const frameWidth = Config.frameWidth;

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.save();

			ctx.translate(-this.scrollX, -this.scrollY);

			var nodes:Node[] = [this.model];
			var nodeCount = nodes.length;
			var i = 0;

			var y = 0;
			while(i < nodeCount)
			{
				var node:Node = nodes[i];

				if(node instanceof ContainerNode && !node.collapsed)
				{
					nodes = nodes.concat(node.children);
					nodeCount += node.childCount;
				}

				if(y <= bottom && y + nodeHeight >= top)
				{
					ctx.fillStyle = Config.node;
					ctx.fillRect(0, y, this.width, nodeHeight);
					ctx.fillStyle = Config.nodeBorder;
					ctx.fillRect(0, y + nodeHeight - 1, this.width, 1);

					if(i > 0)
					{
						var track:Track = animation.tracks[node.id];
						var j = Math.floor(left / frameWidth);
						var x = j * frameWidth;

						for(; j < animationLength; j++)
						{
							if(x > right) break;

							ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);

							x += frameWidth;
						}
					}
				}

				y += nodeHeight;
				i++;
			}

			ctx.restore();

			this.requiresUpdate = false;
		}

		private setupToolbar()
		{
			this.$toolbar = this.$container.parent().find('#timeline-toolbar');
			// this.$toolbar
			// 	.on('click', 'i', this.onToolbarButtonClick)
			// 	.on('mousewheel', this.onToolbarMouseWheel);
			// this.$toolbar.find('.fa-plus').parent()
			// 	.on('mouseenter', this.onToolbarAddHover)
			// 	.on('mouseleave', this.onToolbarAddLeave);
			// this.$toolbarAddMenu = this.$toolbar.find('.add-menu');
			//
			// this.$toolbarAddBtn = this.$toolbar.find('i.btn-add');
			// this.$toolbarAddBoneBtn = this.$toolbar.find('i.btn-add-bone');
			// this.$toolbarAddSpriteBtn = this.$toolbar.find('i.btn-add-sprite');
			// this.$toolbarAddDeleteBtn = this.$toolbar.find('i.btn-delete');

			tippy(this.$toolbar.find('i').toArray());

			// this.$toolbarAddMenu.hide();
		}

		/*
		 * Events
		 */

		// TODO: Implement
		private onActiveAnimationChange = (node:Model, event:Event) =>
		{
			console.log(node, event);
			this.requiresUpdate = true;
		};

		private onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			this.requiresUpdate = true;
		};

		private onModelStructureChange = (model:Model, event:StructureChangeEvent) =>
		{
			this.requiresUpdate = true;
		};

		protected onTreeNodeUpdate = (node:TreeNode, event:Event) =>
		{
			this.requiresUpdate = true;
		};

		protected onTreeScroll = (tree:TimelineTree, event:ScrollEvent) =>
		{
			this.scrollY = event.scrollY;
			this.requiresUpdate = true;
		};

		protected onKeyDown(event)
		{
			const keyCode = event.keyCode;
			console.log(keyCode);


		}

		protected onKeyUp(event)
		{

		}

		protected onMouseDown(event)
		{
		}

		protected onMouseUp(event)
		{
		}

		protected onMouseWheel(event)
		{

		}

		protected onMouseMove(event)
		{


		}

	}

}