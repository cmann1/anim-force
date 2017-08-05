namespace app.timeline
{

	import Model = app.model.Model;
	import StructureChangeEvent = events.StructureChangeEvent;

	export class TimelineViewport extends app.Canvas
	{

		constructor(elementId)
		{
			super(elementId);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);

			this.$canvas
				.on('keydown', this.onKeyDown)
				.on('keyup', this.onKeyUp);
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

		/*
		 * Events
		 */

		// protected onModelStructureChange = (sender: Model, event:StructureChangeEvent) =>
		// {
		// 	this.requiresUpdate = true;
		// };

		protected onKeyDown = (event) =>
		{
			// console.log(event.keyCode);
			const keyCode = event.keyCode;


		};

		protected onKeyUp = (event) =>
		{

		};

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