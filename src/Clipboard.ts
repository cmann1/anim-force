namespace app
{

	export class Clipboard
	{

		private static data:{[id:string]:any} = {};

		public static getData(type:string):any
		{
			return Clipboard.data[type];
		}

		public static setData(type:string, data:any)
		{
			Clipboard.data[type] = data;
		}

	}

}