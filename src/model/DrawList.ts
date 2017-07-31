///<reference path="Node.ts"/>
///<reference path="Attachment.ts"/>

namespace app.model
{

	export class DrawList
	{

		public list:Node[] = [];

		public add(node:Node)
		{
			node.drawIndex = this.list.length;
			this.list.push(node);
		}

		public clear()
		{
			this.list = [];
		}

	}

}