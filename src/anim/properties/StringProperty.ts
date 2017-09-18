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
			// else if(prev && next)
			// {
			// 	value = prev.value;
			//
			// }
			// else if(prev)
			// {
			// 	value = prev.value;
			// }
			// else if(next)
			// {
			// 	value = next.value;
			// }
			// else
			// {
			// 	value = node[this.propertyName];
			// }

			node[this.propertyName] = value;
		}

	}

}