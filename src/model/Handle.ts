namespace app.model
{

	import AABB = app.viewport.AABB;

	export enum HandleShape
	{
		CIRCLE,
		SQUARE,
		LINE
	}

	export class Handle
	{

		public interaction:string;
		public radius:number;
		public shape:HandleShape;
		private outline:string;
		private fill:string;

		public active:boolean = true;
		public x:number;
		public y:number;
		public rotation:number;
		public x2:number;
		public y2:number;

		constructor(interaction:string, radius:number=Config.handleRadius, shape:HandleShape=HandleShape.CIRCLE, fill=Config.control, outline=Config.outline)
		{
			this.interaction = interaction;
			this.radius = radius;
			this.shape = shape;
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

	}

}