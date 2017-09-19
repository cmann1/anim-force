namespace app.model
{

	import AABB = app.viewport.AABB;
	import Interaction = app.viewport.Interaction;
	import LoadData = app.projects.LoadData;

	export class Bone extends ContainerNode
	{
		public length:number = 100;

		public boneWorldAABB:AABB = new AABB();

		public baseHandle:Handle;
		public endPointHandle:Handle;
		public boneHandle:Handle;
		public stretchHandle:Handle;
		public lengthHandle:Handle;

		constructor(name:string=null)
		{
			super(name);

			this.type = 'bone';

			this.baseHandle = new Handle(this, 'base');
			this.endPointHandle = new Handle(this, 'rotation', Config.handleRadius, HandleShape.CIRCLE, HandleType.ROTATION);
			this.boneHandle = new Handle(this, 'base', Config.boneThickness, HandleShape.LINE);
			this.stretchHandle = new Handle(this, 'stretchY', Config.subHandleRadius, HandleShape.SQUARE, HandleType.AXIS);
			this.lengthHandle = new Handle(this, 'length', Config.subHandleRadius, HandleShape.TRI, HandleType.AXIS);
			this.handles.push(this.boneHandle);
			this.handles.push(this.baseHandle);
			this.handles.push(this.endPointHandle);
			this.handles.push(this.stretchHandle);
			this.handles.push(this.lengthHandle);
		}

		public hitTest(x:number, y:number, worldScaleFactor:number, result:Interaction):boolean
		{
			if(this.visible && this.boneWorldAABB.contains(x, y))
			{
				if(this.hitTestHandles(x, y, worldScaleFactor, result))
				{
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
				this.onPropertyChange('stretchY');
			}

			else if(interaction.part == 'length')
			{
				const local = MathUtils.rotate(x - this.worldX - interaction.x, y - this.worldY - interaction.y, -this.worldRotation);
				this.length = Math.max(0, -local.y - Config.boneStretchHandleDist * worldScaleFactor);
				this.onPropertyChange('length');
			}

			return super.updateInteraction(x, y, worldScaleFactor, interaction);
		}

		public prepareForDrawing(worldX:number, worldY:number, worldScale:number, stretchX:number, stretchY:number, worldRotation:number, drawList:DrawList, viewport:AABB)
		{
			super.prepareForDrawing(worldX, worldY, worldScale, stretchX, stretchY, worldRotation, drawList, viewport);

			const endPoint = MathUtils.rotate(0, -this.length * this.stretchY, this.worldRotation);
			this.worldEndPointX = this.worldX + endPoint.x;
			this.worldEndPointY = this.worldY + endPoint.y;


			this.stretchHandle.active = this.selected && this.model.mode == EditMode.ANIMATE;
			this.lengthHandle.active = this.selected && this.model.mode == EditMode.EDIT;
			this.baseHandle.x = this.boneHandle.x = this.worldX;
			this.baseHandle.y = this.boneHandle.y = this.worldY;
			this.endPointHandle.x = this.boneHandle.x2 = this.worldEndPointX;
			this.endPointHandle.y = this.boneHandle.y2 = this.worldEndPointY;
			this.stretchHandle.x = this.lengthHandle.x = this.worldEndPointX + Math.cos(this.worldRotation - Math.PI * 0.5) * (Config.boneStretchHandleDist / worldScale);
			this.stretchHandle.y = this.lengthHandle.y = this.worldEndPointY + Math.sin(this.worldRotation - Math.PI * 0.5) * (Config.boneStretchHandleDist / worldScale);
			this.stretchHandle.rotation = this.lengthHandle.rotation = this.worldRotation;

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

			if(!this.visible) return;

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

		//

		public flipX() {}

		public flipY() {}

		//

		protected getInstance():Bone
		{
			return new Bone();
		}

		protected copyFrom(from:Bone, recursive=true):Bone
		{
			super.copyFrom(from, recursive);

			this.length = from.length;

			return this;
		}

		public save():any
		{
			var data = super.save();

			data.length = this.length;

			return data;
		}

		public load(data:LoadData):Bone
		{
			super.load(data);
			this.length = data.get('length');

			return this;
		}

	}

}