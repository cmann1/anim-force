interface String
{
	ucFirst(this:string): string;
	toTitleCase(this:string): string;
	toVarName(this:string): string;
}
interface Math
{
	TWO_PI:number;
	RAD_TO_DEG:number;
	DEG_TO_RAD:number;

	normalizeAngle(theta:number):number;
	lerpAngle(start:number, end:number, t:number):number;
}
String.prototype.ucFirst = function()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
};
String.prototype.toTitleCase = function()
{
	return this
		.replace(/([a-z])([0-9])/ig, '$1 $2')
		.replace(/([0-9])([a-z])/ig, '$1 $2')
		.replace(/\w\S*/g, function(txt){
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
};
String.prototype.toVarName = function()
{
	var out = this.replace(/^([0-9])/, '_$1');
	return out.toTitleCase()
		.replace(/[^a-zA-Z0-9_$]/g, '')
		.replace(/\s+([a-z])/g, function(txt){ return txt.toUpperCase(); })
		.replace(/\s+/g, '');
};

// public static double normalizeAngle(double a, double center) {
// 	return a - TWO_PI * FastMath.floor((a + FastMath.PI - center) / TWO_PI);
// }

Math.TWO_PI = Math.PI * 2;
Math.RAD_TO_DEG = 1 / Math.PI * 180;
Math.DEG_TO_RAD = 1 / 180 * Math.PI;
Math.normalizeAngle = function (theta:number)
{
	return theta - Math.TWO_PI * Math.floor((theta + Math.PI) / Math.TWO_PI);
};
Math.lerpAngle = function (start:number, end:number, t:number):number
{
	return start + t * Math.normalizeAngle(end - start);
};

namespace Utils
{
	export function naturalCompare(a, b)
	{
		var ax = [], bx = [];

		a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
		b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

		while(ax.length && bx.length) {
			var an = ax.shift();
			var bn = bx.shift();
			var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
			if(nn) return nn;
		}

		return ax.length - bx.length;
	}
}