namespace app.anim
{

	import LoadData = app.projects.LoadData;

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

		public load(data:LoadData):NumberKeyframe
		{
			this.value = data.get('value');

			return this;
		}

	}

}