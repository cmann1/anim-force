namespace app.anim
{

	import LoadData = app.projects.LoadData;
	export enum Interpolation
	{
		LINEAR,
		COSINE
	}

	export type KeyframeStruct = {prev:Keyframe, current:Keyframe, next:Keyframe};
	var KEYFRAME_DATA:KeyframeStruct = {
		prev: null,
		current: null,
		next: null,
	};

	import Node = app.model.Node;
	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import TrackPropertyType = app.anim.TrackPropertyType;
	import TrackProperty = app.anim.TrackProperty;
	import Keyframe = app.anim.Keyframe;

	export class Track
	{
		protected type = null;

		public animation:Animation;
		protected properties:{[id:string]:TrackProperty} = {};

		public bulkKeyframeOperations = true;
		public tweenable = true;
		public keyLabelProperty:string = null;
		public keyLabelField:string = null;

		public node:any;
		public length:number = 1;
		public interpolation:Interpolation = Interpolation.LINEAR;

		public keyframeColour = '#f9e26f';
		public keyframeBorderColour = '#d4b82d';
		public keyframeDisabledColour = '#fff4be';
		public keyframeDisabledBorderColour = '#dacd8f';

		constructor(type:string, animation:Animation, node:any)
		{
			this.type = type;
			this.animation = animation;
			this.node = node;
		}

		protected addProperty(propertyName:string, type:TrackPropertyType)
		{
			this.properties[propertyName] = TrackProperty.create(this, propertyName, type);
		}

		public forceKeyframe(frameIndex = -1, copyFrom:Track=null)
		{
			for(var propertyName in this.properties)
			{
				this.properties[propertyName].updateFrame(this.node, frameIndex, true, copyFrom ? copyFrom.properties[propertyName] : null);
			}
		}

		public updateKeyframe(frameIndex = -1)
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.updateFrame(this.node, frameIndex, false);
				property.updateNode(this.node, this.interpolation);
			}
		}

		public gotoPrevFrame()
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.gotoPrevFrame();
				property.updateNode(this.node, this.interpolation);
			}
		}

		public gotoNextFrame()
		{

			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.gotoNextFrame();
				property.updateNode(this.node, this.interpolation);
			}
		}

		public getKeyFrame(frameIndex:number, from:string=null):Keyframe
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[from || propertyName];

				if(frameIndex < property.length && property.frameList[frameIndex])
				{
					return property.frameList[frameIndex];
				}

				if(from) return null;
			}

			return null;
		}

		public getClosestKeyframes(frameIndex:number, out:KeyframeStruct)
		{
			for(var propertyName in this.properties)
			{
				this.properties[propertyName].getKeyFrameAt(frameIndex, KEYFRAME_DATA);

				if(KEYFRAME_DATA.prev && (!out.prev || KEYFRAME_DATA.prev.frameIndex > out.prev.frameIndex))
				{
					out.prev = KEYFRAME_DATA.prev;
				}
				if(KEYFRAME_DATA.next && (!out.next || KEYFRAME_DATA.next.frameIndex < out.next.frameIndex))
				{
					out.next = KEYFRAME_DATA.next;
				}
			}
		}

		public getPrevKeyframe():Keyframe
		{
			var prev:Keyframe = null;

			for(var propertyName in this.properties)
			{
				var key = this.properties[propertyName].prev;

				if(key && (!prev || key.frameIndex > prev.frameIndex))
				{
					prev = key;
				}
			}

			return prev;
		}

		public getNextKeyframe():Keyframe
		{
			var next:Keyframe = null;

			for(var propertyName in this.properties)
			{
				var key = this.properties[propertyName].next;

				if(key && (!next || key.frameIndex < next.frameIndex))
				{
					next = key;
				}
			}

			return next;
		}

		public deleteKeyframe(frameIndex = -1)
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.deleteKeyframe(frameIndex);
				property.updateNode(this.node, this.interpolation);
			}
		}

		public copyKeyframes(frameData:any, forceAll = false, cut = false, frameIndex = -1):number
		{
			var frameCount = 0;

			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];

				if(property.copy(frameData, forceAll, frameIndex))
				{
					frameCount++;
				}

				if(cut && property.deleteKeyframe(frameIndex))
				{
					property.updateNode(this.node, this.interpolation);
				}
			}

			return frameCount;
		}

		public pasteKeyframes(frameData:any, frameIndex:number)
		{
			for(var propertyName in frameData)
			{
				if(!frameData.hasOwnProperty(propertyName)) continue;

				const property = this.properties[propertyName];

				if(property)
				{
					property.updateFrame(frameData[propertyName], frameIndex);
					property.updateNode(this.node, this.interpolation);
				}
			}
		}

		public setPosition(frameIndex:number)
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.setPosition(frameIndex);
				property.updateNode(this.node, this.interpolation);
			}
		}

		public updateNode()
		{
			for(var propertyName in this.properties)
			{
				this.properties[propertyName].updateNode(this.node, this.interpolation);
			}
		}

		public onNodePropertyChange(node:Node, propertyName:string):boolean
		{
			if(!this.properties[propertyName]) return false;

			for(var propertyName in this.properties)
			{
				this.properties[propertyName].updateFrame(this.node);
			}

			return true;
		}

		public extendLength(newLength)
		{
			if(newLength > this.length)
			{
				this.length = newLength;
				this.animation.extendLength(newLength);
			}
		}

		public trimLength():number
		{
			var newLength = 1;

			for(var propertyName in this.properties)
			{
				newLength = Math.max(newLength, this.properties[propertyName].trimLength());
			}

			return this.length = newLength;
		}

		//

		public copyFrom(track:Track)
		{
			this.length = track.length;
			this.interpolation = track.interpolation;

			for(var propertyName in track.properties)
			{
				this.properties[propertyName].copyFrom(track.properties[propertyName]);
			}
		}

		public save():any
		{
			var data:any = {
				type: this.type,
				nodeId: this.node.id,
				length: this.length,
				interpolation: this.interpolation,
				properties: {}
			};

			for(var propertyName in this.properties)
			{
				data.properties[propertyName] = this.properties[propertyName].save();
			}

			return data;
		}

		public load(data:LoadData):Track
		{
			const type = data.get('type');
			const nodeId = data.get('nodeId');

			if(type != this.type)
			{
				throw new Error('Mismatched animation track type');
			}
			if(nodeId != this.node.id)
			{
				throw new Error('Mismatched animation track id');
			}

			// Properties are auto inserting keyframe when loading
			this.length = data.get('length');
			this.interpolation = data.get('interpolation');

			const properties = data.get('properties');

			for(var propertyName in properties)
			{
				if(!properties.hasOwnProperty(propertyName)) continue;

				var property:TrackProperty = this.properties[propertyName];

				if(!property)
				{
					throw new Error('Invalid animation property');
				}

				property.load(data.asLoadData(properties[propertyName]));
			}

			return this;
		}
	}

}