namespace app.anim
{

	export class VectorKeyframe extends Keyframe
	{

		public x:number;
		public y:number;

		public prev:VectorKeyframe = null;
		public next:VectorKeyframe = null;

		public save():any
		{
			var data = super.save();

			data.x = this.x;
			data.y = this.y;

			return data;
		}

	}

}