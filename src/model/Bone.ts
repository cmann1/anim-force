///<reference path="Node.ts"/>
///<reference path='DrawList.ts'/>

namespace app.model
{

	export class Bone extends Node
	{
		public length:number = 100;
		public stretch:number = 1;

		public children:Node[] = [];
		public childCount:number = 0;

		public worldEndPointX:number = 0;
		public worldEndPointY:number = 0;

		constructor(name:string='Unnamed Bone', parent:Bone=null)
		{
			super(name);
		}

		public addChild(child:Node):Node
		{
			if(child.parent == this)
			{
				return this
			}

			if(child.parent)
			{
				child.parent.removeChild(child);
			}

			child.model = this.model;
			this.children.push(child);
			this.childCount++;

			return child;
		}

		public removeChild(child:Node):Node
		{
			if(child.parent == this)
			{
				child.setModel(null);
				child.parent = null;
				this.children.splice(this.children.indexOf(child), 1);
				this.childCount--;
			}

			return child;
		}

		public setModel(model:Model)
		{
			super.setModel(model);

			for(var bone of this.children)
			{
				bone.setModel(model);
			}
		}

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList)
		{
			const offset = Node.rotate(this.offsetX * stretchX, this.offsetY * stretchY, worldRotation);
			worldX += offset.x;
			worldY += offset.y;

			this.worldX = worldX;
			this.worldY = worldY;

			worldRotation += this.rotation;
			const endPoint = Node.rotate(0, -this.length * this.stretch, worldRotation);
			worldX += endPoint.x;
			worldY += endPoint.y;

			this.worldEndPointX = worldX;
			this.worldEndPointY = worldY;

			this.worldRotation = worldRotation;

			for(var bone of this.children)
			{
				bone.prepareForDrawing(worldX, worldY, 1, this.stretch, worldRotation, drawList);
			}
		}

		public drawControls(ctx:CanvasRenderingContext2D)
		{
			ctx.save();
			ctx.lineWidth = 4;
			ctx.strokeStyle = '#0F0';
			ctx.beginPath();
			ctx.moveTo(this.worldX, this.worldY);
			ctx.lineTo(this.worldEndPointX, this.worldEndPointY);
			ctx.stroke();
			ctx.restore();

			for(var bone of this.children)
			{
				bone.drawControls(ctx);
			}
		}

	}

}