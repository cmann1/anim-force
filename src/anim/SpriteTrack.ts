namespace app.anim
{

	import Node = app.model.Node;
	import Sprite = app.model.Sprite;
	import TrackPropertyType = app.anim.TrackPropertyType;

	export class SpriteTrack extends NodeTrack
	{

		public node:Sprite;

		constructor(animation:Animation, node:Sprite)
		{
			super('sprite', animation, node);

			this.addProperty('frame', TrackPropertyType.NUMBER);
		}

	}

}