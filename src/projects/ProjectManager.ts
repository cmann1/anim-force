namespace app.projects
{

	import Key = KeyCodes.Key;

	type ModelData = {
		_id:string
	};

	export class ProjectManager
	{

		private currentModelData:ModelData = null;

		constructor()
		{

			app.$window.on('keydown', this.onWindowKeyDown);

		}

		public save()
		{

		}

		/*
		 * Events
		 */

		private onWindowKeyDown = (event) =>
		{
			const keyCode = event.keyCode;
			const shiftKey = event.shiftKey;
			const ctrlKey = event.ctrlKey;

			var consume = false;

			if(ctrlKey)
			{
				if(keyCode == Key.S)
				{
					this.save();
					consume = true;
				}
				else if(keyCode == Key.O)
				{
					consume = true;
				}
				else if(keyCode == Key.N)
				{
					consume = true;
				}
			}

			if(consume)
			{
				event.preventDefault();
				return false;
			}
		}

	}

}