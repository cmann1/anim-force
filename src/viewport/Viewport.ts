///<reference path='../Canvas.ts'/>
///<reference path='../../lib/createjs-lib.d.ts'/>
///<reference path='../../lib/tweenjs.d.ts'/>
///<reference path="../../lib/easeljs.d.ts"/>

namespace app.viewport
{

	export class Viewport extends app.Canvas
	{
		protected scales = [0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16, 32];
		protected scale:number = 1;
		protected scaleIndex:number = 3;
		protected cameraX:number = 0;
		protected cameraY:number = 0;

		protected viewLeft:number;
		protected viewRight:number;
		protected viewTop:number;
		protected viewBottom:number;

		protected gridSize:number = 48 * 4;
		protected gridSubdivisions:number = 4;

		protected gridLineWidth = 1;
		protected gridColour = '#999';
		protected gridDash = [];
		protected gridSubColour = '#999';
		protected gridSubDash = [5, 5];
		protected gridSubMinScale = 0.25;

		protected gridXColour = '#F44';
		protected gridYColour = '#4F4';

		protected stageMouse:{x:number, y:number} = {x: 0, y: 0};
		protected mouseGrabX:number = NaN;
		protected mouseGrabY:number = NaN;
		protected stageAnchorX:number = NaN;
		protected stageAnchorY:number = NaN;

		protected $container:JQuery;

		protected $message:JQuery;

		constructor(elementId)
		{
			super(elementId);

			this.$container = this.$canvas.parent();

			this.$message = $('<div class="viewport-message"></div>');
			this.$container.append(this.$message);
			this.$message.hide();
		}

		public step(deltaTime:number, timestamp:number)
		{
			var viewWidth = this.width / this.scale;
			var viewHeight = this.height / this.scale;
			this.viewLeft = this.cameraX - viewWidth * 0.5;
			this.viewRight = this.viewLeft + viewWidth;
			this.viewTop = this.cameraY - viewHeight * 0.5;
			this.viewBottom = this.viewTop + viewHeight;

			if(!isNaN(this.stageAnchorX))
			{
				this.anchorToScreen(this.mouseX, this.mouseY, this.stageAnchorX, this.stageAnchorY);
			}

			this.screenToStage(this.mouseX, this.mouseY, this.stageMouse);
		}

		public draw()
		{
			const ctx = this.ctx;

			ctx.clearRect(0, 0, this.width, this.height);

			ctx.save();
			// ctx.translate(Math.floor(-this.cameraX + this.centreX), Math.floor(-this.cameraY + this.centreY));

			this.drawGrid();

			// ctx.scale(this.scale, this.scale);
			ctx.restore();
		}

