namespace app.viewport
{

	import Key = KeyCodes.Key;
	import Sprite = app.model.Sprite;
	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import SelectionEvent = events.SelectionEvent;
	import StructureChangeEvent = events.StructureChangeEvent;

	export class Viewport extends app.Canvas
	{
		protected scales = [0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8, 16, 32];
		protected scale:number = 1;
		protected scaleIndex:number = 3;
		protected cameraX:number = 0;
		protected cameraY:number = 0;

		protected cameraVelX:number = 0;
		protected cameraVelY:number = 0;
		protected cameraFriction:number = 0.9;

		protected prevCameraX:number = 0;
		protected prevCameraY:number = 0;
		protected flickTolerance:number = 4;
		protected flickFactor:number = 10;

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

		private model:Model;

		constructor(elementId, model:Model)
		{
			super(elementId);

			this.model = model;

			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);

			this.$message = $('<div class="viewport-message"></div>');
			this.$container.append(this.$message);
			this.$message.hide();

			this.$canvas
				.on('keydown', this.onKeyDown)
				.on('keyup', this.onKeyUp);
		}

		public step(deltaTime:number, timestamp:number)
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;

			if(this.cameraVelX != 0 || this.cameraVelY != 0)
			{
				this.cameraX += this.cameraVelX;
				this.cameraY += this.cameraVelY;

				this.cameraVelX *= this.cameraFriction;
				this.cameraVelY *= this.cameraFriction;

				if(Math.abs(this.cameraVelX) < 0.01) this.cameraVelX = 0;
				if(Math.abs(this.cameraVelY) < 0.01) this.cameraVelY = 0;
			}

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

			this.mousePrevX = this.mouseX;
			this.mousePrevY = this.mouseY;
		}

		public draw()
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;

			const ctx = this.ctx;

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.save();

			this.drawGrid();

			ctx.translate(this.centreX, this.centreY);
			ctx.scale(this.scale, this.scale);
			ctx.translate(-this.cameraX, -this.cameraY);

			if(this.bone2)
			{
				this.bone.rotation = Math.sin(this.t * 0.4 + 2) * 0.5;
				this.bone2.rotation += 0.02;
				this.bone.stretch = this.sprite.scaleY = (Math.sin(this.t) * 0.5 + 0.5);
				this.sprite3.scaleX = (Math.sin(this.t + 1) * 0.5 + 1);
				this.t+=0.04;
			}

			for(var b of this.model.rootBones)
				{
					b.rotation+=0.02;
					for(var c of b.children)
						c.rotation+=0.02;
				}
			this.model.draw(this.ctx);

			ctx.restore();

			this.requiresUpdate = false;
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

				ctx.lineDashOffset = cameraY * scale - this.centreY;
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


				ctx.lineDashOffset = cameraX * scale - this.centreX;
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
		 * Model Events
		 */

		protected onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			this.requiresUpdate = true;
		};

		protected onModelStructureChange = (model:Model, event:StructureChangeEvent) =>
		{
			this.requiresUpdate = true;
		};

		/*
		 * Events
		 */

		bone:Bone;
		bone2:Bone;
		sprite:Sprite;
		sprite2:Sprite;
		sprite3:Sprite;
		t = 0;
		protected onKeyDown = (event) =>
		{
			// console.log(event.keyCode);
			const keyCode = event.keyCode;

			if(keyCode == Key.Home)
			{
				this.cameraX = 0;
				this.cameraY = 0;
			}

			// TODO: REMOVE
			else if(keyCode == Key.A)
			{
				var spriteAsset = app.main.spriteManager.loadSprite('props6', 'npc_1'); // leaf
				var spriteAsset2 = app.main.spriteManager.loadSprite('props6', 'npc_2'); // maid
				var spriteAsset3 = app.main.spriteManager.loadSprite('props6', 'npc_5'); // sci

				this.model.clear();
				this.model
					.addChild(this.bone = new Bone())
					.addChild(this.sprite = new Sprite(spriteAsset, 0, 0));

				this.sprite3 = new Sprite(spriteAsset3, 0, 0); // sci
				this.sprite3.rotation = Math.PI * 0.25;
				this.bone.addChild(this.sprite3);

				this.bone2 = new Bone();
				this.bone2.offsetX = -50;
				this.bone.addChild(this.bone2);
				this.bone2.addChild(this.sprite2 = new Sprite(spriteAsset2, 0, 0));

				this.sprite.offsetY = this.bone.length / 2;
				this.sprite2.offsetY = this.bone2.length / 2;
				this.sprite3.offsetX = 50;
				this.sprite3.offsetY = 50;
			}
		};

		protected onKeyUp = (event) =>
		{

		};

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

				const dx = this.mousePrevX - this.mouseX;
				const dy = this.mousePrevY - this.mouseY;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if(dist >= this.flickTolerance)
				{
					this.cameraVelX = dx / this.scale * this.flickFactor;
					this.cameraVelY = dy / this.scale * this.flickFactor;
				}
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
			this.requiresUpdate = true;
		}

		protected onMouseMove(event)
		{

			if(!isNaN(this.mouseGrabX))
			{
				this.prevCameraX = this.cameraX;
				this.prevCameraY = this.cameraY;
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