namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;

	export class SpriteTrack extends Track
	{

		protected node:Sprite;

		constructor(node:Node)
		{
			super(node);

			this.properties['scaleX'] = new TrackProperty(TrackPropertyType.NUMBER);
			this.properties['scaleY'] = new TrackProperty(TrackPropertyType.NUMBER);
		}

	}

}