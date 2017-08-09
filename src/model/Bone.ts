namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Bone extends ContainerNode
	{
		public length:number = 100;

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

				// End point

				dx = x - this.worldEndPointX;
				dy = y - this.worldEndPointY;
				if(this.hitTestHandle(dx, dy, worldScaleFactor))
				{
					dx = x - this.worldX;
					dy = y - this.worldY;
					result.initialX = this.rotation;
					result.offset = Math.atan2(dy, dx) - this.rotation;

					result.part = 'rotation';

					return true;
				}

				// Base

				dx = x - this.worldX;
				dy = y - this.worldY;
				if(this.hitTestHandle(dx, dy, worldScaleFactor))
				{
					result.x = dx;
					result.y = dy;
					result.part = 'base';
					return true;
				}

				// Stretch

				var hx = this.worldEndPointX + ((this.worldEndPointX - this.worldX) / (this.length * this.stretchY)) * (Config.boneStretchHandleDist * worldScaleFactor);
				var hy = this.worldEndPointY + ((this.worldEndPointY - this.worldY) / (this.length * this.stretchY)) * (Config.boneStretchHandleDist * worldScaleFactor);
				dx = x - hx;
				dy = y - hy;
				if(this.hitTestHandle(dx, dy, worldScaleFactor, true, Config.subHandleClick))
				{
					result.x = dx;
					result.y = dy;
					result.offset = this.stretchY;
					result.part = 'stretchY';
					return true;
				}

				// Bone

				var boneHit = this.getClosestPointOnBone(x, y);
				dx = x - boneHit.x;
				dy = y - boneHit.y;
				if(this.hitTestHandle(dx, dy, worldScaleFactor, false, Config.boneClick))
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
			if(interaction.part == 'stretchY')
			{
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
				this.stretchY = (-local.y - Config.boneStretchHandleDist * worldScaleFactor) / this.length;
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const endPoint = MathUtils.rotate(0, -this.length * this.stretchY, this.worldRotation);
			this.worldEndPointX = this.worldX + endPoint.x;
			this.worldEndPointY = this.worldY + endPoint.y;

			this.boneWorldAABB.x1 = Math.min(this.worldX - Config.handleRadius / worldScale, this.worldEndPointX - Config.handleRadius / worldScale);
			this.boneWorldAABB.y1 = Math.min(this.worldY - Config.handleRadius / worldScale, this.worldEndPointY - Config.handleRadius / worldScale);
			this.boneWorldAABB.x2 = Math.max(this.worldX + Config.handleRadius / worldScale, this.worldEndPointX + Config.handleRadius / worldScale);
			this.boneWorldAABB.y2 = Math.max(this.worldY + Config.handleRadius / worldScale, this.worldEndPointY + Config.handleRadius / worldScale);

			if(this.selected)
			{
				var x = this.worldX;
				var y = this.worldY;
				var eX = this.worldEndPointX;
				var eY = this.worldEndPointY;
				var dx = (eX - x) / (this.length * this.stretchY);
				var dy = (eY - y) / (this.length * this.stretchY);
				eX += dx * Config.boneStretchHandleDist / worldScale;
				eY += dy * Config.boneStretchHandleDist / worldScale;
				this.boneWorldAABB.unionF(
					eX - Config.subHandleRadius / worldScale, eY - Config.subHandleRadius / worldScale,
					eX + Config.subHandleRadius / worldScale, eY + Config.subHandleRadius / worldScale);
			}

			var x1 = NaN;
			var y1 = NaN;
			var x2 = NaN;
			var y2 = NaN;

			for(var child of this.children)
			{
				child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretchY, this.worldRotation, drawList, viewport);

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

			// Parent connector
			if(this.parent && this.parent != this.model)
			{
				ctx.setLineDash([2, 2]);
				ctx.strokeStyle = Config.link;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(this.parent.worldEndPointX * worldScale, this.parent.worldEndPointY * worldScale);
				ctx.stroke();
				ctx.setLineDash([]);
			}

			/// Bone

			// Outline
			ctx.lineWidth = Config.boneThickness + 2;
			ctx.strokeStyle = Config.outline;
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

			this.drawHandle(ctx, x, y);
			this.drawHandle(ctx, eX, eY);

			if(this.selected)
			{
				var dx = (eX - x) / (this.length * this.stretchY);
				var dy = (eY - y) / (this.length * this.stretchY);
				this.drawHandle(ctx, eX + dx * Config.boneStretchHandleDist / worldScale, eY + dy * Config.boneStretchHandleDist / worldScale,
					null, null, true, Config.subHandleRadius);
			}

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