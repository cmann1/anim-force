namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;

	export class SpriteTrack extends Track
	{

		protected node:Sprite;

		constructor(animation:Animation, node:Node)
		{
			super(animation, node);

			this.properties['scaleX'] = new TrackProperty(this, TrackPropertyType.NUMBER);
			this.properties['scaleY'] = new TrackProperty(this, TrackPropertyType.NUMBER);
		}

	}

}