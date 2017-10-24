namespace app.anim
{

	import LoadData = app.projects.LoadData;

	export class StringKeyframe extends Keyframe
	{

		public value:string;

		public prev:StringKeyframe = null;
		public next:StringKeyframe = null;

		public set(propertyName:string, node:any, copyFrame:NumberKeyframe)
		{
			this.value = copyFrame
				? copyFrame.value
				: node[propertyName];
		}

		public toString = () : string => {

			return `StringKeyframe[${this.frameIndex}]("${this.value}")`;
		};

		//

		public save():any
		{
			var data = super.save();

			data.value = this.value;

			return data;
		}

		public load(data:LoadData):StringKeyframe
		{
			this.value = data.get('value');

			return this;
		}

	}

}