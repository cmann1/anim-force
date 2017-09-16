namespace app.anim.properties
{

	import LoadData = app.projects.LoadData;
	import Node = app.model.Node;

	var KEYFRAME_DATA:KeyframeStruct = {
		prev: null,
		current: null,
		next: null,
	};

	export enum TrackPropertyType
	{
		NUMBER,
		ANGLE,
		VECTOR
	}

	export class TrackProperty
	{

		public track:Track;
		public propertyName:string;
		public type:TrackPropertyType;

		public frameIndex:number = 0;
		public frames:Keyframe = null;
		public frameList:Keyframe[] = [];
		public length:number = 1;

		public current:Keyframe = null;
		public prev:Keyframe = null;
		public next:Keyframe = null;
		public last:Keyframe = null;

		protected KeyFrameClass:typeof Keyframe;

		constructor(track:Track, propertyName:string, KeyFrameClass:typeof Keyframe, type:TrackPropertyType)
		{
			this.KeyFrameClass = KeyFrameClass;
			this.track = track;
			this.propertyName = propertyName;
			this.type = type;
		}

		public static create(track:Track, propertyName:string, type:TrackPropertyType):TrackProperty
		{
			if(type == TrackPropertyType.NUMBER)
			{
				return new NumberProperty(track, propertyName);
			}

			if(type == TrackPropertyType.ANGLE)
			{
				return new AngleProperty(track, propertyName);
			}

			if(type == TrackPropertyType.VECTOR)
			{
				return new VectorProperty(track, propertyName);
			}

			throw new Error('Unknown track property type');
		}

		public gotoNextFrame()
		{
			this.frameIndex++;

			if(this.next && this.next.frameIndex == this.frameIndex)
			{
				this.current = this.next;
				this.next = this.current.next;
				this.prev = this.current.prev;
				return;
			}

			if(this.current)
			{
				this.prev = this.current;
				this.current = null;
				return;
			}
		}

		public gotoPrevFrame()
		{
			if(this.frameIndex <= 0) return;

			this.frameIndex--;

			if(this.prev && this.prev.frameIndex == this.frameIndex)
			{
				this.current = this.prev;
				this.prev = this.current.prev;
				this.next = this.current.next;
				return;
			}

			if(this.current)
			{
				this.next = this.current;
				this.current = null;
				return;
			}
		}

		public setPosition(frameIndex:number)
		{
			if(frameIndex < 0) frameIndex = 0;
			if(frameIndex == this.frameIndex) return;

			const length = this.length;

			if(frameIndex >= length)
			{
				this.prev = this.last;
				this.current = null;
				this.next = null;
			}
			else if(this.frameList[frameIndex])
			{
				this.current = this.frameList[frameIndex];
				this.prev = this.current.prev;
				this.next = this.current.next;
			}
			else if(this.frames)
			{
				this.current = null;
				this.prev = null;
				this.next = null;

				const groupCheckCount = 20;
				var i1 = frameIndex - 1;
				var i2 = frameIndex + 1;

				while(i1 >= 0 || i2 < length)
				{
					if(i1 >= 0)
					{
						for(var iMin = Math.max(0, i1 - groupCheckCount); i1 >= iMin; i1--)
						{
							var frame =  this.frameList[i1];
							if(frame)
							{
								this.prev = frame;
								this.next = frame.next;
								i1 = -1;
								i2 = length;
								break;
							}
						}
					}

					if(i2 < length)
					{
						for(var iMax = Math.min(length - 1, i2 + groupCheckCount); i2 <= iMax; i2++)
						{
							var frame =  this.frameList[i2];
							if(frame)
							{
								this.next = frame;
								this.prev = frame.prev;
								i1 = -1;
								i2 = length;
								break;
							}
						}
					}
				}
			}

			this.frameIndex = frameIndex;
		}

		public deleteKeyframe(frameIndex = -1):boolean
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			const key = this.frameList[frameIndex];
			if(!key) return false;

			if(key == this.next) this.next = key.next;
			if(key == this.prev) this.prev = key.prev;
			if(key == this.current) this.current = null;
			if(key == this.last) this.last = this.last.prev;

			if(key.prev) key.prev.next = key.next;
			if(key.next) key.next.prev = key.prev;
			this.frameList[frameIndex] = null;

			if(this.frames == key) this.frames = null;

			return true;
		}

		public trimLength():number
		{
			this.length = this.last ? this.last.frameIndex + 1 : 1;
			return this.length;
		}

		public copy(frameData:any, forceAll=false, frameIndex=-1):boolean
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;

			const frame = this.frameList[frameIndex];

			if(frame)
			{
				this.updateNode(frameData[this.propertyName] = {}, this.track.interpolation, frame.prev, frame, frame.next);

				return true;
			}
			else if(forceAll)
			{
				this.getKeyFrameAt(frameIndex, KEYFRAME_DATA);
				this.updateNode(frameData[this.propertyName] = {}, this.track.interpolation, KEYFRAME_DATA.prev, KEYFRAME_DATA.current, KEYFRAME_DATA.next);

				return true;
			}

			return false;
		}

		public updateFrame(node:any, frameIndex=-1, createKeyframe=true, copyFrom:TrackProperty=null)
		{
			if(frameIndex < 0) frameIndex = this.frameIndex;
			var frame:Keyframe = this.frameList[frameIndex];
			var copyFrame:Keyframe = copyFrom ? copyFrom.frameList[frameIndex] : null;

			if(!frame && createKeyframe)
			{
				this.insert(frame = new this.KeyFrameClass(frameIndex));
			}

			if(frame)
			{
				frame.set(this.propertyName, node, copyFrame);
			}
		}

		public updateNode(node:any, interpolation:Interpolation,
		                  prev:Keyframe=this.prev, current:Keyframe=this.current, next:Keyframe=this.next)
		{
			throw new Error('TrackProperty.update not implemented');
		}

		public getKeyFrameAt(frameIndex:number, out:KeyframeStruct)
		{
			var current:Keyframe = null;
			var prev:Keyframe = null;
			var next:Keyframe = null;

			if(this.frameList[frameIndex])
			{
				current = this.frameList[frameIndex];
				prev = out.current.prev;
				next = out.current.next;
			}
			else
			{
				if(this.frames && frameIndex < this.frames.frameIndex)
				{
					next = this.frames;
				}
				else if(this.last && frameIndex > this.last.frameIndex)
				{
					prev = this.last;
				}
				else
				{
					for(var i = frameIndex - 1; i >= 0; i--)
					{
						if(prev = this.frameList[i]) break;
					}
					if(!prev)
					{
						for(var i = frameIndex + 1; i < this.length; i++)
						{
							if(next = this.frameList[i]) break;
						}
					}
					else
					{
						next = prev.next;
					}
				}
			}

			out.current = current;
			out.prev = prev;
			out.next = next;

			return out;
		}

		//

		public save():any
		{
			var data:any = {
				type: this.type,
				frameIndex: this.frameIndex,
				length: this.length,
				frames: [],
				current: this.current ? this.current.frameIndex : -1,
				prev: this.prev ? this.prev.frameIndex : -1,
				next: this.next ? this.next.frameIndex : -1
			};

			var frame:Keyframe = this.frames;

			while(frame)
			{
				data.frames.push(frame.save());

				frame = frame.next;
			}

			return data;
		}

		public load(data:LoadData):TrackProperty
		{
			if(data.get('type') != this.type)
			{
				throw new Error('Invalid animation property data');
			}

			this.frameIndex = data.get('frameIndex');
			this.length = data.get('length');

			var frames = data.get('frames');

			var prevKey:Keyframe = null;

			for(var frameData of frames)
			{
				frameData = data.asLoadData(frameData);

				var frameIndex = frameData.get('frameIndex');
				var key:Keyframe = new this.KeyFrameClass(frameIndex);
				key.load(frameData);
				this.frameList[frameIndex] = key;

				if(!this.frames)
				{
					this.frames = key;
				}

				if(prevKey)
				{
					prevKey.next = key;
					key.prev = prevKey;
				}

				prevKey = key;
			}

			this.last = prevKey;

			const current = data.get('current');
			const prev = data.get('prev');
			const next = data.get('next');

			if(current != -1)
			{
				if(!this.frameList[current])
					throw new Error('Invalid frame index');
				this.current = this.frameList[current];
			}
			if(prev != -1)
			{
				if(!this.frameList[prev])
					throw new Error('Invalid frame index');
				this.prev = this.frameList[prev];
			}
			if(next != -1)
			{
				if(!this.frameList[next])
					throw new Error('Invalid frame index');
				this.next = this.frameList[next];
			}

			return this;
		}

		//

		protected insert(key:Keyframe)
		{
			const frameIndex = key.frameIndex;

			if(this.frameList[frameIndex]) return;

			this.getKeyFrameAt(frameIndex, KEYFRAME_DATA);
			var prev:Keyframe = KEYFRAME_DATA.prev;
			var next:Keyframe = KEYFRAME_DATA.next;

			if(prev)
			{
				key.prev = prev;
				prev.next = key;
			}
			if(next)
			{
				key.next = next;
				next.prev = key;
			}

			if(!key.prev)
			{
				this.frames = key;
			}
			if(!key.next)
			{
				this.last = key;
			}

			if(frameIndex == this.frameIndex)
			{
				this.current = key;
				this.prev = key.prev;
				this.next = key.next;
			}
			else
			{
				if(
					prev == this.prev && (next == this.current || next == this.next) ||
					next == this.next && (prev == this.current || prev == this.prev)
				)
				{
					if(key.frameIndex > this.frameIndex)
						this.next = key;
					else
						this.prev = key;
				}
			}

			if(frameIndex >= this.length)
			{
				this.length = key.frameIndex + 1;
				this.track.extendLength(this.length);
			}

			this.frameList[frameIndex] = key;
		}

		protected getT(interpolation:Interpolation, prev:Keyframe, next:Keyframe):number
		{
			const t:number = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);

			if(interpolation == Interpolation.COSINE)
			{
				return (1 - Math.cos(t * Math.PI)) / 2;
			}

			return t;
		}

	}

}