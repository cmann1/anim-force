namespace app.anim
{

	import ContainerTreeNode = app.timeline.tree.ContainerTreeNode;
	import StructureChangeEvent = app.model.events.StructureChangeEvent;
	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import EventDispatcher = app.events.EventDispatcher;
	import Event = app.events.Event;

	export class Animation
	{

		public name:string;
		public tracks:{[id:string]:Track} = {};
		public active:boolean = false;
		public fps = 30;
		public loop = true;

		protected model:app.model.Model;

		protected accumulatedTime:number = 0;
		protected fpsStep;

		protected frameIndex:number = 0;
		protected length:number = 1;

		public suppressEvents:boolean = false;

		/// Events

		public change:EventDispatcher<Animation> = new EventDispatcher<Animation>();

		constructor(name:string, model:app.model.Model)
		{
			this.name = name;
			this.model = model;

			model.structureChange.on(this.onModelStructureChange);
		}

		private removeNodeRecursive(target:Node)
		{
			var a = 0;
			var nodes:Node[] = [target];

			while(a < nodes.length)
			{
				const node:Node = nodes[a++];

				if(node instanceof ContainerNode)
				{
					for(var child of node.children) nodes.push(child);
				}

				if(this.tracks[node.id])
				{
					delete this.tracks[node.id];
					node.propertyChange.off(this.onNodePropertyChange);
				}
			}
		}

		private createTrack(target:Node):Track
		{
			var track:Track = null;

			if(target instanceof Bone)
			{
				track = new BoneTrack(this, target);
			}

			if(target instanceof Sprite)
			{
				track = new SpriteTrack(this, target);
			}

			target.propertyChange.on(this.onNodePropertyChange);

			if(!track)
			{
				console.error('Cannot create animation track for', target);
			}

			track.forceKeyframe();
			return track;
		}

		public clear()
		{
			this.frameIndex = 0;
			this.length = 1;
			this.fps = 30;
			this.tracks = {};

			this.dispatchChange('clear');
		}

		public initForAnimation()
		{
			this.fpsStep = 1 / this.fps;
			this.accumulatedTime = 0;
		}

		public animateStep(deltaTime:number)
		{
			this.accumulatedTime += deltaTime;

			while(this.accumulatedTime > this.fpsStep)
			{
				this.gotoNextFrame();
				this.accumulatedTime -= this.fpsStep;

				if(this.frameIndex >= this.length)
				{
					this.setPosition(this.frameIndex - this.length);
				}
			}
		}

		public forceKeyframe(node:Node = null, frameIndex = -1)
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			if(node)
			{
				const track = this.tracks[node.id];
				if(track)
				{
					track.forceKeyframe(frameIndex);
				}
			}
			else
			{
				for(var trackId in this.tracks)
				{
					this.tracks[trackId].forceKeyframe(frameIndex);
				}
			}

			this.dispatchChange('keyframe');
		}

		public gotoPrevFrame()
		{
			if(this.frameIndex <= 0) return;

			this.frameIndex--;

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].gotoPrevFrame();
			}

			this.dispatchChange('position');
		}

		public gotoNextFrame()
		{
			this.frameIndex++;

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].gotoNextFrame();
			}

			this.dispatchChange('position');
		}

		public getPrevKeyframe()
		{
			var prev:Keyframe = null;

			for(var trackId in this.tracks)
			{
				var key = this.tracks[trackId].getPrevKeyframe();

				if(key && (!prev || key.frameIndex > prev.frameIndex))
				{
					prev = key;
				}
			}

			return prev;
		}

		public getNextKeyframe()
		{
			var next:Keyframe = null;

			for(var trackId in this.tracks)
			{
				var key = this.tracks[trackId].getNextKeyframe();

				if(key && (!next || key.frameIndex < next.frameIndex))
				{
					next = key;
				}
			}

			return next;
		}

		public gotoPrevKeyframe()
		{
			var prev = this.getPrevKeyframe();

			if(prev)
			{
				this.setPosition(prev.frameIndex);
			}
		}

		public gotoNextKeyframe()
		{
			var next = this.getNextKeyframe();

			if(next)
			{
				this.setPosition(next.frameIndex);
			}
		}

		public setPosition(frameIndex:number)
		{
			if(frameIndex < 0) frameIndex = 0;
			if(frameIndex == this.frameIndex) return;

			if(frameIndex == this.frameIndex + 1)
			{
				this.gotoNextFrame();
				return;
			}

			if(frameIndex == this.frameIndex - 1)
			{
				this.gotoPrevFrame();
				return;
			}

			this.frameIndex = frameIndex;

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].setPosition(frameIndex);
			}

			this.dispatchChange('position');
		}

		public getPosition():number
		{
			return this.frameIndex;
		}

		public deleteKeyframe(node:Node = null, frameIndex = -1)
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			if(node)
			{
				const track = this.tracks[node.id];
				if(track)
				{
					track.deleteKeyframe(frameIndex);
				}
			}
			else
			{
				for(var trackId in this.tracks)
				{
					this.tracks[trackId].deleteKeyframe(frameIndex);
				}
			}

			this.dispatchChange('deleteKeyframe');
		}

		public copyKeyframes(frameData:any, node:Node = null, forceAll = false, cut = false, frameIndex = -1):number
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			var frameCount = 0;
			var tracks:{[id:string]:Track};

			if(node)
			{
				tracks = {};
				const track = this.tracks[node.id];
				if(track) tracks[node.id] = track;
			}
			else
			{
				tracks = this.tracks;
			}

			for(var trackId in tracks)
			{
				var trackFrameData = {};
				var copyCount = this.tracks[trackId].copyKeyframes(trackFrameData, forceAll, cut, frameIndex);

				if(copyCount > 0)
				{
					frameData[trackId] = trackFrameData;
					frameCount++;
				}
			}

			if(frameCount && cut)
			{
				this.dispatchChange('cut');
			}

			return frameCount;
		}

		public pasteKeyframes(frameData:any, frameIndex = -1):number
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			var frameCount = 0;

			for(var nodeId in frameData)
			{
				if(!frameData.hasOwnProperty(nodeId)) continue;

				const track = this.tracks[nodeId];
				if(track)
				{
					track.pasteKeyframes(frameData[nodeId], frameIndex);
					frameCount++;
				}
			}

			if(frameCount)
			{
				this.dispatchChange('paste');
			}

			return frameCount;
		}

		public getLength()
		{
			return this.length;
		}

		public extendLength(newLength)
		{
			if(newLength > this.length)
			{
				this.length = newLength;
				this.dispatchChange('length');
			}
		}

		protected dispatchChange(type:string)
		{
			if(!this.suppressEvents)
			{
				this.change.dispatch(this, new Event(type));
			}
		}

		/*
		 * Events
		 */

		private onNodePropertyChange = (node:app.model.Node, event:PropertyChangeEvent) =>
		{
			if(!this.active) return;

			const track = this.tracks[node.id];

			if(track)
			{
				track.onNodePropertyChange(node, event.type);
				this.dispatchChange('keyframe');
			}
		};

		private onModelStructureChange = (model:app.model.Model, event:StructureChangeEvent) =>
		{
			const type = event.type;
			const target:Node = event.target;

			if(type == 'clear')
			{
				this.tracks = {};
			}
			else if(type == 'addChild')
			{
				const track = this.tracks[target.id];

				if(!track)
				{
					this.tracks[target.id] = this.createTrack(target);
				}
				else
				{
					track.updateKeyframe();
				}
			}
			else if(type == 'removeChild')
			{
				this.removeNodeRecursive(target);
			}
		};

	}

}