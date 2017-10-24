namespace app.anim
{

	import LoadData = app.projects.LoadData;

	export class NumberKeyframe extends Keyframe
	{

		public value:number;

		public prev:NumberKeyframe = null;
		public next:NumberKeyframe = null;

		public set(propertyName:string, node:any, copyFrame:NumberKeyframe)
		{
			this.value = copyFrame
				? copyFrame.value
				: node[propertyName];
		}

		public toString = () : string => {

			return `NumberKeyframe[${this.frameIndex}]("${this.value}")`;
		};

		//

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