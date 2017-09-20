namespace app
{
	/*
	 * Wraps thr html canvas, providing commonly used functionality such as mouse and keyboard events
	 */
	export class Canvas
	{
		public mousePrevX:number = 0;
		public mousePrevY:number = 0;
		public mouseX:number = 0;
		public mouseY:number = 0;

		public requiresUpdate = false;

		protected width:number;
		protected height:number;
		protected centreX:number;
		protected centreY:number;

		protected $container:JQuery;

		protected canvas:HTMLCanvasElement;
		protected $canvas:JQuery;
		protected ctx:CanvasRenderingContext2D;
		protected canvasMouseDown = false;
		protected canvasRightMouseDown = false;

		constructor(elementId)
		{
			this.canvas = <HTMLCanvasElement> document.getElementById(elementId);

			if(!this.canvas)
			{
				console.error(`Cannot find canvas with id "${elementId}"`);
				return;
			}

			this.ctx = this.canvas.getContext('2d');
			this.$canvas = $(this.canvas);
			this.$canvas
				.on('mousedown', this.onCanvasMouseDown)
				.on('wheel', this.onCanvasMouseWheel)
				.on('mousemove', this.onCanvasMouseMove)
				.on('keydown', this.onCanvasKeyDown)
				.on('keyup', this.onCanvasKeyUp);
			this.$container = this.$canvas.parent();

			app.$window
				.on('mousemove', this.onWindowMouseMove)
				.on('mouseup', this.onCanvasMouseUp)
				.on('contextmenu', this.onWindowContextMenu)
				.focus();
		}

		public focus()
		{
			this.$canvas.focus();
		}

		public updateCanvasSize()
		{
			this.width = this.canvas.width = this.canvas.clientWidth;
			this.height = this.canvas.height = this.canvas.clientHeight;
			this.centreX = this.width / 2;
			this.centreY = this.height / 2;
			this.requiresUpdate = true;
		}

		public getContainer()
		{
			return this.$container;
		}

		/*
		 * Events
		 */

		protected onMouseDown(event) {}
		protected onMouseUp(event) {}
		protected onMouseMove(event) {}
		protected onMouseWheel(event) {}

		protected onKeyDown(event) {}
		protected onKeyUp(event) {}

		protected onCanvasKeyDown = (event) =>
		{
			this.onKeyDown(event);
		};

		protected onCanvasKeyUp = (event) =>
		{
			this.onKeyUp(event);
		};

		protected onCanvasMouseDown = (event) =>
		{
			if(event.button == 2)
			{
				this.canvasRightMouseDown = true;
			}

			this.canvasMouseDown = true;

			this.onMouseDown(event);

			event.preventDefault();
			return false;
		};

		protected onCanvasMouseUp = (event) =>
		{
			this.canvasMouseDown = false;
			this.onMouseUp(event);
		};

		protected onCanvasMouseWheel = (event) =>
		{
			this.onMouseWheel(event);
		};

		protected onCanvasMouseMove = (event, force:boolean=false) =>
		{
			if(!force && this.canvasMouseDown) return;

			this.requiresUpdate = true;

			this.mousePrevX = this.mouseX;
			this.mousePrevY = this.mouseY;

			var offset = this.$canvas.offset();
			this.mouseX = event.pageX - offset.left;
			this.mouseY = event.pageY - offset.top;

			if(this.mousePrevX != this.mouseX || this.mousePrevY != this.mouseY)
			{
				this.onMouseMove(event);
			}
		};

		protected onWindowContextMenu = (event) =>
		{
			if(this.canvasRightMouseDown || event.target == this.canvas)
			{
				this.canvasRightMouseDown = false;
				event.preventDefault();
				return false;
			}
		};

		protected onWindowMouseMove = (event) =>
		{
			if(this.canvasMouseDown)
			{
				this.onCanvasMouseMove(event, true);
			}
		};

		protected onResize = () =>
		{
			this.updateCanvasSize();
		};
	}
}