		public drawGrid()
		{
			const ctx = this.ctx;

			const width = this.width;
			const height = this.height;

			const scale = this.scale;
			const viewLeft = this.viewLeft;
			const viewRight = this.viewRight;
			const viewTop = this.viewTop;
			const viewBottom = this.viewBottom;
			const gridSize = this.gridSize;
			const gridSubSize = gridSize / this.gridSubdivisions;

			const cameraX = this.cameraX;
			const cameraY = this.cameraY;
			const centreX = this.centreX;
			const centreY = this.centreY;

			var x:number;
			var y:number;

			ctx.save();

			ctx.lineWidth = this.gridLineWidth;

			// Subdivisions
			//

			if(scale > this.gridSubMinScale)
			{

				ctx.setLineDash(this.gridSubDash);
				ctx.strokeStyle = this.gridSubColour;

				ctx.lineDashOffset = cameraY * scale;
				ctx.beginPath();

				x = Math.floor(Math.ceil(viewLeft / gridSubSize) * gridSubSize);
				while(x < viewRight)
				{
					if(x % gridSize)
					{
						const sx = Math.floor(this.stageXToScreen(x)) - 0.5;
						ctx.moveTo(sx, 0);
						ctx.lineTo(sx, height);
					}
					x += gridSubSize;
				}

				ctx.stroke();


				ctx.lineDashOffset = cameraX * scale;
				ctx.beginPath();

				y = Math.floor(Math.ceil(viewTop / gridSubSize) * gridSubSize);
				while(y < viewBottom)
				{
					if(y % gridSize)
					{
						const sy = Math.floor(this.stageYToScreen(y)) - 0.5;
						ctx.moveTo(0, sy);
						ctx.lineTo(width, sy);
					}

					y += gridSubSize;
				}
				ctx.stroke();

			}

			// Grid
			//

			ctx.setLineDash(this.gridDash);
			ctx.strokeStyle = this.gridColour;
			ctx.beginPath();

			x = Math.floor(Math.ceil(viewLeft / gridSize) * gridSize);
			while(x < viewRight)
			{
				const sx = Math.floor(this.stageXToScreen(x)) - 0.5;
				ctx.moveTo(sx, 0);
				ctx.lineTo(sx, height);

				x += gridSize;
			}

			y = Math.floor(Math.ceil(viewTop / gridSize) * gridSize);
			while(y < viewBottom)
			{
				const sy = Math.floor(this.stageYToScreen(y)) - 0.5;
				ctx.moveTo(0, sy);
				ctx.lineTo(width, sy);

				y += gridSize;
			}

			ctx.stroke();

			// Axes
			//

			if(viewLeft < 0 && viewRight > 0)
			{
				ctx.strokeStyle = this.gridYColour;
				ctx.beginPath();

				const sx = Math.floor(this.stageXToScreen(0)) - 0.5;
				ctx.moveTo(sx, 0);
				ctx.lineTo(sx, height);

				ctx.stroke();
			}

			if(viewTop < 0 && viewBottom > 0)
			{
				ctx.strokeStyle = this.gridXColour;
				ctx.beginPath();

				const sy = Math.floor(this.stageYToScreen(0)) - 0.5;
				ctx.moveTo(0, sy);
				ctx.lineTo(width, sy);

				ctx.stroke();
			}

			ctx.restore();
		}

		public screenToStage(x:number, y:number, out:{x:number, y:number})
		{
			out.x = this.cameraX + (x - this.centreX) / this.scale;
			out.y = this.cameraY + (y - this.centreY) / this.scale;
		}

		public stageXToScreen(x:number)
		{
			return (x - this.cameraX) * this.scale + this.centreX;
		}

		public stageYToScreen(y:number)
		{
			return (y - this.cameraY) * this.scale + this.centreY;
		}

		public anchorToScreen(screenX, screenY, stageX, stageY)
		{
			this.cameraX = stageX - (screenX - this.centreX) / this.scale;
			this.cameraY = stageY - (screenY - this.centreY) / this.scale;
		}

		protected showMessage(message:string, duration=1000)
		{
			this.$message.html(message).show().stop(true).fadeTo(duration, 1).fadeOut(250);
		}

		/*
		 * Events
		 */

		protected onMouseDown(event)
		{
			if(event.button == 2)
			{
				this.mouseGrabX = this.stageMouse.x;
				this.mouseGrabY = this.stageMouse.y;
			}
		}

		protected onMouseUp(event)
		{
			if(!isNaN(this.mouseGrabX))
			{
				this.mouseGrabX = NaN;
				this.mouseGrabY = NaN;
			}
		}

		protected onMouseWheel(event)
		{
			this.scaleIndex += event.originalEvent.wheelDelta > 0 ? 1 : -1;
			if(this.scaleIndex < 0) this.scaleIndex = 0;
			else if(this.scaleIndex >= this.scales.length) this.scaleIndex = this.scales.length - 1;

			const scale = this.scales[this.scaleIndex];
			createjs.Tween.get(this, {override: true}).to({scale: scale}, 50).call(this.onZoomComplete);

			this.stageAnchorX = this.stageMouse.x;
			this.stageAnchorY = this.stageMouse.y;

			this.showMessage(`Zoom: ${scale}`);
		}

		protected onMouseMove(event)
		{

			if(!isNaN(this.mouseGrabX))
			{
				this.anchorToScreen(this.mouseX, this.mouseY, this.mouseGrabX, this.mouseGrabY);
				this.showMessage(`${Math.floor(this.cameraX)}, ${Math.floor(this.cameraY)}`);

			}

			this.screenToStage(this.mouseX, this.mouseY, this.stageMouse);
		}

		protected onZoomComplete = () =>
		{
			this.anchorToScreen(this.mouseX, this.mouseY, this.stageAnchorX, this.stageAnchorY);
			this.stageAnchorX = NaN;
			this.stageAnchorY = NaN;
		};
	}

}