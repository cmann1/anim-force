namespace app.properties
{

	import Model = app.model.Model;
	import AngelScriptExporter = app.exporters.AngelScriptExporter;
	import SpriteGroupExporter = app.exporters.SpriteGroupExporter;

	export class PropertiesPanel
	{

		private model:Model;

		private $panel:JQuery;

		constructor(model:Model)
		{
			this.setModel(model);

			this.$panel = $('#properties-panel');

			// TODO: Remove
			this.$panel.find('button.btn-export-as').on('click', (event) => {
				var out = (new AngelScriptExporter()).exportModel(this.model);
				// console.log(out);
				if(event.shiftKey)
				{
					Utils.copyToClipboard(out);
					App.notice('Output copied to clipboard', 'blue');
				}
				else
				{
					var blob = new Blob([out], {type: 'text/json;charset=utf-8'});
					saveAs(blob, this.model.name  + '.cpp');
				}
			});
			// TODO: Remove
			this.$panel.find('button.btn-export-spr').on('click', () => {
				var out = (new SpriteGroupExporter()).exportModel(this.model);
				Utils.copyToClipboard(out);
				App.notice('Output copied to clipboard', 'blue');
			});
		}

		public setModel(model:Model)
		{
			if(model == this.model) return;

			this.model = model;
		}

	}

}