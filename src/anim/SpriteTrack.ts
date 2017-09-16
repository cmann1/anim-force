namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;

	export class SpriteTrack extends Track
	{

		public node:Sprite;

		constructor(animation:Animation, node:Node)
		{
			super('sprite', animation, node);

			this.addProperty('frame', TrackPropertyType.NUMBER);
			this.addProperty('scaleX', TrackPropertyType.NUMBER);
			this.addProperty('scaleY', TrackPropertyType.NUMBER);
		}

	}

}