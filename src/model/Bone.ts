namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;

	export class Bone extends ContainerNode
	{
		public length:number = 100;

		public boneWorldAABB:AABB = new AABB();

		public baseHandle:Handle = new Handle('base');
		public endPointHandle:Handle = new Handle('rotation');
		public boneHandle:Handle = new Handle('base', Config.boneThickness, HandleShape.LINE);
		public stretchHandle:Handle = new Handle('stretch', Config.subHandleRadius, HandleShape.SQUARE);

		constructor(name:string=null)
		{
			super(name);

			this.type = 'bone';

			this.handles.push(this.boneHandle);
			this.handles.push(this.baseHandle);
			this.handles.push(this.endPointHandle);
			this.handles.push(this.stretchHandle);
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			// TODO: Auto hit testing using handles
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

			this.stretchHandle.active = this.selected;
			this.baseHandle.x = this.boneHandle.x = this.worldX;
			this.baseHandle.y = this.boneHandle.y = this.worldY;
			this.endPointHandle.x = this.boneHandle.x2 = this.worldEndPointX;
			this.endPointHandle.y = this.boneHandle.y2 = this.worldEndPointY;
			this.stretchHandle.x = this.worldEndPointX + ((this.worldEndPointX - this.worldX) / (this.length * this.stretchY)) * (Config.boneStretchHandleDist / worldScale);
			this.stretchHandle.y = this.worldEndPointY + ((this.worldEndPointY - this.worldY) / (this.length * this.stretchY)) * (Config.boneStretchHandleDist / worldScale);
			this.stretchHandle.rotation = this.worldRotation;

			this.prepareAABB(worldScale);
			this.boneWorldAABB.from(this.worldAABB);

			this.childrenWorldAABB.reset();

			for(var child of this.children)
			{
				child.prepareForDrawing(this.worldEndPointX, this.worldEndPointY, worldScale, 1, this.stretchY, this.worldRotation, drawList, viewport);

				this.childrenWorldAABB.union(child.worldAABB);
			}

			this.worldAABB.union(this.childrenWorldAABB);
		}

		public drawControls(ctx:CanvasRenderingContext2D, worldScale:number, viewport:AABB)
		{
			if(!this.worldAABB.intersects(viewport)) return;

			for(var child of this.children)
			{
				child.drawControls(ctx, worldScale, viewport);
			}

			ctx.save();

			const x = this.worldX * worldScale;
			const y = this.worldY * worldScale;

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

			super.drawControls(ctx, worldScale, viewport);

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