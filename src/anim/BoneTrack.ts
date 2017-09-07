namespace app.anim
{

	import PropertyChangeEvent = events.PropertyChangeEvent;
	import Node = app.model.Node;
	import Bone = app.model.Bone;

	export class BoneTrack extends Track
	{

		protected node:Bone;

		constructor(node:Node)
		{
			super(node);

			this.properties['length'] = new TrackProperty(TrackPropertyType.NUMBER);
			this.properties['stretchY'] = new TrackProperty(TrackPropertyType.NUMBER);
		}

	}

}