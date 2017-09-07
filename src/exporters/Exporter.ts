namespace app.exporters
{

	import Model = app.model.Model;

	export class Exporter
	{

		public exportModel(model:Model):string
		{
			return '';
		}

		public static num(value:number):string
		{
			return value.toFixed(4).replace(/\.0000/, '')
		}

	}

}