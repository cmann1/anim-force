namespace app.anim
{

	export class NumberKeyframe extends Keyframe
	{

		public value:number;

		public prev:NumberKeyframe = null;
		public next:NumberKeyframe = null;

	}

}