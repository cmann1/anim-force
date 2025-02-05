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
	import EditMode = app.model.EditMode;
	import Keyframe = app.anim.Keyframe;
	import KeyframeStruct = app.anim.KeyframeStruct;
	import PromptDlg = app.ui.PromptDlg;
	import EventTrack = app.anim.EventTrack;
	import StringKeyframe = app.anim.StringKeyframe;
	import Dialog = app.ui.Dialog;

	export class TimelineViewport extends app.Canvas
	{

		private model:Model;
		private tree:TimelineTree;
		private animation:Animation;
		private mode:EditMode;

		private trackList:Track[] = [];

		private toolbar:TimelineToolbar;
		private eventPrompt:PromptDlg;
		private eventEditTrack:EventTrack = null;
		private eventEditFrame:number = -1;

		private scrollX:number = 0;
		private scrollY:number = 0;
		private currentFrame:number = 0;

		private selectedTrack:Track = null;
		private selectedFrame:number = -1;

		private dragFrameIndicator = false;
		private dragKeyframeTrack:Track = null;
		private dragKeyframeIndex:number = -1;
		private dragKeyframeTargetTrack:Track = null;
		private dragKeyframeTargetIndex:number = -1;
		private dragKeyframeInitiated = false;
		private deselectKeyframe = false;
		private dragView = false;
		private dragViewX = 0;
		private dragViewY = 0;

		private headerGrad:CanvasGradient;
		private headerFontSize = '12px';
		private headerTickSize:number = 4;
		private headerFrameInterval:number = 5;
		private scrubColour = 'rgba(255, 50, 50, 0.5)';
		private keyframeSize = 4;
		private selectedFrameColour = '#fdf4a8';
		private labelFontSize = '12px';

		private labelCanvas:HTMLCanvasElement;
		private labelCtx:CanvasRenderingContext2D;

		public viewport:app.viewport.Viewport;

		constructor(elementId, model:Model, tree:TimelineTree)
		{
			super(elementId);

			this.tree = tree;

			tree.scrollChange.on(this.onTreeScroll);
			tree.treeNodeUpdate.on(this.onTreeNodeUpdate);

			this.$canvas .on('dblclick', this.onCanvasDblClick);

			this.toolbar = new TimelineToolbar(model, this, this.$container.parent().find('#timeline-toolbar'));

			this.headerGrad = this.ctx.createLinearGradient(0, 0, 0, Config.nodeHeight);
			this.headerGrad.addColorStop(0, Config.node);
			this.headerGrad.addColorStop(1, Config.nodeBottom);

			this.setModel(model);

			this.labelCanvas = document.createElement('canvas');
			this.labelCanvas.width = Config.frameWidth * 10;
			this.labelCanvas.height = Config.nodeHeight;
			this.labelCtx = this.labelCanvas.getContext('2d');
		}

		//

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

			const firstFrame = Math.floor(left / frameWidth);
			const lastFrame = Math.ceil(right / frameWidth);

			ctx.clearRect(0, 0, this.width, this.height);
			ctx.save();

			this.drawHeader();

			ctx.beginPath();
			ctx.rect(0, nodeHeight, this.width, this.height - nodeHeight);
			ctx.clip();

			ctx.translate(-this.scrollX, -this.scrollY + nodeHeight);

			const labelCtx = this.labelCtx;
			labelCtx.font = `${this.labelFontSize} ${Config.font}`;
			labelCtx.fillStyle = Config.text;
			labelCtx.textAlign = 'left';
			labelCtx.textBaseline = 'middle';

			var y = 0;
			for(var track of this.trackList)
			{
				const keyframeColour = this.mode != EditMode.EDIT ? track.keyframeColour : track.keyframeDisabledColour;
				const keyframeBorderColour = this.mode != EditMode.EDIT ? track.keyframeBorderColour : track.keyframeDisabledBorderColour;

				if(y <= bottom && y + nodeHeight >= top)
				{
					ctx.fillStyle = Config.node;
					ctx.fillRect(this.scrollX, y, this.width, nodeHeight);
					ctx.fillStyle = Config.nodeBorder;
					ctx.fillRect(this.scrollX, y + nodeHeight - 1, this.width, 1);

					var lastKeyframe = -1;
					var onScreenFrameCount = 0;
					const selectedFrame = this.selectedTrack == track ? this.selectedFrame : -1;
					const dragFrame = this.dragKeyframeTrack == track ? this.dragKeyframeIndex : -1;
					const dropTargetFrame = this.dragKeyframeTargetTrack == track ? this.dragKeyframeTargetIndex : -1;

					// Draw the background (selection and borders)

					for(var j = firstFrame, x = firstFrame * frameWidth; j < lastFrame; j++)
					{
						if(j == selectedFrame || j == dropTargetFrame)
						{
							ctx.fillStyle = this.selectedFrameColour;
							ctx.fillRect(x, y, frameWidth - 1, nodeHeight - 1);

							if(j == dragFrame)
							{
								ctx.fillStyle = track.keyframeBorderColour;
								ctx.fillRect(x, y, 1, nodeHeight - 1);
								ctx.fillRect(x + frameWidth - 2, y, 1, nodeHeight - 1);
								ctx.fillRect(x + 1, y, frameWidth - 3, 1);
								ctx.fillRect(x + 1, y + nodeHeight - 2, frameWidth - 3, 1);
							}
						}

						if(j < animationLength)
						{
							ctx.fillStyle = Config.nodeBorder;
							ctx.fillRect(x + frameWidth - 1, y, 1, nodeHeight);
						}

						x += frameWidth;
					}

					// Draw keyframes

					var labels = [];

					for(var j = firstFrame, x = firstFrame * frameWidth; j < lastFrame; j++)
					{
						var prev:Keyframe = null;
						var next:Keyframe = null;
						var arrowCount = 0;
						var cx = x + frameCX;
						var cy = y + frameCY;


						if(j < animationLength)
						{
							let keyframe = track.getKeyFrame(j);
							if(keyframe)
							{
								onScreenFrameCount++;

								if(labels.length)
								{
									const label = labels[labels.length - 1];
									if(label.x + label.width > x)
										label.width = x - label.x - 1;
								}

								// Keyframe diamond
								ctx.fillStyle = keyframeColour;
								ctx.strokeStyle = keyframeBorderColour;
								ctx.beginPath();
								ctx.moveTo(cx - keyframeSize, cy);
								ctx.lineTo(cx, cy - keyframeSize);
								ctx.lineTo(cx + keyframeSize, cy);
								ctx.lineTo(cx, cy + keyframeSize);
								ctx.closePath();
								ctx.fill();
								ctx.stroke();

								if(track.keyLabelProperty && (keyframe = track.getKeyFrame(j, track.keyLabelProperty)))
								{
									const label = String(keyframe[track.keyLabelField]);
									const labelWidth = labelCtx.measureText(label).width;
									labels.push({
										x: x + frameWidth + 4,
										text: label,
										width: labelWidth
									});
								}

								// There needs to be an arrow connecting keyframes
								if(keyframe.next && keyframe.next.frameIndex > keyframe.frameIndex + 1)
								{
									lastKeyframe = j;
									prev = keyframe;
									next = keyframe.next;
									arrowCount++;

									if(prev.prev && prev.prev.frameIndex < firstFrame)
									{
										arrowCount++;
									}
								}
								else if(keyframe.prev && keyframe.prev.frameIndex != lastKeyframe && keyframe.prev.frameIndex < keyframe.frameIndex - 1)
								{
									lastKeyframe = j;
									prev = keyframe.prev;
									next = keyframe;
									arrowCount++;
								}
							}
						}

						// Connect two keyframes outside of the drawing range
						if(onScreenFrameCount == 0 && j + 1 == lastFrame)
						{
							let tmp:KeyframeStruct = {prev: null, current: null, next:  null};
							this.animation.getClosestKeyframes(j, tmp, track);
							if(tmp.prev && tmp.next)
							{
								prev = tmp.prev;
								next = tmp.next;
								arrowCount++;
							}
						}

						// Draw keyframe connection arrows
						if(track.tweenable)
						{
							while(arrowCount--)
							{
								cx = next.frameIndex * frameWidth - 3;
								ctx.strokeStyle = keyframeBorderColour;
								ctx.beginPath();
								ctx.moveTo(prev.frameIndex * frameWidth + frameWidth + 2, cy);
								ctx.lineTo(cx, cy);
								ctx.lineTo(cx - 4, cy - 4);
								ctx.moveTo(cx, cy);
								ctx.lineTo(cx - 4, cy + 4);
								ctx.stroke();

								if(arrowCount > 0)
								{
									prev = prev.prev;
									next = prev.next;
								}
							}
						}

						x += frameWidth;
					}

					// Draw keyframe labels
					if(labels.length)
					{
						for(var label of labels)
						{
							if(label.width < frameWidth - 5) continue;

							labelCtx.clearRect(0, 0, this.labelCanvas.width, this.labelCanvas.height);
							labelCtx.fillText(label.text, 0, frameCY);

							const sw = Math.min(label.width, this.labelCanvas.width);
							ctx.drawImage(this.labelCanvas,
								0, 0, sw, nodeHeight,
								label.x, y, sw, nodeHeight);
						}
					}

				} // End if

				y += nodeHeight;
			}

			const currentFrameX = currentFrame * frameWidth;
			if(this.mode != EditMode.EDIT && currentFrameX <= right && currentFrameX + frameWidth >= left)
			{
				ctx.fillStyle = this.scrubColour;
				ctx.fillRect(currentFrameX + frameWidth * 0.5 - 1, top, 2, bottom - top);
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
				if(frameIndex == currentFrame && this.mode != EditMode.EDIT)
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

		//

		public focus()
		{
			this.$canvas.focus();
		}

		public getMode()
		{
			return this.mode;
		}

		public prevFrame(shiftKey)
		{
			if(shiftKey)
				this.animation.setPosition(this.animation.getPosition() - 5);
			else
				this.animation.gotoPrevFrame();
		}

		public nextFrame(shiftKey)
		{
			if(shiftKey)
				this.animation.setPosition(this.animation.getPosition() + 5);
			else
				this.animation.gotoNextFrame();
		}

		public reset()
		{
			this.scrollX = this.animation.scrollX = 0;
			this.scrollY = 0;

			this.requiresUpdate = true;
		}

		public setModel(model:Model)
		{
			this.model = model;
			this.mode = model.mode;
			this.animation = model.getActiveAnimation();
			this.updateTrackList();

			model.setAnimationListeners(this.onAnimationChange);
			model.animationChange.on(this.onModelAnimationChange);
			model.modeChange.on(this.onModelModeChange);
			model.selectionChange.on(this.onModelSelectionChange);

			this.currentFrame = this.animation.getPosition();
			this.toolbar.setModel(model);

			this.requiresUpdate = true;
		}

		public togglePlayback()
		{
			if(this.mode == EditMode.ANIMATE)
			{
				this.model.mode = EditMode.PLAYBACK;
			}
			else if(this.mode == EditMode.PLAYBACK)
			{
				this.model.mode = EditMode.ANIMATE;
			}
		}

		//

		private getFrameIndexAt(x:number):number
		{
			return Math.floor((x + this.scrollX) / Config.frameWidth);
		}

		private getNodeAt(y:number):Track
		{
			const i = Math.floor((y + this.scrollY) / Config.nodeHeight);
			return i < 0 || i >= this.trackList.length ? null : this.trackList[i];
		}

		private scrollIntoView(track:Track=null, frame:number=NaN)
		{
			if(track)
			{
				var trackY = this.trackList.indexOf(track) * Config.nodeHeight;
				if(trackY + Config.nodeHeight > this.scrollY + this.height - Config.nodeHeight)
				{
					this.scrollY = Math.floor(Math.max(0, trackY - this.height + Config.nodeHeight + Config.nodeHeight));
				}
				else if(trackY < this.scrollY)
				{
					this.scrollY = Math.floor(Math.max(0, trackY));
				}

				this.tree.setScroll(this.scrollY);
			}

			if(!isNaN(frame))
			{
				var frameX = frame * Config.frameWidth;
				if(frameX + Config.frameWidth > this.scrollX + this.width)
				{
					this.scrollX = this.animation.scrollX = Math.floor(Math.max(0, frameX - this.width + Config.frameWidth));
				}
				else if(frameX < this.scrollX)
				{
					this.scrollX = this.animation.scrollX = Math.floor(Math.max(0, frameX));
				}
			}

			this.requiresUpdate = true;
		}

		private setFrame(frame:number)
		{
			if(this.currentFrame == frame) return;

			this.animation.setPosition(frame);
			this.currentFrame = this.animation.getPosition();
			this.toolbar.updateFrameLabel();
			this.scrollIntoView(null, this.currentFrame);
		}

		private setSelectedFrame(track:Track, frameIndex:number=-1, toggle=false):boolean
		{
			if(frameIndex < 0) track = null;

			if(track == this.selectedTrack && frameIndex == this.selectedFrame)
			{
				if(toggle && track)
				{
					this.selectedTrack = null;
					this.selectedFrame = -1;
				}
				return false;
			}

			this.selectedTrack = track;
			this.selectedFrame = track ? frameIndex : -1;
			return true;
		}

		private showEventPrompt(track:EventTrack, frame:number)
		{
			if(!this.eventPrompt)
			{
				this.eventPrompt = new PromptDlg('Event Name', {
					target: this.$container,
					position: {x: 'center', y: 'bottom'},
					pointer: true,
					pointTo: 'bottom',
					buttons: [
						{label: 'Accept', confirm: true},
						{label: 'Cancel', cancel: true}
					],
					confirm: this.onEventConfirm,
					close: this.onEventDlgClose
				});
			}

			const key = <StringKeyframe> track.getKeyFrame(frame);
			this.eventEditTrack = track;
			this.eventEditFrame = frame;

			const offset = this.eventPrompt.dialog.options.offset;
			offset.x = frame * Config.frameWidth - this.scrollX + Config.frameWidth * 0.5 - this.width * 0.5;
			offset.y = Config.nodeHeight + this.trackList.indexOf(track) * Config.nodeHeight - this.scrollY - this.height;
			this.eventPrompt.show(key ? key.value : '');
		}

		private stopKeyframeDrag(move=false, cancel=true)
		{
			if(this.dragKeyframeTrack)
			{
				if(!cancel && this.dragKeyframeTargetTrack && (this.dragKeyframeTrack != this.dragKeyframeTargetTrack || this.dragKeyframeIndex != this.dragKeyframeTargetIndex))
				{
					var frameData = {};
					this.animation.copyKeyframes(
						frameData, this.dragKeyframeTrack,
						false, move, this.dragKeyframeIndex);

					this.animation.pasteKeyframes(frameData, this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);

					this.setSelectedFrame(this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);
				}

				this.dragKeyframeTrack = null;
				this.dragKeyframeIndex = -1;
				this.dragKeyframeInitiated = false;
				this.dragKeyframeTargetTrack = null;
				this.dragKeyframeTargetIndex = -1;
			}
		}

		private updateTrackList()
		{
			this.trackList = [];

			var nodeList = this.model.getNodeList(true);
			for(var node of nodeList)
			{
				this.trackList.push(this.animation.tracks[node.id]);
			}
		}

		/*
		 * Events
		 */

		private onCanvasDblClick = (event) =>
		{
			if(this.mode == EditMode.ANIMATE)
			{
				if(this.mouseY > Config.nodeHeight)
				{
					if(event.button == 0)
					{
						const track = this.getNodeAt(this.mouseY - Config.nodeHeight);
						if(track instanceof EventTrack)
						{
							const frame = this.getFrameIndexAt(this.mouseX);
							this.showEventPrompt(track, this.getFrameIndexAt(this.mouseX));
						}
					}
				}
			}
		};

		private onEventConfirm = (name:string, value?:any) =>
		{
			value = $.trim(value);

			if(value == '')
			{
				this.animation.deleteKeyframe(this.eventEditTrack.node, this.eventEditFrame);
			}
			else
			{
				this.eventEditTrack.node.event = value;
				this.animation.forceKeyframe(this.eventEditTrack.node, this.eventEditFrame);
			}

			this.$canvas.focus();
		};

		private onEventDlgClose = (dlg:Dialog) =>
		{
			this.$canvas.focus();
		};

		//

		private onAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'position' || type == 'clear')
			{
				this.setFrame(animation.getPosition());
			}
			else if(type == 'length')
			{
				this.setSelectedFrame(this.selectedTrack, this.selectedFrame);
			}
			else if(type == 'updateTracks')
			{
				this.updateTrackList();
			}

			this.requiresUpdate = true;
		};

		private onModelAnimationChange = (animation:Animation, event:Event) =>
		{
			const type = event.type;

			if(type == 'updateAnimationList' || type == 'newAnimation')
			{
				if(type == 'newAnimation')
				{
					animation.change.on(this.onAnimationChange);
				}
			}

			if(type == 'setAnimation' || type == 'updateAnimationList')
			{
				this.setSelectedFrame(null, -1);

				this.animation = animation;
				this.currentFrame = this.animation.getPosition();
				this.toolbar.updateFrameLabel();
				this.scrollX = animation.scrollX;

				this.updateTrackList();

				this.requiresUpdate = true;
			}
		};

		private onModelSelectionChange = (model:Model, event:SelectionEvent) =>
		{
			this.requiresUpdate = true;
		};

		private onModelModeChange = (model:Model, event:Event) =>
		{
			this.mode = model.mode;
			this.requiresUpdate = true;
			this.toolbar.updateToolbarButtons();
		};

		protected onTreeNodeUpdate = (node:TreeNode, event:Event) =>
		{
			const type = event.type;

			if(type == 'nodeCollapse')
			{
				this.updateTrackList();
			}

			this.requiresUpdate = true;
		};

		protected onTreeScroll = (tree:TimelineTree, event:ScrollEvent) =>
		{
			this.scrollY = event.scrollY;
			this.requiresUpdate = true;
		};

		//

		protected onKeyDown(event)
		{
			if(this.viewport.commonKey(event)) return;
			if(this.commonKey(event)) return;

			if(this.mode == EditMode.PLAYBACK) return;

			const keyCode = event.keyCode;
			const ctrlKey = event.ctrlKey;
			const shiftKey = event.shiftKey;
			const altKey = event.altKey;

			// console.log(keyCode);

			if(this.mode == EditMode.ANIMATE)
			{
				if(keyCode == Key.Home)
				{
					this.setFrame(0);
				}
				else if(keyCode == Key.End)
				{
					this.setFrame(this.animation.getLength() - 1);
				}

				else if(ctrlKey && (keyCode == Key.C || keyCode == Key.X))
				{
					var frameData = {};
					var frameCount = this.animation.copyKeyframes(
						frameData, this.selectedTrack || this.model.getSelectedNode(),
						altKey, keyCode == Key.X, this.selectedFrame);
					Clipboard.setData('keyframes', frameData);
					this.viewport.showMessage(`Copied ${frameCount} frames`);

					if(keyCode == Key.X)
					{
						this.setSelectedFrame(null);
					}
				}
				else if(ctrlKey && keyCode == Key.V)
				{
					var frameCount = this.animation.pasteKeyframes(Clipboard.getData('keyframes'), this.selectedTrack, this.selectedFrame);
					this.viewport.showMessage(`Pasted ${frameCount} frames`);
					this.setSelectedFrame(null);
				}
				else if(keyCode == Key.Delete)
				{
					if(this.selectedTrack)
					{
						this.animation.deleteKeyframe(this.selectedTrack, this.selectedFrame);
						this.setSelectedFrame(null);
					}
				}

				else if(keyCode == Key.Escape)
				{
					if(this.dragKeyframeTargetTrack)
					{
						this.stopKeyframeDrag();
					}
				}
			}
		}

		public commonKey(event):boolean
		{
			const keyCode = event.keyCode;
			const ctrlKey = event.ctrlKey;
			const shiftKey = event.shiftKey;

			if(this.mode == EditMode.ANIMATE || this.mode == EditMode.PLAYBACK)
			{
				// Playback
				if(keyCode == Key.ForwardSlash)
				{
					this.togglePlayback();
					return true;
				}
			}

			if(this.mode == EditMode.ANIMATE)
			{
				// Prev/Next frame
				if(keyCode == Key.Comma)
				{
					this.prevFrame(event.shiftKey);
					return true;
				}
				else if(keyCode == Key.Period)
				{
					this.nextFrame(event.shiftKey);
					return true;
				}

				// Prev/Next keyframe
				if(keyCode == Key.OpenBracket)
				{
					this.animation.gotoPrevKeyframe();
					return true;
				}
				else if(keyCode == Key.ClosedBracket)
				{
					this.animation.gotoNextKeyframe();
					return true;
				}

				// Keyframes
				else if(!ctrlKey && keyCode == Key.X)
				{
					this.animation.deleteKeyframe(shiftKey ? null : this.model.getSelectedNode());
					return true;
				}
				else if(keyCode == Key.I)
				{
					this.animation.forceKeyframe(event.shiftKey ? null : this.model.getSelectedNode());
					return true;
				}
				else if(keyCode == Key.T && shiftKey)
				{
					var length = this.animation.getLength();
					this.animation.trimLength();
					this.viewport.showMessage(`Trimmed ${length - this.animation.getLength()} frames`);
					return true;
				}
			}

			return false;
		}

		protected onKeyUp(event)
		{

		}

		protected onMouseDown(event)
		{
			this.$canvas.focus();

			if(this.mode == EditMode.PLAYBACK) return;

			// Drag view
			if(event.button == 2)
			{
				this.dragViewX = this.scrollX + this.mouseX;
				this.dragViewY = this.scrollY + this.mouseY;
				this.dragView = true;
				return;
			}

			if(this.mode == EditMode.ANIMATE)
			{
				// Clicked on header
				if(this.mouseY <= Config.nodeHeight)
				{
					if(event.button == 0)
					{
						this.setFrame(this.getFrameIndexAt(this.mouseX));
						this.dragFrameIndicator = true;
					}
				}

				else
				{
					if(!this.setSelectedFrame(this.getNodeAt(this.mouseY - Config.nodeHeight), this.getFrameIndexAt(this.mouseX)))
					{
						this.deselectKeyframe = true;
					}

					if(this.selectedTrack && this.selectedTrack.getKeyFrame(this.selectedFrame))
					{
						this.dragKeyframeTrack = this.selectedTrack;
						this.dragKeyframeIndex = this.selectedFrame;
					}
				}
			}
		}

		protected onMouseUp(event)
		{
			this.dragFrameIndicator = false;

			if(this.dragView)
			{
				this.dragView = false;
				this.animation.scrollX = this.scrollX;
			}

			if(this.deselectKeyframe)
			{
				this.setSelectedFrame(null);
				this.deselectKeyframe = false;
			}

			this.stopKeyframeDrag(!event.ctrlKey, false);
		}

		protected onMouseWheel(event)
		{
			this.tree.triggerScroll(event);
		}

		protected onMouseMove(event)
		{
			if(this.mode == EditMode.PLAYBACK) return;

			if(this.dragFrameIndicator)
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

			else if(this.dragKeyframeTrack)
			{
				this.deselectKeyframe = false;

				if(!this.dragKeyframeInitiated)
				{
					let node = this.getNodeAt(this.mouseY - Config.nodeHeight);
					let frame = this.getFrameIndexAt(this.mouseX);

					if(node && frame >= 0)
					{
						this.dragKeyframeInitiated = true;
					}
				}

				if(this.dragKeyframeInitiated)
				{
					this.dragKeyframeTargetTrack = this.getNodeAt(this.mouseY - Config.nodeHeight);
					this.dragKeyframeTargetIndex = this.dragKeyframeTargetTrack ? this.getFrameIndexAt(this.mouseX) : -1;

					this.scrollIntoView(this.dragKeyframeTargetTrack, this.dragKeyframeTargetIndex);
				}
			}
		}

	}

}