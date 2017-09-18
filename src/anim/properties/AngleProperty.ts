namespace app.anim
{

	export class AngleProperty extends TrackProperty
	{

		public current:NumberKeyframe;
		public prev:NumberKeyframe;
		public next:NumberKeyframe;
		public last:NumberKeyframe;

		constructor(track:Track, propertyName:string)
		{
			super(track, propertyName, NumberKeyframe, TrackPropertyType.ANGLE);
		}

		public updateNode(node:any, interpolation:Interpolation,
		                  prev:NumberKeyframe=this.prev, current:NumberKeyframe=this.current, next:NumberKeyframe=this.next)
		{
			var value:number;

			if(current)
			{
				value = current.value;
			}
			else if(prev && next)
			{
				const t:number = this.getT(interpolation, prev, next);
				var delta:number = Math.normalizeAngle(next.value - prev.value);

				value = prev.value * (1 - t) + (prev.value + delta) * t;

			}
			else if(prev)
			{
				value = prev.value;
			}
			else if(next)
			{
				value = next.value;
			}
			else
			{
				value = node[this.propertyName];
			}

			node[this.propertyName] = value;
		}

	}

}