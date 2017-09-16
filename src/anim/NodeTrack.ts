namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;
	import TrackPropertyType = app.anim.properties.TrackPropertyType;

	export class NodeTrack extends Track
	{

		public node:Node;

		constructor(type:string, animation:Animation, node:Node)
		{
			super(type, animation, node);

			this.addProperty('offset', TrackPropertyType.VECTOR);
			this.addProperty('rotation', TrackPropertyType.ANGLE);
		}

	}

}