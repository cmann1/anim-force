namespace app.viewport
{

	import Node = app.model.Node;

	export class Interaction
	{

		public node:Node;
		public offset:number = 0;
		public x:number = 0;
		public y:number = 0;
		public part:string;
		public success:boolean = false;

	}

}