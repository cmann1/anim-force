namespace app.anim
{

	export class Keyframe
	{

		public frameIndex:number;
		public prev:Keyframe = null;
		public next:Keyframe = null;

		constructor(frameIndex:number)
		{
			this.frameIndex = frameIndex;
		}

		public save():any
		{
			return {
				frameIndex: this.frameIndex
			};
		}

	}

}