namespace app.events
{

	export class ScrollEvent extends Event
	{

		public scrollX:number;
		public scrollY:number;

		constructor(scrollX:number, scrollY:number, nativeEvent:any)
		{
			super('scroll', nativeEvent);

			this.scrollX = scrollX;
			this.scrollY = scrollY;
		}

	}

}