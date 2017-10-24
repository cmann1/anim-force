namespace app.anim
{

	import LoadData = app.projects.LoadData;

	export class VectorKeyframe extends Keyframe
	{

		public x:number;
		public y:number;

		public prev:VectorKeyframe = null;
		public next:VectorKeyframe = null;

		public set(propertyName:string, node:any, copyFrame:VectorKeyframe)
		{
			if(copyFrame)
			{
				this.x = copyFrame.x;
				this.y = copyFrame.y;
			}
			else
			{
				this.x = node[propertyName + 'X'];
				this.y = node[propertyName + 'Y'];
			}
		}

		public toString = () : string => {

			return `VectorKeyframe[${this.frameIndex}](${this.x}, ${this.y})`;
		};

		//

		public save():any
		{
			var data = super.save();

			data.x = this.x;
			data.y = this.y;

			return data;
		}

		public load(data:LoadData):VectorKeyframe
		{
			this.x = data.get('x');
			this.y = data.get('y');

			return this;
		}


	}

}