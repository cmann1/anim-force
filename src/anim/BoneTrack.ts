namespace app.anim
{

	import PropertyChangeEvent = app.model.events.PropertyChangeEvent;
	import Node = app.model.Node;
	import Bone = app.model.Bone;
	import TrackPropertyType = app.anim.properties.TrackPropertyType;

	export class BoneTrack extends NodeTrack
	{

		public node:Bone;

		constructor(animation:Animation, node:Bone)
		{
			super('bone', animation, node);

			// this.addProperty('length', TrackPropertyType.NUMBER);
			this.addProperty('stretchY', TrackPropertyType.NUMBER);
		}

	}

}