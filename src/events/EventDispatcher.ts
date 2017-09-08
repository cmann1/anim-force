namespace app.events
{
	type Callback<TSender> = (sender: TSender, event:Event) => void;

	export interface IEventDispatcher<TSender>{
		on(callback:Callback<TSender>):void;

		off(callback:Callback<TSender>);

		clear();

		dispatch(sender:TSender, event:Event);
	}

	export class EventDispatcher<TSender> implements IEventDispatcher<TSender>{
		private _eventHandlers:Callback<TSender>[] = [];

		public on(callback:Callback<TSender>)
		{
			if(callback && this._eventHandlers.indexOf(callback) == -1)
			{
				this._eventHandlers.push(callback);
			}
		}

		off(callback:Callback<TSender>)
		{
			const index = this._eventHandlers.indexOf(callback);
			if(index != -1)
			{
				this._eventHandlers.splice(index, 1);
			}
		}

		clear()
		{
			this._eventHandlers = [];
		}

		dispatch(sender:TSender, event:Event)
		{
			for(let handler of this._eventHandlers)
			{
				handler(sender, event);
			}
		}

	}

}