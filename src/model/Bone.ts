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

			this.onStructureChange(eventType, this, child, this.childCount - 1);

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
					this.onStructureChange('removeChild', this, child, index);
				}
			}

			return child;
		}

		public getChildAt(index:number):Node
		{
			if(this.childCount == 0) return null;

			if(index < 0) index = 0;
			if(index >= this.childCount) index = this.childCount - 1;

			return this.children[index];
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
			this.rotation += 0.01; // TODO: REMOVE

			super.prepareForDrawing(worldX, worldY, stretchX, stretchY, worldRotation, drawList);

			const endPoint = Node.rotate(0, -this.length * this.stretch, this.worldRotation);
			this.worldEndPointX = this.worldX + endPoint.x;
			this.worldEndPointY = this.worldY + endPoint.y;

			for(var bone of this.children)
			{
				bone.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, 1, this.stretch, this.worldRotation, drawList);
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