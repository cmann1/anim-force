namespace app.anim
{

	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import Node = app.model.Node;
	import Bone = app.model.Bone;

	export class BoneTrack extends Track
	{

		protected node:Bone;

		constructor(animation:Animation, node:Node)
		{
			super(animation, node);

			this.addProperty('length', TrackPropertyType.NUMBER);
			this.addProperty('stretchY', TrackPropertyType.NUMBER);
		}

	}

}