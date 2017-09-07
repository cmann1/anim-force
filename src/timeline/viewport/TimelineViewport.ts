namespace app.timeline
{

	import Model = app.model.Model;
	import StructureChangeEvent = events.StructureChangeEvent;

	export class TimelineViewport extends app.Canvas
	{

		private model:Model;
		private $toolbar:JQuery;

		constructor(elementId, model:Model)
		{
			super(elementId);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);

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

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.save();

			// this.tree.draw(ctx, 0, 0, this.treeWidth, this.height);
			// this.viewport.draw(ctx, this.treeWidth, 0, this.width - this.treeWidth, this.height);

			ctx.restore();

			this.requiresUpdate = false;
		}

		private setupToolbar()
		{
			this.$toolbar = this.$container.find('#timeline-toolbar');
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