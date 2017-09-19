namespace app.anim
{

	export class StringProperty extends TrackProperty
	{

		public current:StringKeyframe;
		public prev:StringKeyframe;
		public next:StringKeyframe;
		public last:StringKeyframe;

		constructor(track:Track, propertyName:string)
		{
			super(track, propertyName, StringKeyframe, TrackPropertyType.STRING);
		}

		public updateNode(node:any, interpolation:Interpolation,
		                  prev:StringKeyframe=this.prev, current:StringKeyframe=this.current, next:StringKeyframe=this.next)
		{
			var value:string;

			if(current)
			{
				value = current.value;
			}
			else
			{
				value = null;
			}

			node[this.propertyName] = value;
		}

	}

}