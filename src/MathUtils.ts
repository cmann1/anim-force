namespace app.MathUtils
{

	export function dot(x1:number, y1:number, x2:number, y2:number):number
	{
		return x1 * x2 + y1 * y2;
	}

	export function rotate(x, y, angle):{x:number, y:number}
	{
		return {
			x: Math.cos(angle) * x - Math.sin(angle) * y,
			y: Math.sin(angle) * x + Math.cos(angle) * y
		}
	}

	export function project(ax:number, ay:number, bx:number, by:number)
	{
		const dp = dot(ax, ay, bx, by);

		return {
			x: ( dp / (bx * bx + by * by) ) * bx,
			y: ( dp / (bx * bx + by * by) ) * by
		}
	}

}