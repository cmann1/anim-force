namespace app.events
{

	export class Event
	{

		public type:string;
		public nativeEvent:any;

		constructor(type:string, nativeEvent:any)
		{
			this.type = type;
			this.nativeEvent = nativeEvent;
		}

	}

}