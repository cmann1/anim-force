namespace app.anim
{

	import PropertyChangeEvent = events.PropertyChangeEvent;
	import Node = app.model.Node;
	import Bone = app.model.Bone;

	export class BoneTrack extends Track
	{

		protected node:Bone;

		constructor(animation:Animation, node:Node)
		{
			super(animation, node);

			this.properties['length'] = new TrackProperty(this, TrackPropertyType.NUMBER);
			this.properties['stretchY'] = new TrackProperty(this, TrackPropertyType.NUMBER);
		}

	}

}