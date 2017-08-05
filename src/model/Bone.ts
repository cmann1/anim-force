namespace app.model
{

	export class Bone extends ContainerNode
	{
		public length:number = 100;
		public stretch:number = 1;

		public worldEndPointX:number = 0;
		public worldEndPointY:number = 0;

		constructor(name:string=null)
		{
			super(name);

			this.type = 'bone';
		}

		public prepareForDrawing(worldX:number, worldY:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList)
		{
			this.rotation += 0.01; // TODO: REMOVE

			super.prepareForDrawing(worldX, worldY, stretchX, stretchY, worldRotation, drawList);

			const endPoint = Node.rotate(0, -this.length * this.stretch, this.worldRotation);
			this.worldEndPointX = this.worldX + endPoint.x;
			this.worldEndPointY = this.worldY + endPoint.y;

			for(var child of this.children)
			{
				child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, 1, this.stretch, this.worldRotation, drawList);
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

			for(var child of this.children)
			{
				child.drawControls(ctx);
			}
		}

	}

}