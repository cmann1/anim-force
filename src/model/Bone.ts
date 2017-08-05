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

		constructor(name:string=null, parent:Bone=null)
		{
			super(name);

			this.type = 'bone';
			this.canHaveChildren = true;
		}

		public addChild(child:Node):Node
		{
			if(child.parent == this)
			{
				return this
			}

			var eventType = 'addChild';

			if(child.parent)
			{
				child.parent.removeChild(child, false);
				eventType = 'reParent';
			}

			child.model = this.model;
			child.parent = this;
			this.children.push(child);
			this.childCount++;

			this.onStructureChange(eventType, child, this.childCount - 1);

			return child;
		}

		public removeChild(child:Node, triggerEvent=true):Node
		{
			if(child.parent == this)
			{
				const index = this.children.indexOf(child);

				child.setModel(null);
				child.parent = null;
				this.children.splice(index, 1);
				this.childCount--;

				if(triggerEvent)
				{
					this.onStructureChange('removeChild', child, index);
				}
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
			ctx.strokeStyle = this.selected ? ColourConfig.selected : (this.highlighted ? ColourConfig.highlighted : '#888');
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