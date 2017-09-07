namespace app.anim
{

	export class NumberKeyframe extends Keyframe
	{

		public value:number;

		public prev:NumberKeyframe = null;
		public next:NumberKeyframe = null;

		constructor(frameIndex:number, value:number)
		{
			super(frameIndex);
			this.value = value;
		}

	}

}