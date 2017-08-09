namespace app.viewport
{

	export class AABB
	{

		x1:number;
		y1:number;

		x2:number;
		y2:number;

		constructor(x1:number=0, y1:number=0, x2:number=0, y2:number=0)
		{
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
		}

		public intersects(other:AABB):boolean
		{
			return this.x1 <= other.x2 && this.x2 >= other.x1 && this.y1 <= other.y2 && this. y2 >= other.y1;
		}

		public contains(x:number, y:number):boolean
		{
			return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
		}

		public fromCombined(a:AABB, b:AABB)
		{
			this.x1 = Math.min(a.x1, b.x1);
			this.y1 = Math.min(a.y1, b.y1);
			this.x2 = Math.max(a.x2, b.x2);
			this.y2 = Math.max(a.y2, b.y2);
		}

		public from(a:AABB)
		{
			this.x1 = a.x1;
			this.y1 = a.y1;
			this.x2 = a.x2;
			this.y2 = a.y2;
		}

		public union(a:AABB)
		{
			if(a.x1 < this.x1) this.x1 = a.x1;
			if(a.y1 < this.y1) this.y1 = a.y1;
			if(a.x2 > this.x2) this.x2 = a.x2;
			if(a.y2 > this.y2) this.y2 = a.y2;
		}

		public unionF(x1:number, y1:number, x2:number, y2:number)
		{
			if(x1 < this.x1) this.x1 = x1;
			if(y1 < this.y1) this.y1 = y1;
			if(x2 > this.x2) this.x2 = x2;
			if(y2 > this.y2) this.y2 = y2;
		}

		public draw(ctx:CanvasRenderingContext2D, worldScale:number, colour=null)
		{
			ctx.strokeStyle = colour || Config.AABB;
			ctx.lineWidth = 1;
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.rect(this.x1 * worldScale, this.y1 * worldScale, (this.x2 - this.x1) * worldScale, (this.y2 - this.y1) * worldScale);
			ctx.stroke();
		}

		public toString = () : string => {
			return `<${this.x1}, ${this.y1}> <${this.x2}, ${this.y2}>`;
		}

	}

}