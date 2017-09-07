namespace app.anim
{

	import Node = app.model.Node;
	import PropertyChangeEvent = events.PropertyChangeEvent;

	export class Track
	{

		protected animation:Animation;
		protected properties:{[id:string]:TrackProperty} = {};
		protected node:Node;

		public length:number = 1;

		constructor(animation:Animation, node:Node)
		{
			this.animation = animation;
			this.node = node;

			this.properties['offset'] = new TrackProperty(this, TrackPropertyType.VECTOR);
			this.properties['rotation'] = new TrackProperty(this, TrackPropertyType.ANGLE);
		}

		public forceKeyframe()
		{
			for(var propertyName in this.properties)
			{
				const property:TrackProperty = this.properties[propertyName];

				if(property.type == TrackPropertyType.VECTOR)
				{
					property.setVector(this.node[propertyName + 'X'], this.node[propertyName + 'Y']);
				}
				else if(property.type == TrackPropertyType.NUMBER || property.type == TrackPropertyType.ANGLE)
				{
					property.setNumber(this.node[propertyName]);
				}
			}
		}

		public gotoNextFrame()
		{

			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.gotoNextFrame();
				property.updateNode(this.node, propertyName);
			}
		}

		public gotoPrevFrame()
		{
			for(var propertyName in this.properties)
			{
				const property = this.properties[propertyName];
				property.gotoPrevFrame();
				property.updateNode(this.node, propertyName);
			}
		}

		public onNodePropertyChange(node:Node, propertyName:string)
		{
			const property:TrackProperty = this.properties[propertyName];

			if(property)
			{
				property.updateFrame(node, propertyName);
			}
		}

		public extendLength(newLength)
		{
			if(newLength > this.length)
			{
				this.length = newLength;
				this.animation.extendLength(newLength);
			}
		}
	}

	export class TrackProperty
	{

		public track:Track;
		public type:TrackPropertyType;

		public frameIndex:number = 0;
		public frames:Keyframe = null;
		public length:number = 1;

		public current:Keyframe = null;
		public prev:Keyframe = null;
		public next:Keyframe = null;

		constructor(track:Track, type:TrackPropertyType)
		{
			this.track = track;
			this.type = type;
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

		public setNumber(value:number)
		{
			if(this.current)
			{
				(<NumberKeyframe> this.current).value = value;
				return;
			}

			this.insert(new NumberKeyframe(this.frameIndex, value));
		}

		public setVector(x:number, y:number)
		{
			if(this.current)
			{
				(<VectorKeyframe> this.current).x = x;
				(<VectorKeyframe> this.current).y = y;
				return;
			}

			this.insert(new VectorKeyframe(this.frameIndex, x, y));
		}

		public updateFrame(node:Node, propertyName:string)
		{
			if(this.type == TrackPropertyType.VECTOR)
			{
				if(this.current)
				{
					(<VectorKeyframe> this.current).x = node[propertyName + 'X'];
					(<VectorKeyframe> this.current).y = node[propertyName + 'Y'];
				}
				else
				{
					this.insert(new VectorKeyframe(this.frameIndex, node[propertyName + 'X'], node[propertyName + 'Y']));
				}
			}
			else if(this.type == TrackPropertyType.NUMBER || this.type == TrackPropertyType.ANGLE)
			{
				if(this.current)
				{
					(<NumberKeyframe> this.current).value = node[propertyName];
				}
				else
				{
					this.insert(new NumberKeyframe(this.frameIndex, node[propertyName]));
				}
			}
		}

		public updateNode(node:Node, propertyName:string)
		{
			const type = this.type;

			if(this.type == TrackPropertyType.VECTOR)
			{
				var x:number;
				var y:number;
				const prev = (<VectorKeyframe> this.prev);
				const next = (<VectorKeyframe> this.next);
				const current = (<VectorKeyframe> this.current);

				if(current)
				{
					x = (<VectorKeyframe> this.current).x;
					y = (<VectorKeyframe> this.current).y;
				}
				else if(prev && next)
				{
					const t:number = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);
					x = prev.x + (next.x - prev.x) * t;
					y = prev.y + (next.y - prev.y) * t;
				}
				else if(prev)
				{
					x = prev.x;
					y = prev.y;
				}
				else if(next)
				{
					x = next.x;
					y = next.y;
				}

				node[propertyName + 'X'] = x;
				node[propertyName + 'Y'] = y;
			}
			else if(this.type == TrackPropertyType.NUMBER || this.type == TrackPropertyType.ANGLE)
			{
				var value:number;
				const prev = (<NumberKeyframe> this.prev);
				const next = (<NumberKeyframe> this.next);
				const current = (<NumberKeyframe> this.current);

				if(current)
				{
					value = current.value;
				}
				else if(prev && next)
				{
					const t:number = (this.frameIndex - prev.frameIndex) / (next.frameIndex - prev.frameIndex);
					var delta:number = (next.value - prev.value);

					if(this.type == TrackPropertyType.ANGLE)
					{
						// delta += (delta > Math.PI) ? -Math.PI * 2 : (delta < -Math.PI) ? Math.PI * 2 : 0;
						delta = Math.normalizeAngle(delta);
					}


					value = prev.value + delta * t;
				}
				else if(prev)
				{
					value = prev.value;
				}
				else if(next)
				{
					value = next.value;
				}

				node[propertyName] = value;
			}
		}

		protected insert(key:Keyframe)
		{
			if(!this.frames)
			{
				this.frames = key;
				if(this.frameIndex == key.frameIndex)
				{
					this.current = key;
				}
			}

			else
			{
				if(this.next)
				{
					if(this.next.prev == this.frames)
					{
						this.frames = key;
					}

					this.next.prev = key;
					key.next = this.next;
				}

				if(this.prev)
				{
					this.prev.next = key;
					key.prev = this.prev;
				}

				this.current = key;
			}

			if(key.frameIndex + 1 > this.length)
			{
				this.length = key.frameIndex + 1;
				this.track.extendLength(this.length);
			}
		}

	}

	export enum TrackPropertyType
	{
		NUMBER,
		ANGLE,
		VECTOR
	}

}