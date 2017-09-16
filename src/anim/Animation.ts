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
	import LoadData = app.projects.LoadData;

	export class Animation
	{

		public name:string;
		public active:boolean = false;
		public fps = 30;
		public loop = true;
		public skipLastFrame = false;
		public tracks:{[id:string]:Track} = {};

		protected readOnly = false;

		protected model:app.model.Model;

		protected accumulatedTime:number = 0;
		protected fpsStep;

		protected frameIndex:number = 0;
		protected length:number = 1;

		public suppressEvents:boolean = false;

		// UI

		public scrollX:number = 0;

		/// Events

		public change:EventDispatcher<Animation> = new EventDispatcher<Animation>();

		constructor(name:string, model:app.model.Model, readOnly=false, forceKeyframe=true)
		{
			this.name = name;
			this.model = model;
			this.readOnly = readOnly;

			model.structureChange.on(this.onModelStructureChange);
			this.initTracksFromModel(forceKeyframe);
		}

		public initTracksFromModel(forceKeyframe=true)
		{
			this.initNodes(this.model.children, this.model.getBindPose(), forceKeyframe);
		}

		private initNodes(nodes:Node[], copyFrom:Animation=null, forceKeyframe=true)
		{
			for(var node of nodes)
			{
				this.tracks[node.id] = this.createTrack(node, copyFrom ? copyFrom.tracks[node.id] : null, forceKeyframe);

				if(node instanceof ContainerNode)
				{
					this.initNodes((<ContainerNode> node).children, copyFrom, forceKeyframe);
				}
			}
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

		private createTrack(target:Node, copyFrom:Track=null, forceKeyframe=true):Track
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

			if(forceKeyframe)
			{
				track.forceKeyframe(0, copyFrom);
			}

			track.setPosition(this.frameIndex);
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

				if(this.frameIndex >= this.length - (this.skipLastFrame ? 1 : 0))
				{
					this.setPosition(this.frameIndex - this.length);
				}
			}
		}

		public forceKeyframe(node:Node = null, frameIndex = -1)
		{
			if(this.readOnly) return;

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
			if(this.readOnly) return;

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
			if(this.readOnly) return;


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
			if(this.readOnly) return;


			var prev = this.getPrevKeyframe();

			if(prev)
			{
				this.setPosition(prev.frameIndex);
			}
		}

		public gotoNextKeyframe()
		{
			if(this.readOnly) return;


			var next = this.getNextKeyframe();

			if(next)
			{
				this.setPosition(next.frameIndex);
			}
		}

		public updateNodes()
		{
			for(var trackId in this.tracks)
			{
				this.tracks[trackId].updateNode();
			}
		}

		public setPosition(frameIndex:number)
		{
			if(this.readOnly) return;


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

		public deleteKeyframe(node:Node|Track = null, frameIndex = -1)
		{
			if(this.readOnly) return;

			if(frameIndex < 0) frameIndex = this.frameIndex;

			if(node instanceof Node)
			{
				const track = this.tracks[node.id];
				if(track)
				{
					track.deleteKeyframe(frameIndex);
				}
			}
			else if(node instanceof Track)
			{
				node.deleteKeyframe(frameIndex);
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

		public copyKeyframes(frameData:any, node:Node|Track = null, forceAll = false, cut = false, frameIndex = -1):number
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			var frameCount = 0;
			var tracks:{[id:string]:Track};

			if(node instanceof Node)
			{
				tracks = {};
				const track = this.tracks[node.id];
				if(track) tracks[node.id] = track;
			}
			else if(node instanceof Track)
			{
				tracks = {};
				tracks[node.node.id] = node;
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

		public pasteKeyframes(frameData:any, node:Node|Track = null, frameIndex = -1):number
		{
			if(this.readOnly) return 0;

			if(frameIndex < 0) frameIndex = this.frameIndex;

			var frameCount = 0;

			const intoTrack = node instanceof Track ? node : null;
			const intoNode = node instanceof Node ? node : null;

			for(var nodeId in frameData)
			{
				if(!frameData.hasOwnProperty(nodeId)) continue;

				const track = intoTrack ? intoTrack : this.tracks[intoNode ? intoNode.id : nodeId];
				if(track)
				{
					track.pasteKeyframes(frameData[nodeId], frameIndex);
					frameCount++;

					if(intoTrack || intoNode) break;
				}
			}

			if(frameCount)
			{
				this.dispatchChange('paste');
			}

			return frameCount;
		}

		public getClosestKeyframes(frameIndex:number, out:KeyframeStruct, node:Node|Track=null)
		{
			if(node instanceof Node)
			{
				this.tracks[node.id].getClosestKeyframes(frameIndex, out);
				return;
			}
			else if(node instanceof Track)
			{
				node.getClosestKeyframes(frameIndex, out);
				return;
			}

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].getClosestKeyframes(frameIndex, out);

			}
		}

		public getLength()
		{
			return this.length;
		}

		public extendLength(newLength)
		{
			if(this.readOnly) return;


			if(newLength > this.length)
			{
				this.length = newLength;
				this.dispatchChange('length');
			}
		}

		public trimLength()
		{
			var newLength = 1;

			for(var trackId in this.tracks)
			{
				newLength = Math.max(newLength, this.tracks[trackId].trimLength());
			}

			if(newLength != this.length)
			{
				this.length = newLength;
				this.dispatchChange('length');
			}
		}

		//

		public save():any
		{
			var data = {
				name: this.name,
				readOnly: this.readOnly,
				fps: this.fps,
				loop: this.loop,
				skipLastFrame: this.skipLastFrame,
				frameIndex: this.frameIndex,
				length: this.length,
				tracks: {},
				scrollX: this.scrollX
			};

			for(var trackId in this.tracks)
			{
				data.tracks[trackId] = this.tracks[trackId].save();
			}

			return data;
		}

		public load(data:LoadData):Animation
		{
			this.name = data.get('name');
			this.readOnly = data.get('readOnly');
			this.fps = data.get('fps');
			this.loop = data.get('loop');
			this.skipLastFrame = data.get('skipLastFrame');
			this.frameIndex = data.get('frameIndex');
			this.length = data.get('length');
			this.scrollX = data.get('scrollX');

			var tracks = data.get('tracks');
			for(var trackId in tracks)
			{
				if(!tracks.hasOwnProperty(trackId)) continue;

				var node = this.model.getNode(trackId);
				var track = this.tracks[trackId];

				if(!node || !track)
				{
					throw new Error('Invalid node id: ' + trackId);
				}

				node.propertyChange.on(this.onNodePropertyChange);
				track.load(data.asLoadData(tracks[trackId]));
			}

			return this;
		}

		//

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

			if(track && track.onNodePropertyChange(node, event.type))
			{
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
				else if(this.active)
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