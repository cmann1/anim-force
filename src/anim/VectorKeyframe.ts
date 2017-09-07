namespace app.anim
{

	export class VectorKeyframe extends Keyframe
	{

		public x:number;
		public y:number;

		public prev:VectorKeyframe = null;
		public next:VectorKeyframe = null;

		constructor(frameIndex:number, x:number, y:number)
		{
			super(frameIndex);
			this.x = x;
			this.y = y;
		}

	}

}