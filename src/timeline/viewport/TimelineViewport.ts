namespace app.timeline
{

	import Animation = app.anim.Animation;
	import Model = app.model.Model;
	import Event = app.events.Event;
	import TimelineTree = app.timeline.tree.TimelineTree;
	import ScrollEvent = app.events.ScrollEvent;
	import SelectionEvent = app.model.events.SelectionEvent;
	import StructureChangeEvent = app.model.events.StructureChangeEvent;
	import TreeNode = app.timeline.tree.TreeNode;
	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;
	import Track = app.anim.Track;
	import Key = KeyCodes.Key;

	export class TimelineViewport extends app.Canvas
	{

		private model:Model;
		private tree:TimelineTree;
		private animation:Animation;

		private $toolbar:JQuery;
		private $frameLabel:JQuery;

		private scrollX:number = 0;
		private scrollY:number = 0;
		private currentFrame:number = 0;

		private dragFrame = false;
		private dragView = false;
		private dragViewX = 0;
		private dragViewY = 0;

		private headerGrad:CanvasGradient;
		private headerFontSize = '12px';
		private headerTickSize:number = 4;
		private headerFrameInterval:number = 5;
		private scrubColour = 'rgba(255, 50, 50, 0.5)';
		private keyframeSize = 4;
		private keyframeColour = '#f9e26f';
		private keyframeBorderColour = '#d4b82d';

		public viewport:app.viewport.Viewport;

		constructor(elementId, model:Model, tree:TimelineTree)
		{
			super(elementId);

			this.model = model;
			this.tree = tree;

			this.animation = model.getActiveAnimation();
			this.animation.change.on(this.onAnimationChange);
			model.activeAnimationChange.on(this.onActiveAnimationChange);
			model.structureChange.on(this.onModelStructureChange);
			model.selectionChange.on(this.onModelSelectionChange);
			tree.scrollChange.on(this.onTreeScroll);
			tree.treeNodeUpdate.on(this.onTreeNodeUpdate);

			this.$container.on('resize', this.onResize);
			this.$container.parent().on('resize', this.onResize);
			this.$container.parent().parent().parent().on('resize', this.onResize);
			app.$window.on('resize', this.onResize);

			this.setupToolbar();

			this.headerGrad = this.ctx.createLinearGradient(0, 0, 0, Config.nodeHeight);
			this.headerGrad.addColorStop(0, Config.node);
			this.headerGrad.addColorStop(1, Config.nodeBottom);
		}

		public step(deltaTime:number, timestamp:number)
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;
		}

		public draw()
		{
			if(!this.requiresUpdate && document.activeElement != this.canvas) return;

			const ctx = this.ctx;
			const nodeHeight = Config.nodeHeight;
			const top  = this.scrollY;
			const bottom = top + this.height;
			const left  = this.scrollX;
			const right = left + this.width;

			const animation = this.animation;
			const animationLength = animation.getLength();
			const currentFrame = this.currentFrame;
			const frameWidth = Config.frameWidth;
			const frameCX = frameWidth * 0.5;
			const frameCY = nodeHeight * 0.5;
			const keyframeSize = this.keyframeSize;

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.save();

			this.drawHeader();

			ctx.beginPath();
			ctx.rect(0, nodeHeight, this.width, this.height - nodeHeight);
			ctx.clip();

			ctx.translate(-this.scrollX, -this.scrollY + nodeHeight);

			var nodes:Node[] = this.model.children.slice();
			var i = -1;
			for(var j = this.model.childCount - 1; j >= 0; j--) nodes[++i] = this.model.children[i];

			var y = 0;
			while(i >= 0)
			{
				var node:Node = nodes[i--];

				if(node instanceof ContainerNode && !node.collapsed)
				{
					for(var j = node.childCount - 1; j >= 0; j--) nodes[++i] = node.children[j];
					// for(var child of node.children)
					// {
					// 	nodes[++i] = child;
					// }
					// nodes = nodes.concat(node.children);
					// i += node.childCount;
				}

				if(y <= bottom && y + nodeHeight >= top)
				{
					ctx.fillStyle = Config.node;
					ctx.fillRect(this.scrollX, y, this.width, nodeHeight);
					ctx.fillStyle = Config.nodeBorder;
					ctx.fillRect(this.scrollX, y + nodeHeight - 1, this.width, 1);

					var track:Track = animation.tracks[node.id];
					var j = Math.floor(left / frameWidth);
					var x = j * frameWidth;

					for(; j < animationLength; j++)
					{
						if(x > right) break;

						const keyframe = track.getKeyFrame(j);
						if(keyframe)
						{
							var cx = x + frameCX;
							var cy = y + frameCY;
							ctx.fillStyle = this.keyframeColour;
							ctx.strokeStyle = this.keyframeBorderColour;
							ctx.beginPath();
							ctx.moveTo(cx - keyframeSize, cy);
							ctx.lineTo(cx, cy - keyframeSize);
							ctx.lineTo(cx + keyframeSize, cy);
							ctx.lineTo(cx, cy + keyframeSize);
							ctx.closePath();
							ctx.fill();
							ctx.stroke();

							if(keyframe.prev && keyframe.prev.frameIndex < keyframe.frameIndex - 1)
							{
								cx = keyframe.frameIndex * frameWidth - 3;
								ctx.beginPath();
								ctx.moveTo(keyframe.prev.frameIndex * frameWidth + frameWidth + 2, cy);
								ctx.lineTo(cx, cy);
								ctx.lineTo(cx - 4, cy - 4);
								ctx.moveTo(cx, cy);
								ctx.lineTo(cx - 4, cy + 4);
								ctx.stroke();
							}
						}

						ctx.fillStyle = Config.nodeBorder;
						ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);

						x += frameWidth;
					}
				}

				y += nodeHeight;
			}

			const currentFrameX = currentFrame * frameWidth;
			if(currentFrameX <= right && currentFrameX + frameWidth >= left)
			{
				ctx.fillStyle = this.scrubColour;
				ctx.fillRect(currentFrameX + frameWidth * 0.5 - 1, 0, 2, this.width);
			}

			ctx.restore();

			this.requiresUpdate = false;
		}

		public drawHeader()
		{
			const ctx = this.ctx;
			const nodeHeight = Config.nodeHeight;
			const headerTickSize = this.headerTickSize;
			const headerFrameInterval = this.headerFrameInterval;

			const left  = this.scrollX;
			const right = left + this.width;

			const animation = this.animation;
			const animationLength = animation.getLength();
			const currentFrame = this.currentFrame;
			const frameWidth = Config.frameWidth;

			ctx.fillStyle = this.headerGrad;
			ctx.fillRect(0, 0, this.width, nodeHeight);
			ctx.fillStyle = Config.nodeBorder;
			ctx.fillRect(0, nodeHeight - 1, this.width, 1);

			ctx.font = `${this.headerFontSize} ${Config.font}`;

			var frameIndex = Math.floor(left / frameWidth);
			var x = frameIndex * frameWidth;

			while(x <= right)
			{
				const drawX = x - this.scrollX;
				if(frameIndex == currentFrame)
				{
					ctx.fillStyle = this.scrubColour;
					ctx.fillRect(drawX + 3, 0, frameWidth - 6, nodeHeight - 1);
				}

				if(frameIndex % headerFrameInterval == 0)
				{
					ctx.fillStyle = Config.line;
					ctx.fillRect(drawX, nodeHeight - headerTickSize - 4, 1, headerTickSize + 2);

					ctx.fillStyle = Config.text;
					ctx.fillText(String(frameIndex + 1), drawX + 1, nodeHeight - headerTickSize - 6);
				}
				else
				{
					ctx.fillStyle = Config.line;
					ctx.fillRect(drawX, nodeHeight - headerTickSize - 2, 1, headerTickSize);
				}

				frameIndex++;
				x += frameWidth;
			}
		}

		private setupToolbar()
		{
			// TODO: Toolbar buttons
			this.$toolbar = this.$container.parent().find('#timeline-toolbar');
			this.$frameLabel = this.$toolbar.find('.frame-label .value');

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

			this.updateFrameLabel();
		}

		private updateFrameLabel()
		{
			this.$frameLabel.text((this.currentFrame + 1) + '/' + this.animation.getLength());
		}

		private setFrame(frame:number)
		{
			if(this.currentFrame == frame) return;

			this.animation.setPosition(frame);
			this.currentFrame = this.animation.getPosition();
			this.updateFrameLabel();

			var frameX = this.currentFrame * Config.frameWidth;
			if(frameX + Config.frameWidth > this.scrollX + this.width)
			{
				this.scrollX = Math.floor(Math.max(0, frameX - this.width + Config.frameWidth));
			}
			else if(frameX < this.scrollX)
			{
				this.scrollX = Math.floor(Math.max(0, frameX));
			}

			this.requiresUpdate = true;
		}

		/*
		 * Events
		 */

		// TODO: Implement
		private onActiveAnimationChange = (model:Model, event:Event) =>
		{
			// console.log(model, event);

			this.updateFrameLabel();

			this.requiresUpdate = true;
		};

		private onAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'position')
			{
				this.setFrame(animation.getPosition());
				this.updateFrameLabel();
			}
			else if(type == 'length')
			{
				this.updateFrameLabel();
			}

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
			if(this.viewport.commonKey(event)) return;
			if(this.commonKey(event)) return;

			const keyCode = event.keyCode;
			// console.log(keyCode);

			if(keyCode == Key.Home)
			{
				this.setFrame(0);
			}

			else if(keyCode == Key.End)
			{
				this.setFrame(this.animation.getLength() - 1);
			}
		}

		public commonKey(event):boolean
		{
			const keyCode = event.keyCode;

			// Prev/Next frame
			if(keyCode == Key.Comma)
			{
				if(event.shiftKey)
					this.animation.setPosition(this.animation.getPosition() - 5);
				else
					this.animation.gotoPrevFrame();
			}
			else if(keyCode == Key.Period)
			{
				if(event.shiftKey)
					this.animation.setPosition(this.animation.getPosition() + 5);
				else
					this.animation.gotoNextFrame();
			}

			// Prev/Next keyframe
			if(keyCode == Key.OpenBracket)
			{
				this.animation.gotoPrevKeyframe();
			}
			else if(keyCode == Key.ClosedBracket)
			{
				this.animation.gotoNextKeyframe();
			}

			// Keyframes
			else if(keyCode == Key.X)
			{
				this.animation.deleteKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
			}
			else if(keyCode == Key.I)
			{
				this.animation.forceKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
			}

			// Other

			return false;
		}

		protected onKeyUp(event)
		{

		}

		protected onMouseDown(event)
		{
			this.$canvas.focus();

			// Drag view
			if(event.button == 2)
			{
				this.dragViewX = this.scrollX + this.mouseX;
				this.dragViewY = this.scrollY + this.mouseY;
				this.dragView = true;
				return;
			}

			// Clicked on header
			if(this.mouseY <= Config.nodeHeight)
			{
				if(event.button == 0)
				{
					this.setFrame(Math.floor((this.mouseX + this.scrollX) / Config.frameWidth));
					this.dragFrame = true;
				}
			}

			else
			{

			}
		}

		protected onMouseUp(event)
		{
			this.dragFrame = false;
			this.dragView = false;
		}

		protected onMouseWheel(event)
		{
			this.tree.triggerScroll(event);
		}

		protected onMouseMove(event)
		{
			if(this.dragFrame)
			{
				this.setFrame(Math.floor((this.mouseX + this.scrollX) / Config.frameWidth));
			}

			else if(this.dragView)
			{
				this.scrollX = Math.max(0, this.dragViewX - this.mouseX);
				this.scrollY = Math.max(0, this.dragViewY - this.mouseY);
				this.tree.setScroll(this.scrollY);
				this.requiresUpdate = true;
			}
		}

	}

}