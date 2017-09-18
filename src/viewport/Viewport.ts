namespace app.viewport
{

	import Key = KeyCodes.Key;
	import Sprite = app.model.Sprite;
	import Model = app.model.Model;
	import Bone = app.model.Bone;
	import SelectionEvent = app.model.events.SelectionEvent;
	import StructureChangeEvent = app.model.events.StructureChangeEvent;
	import Node = app.model.Node;
	import Animation = app.anim.Animation;
	import Event = app.events.Event;
	import EditMode = app.model.EditMode;
	import LoadData = app.projects.LoadData;

	export class Viewport extends app.Canvas
	{
		protected scales = [0.1, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 6, 8, 12, 16, 24, 32];
		protected scale:number = 1;
		protected scaleIndex:number = 9;
		protected cameraX:number = 0;
		protected cameraY:number = 0;

		protected cameraVelX:number = 0;
		protected cameraVelY:number = 0;
		protected cameraFriction:number = 0.9;

		protected prevCameraX:number = 0;
		protected prevCameraY:number = 0;
		protected flickTolerance:number = 4;
		protected flickFactor:number = 2;

		protected viewportAABB:AABB = new AABB();
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

		protected interaction:Interaction = new Interaction();
		protected highlightInteraction:Interaction = new Interaction();

		protected $container:JQuery;
		protected fpsDisplay:Fps.Display;

		protected $message:JQuery;

		private model:Model;
		private mode:EditMode;

		public timeline:app.timeline.TimelineViewport;

		constructor(elementId, model:Model)
		{
			super(elementId);

			this.setModel(model);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);

			this.$message = $('<div class="viewport-message"></div>');
			this.$container.append(this.$message);
			this.$message.hide();

			this.fpsDisplay = new Fps.Display(app.main.ticker.getFps);
			if(!Config.showFps)
			{
				this.fpsDisplay.hide();
			}

			new SettingsDlg(this, this.$container);

			Config.change.on(this.onConfigChange);
		}

		//

		public step(deltaTime:number, timestamp:number)
		{
			if(this.mode == EditMode.PLAYBACK)
			{
				this.model.animateStep(deltaTime);
			}

			if(!this.requiresUpdate && document.activeElement != this.canvas) return;

			if(this.cameraVelX != 0 || this.cameraVelY != 0)
			{
				this.cameraX += this.cameraVelX;
				this.cameraY += this.cameraVelY;

				this.cameraVelX *= this.cameraFriction;
				this.cameraVelY *= this.cameraFriction;

				if(Math.abs(this.cameraVelX) < 0.01) this.cameraVelX = 0;
				if(Math.abs(this.cameraVelY) < 0.01) this.cameraVelY = 0;
				this.requiresUpdate = true;
			}

			var viewWidth = this.width / this.scale;
			var viewHeight = this.height / this.scale;
			this.viewLeft = this.cameraX - viewWidth * 0.5;
			this.viewRight = this.viewLeft + viewWidth;
			this.viewTop = this.cameraY - viewHeight * 0.5;
			this.viewBottom = this.viewTop + viewHeight;
			this.viewportAABB.x1 = this.viewLeft;
			this.viewportAABB.y1 = this.viewTop;
			this.viewportAABB.x2 = this.viewRight;
			this.viewportAABB.y2 = this.viewBottom;

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

			ctx.translate(
				Math.floor(this.centreX - this.cameraX * this.scale),
				Math.floor(this.centreY - this.cameraY * this.scale));

			this.model.drawModel(this.ctx, this.scale, this.viewportAABB);

			// this.viewportAABB.draw(ctx, this.scale);

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

			if(Config.drawGrid)
			{
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
			}

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

		//

		public anchorToScreen(screenX, screenY, stageX, stageY)
		{
			this.cameraX = stageX - (screenX - this.centreX) / this.scale;
			this.cameraY = stageY - (screenY - this.centreY) / this.scale;
		}

		public reset()
		{
			this.cameraX = 0;
			this.cameraY = 0;
			this.scale = 1;
			this.scaleIndex = this.scales.indexOf(this.scale);

			this.requiresUpdate = true;
		}

		public screenToStage(x:number, y:number, out:{x:number, y:number})
		{
			out.x = this.cameraX + (x - this.centreX) / this.scale;
			out.y = this.cameraY + (y - this.centreY) / this.scale;
		}

		public setModel(model:Model)
		{
			this.model = model;
			this.mode = model.mode;

			model.setAnimationListeners(this.onAnimationChange);
			model.animationChange.on(this.onModelAnimationChange);
			model.modeChange.on(this.onModelModeChange);
			model.selectionChange.on(this.onModelSelectionChange);
			model.structureChange.on(this.onModelStructureChange);

			this.requiresUpdate = true;
		}

		public stageXToScreen(x:number)
		{
			return (x - this.cameraX) * this.scale + this.centreX;
		}

		public stageYToScreen(y:number)
		{
			return (y - this.cameraY) * this.scale + this.centreY;
		}

		public showMessage(message:string, duration=1000)
		{
			this.$message.html(message).show().stop(true).fadeTo(duration, 1).fadeOut(250);
		}

		public toggleFps(show:boolean)
		{
			if(show)
			{
				this.fpsDisplay.show();
			}
			else
			{
				this.fpsDisplay.hide();
			}
		}

		//

		public save():any
		{
			return {
				scale: this.scale,
				cameraX: this.cameraX,
				cameraY: this.cameraY
			};
		}

		public load(data:LoadData)
		{
			this.cameraVelX = 0;
			this.cameraVelY = 0;

			this.scale = data.get('scale');
			this.scaleIndex = this.scales.indexOf(this.scale);
			if(this.scaleIndex == -1)
			{
				this.scaleIndex = this.scales.indexOf(this.scale = 1);
			}

			this.cameraX = this.prevCameraX = data.get('cameraX');
			this.cameraY = this.prevCameraY = data.get('cameraY');

			this.requiresUpdate = true;
		}

		//

		protected zoom(direction:number=1)
		{
			this.scaleIndex += direction;
			if(this.scaleIndex < 0) this.scaleIndex = 0;
			else if(this.scaleIndex >= this.scales.length) this.scaleIndex = this.scales.length - 1;

			const scale = this.scales[this.scaleIndex];
			createjs.Tween.get(this, {override: true})
				.to({scale: scale}, 50)
				.call(this.onZoomComplete)
				.addEventListener('change', () => {this.requiresUpdate = true});

			this.stageAnchorX = this.stageMouse.x;
			this.stageAnchorY = this.stageMouse.y;

			this.showMessage(`Zoom: ${scale}`);
			this.requiresUpdate = true;
		}

		/*
		 * Model Events
		 */

		private onAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			// if(type == 'position')
			// {
			// 	this.showMessage('Frame: ' + (this.model.getActiveAnimation().getPosition() + 1));
			// }

			this.requiresUpdate = true;
		};

		private onConfigChange = (obj:any, event:Event) =>
		{
			const type = event.type;

			if(type == 'showFps')
			{
				this.toggleFps(Config.showFps);
			}
		};

		protected onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			this.requiresUpdate = true;
		};

		protected onModelStructureChange = (model:Node, event:StructureChangeEvent) =>
		{
			this.requiresUpdate = true;
		};

		protected onModelAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'setAnimation')
			{
				animation.change.on(this.onAnimationChange);
				this.requiresUpdate = true;
			}
		};

		protected onModelModeChange = (model:Model, event:Event) =>
		{
			this.mode = model.mode;

			if(this.mode == EditMode.PLAYBACK)
			{
				this.interaction.success = false;
			}
		};

		/*
		 * Events
		 */

		protected onKeyDown(event)
		{
			if(this.timeline.commonKey(event)) return;
			if(this.commonKey(event)) return;

			// console.log(keyCode);
			const keyCode = event.keyCode;
			const altKey = event.altKey;
			const selectedNode = this.model.getSelectedNode();

			if(keyCode == Key.Home)
			{
				this.reset();
			}

			// Zoom in
			else if(keyCode == Key.Add || keyCode == Key.Equals)
			{
				this.zoom(1);
			}

			// Zoom out
			else if(keyCode == Key.Subtract || keyCode == Key.Dash)
			{
				this.zoom(-1);
			}

			// Toggle draw grid
			else if(keyCode == Key.G && !altKey)
			{
				Config.set('drawGrid', !Config.drawGrid);
			}

			// Toggle AAB draw
			else if(keyCode == Key.Zero)
			{
				Config.set('drawAABB', !Config.drawAABB);
			}

			// TODO: REMOVE
			else if(keyCode == Key.A)
			{
				var spriteAsset = app.main.spriteManager.loadSprite('props6', 'npc_1'); // leaf
				var spriteAsset2 = app.main.spriteManager.loadSprite('props6', 'npc_2'); // maid
				var spriteAsset3 = app.main.spriteManager.loadSprite('props6', 'npc_5'); // sci

				var bone:Bone;
				var bone2:Bone;
				var sprite:Sprite;
				var sprite2:Sprite;
				var sprite3:Sprite;

				this.model.clear();
				this.model.addChild(bone = new Bone());
				// bone.rotation = Math.PI * 0.25;
				bone.addChild(sprite = new Sprite(spriteAsset, 0, 0));

				sprite3 = new Sprite(spriteAsset3, 0, 0);
				sprite3.rotation = Math.PI * 0.25;
				sprite3.offsetX = 50;
				sprite3.offsetY = 50;
				bone.addChild(sprite3);

				bone2 = new Bone();
				bone2.offsetX = -50;
				bone.addChild(bone2);
				bone2.addChild(sprite2 = new Sprite(spriteAsset2, 0, 0));

				sprite.offsetY = bone.length / 2;
				sprite2.offsetY = bone2.length / 2;

				sprite3 = new Sprite(spriteAsset3, 0, 0);
				sprite3.rotation = -Math.PI * 0.25;
				sprite3.offsetX = -50;
				sprite3.offsetY = 50;
				bone.addChild(sprite3);

				sprite3 = new Sprite(spriteAsset3, 0, 0);
				sprite3.rotation = -Math.PI * 0.5;
				sprite3.offsetX = 0;
				sprite3.offsetY = 150;
				bone.addChild(sprite3);

				sprite3 = new Sprite(spriteAsset2, 0, 0);
				sprite3.rotation = -Math.PI * 0.5;
				sprite3.offsetX = 0;
				sprite3.offsetY = -150;
				bone.addChild(sprite3);

				// this.model.bindPose.forceKeyframe();
			}

			else if(this.mode != EditMode.PLAYBACK)
			{
				// Delete ndoe
				if(keyCode == Key.Delete)
				{
					if(!this.interaction.success)
					{
						if(selectedNode)
						{
							selectedNode.parent.removeChild(selectedNode);
						}
					}
				}

				// Change layer/sublayer
				else if(keyCode == Key.PageDown || keyCode == Key.PageUp)
				{
					if(selectedNode)
					{
						this.model.increaseSelectedNodeLayer(
							keyCode == Key.PageDown ? -1 : 1,
							altKey
						);
						this.showMessage(`Layer: ${selectedNode.layer}.${selectedNode.subLayer}`);
					}

				}

				// Change sprite frame
				else if(keyCode == Key.Numpad8 || keyCode == Key.Numpad2)
				{
					if(selectedNode instanceof Sprite)
					{
						selectedNode.setFrame(Math.round(selectedNode.frame) + (keyCode == Key.Numpad8 ? 1 : -1));
						this.showMessage('Frame: ' + (Math.round(selectedNode.frame) + 1) + '/' + selectedNode.frameCount);
					}
				}

				// Change palette
				else if(keyCode == Key.Numpad4 || keyCode == Key.Numpad6)
				{
					if(selectedNode instanceof Sprite)
					{
						selectedNode.setPalette(selectedNode.palette + (keyCode == Key.Numpad6 ? 1 : -1));
						this.showMessage('Palette: ' + (selectedNode.palette + 1) + '/' + selectedNode.paletteCount);
					}
				}

				// Reset offset
				else if(keyCode == Key.G && altKey)
				{
					if(selectedNode) selectedNode.resetOffset();
				}
				// Reset scale
				else if(keyCode == Key.S && altKey)
				{
					if(selectedNode) selectedNode.resetScale();
				}
				// Reset rotation
				else if(keyCode == Key.R && altKey)
				{
					if(selectedNode) selectedNode.resetRotation();
				}

				// TODO: REMOVE
				else if(keyCode == Key.Enter)
				{
					app.main.showSpriteSelector(this.onSpritesSelect);
				}
			}

		}

		public commonKey(event):boolean
		{
			const keyCode = event.keyCode;

			// if(this.mode == EditMode.PLAYBACK) return false;

			if(keyCode == Key.H)
			{
				Config.set('showControls', !Config.showControls);
				this.requiresUpdate = true;
			}

			return false;
		}

		// TODO: REMOVE
		protected onSpritesSelect = (spriteGroup:string, spriteName:string) =>
		{
			var node = this.model.getSelectedNode();
			if(node instanceof Sprite)
			{
				node.loadSprite(spriteGroup, spriteName);
			}
		};

		protected onKeyUp(event)
		{

		}

		protected onMouseDown(event)
		{
			this.$canvas.focus();

			if(event.button == 0)
			{
				if(this.mode != EditMode.PLAYBACK)
				{
					this.interaction.success = false;

					if(this.model.hitTest(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.interaction))
					{
						this.interaction.node.setSelected(true);
						this.interaction.success = true;
					}
					else
					{
						this.model.setSelectedNode(null);
					}
				}
			}

			else if(event.button == 2)
			{
				if(!this.interaction.success)
				{
					this.mouseGrabX = this.stageMouse.x;
					this.mouseGrabY = this.stageMouse.y;
					this.cameraVelX = 0;
					this.cameraVelY = 0;
				}
			}
		}

		protected onMouseUp(event)
		{
			if(event.button == 0)
			{
				this.interaction.success = false;
			}

			else if(event.button == 2)
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
		}

		protected onMouseWheel(event)
		{
			if(!this.interaction.success)
			{
				this.zoom(event.originalEvent.wheelDelta > 0 ? 1 : -1);
			}
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

			if(this.interaction.success)
			{
				this.interaction.constrain = event.shiftKey;
				this.interaction.node.updateInteraction(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.interaction);
			}
			else if(this.mode != EditMode.PLAYBACK)
			{
				if(this.model.hitTest(this.stageMouse.x, this.stageMouse.y, 1 / this.scale, this.highlightInteraction))
				{
					this.highlightInteraction.node.setHighlighted(true);
				}
				else
				{
					this.model.setHighlightedNode(null);
				}
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