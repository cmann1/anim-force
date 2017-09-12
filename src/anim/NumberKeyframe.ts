namespace app.anim
{

	export class NumberKeyframe extends Keyframe
	{

		public value:number;

		public prev:NumberKeyframe = null;
		public next:NumberKeyframe = null;

		public save():any
		{
			var data = super.save();

			data.value = this.value;

			return data;
		}

	}

}