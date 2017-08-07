namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Bone extends ContainerNode
	{
		public length:number = 100;
		public stretch:number = 1;

		public boneWorldAABB:AABB = new AABB();

		constructor(name:string=null)
		{
			super(name);

			this.type = 'bone';
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.boneWorldAABB.contains(x, y))
			{
				var dx:number, dy:number;

				result.offset = this.parent ? -this.parent.worldRotation : 0;
				result.node = this;

				dx = x - this.worldEndPointX;
				dy = y - this.worldEndPointY;
				if(Math.sqrt(dx * dx + dy * dy) <= Config.boneEndPointClick * worldScaleFactor)
				{
					dx = x - this.worldX;
					dy = y - this.worldY;
					result.offset = Math.atan2(dy, dx) - this.rotation;

					result.part = 'endPoint';

					return true;
				}

				dx = x - this.worldX;
				dy = y - this.worldY;
				if(Math.sqrt(dx * dx + dy * dy) <= Config.boneEndPointClick * worldScaleFactor)
				{
					result.x = dx;
					result.y = dy;
					result.part = 'base';
					return true;
				}

				var boneHit = this.getClosestPointOnBone(x, y);
				dx = x - boneHit.x;
				dy = y - boneHit.y;
				if(Math.sqrt(dx * dx + dy * dy) <= Config.boneClick * worldScaleFactor)
				{
					result.x = x - this.worldX;
					result.y = y - this.worldY;
					result.part = 'base';
					return true;
				}
			}

			return super.hitTest(x, y, worldScaleFactor, result);
		}

		public updateInteraction(x:number, y:number, worldScaleFactor:number, interaction:Interaction):boolean
		{
			if(interaction.part == 'endPoint')
			{
				var dx = x - this.worldX;
				var dy = y - this.worldY;

				this.rotation = Math.atan2(dy, dx) - interaction.offset;

				return true;
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const endPoint = Node.rotate(0, -this.length * this.stretch, this.worldRotation);
			this.worldEndPointX = this.worldX + endPoint.x;
			this.worldEndPointY = this.worldY + endPoint.y;

			this.boneWorldAABB.x1 = Math.min(this.worldX - Config.boneEndPointRadius * 2, this.worldEndPointX - Config.boneEndPointRadius * 2);
			this.boneWorldAABB.y1 = Math.min(this.worldY - Config.boneEndPointRadius * 2, this.worldEndPointY - Config.boneEndPointRadius * 2);
			this.boneWorldAABB.x2 = Math.max(this.worldX + Config.boneEndPointRadius * 2, this.worldEndPointX + Config.boneEndPointRadius * 2);
			this.boneWorldAABB.y2 = Math.max(this.worldY + Config.boneEndPointRadius * 2, this.worldEndPointY + Config.boneEndPointRadius * 2);

			var x1 = NaN;
			var y1 = NaN;
			var x2 = NaN;
			var y2 = NaN;

			for(var child of this.children)
			{
				child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretch, this.worldRotation, drawList, viewport);

				if(isNaN(x1))
				{
					x1 = child.worldAABB.x1;
					y1 = child.worldAABB.y1;
					x2 = child.worldAABB.x2;
					y2 = child.worldAABB.y2;
				}
				else
				{
					x1 = Math.min(x1, child.worldAABB.x1);
					y1 = Math.min(y1, child.worldAABB.y1);
					x2 = Math.max(x2, child.worldAABB.x2);
					y2 = Math.max(y2, child.worldAABB.y2);
				}
			}

			this.childrenWorldAABB.x1 = x1;
			this.childrenWorldAABB.y1 = y1;
			this.childrenWorldAABB.x2 = x2;
			this.childrenWorldAABB.y2 = y2;

			if(isNaN(x1))
			{
				this.worldAABB.x1 = this.boneWorldAABB.x1;
				this.worldAABB.y1 = this.boneWorldAABB.y1;
				this.worldAABB.x2 = this.boneWorldAABB.x2;
				this.worldAABB.y2 = this.boneWorldAABB.y2;
			}
			else
			{
				this.worldAABB.fromCombined(this.boneWorldAABB, this.childrenWorldAABB);
			}
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.worldAABB.intersects(viewport)) return;

			for(var child of this.children)
			{
				child.drawControls(ctx, worldScale, viewport);
			}

			ctx.save();

			const colour = this.selected ? Config.selected : (this.highlighted ? Config.highlighted : Config.control);
			const x = this.worldX * worldScale;
			const y = this.worldY * worldScale;
			const eX = this.worldEndPointX * worldScale;
			const eY = this.worldEndPointY * worldScale;

			/// Bone

			// Outline
			ctx.lineWidth = Config.boneThickness + 2;
			ctx.strokeStyle = Config.bone;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(eX, eY);
			ctx.stroke();
			// Centre
			ctx.lineWidth = Config.boneThickness;
			ctx.strokeStyle = colour;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(eX, eY);
			ctx.stroke();

			/// End points

			// Outline
			ctx.beginPath();
			ctx.fillStyle = Config.bone;
			ctx.arc(x, y, Config.boneEndPointRadius + 1, 0, Math.PI * 2);
			ctx.fill();
			// Centre
			ctx.beginPath();
			ctx.fillStyle = colour;
			ctx.arc(x, y, Config.boneEndPointRadius, 0, Math.PI * 2);
			ctx.fill();

			// Outline
			ctx.beginPath();
			ctx.fillStyle = Config.bone;
			ctx.arc(eX, eY, Config.boneEndPointRadius + 1, 0, Math.PI * 2);
			ctx.fill();
			// Centre
			ctx.beginPath();
			ctx.fillStyle = colour;
			ctx.arc(eX, eY, Config.boneEndPointRadius, 0, Math.PI * 2);
			ctx.fill();

			if(Config.drawAABB)
			{
				this.boneWorldAABB.draw(ctx, worldScale, Config.boneAABB);
				this.childrenWorldAABB.draw(ctx, worldScale, Config.childrenAABB);
				this.worldAABB.draw(ctx, worldScale);
			}

			ctx.restore();
		}

		public getClosestPointOnBone(x:number, y:number)
		{
			var dx = this.worldEndPointX - this.worldX;
			var dy = this.worldEndPointY - this.worldY;

			var u = ((x - this.worldX) * dx + (y - this.worldY) * dy) / (dx * dx + dy * dy);
			var lineX, lineY;

			if(u < 0){
				lineX = this.worldX;
				lineY = this.worldY;
			}
			else if(u > 1){
				lineX = this.worldEndPointX;
				lineY = this.worldEndPointY;
			}
			else{
				lineX = this.worldX + u * dx;
				lineY = this.worldY + u * dy;
			}

			return {x: lineX, y: lineY};
		}

	}

}