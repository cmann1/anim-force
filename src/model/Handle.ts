namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export enum HandleShape
	{
		CIRCLE,
		SQUARE,
		LINE
	}

	export enum HandleType
	{
		VECTOR,
		AXIS,
		SCALE,
		ROTATION
	}

	export class Handle
	{

		public node:Node;
		public interaction:string;
		public radius:number;
		public shape:HandleShape;
		private outline:string;
		private fill:string;

		public active:boolean = true;
		public rotation:number = 0;
		public x:number;
		public y:number;
		public x2:number;
		public y2:number;
		private type:HandleType;

		constructor(node:Node, interaction:string, radius:number=Config.handleRadius,
		            shape:HandleShape=HandleShape.CIRCLE, type=HandleType.VECTOR,
		            fill=Config.control, outline=Config.outline)
		{
			this.node = node;
			this.interaction = interaction;
			this.radius = radius;
			this.shape = shape;
			this.type = type;
			this.fill = fill;
			this.outline = outline;
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number, selected:boolean, highlighted:boolean)
		{
			ctx.save();

			const x = this.x * worldScale;
			const y = this.y * worldScale;
			const x2 = this.x2 * worldScale;
			const y2 = this.y2 * worldScale;
			const radius = this.radius;
			const shape = this.shape;
			const fill = selected ? Config.selected : (highlighted ? Config.highlighted : this.fill);

			ctx.translate(x, y);
			ctx.rotate(this.rotation);

			// Outline
			ctx.beginPath();
			ctx.fillStyle = this.outline;
			if(shape == HandleShape.CIRCLE)
			{
				ctx.arc(0, 0, radius + 1, 0, Math.PI * 2);
			}
			else if(shape == HandleShape.SQUARE)
			{
				ctx.rect(
					-radius - 1, -radius - 1,
					(radius + 1) * 2, (radius + 1) * 2);
			}
			else if(shape == HandleShape.LINE)
			{
				ctx.lineWidth = radius + 2;
				ctx.strokeStyle = this.outline;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(x2 - x, y2 - y);
				ctx.stroke();
			}
			ctx.fill();

			// Fill
			ctx.beginPath();
			ctx.fillStyle = fill;
			if(shape == HandleShape.CIRCLE)
			{
				ctx.arc(0, 0, radius, 0, Math.PI * 2);
			}
			else if(shape == HandleShape.SQUARE)
			{
				ctx.rect(
					-radius, -radius,
					radius * 2, radius * 2);
			}
			else if(shape == HandleShape.LINE)
			{
				ctx.lineWidth = radius;
				ctx.strokeStyle = fill;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(x2 - x, y2 - y);
				ctx.stroke();
			}
			ctx.fill();

			ctx.restore();
		}

		public expand(aabb:AABB, worldScale:number)
		{
			const x = this.x;
			const y = this.y;
			const x2 = this.x2;
			const y2 = this.y2;
			const radius = (this.radius + Config.interactionTolerance) / worldScale;
			const shape = this.shape;

			if(shape == HandleShape
					.CIRCLE || shape == HandleShape.SQUARE)
			{
				aabb.unionF(
					x - radius, y - radius,
					x + radius, y + radius
				);
			}
			else if(shape == HandleShape.LINE)
			{
				aabb.unionF(
					(x < x2 ? x : x2) - radius, (y < y2 ? y : y2) - radius,
					(x > x2 ? x : x2) + radius, (y > y2 ? y : y2) + radius
				);
			}
		}

		public hitTest(worldX:number, worldY:number, worldScaleFactor:number, result:Interaction):boolean
		{
			const x = this.x;
			const y = this.y;
			const x2 = this.x2;
			const y2 = this.y2;
			const radius = (this.radius + Config.interactionTolerance) * worldScaleFactor;
			const shape = this.shape;

			var hit = false;
			var dx = worldX - x;
			var dy = worldY - y;

			if(this.rotation != 0)
			{
				var local = MathUtils.rotate(dx, dy, this.rotation);
				dx = local.x;
				dy = local.y;
			}

			if(shape == HandleShape.LINE)
			{
				var lineDx = x2 - x;
				var lineDy = y2 - y;

				var u = ((worldX - x) * lineDx + (worldY - y) * lineDy) / (lineDx * lineDx + lineDy * lineDy);
				var lineX, lineY;

				if(u < 0){
					lineX = x;
					lineY = y;
				}
				else if(u > 1){
					lineX = x2;
					lineY = y2;
				}
				else{
					lineX = x + u * lineDx;
					lineY = y + u * lineDy;
				}

				dx = worldX - lineX;
				dy = worldY - lineY;
			}

			if(shape == HandleShape.CIRCLE || shape == HandleShape.LINE)
			{
				hit = Math.sqrt(dx * dx + dy * dy) <= radius;
			}
			else if(shape == HandleShape.SQUARE)
			{
				hit = dx >= -radius && dx <= radius && dy >= -radius && dy <= radius;
			}

			if(hit)
			{
				result.part = this.interaction;
				result.node = this.node;

				if(this.type == HandleType.VECTOR)
				{
					result.x = worldX - x;
					result.y = worldY - y;
					result.offset = 0;
				}
				else if(this.type == HandleType.AXIS)
				{
					result.x = worldX - x;
					result.y = worldY - y;
					result.offset = 1;
				}
				else if(this.type == HandleType.SCALE)
				{
					var local = MathUtils.rotate(worldX - this.node.worldX, worldY - this.node.worldY, this.rotation);

					result.x = worldX - x;
					result.y = worldY - y;
					result.initialX = this.node.scaleX;
					result.initialY = this.node.scaleY;
					result.offset = Math.sqrt(local.x * local.x + local.y * local.y);
				}
				else if(this.type == HandleType.ROTATION)
				{
					result.initialX = this.node.rotation;
					result.offset = (this.node.parent ? this.node.parent.worldRotation : 0)
						+ (Math.atan2(worldY - this.node.worldY, worldX - this.node.worldX)
						- this.node.worldRotation);
				}
			}

			return hit;
		}

	}

}