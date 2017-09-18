namespace app.anim
{

	export class VectorProperty extends TrackProperty
	{

		public current:VectorKeyframe;
		public prev:VectorKeyframe;
		public next:VectorKeyframe;
		public last:VectorKeyframe;

		constructor(track:Track, propertyName:string)
		{
			super(track, propertyName, VectorKeyframe, TrackPropertyType.VECTOR);
		}

		public updateNode(node:any, interpolation:Interpolation,
		                  prev:VectorKeyframe=this.prev, current:VectorKeyframe=this.current, next:VectorKeyframe=this.next)
		{
			var x:number;
			var y:number;

			if(current)
			{
				x = (<VectorKeyframe> current).x;
				y = (<VectorKeyframe> current).y;
			}
			else if(prev && next)
			{
				const t:number = this.getT(interpolation, prev, next);

				x = prev.x * (1 - t) + next.x * t;
				y = prev.y * (1 - t) + next.y * t;
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
			else
			{
				x = node[this.propertyName + 'X'];
				y = node[this.propertyName + 'Y'];
			}

			node[this.propertyName + 'X'] = x;
			node[this.propertyName + 'Y'] = y;
		}

	}

}