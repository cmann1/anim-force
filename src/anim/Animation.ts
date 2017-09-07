namespace app.anim
{

	import ContainerTreeNode = app.timeline.tree.ContainerTreeNode;
	import StructureChangeEvent = events.StructureChangeEvent;
	import Node = app.model.Node;
	import ContainerNode = app.model.ContainerNode;
	import Bone = app.model.Bone;
	import Sprite = app.model.Sprite;
	import PropertyChangeEvent = events.PropertyChangeEvent;

	export class Animation
	{

		public name:string;
		public tracks:{[id:string]:Track} = {};
		public active:boolean = false;
		public fps = 15;

		protected model:app.model.Model;

		protected frameIndex:number = 0;
		protected length:number = 1;

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

		private createTrack(target:Node)
		{
			var track:Track = null;

			if(target instanceof Bone)
			{
				track = new BoneTrack(target);
			}

			if(target instanceof Sprite)
			{
				track = new SpriteTrack(target);
			}

			target.propertyChange.on(this.onNodePropertyChange);

			if(!track)
			{
				console.error('Cannot create animation track for', target);
			}

			track.forceKeyframe();
			return track;
		}

		public forceKeyframe()
		{
			for(var trackId in this.tracks)
			{
				this.tracks[trackId].forceKeyframe();
			}
		}

		public gotoNextFrame()
		{
			this.frameIndex++;

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].gotoNextFrame();
			}
		}

		public gotoPrevFrame()
		{
			if(this.frameIndex <= 0) return;

			this.frameIndex--;

			for(var trackId in this.tracks)
			{
				this.tracks[trackId].gotoPrevFrame();
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
			// TODO: Seeking to any position
		}

		public getPosition():number
		{
			return this.frameIndex;
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
				if(!this.tracks[target.id])
				{
					this.tracks[target.id] = this.createTrack(target);
				}
			}
			else if(type == 'removeChild')
			{
				this.removeNodeRecursive(target);
			}
		};

	}

}