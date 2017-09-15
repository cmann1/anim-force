namespace app.properties
{

	import Model = app.model.Model;
	import AngelScriptExporter = app.exporters.AngelScriptExporter;

	export class PropertiesPanel
	{

		private model:Model;

		private $panel:JQuery;

		constructor(model:Model)
		{
			this.setModel(model);

			this.$panel = $('#properties-panel');

			// TODO: Remove
			this.$panel.find('button.btn-export').on('click', () => {
				var out = (new AngelScriptExporter()).exportModel(this.model);
				Utils.copyToClipboard(out);
				App.notice('Output copied to clipboard');
			});
		}

		public setModel(model:Model)
		{
			if(model == this.model) return;

			this.model = model;
		}

	}

}