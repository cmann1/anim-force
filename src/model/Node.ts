///<reference path="Model.ts"/>
///<reference path="Bone.ts"/>

namespace app.model
{

	export class Node
	{
		public name:string;

		public model:Model;
		public parent:Bone;

		/// Properties

		public offsetX:number = 0;
		public offsetY:number = 0;
		public rotation:number = 0;
		public scaleX:number = 1;
		public scaleY:number = 1;

		public layer:number = 17;
		public subLayer:number = 19;

		/// Rendering related

		public worldX:number = 0;
		public worldY:number = 0;
		public worldRotation:number = 0;
		public drawIndex:number = 0;

		/// UI

		public collapsed:boolean = false;

		constructor(name:string)
		{
			this.name = name;
		}

		public setModel(model:Model)
		{
			this.model = model;
		}

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList) { }

		public draw(ctx:CanvasRenderingContext2D) { }

		public drawControls(ctx:CanvasRenderingContext2D) { }

		static rotate(x, y, angle)
		{
			return {
				x: Math.cos(angle) * x - Math.sin(angle) * y,
				y: Math.sin(angle) * x + Math.cos(angle) * y
			}
		}

	}

}