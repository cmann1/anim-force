namespace app.anim
{

	import LoadData = app.projects.LoadData;

	export class Keyframe
	{

		public frameIndex:number;
		public prev:Keyframe = null;
		public next:Keyframe = null;

		constructor(frameIndex:number)
		{
			this.frameIndex = frameIndex;
		}

		public set(propertyName:string, node:any, copyFrame:Keyframe)
		{
			throw new Error('Keyframe.set not implemented');
		}

		//

		public save():any
		{
			return {
				frameIndex: this.frameIndex
			};
		}

		public load(data:LoadData):Keyframe
		{
			// frameIndex must be set when the keyframe is created.
			throw new Error('Keyframe.load not implemented');
		}

	}

}