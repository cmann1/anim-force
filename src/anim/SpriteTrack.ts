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

			this.addProperty('scaleX', TrackPropertyType.NUMBER);
			this.addProperty('scaleY', TrackPropertyType.NUMBER);
		}

	}

}