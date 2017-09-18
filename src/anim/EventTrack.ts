namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;
	import TrackPropertyType = app.anim.TrackPropertyType;
	import EventNode = app.model.EventNode;

	export class EventTrack extends Track
	{

		public node:EventNode;

		constructor(animation:Animation, node:EventNode)
		{
			super('event', animation, node);

			this.bulkKeyframeOperations = false;

			this.addProperty('event', TrackPropertyType.STRING);

			this.keyframeColour = '#719ef9';
			this.keyframeBorderColour = '#2b63d4';
			this.keyframeDisabledColour = '#bdd8ff';
			this.keyframeDisabledBorderColour = '#90afda';
		}

	}

}